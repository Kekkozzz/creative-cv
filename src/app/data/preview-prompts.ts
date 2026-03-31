export type PreviewInput = {
  businessName: string;
  sector: string;
  style: string;
  colorPalette: string[];
  description: string;
  referenceUrls?: string;
  serviceName: string;
  serviceId: string;
  tierName: string;
  features: string[];
  addOns: string[];
};

// --- Service-specific layout blueprints ---

const serviceBlueprints: Record<string, { layout: string; sections: string }> = {
  "siti-web": {
    layout: "corporate website / brochure homepage",
    sections: `- Sticky navbar with logo left, navigation links right, and a subtle CTA button
- Full-width hero section with a bold headline (max 8 words), a one-line subheadline, and a prominent CTA button. Background uses a high-quality relevant image with a dark gradient overlay for text contrast
- "About" section with a 60/40 text-image split layout, generous whitespace
- Services grid: 3 or 4 cards with icons, short titles, and one-line descriptions, consistent card heights
- Testimonial or trust section with a quote, attribution, and subtle background differentiation
- Footer with 3-column layout: brand + tagline, quick links, contact info`,
  },
  "shop-saas": {
    layout: "e-commerce storefront homepage",
    sections: `- Top bar with logo, search input with icon, cart icon with badge, and user icon
- Full-width promotional hero banner with a lifestyle image, overlay headline, and "Shop Now" CTA
- "Featured Products" section: 4-column product grid, each card has a product image placeholder, name, price, and "Add to Cart" button with hover state
- Category navigation strip with pill-shaped buttons
- "Why Choose Us" strip: 4 icon+text blocks (free shipping, secure payment, etc.)
- Footer with newsletter signup input, payment method icons, and multi-column links`,
  },
  "web-app": {
    layout: "SaaS dashboard web application",
    sections: `- Left sidebar (dark) with logo at top, icon+label navigation items, active state highlighted, user avatar at bottom
- Top header bar with breadcrumb, search input, notification bell icon, and profile dropdown
- Main content area with a welcome greeting and 4 stat cards in a row (icon, number, label, subtle trend indicator)
- Below stats: a large area chart or bar chart placeholder with clean axes and a legend
- Data table with 5-6 rows, column headers, alternating row colors, and action buttons
- Floating action button (FAB) in bottom-right corner`,
  },
  "mobile-app": {
    layout: "mobile app showcase landing page",
    sections: `- Sticky navbar with logo left, navigation links right, and a "Scarica l'App" CTA button
- Hero section: bold headline about the app, subheadline with value proposition, two store badges (App Store + Google Play) side by side, and a large phone mockup on the right showing the app's main screen (60/40 split)
- "Come Funziona" section: 3-step horizontal flow with numbered circles, icons, short titles, and one-line descriptions
- Feature highlight section: alternating left-right layout (phone mockup + text block), 2-3 key features with icons and short descriptions
- Social proof strip: app rating stars, download count, and 2-3 short user review cards with avatar, name, and quote
- Final CTA section with centered headline, subheadline, store badges, and a subtle gradient background`,
  },
};

// --- Style-specific design directives (with reference anchors) ---

