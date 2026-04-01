import { type NextRequest } from "next/server";
import {
  generateImage,
  GeminiConfigError,
  GeminiTimeoutError,
  GeminiRateLimitError,
  GeminiNoImageError,
  GeminiNetworkError,
  GeminiServerError,
} from "@/app/lib/gemini";
import { buildImagePrompt, type PreviewInput } from "@/app/data/preview-prompts";
import { checkRateLimit } from "@/app/actions/rate-limit";
import { savePreviewCore } from "@/app/lib/previews/save";
import { createServerClient } from "@/app/lib/supabase/server";

export const maxDuration = 180;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — IP (persistent via Supabase)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const ipCheck = await checkRateLimit(`ip:${ip}`, "preview_generate", 10);
    if (!ipCheck.allowed) {
      return Response.json(
        { error: "Hai raggiunto il limite di preview. Contattaci per vedere di più!" },
        { status: 429 }
      );
    }

    // Rate limiting — Session (persistent via Supabase, keyed by IP + UA hash)
    const ua = request.headers.get("user-agent") ?? "";
    const sessionKey = `session:${ip}:${ua.slice(0, 50)}`;
    const sessionCheck = await checkRateLimit(sessionKey, "preview_session", 3);
    if (!sessionCheck.allowed) {
      return Response.json(
        { error: "Hai raggiunto il limite di preview per questa sessione." },
        { status: 429 }
      );
    }

    // Validate input
    const body = await request.json();
    const { businessName, sector, style, colorPalette, description, referenceUrls,
            serviceName, serviceId, tierName, features, addOns } = body;

    if (!businessName || !sector || !style || !serviceName || !tierName) {
      return Response.json(
        { error: "Campi obbligatori mancanti" },
        { status: 400 }
      );
    }

    const input: PreviewInput = {
      businessName: String(businessName).slice(0, 100),
      sector: String(sector).slice(0, 50),
      style: String(style).slice(0, 30),
      colorPalette: Array.isArray(colorPalette) ? colorPalette.slice(0, 5).map((c: string) => String(c).slice(0, 10)) : [],
      description: String(description ?? "").slice(0, 500),
      referenceUrls: referenceUrls ? String(referenceUrls).slice(0, 200) : undefined,
      serviceName: String(serviceName).slice(0, 50),
      serviceId: String(serviceId).slice(0, 30),
      tierName: String(tierName).slice(0, 20),
      features: Array.isArray(features) ? features.slice(0, 15).map((f: string) => String(f).slice(0, 50)) : [],
      addOns: Array.isArray(addOns) ? addOns.slice(0, 10).map((a: string) => String(a).slice(0, 50)) : [],
    };

    const prompt = buildImagePrompt(input);
    const imageBase64 = await generateImage(prompt);

    // Resolve authenticated user from request cookies
    let userId: string | null = null;
    try {
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      console.warn("Could not resolve user from cookies in API route");
    }

    // Persist image to Supabase Storage
    let previewId: string | undefined;
    let signedUrl: string | undefined;
    let previewSaved = false;
    try {
      const result = await savePreviewCore(imageBase64, input as Record<string, unknown>, userId);
      if (result.success) {
        previewId = result.previewId;
        signedUrl = result.signedUrl;
        previewSaved = true;
      } else {
        console.error("Preview save returned error:", result.error);
      }
    } catch (storageErr) {
      console.error("Storage save failed:", storageErr);
    }

    return Response.json({
      imageBase64,
      previewId,
      imageUrl: signedUrl,
      previewSaved,
    });
  } catch (err) {
    console.error("Image generation error:", err);

    if (err instanceof GeminiTimeoutError) {
      return Response.json(
        { error: "La generazione sta impiegando troppo tempo. Riprova tra qualche istante." },
        { status: 504 }
      );
    }

    if (err instanceof GeminiConfigError) {
      return Response.json(
        { error: "Servizio preview AI non configurato. Controlla GEMINI_API_KEY in produzione." },
        { status: 503 }
      );
    }

    if (err instanceof GeminiRateLimitError) {
      return Response.json(
        { error: "Servizio temporaneamente sovraccarico. Riprova tra un minuto." },
        { status: 429 }
      );
    }

    if (err instanceof GeminiNoImageError) {
      return Response.json(
        { error: "Il modello non ha generato un'immagine. Riprova con una descrizione diversa." },
        { status: 502 }
      );
    }

    if (err instanceof GeminiNetworkError) {
      return Response.json(
        { error: "Errore di connessione al servizio AI. Verifica la connessione e riprova." },
        { status: 502 }
      );
    }

    if (err instanceof GeminiServerError) {
      return Response.json(
        { error: "Il servizio AI è temporaneamente non disponibile. Riprova tra qualche istante." },
        { status: 502 }
      );
    }

    return Response.json(
      { error: "Errore nella generazione dell'immagine. Riprova." },
      { status: 500 }
    );
  }
}
