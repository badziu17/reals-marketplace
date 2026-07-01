import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Zalogowany użytkownik próbujący wejść na /login lub /register
    // → przekieruj na stronę główną
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (token && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // authorized zwraca true jeśli token istnieje LUB trasa nie jest chroniona.
      // Trasy chronione: /messages, /sell, /saved, /konto
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;
        const protectedPrefixes = ["/messages", "/sell", "/saved", "/konto"];
        const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
        if (isProtected) return !!token;
        return true; // reszta publiczna
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  // Matcher wyklucza pliki statyczne i Next.js internals
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