const styleDirectives: Record<string, string> = {
  minimal: `DESIGN DIRECTION — MINIMAL (reference: apple.com, evoulve.com):
Typography: One clean sans-serif family throughout (Inter or SF Pro style). Hero headline rendered at ~48px medium weight, body at 16px regular. Tracking slightly open on headlines.
Spacing: Sections breathe with 120px+ vertical padding. Content lives within a centered ~1000px container. Whitespace is the dominant visual element — every element has room to exist independently.
Color: Brand colors appear only on CTA buttons and subtle link accents. Background is pure white or warm off-white (#fafaf9). Text is near-black (#111). Two colors maximum beyond neutrals.
Layout: Elements align to a strict invisible grid. Asymmetric 60/40 splits add visual interest. Cards and containers have zero or 2px border-radius, thin 1px borders in #e5e5e5.
Lighting: Flat, uniform — as captured on a calibrated IPS monitor under neutral lighting. Colors are true and accurate, with no cast or atmospheric effect.`,

  moderno: `DESIGN DIRECTION — MODERN (reference: linear.app, vercel.com):
Typography: Geometric sans-serif for headings (Plus Jakarta Sans / Geist style) at ~52px bold, paired with a clean 16px body. Headings use tight letter-spacing (-0.02em).
Spacing: Generous 80-100px section padding. Cards have 24-32px internal padding with consistent gutters. Every grid row aligns perfectly.
Color: Brand colors applied as subtle linear gradients (2 stops, 135deg). Soft drop-shadows on cards (0 4px 24px rgba(0,0,0,0.06)). Light backgrounds with one accent-colored section for rhythm.
Layout: 12-16px border-radius on cards, 8px on buttons. Hero uses asymmetric composition with floating UI elements or isometric illustrations that overlap section boundaries, creating depth.
Lighting: Soft ambient — simulating a modern backlit display. Subtle glassmorphism panels (frosted glass with 60% opacity) catch light naturally. Colors are vibrant but never oversaturated.`,

  corporate: `DESIGN DIRECTION — CORPORATE (reference: stripe.com, wise.com):
Typography: Refined serif headlines (Playfair Display / Georgia style) paired with a professional 16px sans-serif body. Headlines feel authoritative at ~44px. Small uppercase labels with wide tracking for section markers.
Spacing: Grid-based rhythm — 80-100px section padding, 24px card gutters. Content organized in clean rows and columns with visible structure.
Color: Serious, muted tones — navy (#1a2332), charcoal (#374151), pure white. Brand color reserved for primary CTA buttons and key data highlights. Accent color used at 10% opacity for section backgrounds.
Layout: Strict 12-column grid with symmetrical compositions. Full-width navbar with complete navigation. Cards use 4-6px radius with thin 1px borders. Tables and data feel organized and trustworthy.
Lighting: Clean, professional — like a corporate presentation on a high-resolution projector. Even illumination, accurate whites, no warm or cool color cast.`,

  creativo: `DESIGN DIRECTION — CREATIVE (reference: awwwards.com winners, spotify.design):
Typography: Expressive display font for headlines (Clash Display / Unbounded style) at 60px+ ultra-bold. Body uses a contrasting thin-weight sans-serif. Mix weights dramatically — the contrast between headline and body is extreme.
Spacing: Intentionally dynamic — some sections pack elements tightly while others use vast 140px+ breathing room. The rhythm is syncopated, not uniform.
Color: Fully saturated brand colors in bold blocks. Sections alternate between dark (#0a0a0a) and vivid color backgrounds. Duotone or gradient-washed imagery. Color is used emotionally, not just decoratively.
Layout: Grid-breaking compositions — elements overlap, text crosses section boundaries, images bleed edge-to-edge. Angled dividers (3-5deg skew) between sections. Hero typography itself becomes the visual centerpiece.
Lighting: Dramatic and directional — simulating a high-contrast display. Deep blacks, vivid highlights. Elements feel like they pop off the surface with strong figure-ground contrast.`,

  elegante: `DESIGN DIRECTION — ELEGANT (reference: rolex.com, aesop.com):
Typography: Refined serif (Cormorant Garamond / Didot style) for headlines at 44px thin/light weight. Uppercase labels with 0.15em letter-spacing. Body in a delicate 15px sans-serif with 1.7 line-height.
Spacing: Luxurious — space is the primary design material. 140-180px between sections. Content max-width ~900px centered. Every element is surrounded by generous negative space.
Color: Dark foundation (warm black #0d0d0d, charcoal #1a1a1a) with champagne gold (#c9a96e) or rose gold (#b76e79) as the sole accent. Cream (#f5f0eb) for light-on-dark inversions. Maximum 2 accent colors.
Layout: Centered, symmetrical compositions. Thin 1px gold lines as section dividers. Full-width cinematic imagery (16:9 aspect). Cards float with delicate gold hairline borders and generous internal spacing.
Lighting: Warm, intimate — as if viewed on a premium OLED display in a dimly lit room. Deep blacks with rich shadow detail. Gold accents catch light with a subtle metallic quality. The overall mood is refined and unhurried.`,
};

// --- Color formatting ---

function formatColors(colors: string[]): string {
  if (colors.length === 0) return "choose a professional, harmonious palette appropriate for the sector";
  return `primary palette: ${colors.join(", ")} — use these as the dominant brand colors. Derive complementary shades (lighter tints for backgrounds, darker shades for text/accents) from these base colors`;
}

// --- Main prompt builder ---

export function buildImagePrompt(input: PreviewInput): string {
  const blueprint = serviceBlueprints[input.serviceId] ?? serviceBlueprints["siti-web"];
  const styleDir = styleDirectives[input.style.toLowerCase()] ?? styleDirectives["moderno"];
  const desc = input.description ? input.description.slice(0, 200) : "";

  return `A direct frontal screenshot of a ${blueprint.layout} displayed in a desktop browser at 1440x900 viewport, captured at 1:1 pixel ratio on a Retina display. The website belongs to "${input.businessName}", an Italian ${input.sector} business.${desc ? ` ${desc}.` : ""}

The page scrolls from top to bottom through these sections, each occupying clear horizontal bands:
${blueprint.sections}

${styleDir}

COLOR SYSTEM: ${formatColors(input.colorPalette)}

The screenshot renders with flat, uniform monitor lighting and accurate color reproduction — exactly as a designer would see it on a calibrated display. Every letterform is crisp and legible, every UI element (buttons, inputs, cards, icons) has sharp edges and consistent styling. All visible text is written in natural Italian — authentic copy that reads as if written by a native copywriter, contextually relevant to the ${input.sector} sector. The brand name "${input.businessName}" appears prominently in the top-left of the navbar. Typography follows a clear size hierarchy: large headline, medium subheadline, regular body, small caption — with consistent vertical rhythm and intentional spacing between every element.

OUTPUT: ONLY the image.`;
}
