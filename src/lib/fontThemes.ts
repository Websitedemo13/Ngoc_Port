export interface FontTheme {
  id: string;
  name: string;
  description: string;
  heading: string;
  body: string;
  googleFontsUrl: string;
}

export const FONT_THEMES: FontTheme[] = [
  {
    id: 'inter-lora',
    name: 'Inter & Lora',
    description: 'Mặc định — Hiện đại, dễ đọc tiếng Việt',
    heading: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&subset=vietnamese&display=swap',
  },
  {
    id: 'manrope-source',
    name: 'Manrope & Source Serif',
    description: 'Thanh lịch, chuyên nghiệp',
    heading: "'Manrope', system-ui, sans-serif",
    body: "'Source Serif 4', Georgia, serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Source+Serif+4:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&subset=vietnamese&display=swap',
  },
  {
    id: 'space-dm',
    name: 'Space Grotesk & DM Sans',
    description: 'Công nghệ, hiện đại',
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&subset=vietnamese&display=swap',
  },
  {
    id: 'raleway-nunito',
    name: 'Raleway & Nunito',
    description: 'Nhẹ nhàng, thân thiện',
    heading: "'Raleway', system-ui, sans-serif",
    body: "'Nunito', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&subset=vietnamese&display=swap',
  },
  {
    id: 'poppins-roboto',
    name: 'Poppins & Roboto',
    description: 'Phổ biến, dễ đọc',
    heading: "'Poppins', system-ui, sans-serif",
    body: "'Roboto', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400;1,500&subset=vietnamese&display=swap',
  },
  {
    id: 'playfair-lato',
    name: 'Playfair Display & Lato',
    description: 'Sang trọng, editorial',
    heading: "'Playfair Display', Georgia, serif",
    body: "'Lato', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Lato:ital,wght@0,300;0,400;0,700;1,400&subset=vietnamese&display=swap',
  },
  {
    id: 'montserrat-opensans',
    name: 'Montserrat & Open Sans',
    description: 'Cổ điển, chuyên nghiệp',
    heading: "'Montserrat', system-ui, sans-serif",
    body: "'Open Sans', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&subset=vietnamese&display=swap',
  },
  {
    id: 'sora-karla',
    name: 'Sora & Karla',
    description: 'Tối giản, startup',
    heading: "'Sora', system-ui, sans-serif",
    body: "'Karla', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Karla:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&subset=vietnamese&display=swap',
  },
  {
    id: 'outfit-crimson',
    name: 'Outfit & Crimson Pro',
    description: 'Sang trọng, editorial',
    heading: "'Outfit', system-ui, sans-serif",
    body: "'Crimson Pro', Georgia, serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&subset=vietnamese&display=swap',
  },
  {
    id: 'bricolage-geist',
    name: 'Bricolage Grotesque & Geist',
    description: 'Đậm cá tính, hiện đại',
    heading: "'Bricolage Grotesque', system-ui, sans-serif",
    body: "'Geist', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@300;400;500;600;700;800&family=Geist:wght@300;400;500;600;700&subset=vietnamese&display=swap',
  },
  {
    id: 'cabin-merriweather',
    name: 'Cabin & Merriweather Sans',
    description: 'Thân thiện, dễ đọc',
    heading: "'Cabin', system-ui, sans-serif",
    body: "'Merriweather Sans', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Merriweather+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&subset=vietnamese&display=swap',
  },
  {
    id: 'josefin-quicksand',
    name: 'Josefin Sans & Quicksand',
    description: 'Nhẹ nhàng, trẻ trung',
    heading: "'Josefin Sans', system-ui, sans-serif",
    body: "'Quicksand', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;600;700&subset=vietnamese&display=swap',
  },
  {
    id: 'archivo-libre',
    name: 'Archivo & Libre Baskerville',
    description: 'Mạnh mẽ, truyền thống',
    heading: "'Archivo', system-ui, sans-serif",
    body: "'Libre Baskerville', Georgia, serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&subset=vietnamese&display=swap',
  },
  {
    id: 'lexend-source',
    name: 'Lexend & Source Sans 3',
    description: 'Dễ đọc, accessibility',
    heading: "'Lexend', system-ui, sans-serif",
    body: "'Source Sans 3', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&subset=vietnamese&display=swap',
  },
  {
    id: 'cormorant-work',
    name: 'Cormorant Garamond & Work Sans',
    description: 'Nghệ thuật, thời trang',
    heading: "'Cormorant Garamond', Georgia, serif",
    body: "'Work Sans', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&subset=vietnamese&display=swap',
  },
];

export const getFontThemeById = (id: string): FontTheme => {
  return FONT_THEMES.find(t => t.id === id) || FONT_THEMES[0];
};

let currentLinkEl: HTMLLinkElement | null = null;

export const applyFontTheme = (themeId: string) => {
  const theme = getFontThemeById(themeId);

  // Load Google Fonts
  if (currentLinkEl) {
    currentLinkEl.href = theme.googleFontsUrl;
  } else {
    const existing = document.querySelector('link[data-font-theme]') as HTMLLinkElement;
    if (existing) {
      existing.href = theme.googleFontsUrl;
      currentLinkEl = existing;
    } else {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = theme.googleFontsUrl;
      link.setAttribute('data-font-theme', 'true');
      document.head.appendChild(link);
      currentLinkEl = link;
    }
  }

  // Apply CSS custom properties
  const root = document.documentElement;
  root.style.setProperty('--font-heading', theme.heading);
  root.style.setProperty('--font-body', theme.body);
};
