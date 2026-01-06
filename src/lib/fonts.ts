/**
 * Font utilities for property website customization
 */

// Font configuration with Google Fonts URLs
export const FONT_CONFIG: Record<string, {
  family: string;
  googleFontsUrl: string;
  weights: string;
}> = {
  inter: {
    family: "'Inter', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    weights: "400;500;600;700",
  },
  playfair: {
    family: "'Playfair Display', serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
    weights: "400;500;600;700",
  },
  montserrat: {
    family: "'Montserrat', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
    weights: "400;500;600;700",
  },
  lora: {
    family: "'Lora', serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap",
    weights: "400;500;600;700",
  },
  roboto: {
    family: "'Roboto', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
    weights: "400;500;700",
  },
  opensans: {
    family: "'Open Sans', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap",
    weights: "400;500;600;700",
  },
  raleway: {
    family: "'Raleway', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap",
    weights: "400;500;600;700",
  },
  merriweather: {
    family: "'Merriweather', serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
    weights: "400;700",
  },
  poppins: {
    family: "'Poppins', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
    weights: "400;500;600;700",
  },
  cormorant: {
    family: "'Cormorant Garamond', serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap",
    weights: "400;500;600;700",
  },
};

/**
 * Get Google Fonts URL for loading custom fonts
 */
export function getGoogleFontsUrl(fontHeading?: string | null, fontBody?: string | null): string | null {
  const fonts: string[] = [];

  if (fontHeading && FONT_CONFIG[fontHeading]) {
    const config = FONT_CONFIG[fontHeading];
    fonts.push(`family=${encodeURIComponent(config.family.replace(/'/g, "").split(",")[0].trim())}:wght@${config.weights}`);
  }

  if (fontBody && fontBody !== fontHeading && FONT_CONFIG[fontBody]) {
    const config = FONT_CONFIG[fontBody];
    fonts.push(`family=${encodeURIComponent(config.family.replace(/'/g, "").split(",")[0].trim())}:wght@${config.weights}`);
  }

  if (fonts.length === 0) {
    return null;
  }

  return `https://fonts.googleapis.com/css2?${fonts.join("&")}&display=swap`;
}

/**
 * Get font family CSS value
 */
export function getFontFamily(fontKey?: string | null): string | null {
  if (!fontKey || !FONT_CONFIG[fontKey]) {
    return null;
  }
  return FONT_CONFIG[fontKey].family;
}

/**
 * Generate inline style object for custom fonts
 */
export function getCustomFontStyles(fontHeading?: string | null, fontBody?: string | null): {
  headingStyle: React.CSSProperties;
  bodyStyle: React.CSSProperties;
} {
  return {
    headingStyle: fontHeading && FONT_CONFIG[fontHeading]
      ? { fontFamily: FONT_CONFIG[fontHeading].family }
      : {},
    bodyStyle: fontBody && FONT_CONFIG[fontBody]
      ? { fontFamily: FONT_CONFIG[fontBody].family }
      : {},
  };
}
