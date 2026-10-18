import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  (await cookies()).set("session", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getUserId() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    return (await jwtVerify(token, secret)).payload.userId as string;
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete("session");
}
