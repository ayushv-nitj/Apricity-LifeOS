/**
 * lib/auth.ts — NextAuth Configuration
 *
 * This file sets up authentication for the entire app using NextAuth v5.
 * It exports four things used throughout the codebase:
 *   - handlers  → GET/POST route handlers (used in app/api/auth/[...nextauth]/route.ts)
 *   - signIn    → programmatic sign-in function
 *   - signOut   → programmatic sign-out function
 *   - auth      → reads the current session (works in Server Components & API routes)
 *
 * We use the "Credentials" provider, meaning users log in with email + password
 * rather than OAuth (Google, GitHub, etc.).
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  /* ── Providers ────────────────────────────────────────────────────────────
   * A "provider" defines how users can authenticate.
   * Here we only use "Credentials" (email + password).
   * You could add Google, GitHub, etc. as additional providers.
   */
  providers: [
    Credentials({
      name: "credentials",

      // These fields tell NextAuth what inputs to expect.
      // They're used by the built-in sign-in page (if you use it).
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      /**
       * authorize — Called when a user submits the login form.
       * Must return a user object on success, or null on failure.
       * NextAuth will create a session from the returned object.
       */
      async authorize(credentials) {
        // Reject immediately if either field is missing.
        if (!credentials?.email || !credentials?.password) return null;

        // Connect to DB and look up the user by email.
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        // bcrypt.compare checks the plain-text password against the stored hash.
        // We NEVER store plain-text passwords — only the bcrypt hash.
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        // Return a plain object with the fields NextAuth will put in the token.
        // We map MongoDB's `_id` to `id` (string) because JWT tokens are JSON.
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          image: user.avatar,
        };
      },
    }),
  ],

  /* ── Session strategy ─────────────────────────────────────────────────────
   * "jwt" means the session is stored in a signed cookie (no DB session table).
   * This is stateless and works well with serverless/edge deployments.
   * The alternative is "database" which stores sessions in MongoDB.
   */
  session: { strategy: "jwt" },

  // Redirect to our custom login page instead of NextAuth's default.
  pages: { signIn: "/login" },

  /* ── Callbacks ────────────────────────────────────────────────────────────
   * Callbacks let you customise what data is stored in the JWT and session.
   * The flow is: authorize() → jwt() → session()
   */
  callbacks: {
    /**
     * jwt — Called whenever a JWT is created or updated.
     * `user` is only present on the first sign-in; subsequent calls only have `token`.
     * We copy the user's DB id into the token so it's available later.
     */
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    /**
     * session — Called whenever a session is read (e.g. via `auth()` or `useSession()`).
     * We copy `token.id` onto `session.user` so components can access the user's DB id.
     * Without this, `session.user.id` would be undefined.
     */
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
