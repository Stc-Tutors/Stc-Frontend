import Link from "next/link";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-16">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm font-semibold text-blue-600">404</p>
        <h1 className="text-2xl font-bold text-gray-900">We can&apos;t find that page</h1>
        <p className="text-gray-600">
          The link may be out of date or mistyped. Head back home, or log in to continue where you left off.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Go to home
          </Link>
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
