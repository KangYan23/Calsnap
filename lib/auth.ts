import { cookies } from "next/headers";

export async function getUserIdFromCookies(): Promise<string | null> {
  try {
    // Support both sync and async cookies() depending on Next runtime
    const cookieStore: any = await (cookies() as any);
    const cookie = cookieStore?.get ? cookieStore.get("userId") : undefined;
    return cookie?.value ?? null;
  } catch {
    return null;
  }
}


