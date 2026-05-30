export type Variant = {
  sku: string;
  color: string;
  hex: string;
  inStock: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // cents
  currency: string;
  variants: Variant[];
  specs: { label: string; value: string }[];
  features: { title: string; body: string }[];
  inStock: boolean;
};

export const PRODUCT: Product = {
  id: "volt-pro-3k",
  slug: "pro-3k",
  name: "VÖLT Pro 3K",
  tagline: "Charged for control. Engineered for impact.",
  description:
    "A 3K carbon-fiber padel racket engineered for control players who attack on demand. Teardrop head, EVA-soft honeycomb core, and a hexagonal hole pattern tuned to cut drag without sacrificing sweet-spot response.",
  price: 28900,
  currency: "USD",
  inStock: true,
  variants: [
    { sku: "VPR3K-EG", color: "Electric Green", hex: "#A8FF00", inStock: true },
    { sku: "VPR3K-SB", color: "Stealth Black", hex: "#0A0A0A", inStock: true },
    { sku: "VPR3K-CW", color: "Court White", hex: "#F4F4F2", inStock: false },
  ],
  specs: [
    { label: "Weight", value: "370 g ± 5" },
    { label: "Shape", value: "Teardrop" },
    { label: "Balance", value: "Medium-high" },
    { label: "Hardness", value: "Medium" },
    { label: "Face", value: "3K Carbon Fiber Twill" },
    { label: "Core", value: "EVA Soft Black Honeycomb" },
    { label: "Frame", value: "Anodized Aluminum 6061" },
    { label: "Face Holes", value: "~50 hex grid · 9 mm" },
    { label: "Grip", value: "Matte EVA · 21 g overgrip included" },
    { label: "Level", value: "Intermediate → Advanced" },
  ],
  features: [
    {
      title: "Charged Carbon Face",
      body: "3K twill weave delivers a snap-back response that translates wrist intent into shot direction without ringing.",
    },
    {
      title: "Honeycomb Core",
      body: "Soft EVA hex core absorbs the brunt and returns it. Forgiving on the bandeja, alive on the víbora.",
    },
    {
      title: "Drag-Cut Hole Grid",
      body: "Hexagonal hole pattern displaces air evenly across the face — faster swings, quieter strikes.",
    },
    {
      title: "Cold-Forged Frame",
      body: "Anodized aluminum 6061 rim shrugs off cage hits and holds its geometry season after season.",
    },
  ],
};
