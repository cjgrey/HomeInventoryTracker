export interface ThemeConfig {
  name: string;
  displayName: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    accent: string;
    accentForeground: string;
  };
  fontFamily?: string;
}

export const themes: Record<string, ThemeConfig> = {
  minimalist: {
    name: "minimalist",
    displayName: "Minimalist White",
    description: "Clean and bright interface with subtle colors",
    colors: {
      background: "hsl(0, 0%, 100%)",
      foreground: "hsl(210, 22%, 22%)",
      card: "hsl(0, 0%, 100%)",
      cardForeground: "hsl(210, 22%, 22%)",
      primary: "hsl(195, 100%, 85%)",
      primaryForeground: "hsl(210, 22%, 22%)",
      muted: "hsl(210, 20%, 98%)",
      mutedForeground: "hsl(210, 15%, 60%)",
      border: "hsl(210, 20%, 95%)",
      input: "hsl(210, 20%, 95%)",
      accent: "hsl(210, 20%, 98%)",
      accentForeground: "hsl(210, 22%, 22%)",
    },
  },
  classic: {
    name: "classic",
    displayName: "Classic Ledger",
    description: "Vintage brown theme with serif fonts",
    colors: {
      background: "hsl(28, 30%, 95%)",
      foreground: "hsl(25, 25%, 15%)",
      card: "hsl(30, 40%, 98%)",
      cardForeground: "hsl(25, 25%, 15%)",
      primary: "hsl(25, 75%, 45%)",
      primaryForeground: "hsl(28, 30%, 95%)",
      muted: "hsl(28, 20%, 90%)",
      mutedForeground: "hsl(25, 15%, 35%)",
      border: "hsl(28, 25%, 85%)",
      input: "hsl(28, 25%, 85%)",
      accent: "hsl(28, 20%, 90%)",
      accentForeground: "hsl(25, 25%, 15%)",
    },
    fontFamily: '"Times New Roman", serif',
  },
  collector: {
    name: "collector",
    displayName: "Collector's Dark",
    description: "Dark theme with gold accents for premium feel",
    colors: {
      background: "hsl(220, 15%, 8%)",
      foreground: "hsl(45, 50%, 85%)",
      card: "hsl(220, 15%, 12%)",
      cardForeground: "hsl(45, 50%, 85%)",
      primary: "hsl(45, 76%, 55%)",
      primaryForeground: "hsl(220, 15%, 8%)",
      muted: "hsl(220, 15%, 15%)",
      mutedForeground: "hsl(45, 20%, 60%)",
      border: "hsl(220, 15%, 20%)",
      input: "hsl(220, 15%, 20%)",
      accent: "hsl(220, 15%, 15%)",
      accentForeground: "hsl(45, 50%, 85%)",
    },
  },
};

export function applyTheme(themeName: string) {
  const theme = themes[themeName];
  if (!theme) return;

  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });

  if (theme.fontFamily) {
    root.style.setProperty('font-family', theme.fontFamily);
  }
}
