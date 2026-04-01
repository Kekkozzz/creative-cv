import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /services/dashboard and /services/admin routes — redirect to login if not authenticated
  if (!user && (request.nextUrl.pathname.startsWith("/services/dashboard") || request.nextUrl.pathname.startsWith("/services/admin"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/services/login";
    return NextResponse.redirect(url);
  }

  // Protect /services/admin routes — check admin role
  if (user && request.nextUrl.pathname.startsWith("/services/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/services/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === "/services/login" || request.nextUrl.pathname === "/services/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/services/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
