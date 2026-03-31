import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY ?? "";
if (!apiKey) {
  console.warn("[gemini][warn] GEMINI_API_KEY is not set - image generation will fail.");
}
const ai = new GoogleGenAI({ apiKey });

const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
const MAX_RETRIES = 1;
const IMAGE_TIMEOUT = 120_000;

// Custom error classes for differentiated handling
export class GeminiTimeoutError extends Error {
  constructor(ms: number) {
    super(`Timeout after ${ms}ms`);
    this.name = "GeminiTimeoutError";
  }
}

export class GeminiRateLimitError extends Error {
  constructor() {
    super("Rate limit exceeded");
    this.name = "GeminiRateLimitError";
  }
}

export class GeminiNoImageError extends Error {
  constructor() {
    super("No image returned from Gemini");
    this.name = "GeminiNoImageError";
  }
}

export class GeminiConfigError extends Error {
  constructor() {
    super("GEMINI_API_KEY is not configured");
    this.name = "GeminiConfigError";
  }
}

export class GeminiNetworkError extends Error {
  constructor(cause?: string) {
    super(`Network error communicating with Gemini${cause ? `: ${cause}` : ""}`);
    this.name = "GeminiNetworkError";
  }
}

export class GeminiServerError extends Error {
  constructor(status?: number, detail?: string) {
    super(`Gemini server error${status ? ` (${status})` : ""}${detail ? `: ${detail}` : ""}`);
    this.name = "GeminiServerError";
  }
}

function getErrorStatus(err: unknown): number | null {
  if (typeof err === "object" && err !== null && "status" in err) {
    return (err as { status: number }).status;
  }
  return null;
}

function isRateLimitError(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.message.includes("429") ||
      err.message.includes("RESOURCE_EXHAUSTED")
    );
  }
  return getErrorStatus(err) === 429;
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true; // fetch network failures
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("fetch failed") ||
      msg.includes("econnreset") ||
      msg.includes("econnrefused") ||
      msg.includes("enotfound") ||
      msg.includes("socket hang up") ||
      msg.includes("network") ||
      msg.includes("aborted")
    );
  }
  return false;
}

function isServerError(err: unknown): boolean {
  const status = getErrorStatus(err);
  if (status && status >= 500) return true;
  if (err instanceof Error) {
    return err.message.includes("500") || err.message.includes("503") || err.message.includes("INTERNAL");
  }
  return false;
}

function isRetryable(err: unknown): boolean {
  return isNetworkError(err) || isServerError(err);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (isRateLimitError(err)) throw new GeminiRateLimitError();

      // On last attempt, classify the error before throwing
      if (i === retries) {
        if (isNetworkError(err)) {
          throw new GeminiNetworkError(err instanceof Error ? err.message : undefined);
        }
        if (isServerError(err)) {
          throw new GeminiServerError(getErrorStatus(err) ?? undefined, err instanceof Error ? err.message : undefined);
        }
        throw err;
      }

      // Only retry on transient errors
      if (!isRetryable(err)) throw err;

      console.warn(`[gemini] Retryable error (attempt ${i + 1}/${retries + 1}):`, err instanceof Error ? err.message : err);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw new Error("Unreachable");
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new GeminiTimeoutError(ms)), ms);
    }),
  ]);
}

export async function generateImage(prompt: string): Promise<string> {
  if (!apiKey) {
    throw new GeminiConfigError();
  }

  return withRetry(async () => {
    const response = await withTimeout(
      ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: prompt,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      }),
      IMAGE_TIMEOUT
    );

    const parts = response.candidates?.[0]?.content?.parts ?? [];

    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    // Log what the model actually returned so failures aren't a black box
    console.warn(
      "[gemini] No image in response. Parts received:",
      parts.map((p) => (p.text ? `text(${p.text.length} chars)` : JSON.stringify(Object.keys(p))))
    );
    throw new GeminiNoImageError();
  });
}

