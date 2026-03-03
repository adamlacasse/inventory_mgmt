import { type IronSession, getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { ApiError } from "./errors";
import { type AppSession, type SessionUser, sessionOptions } from "./session";

// Next.js 15 ReadonlyRequestCookies has a minor signature mismatch with iron-session's
// internal CookieStore type (return type of set, and optional param handling). This local
// type captures the structural shape iron-session actually uses, allowing a safe cast.
type IronSessionCookieStore = {
  get(name: string): { name: string; value: string } | undefined;
  set(name: string, value: string, cookie?: object): void;
  set(options: object): void;
};

export async function getSession(): Promise<IronSession<AppSession>> {
  const cookieStore = await cookies();
  return getIronSession<AppSession>(
    cookieStore as unknown as IronSessionCookieStore,
    sessionOptions,
  );
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session.user) {
    throw new ApiError("UNAUTHENTICATED", 401, "Authentication required.");
  }
  return session.user;
}
