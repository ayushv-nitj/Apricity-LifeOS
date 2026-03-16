/**
 * app/page.tsx — Root Route Redirect
 *
 * This is a Server Component that runs on every visit to "/".
 * It has no UI — its only job is to redirect the user to the right place:
 *
 *  - Logged in  → /dashboard  (skip the login page, go straight to the app)
 *  - Logged out → /login      (must authenticate first)
 *
 * `auth()` reads the JWT session cookie server-side.
 * `redirect()` throws a special Next.js error that stops rendering and
 * sends a 307 Temporary Redirect response to the browser.
 *
 * This means the root "/" URL is never actually rendered — it always
 * bounces the user somewhere else immediately.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function RootPage() {
  const session = await auth();
  // If a valid session exists, skip login and go to the dashboard
  if (session) redirect("/dashboard");
  // Otherwise, send to the login page
  else redirect("/login");
}
