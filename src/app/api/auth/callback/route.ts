import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const cookieStore = await cookies();
  const cookieNextRaw = cookieStore.get("auth_next")?.value;

  let next = requestUrl.searchParams.get("next") ?? "/dashboard";
  if (!requestUrl.searchParams.get("next") && cookieNextRaw) {
    try {
      next = decodeURIComponent(cookieNextRaw);
    } catch {
      next = cookieNextRaw;
    }
  }

  const safeNext = next.startsWith("/") ? next : "/dashboard";

  // Build base URL: prefer forwarded headers (Vercel/reverse proxy), fallback to origin
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const baseUrl = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  if (!code) {
    const response = NextResponse.redirect(
      `${baseUrl}/login?error=auth&reason=missing_code`
    );
    response.cookies.set("auth_next", "", { path: "/", maxAge: 0 });
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Cookie setting may fail in edge cases
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    const response = NextResponse.redirect(`${baseUrl}${safeNext}`);
    response.cookies.set("auth_next", "", { path: "/", maxAge: 0 });
    return response;
  }

  console.error("Auth callback exchange failed", {
    message: error.message,
    name: error.name,
    status: "status" in error ? error.status : undefined,
  });

  const response = NextResponse.redirect(
    `${baseUrl}/login?error=auth&reason=${encodeURIComponent(error.message)}`
  );
  response.cookies.set("auth_next", "", { path: "/", maxAge: 0 });
  return response;
}
