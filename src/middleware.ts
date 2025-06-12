import { ROUTES } from "./config/routes";

export async function middleware(request: Request) {
  const pathname = new URL(request.url).pathname;

  // if (pathname === "/auth/register") {
  //   return Response.redirect(new URL("/dashboard", request.url))
  // }

  const isAuthPage = pathname.startsWith("/auth");
  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/privacy-policy",
    "/services",
  ];

  const isPublicPage = pathname === "/" || publicPaths.some(publicPath => 
    publicPath !== "/" && pathname.startsWith(publicPath)
  );

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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|image|video).*)"],
};
