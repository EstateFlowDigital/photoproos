"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { setLocale } from "@/lib/actions/locale";
import { locales, localeNames, Locale } from "@/i18n/config";
import { Globe } from "lucide-react";

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale() as Locale;

  const handleChange = (newLocale: Locale) => {
    startTransition(async () => {
      await setLocale(newLocale);
      // Reload to apply new locale
      window.location.reload();
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-foreground-muted" />
        <select
          value={currentLocale}
          onChange={(e) => handleChange(e.target.value as Locale)}
          disabled={isPending}
          className="appearance-none bg-transparent text-sm text-foreground-muted hover:text-foreground focus:outline-none cursor-pointer disabled:opacity-50"
        >
          {locales.map((locale) => (
            <option key={locale} value={locale}>
              {localeNames[locale]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function LocaleSwitcherDropdown({ className }: LocaleSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale() as Locale;

  const handleChange = (newLocale: Locale) => {
    startTransition(async () => {
      await setLocale(newLocale);
      window.location.reload();
    });
  };

  return (
    <div className={`relative group ${className}`}>
      <button
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-hover rounded-lg transition-colors disabled:opacity-50"
      >
        <Globe className="h-4 w-4" />
        <span>{localeNames[currentLocale]}</span>
      </button>

      <div className="absolute right-0 mt-1 w-40 bg-card border border-card-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="py-1">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleChange(locale)}
              disabled={isPending || locale === currentLocale}
              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                locale === currentLocale
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-background-hover"
              } disabled:opacity-50`}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
