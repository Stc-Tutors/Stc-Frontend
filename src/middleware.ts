import { ROUTES } from "./config/routes";

export async function middleware(request: Request) {
  const pathname = new URL(request.url).pathname;
  const isAuthPage = pathname.startsWith("/auth");
  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
  ];

  const isPublicPage = publicPaths.includes(pathname);

  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find(row => row.startsWith("token="));
  const isAuthenticated = !!token;

  if (isAuthPage && isAuthenticated) {
    return Response.redirect(new URL(ROUTES.DASHBOARD.HOME, request.url));
  }

  if (!isAuthPage && !isAuthenticated && !isPublicPage) {
    return Response.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
