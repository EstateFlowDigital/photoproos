"use server";

import { cookies } from "next/headers";
import { Locale, locales, defaultLocale } from "@/i18n/config";

const COOKIE_NAME = "NEXT_LOCALE";

/**
 * Get the current locale from cookies
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(COOKIE_NAME);
  const locale = localeCookie?.value as Locale;

  if (locale && locales.includes(locale)) {
    return locale;
  }

  return defaultLocale;
}

/**
 * Set the user's preferred locale
 */
export async function setLocale(locale: Locale): Promise<void> {
  if (!locales.includes(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
