import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, Locale } from "./config";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Get locale from cookie or use default
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  let locale = (localeCookie?.value as Locale) || defaultLocale;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
