import type { SessionOptions } from "iron-session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AppSession = {
  user?: SessionUser;
};

export const SESSION_COOKIE_NAME = "inventory_session";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "",
  cookieName: SESSION_COOKIE_NAME,
  ttl: 60 * 60 * 8, // 8 hours
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};
