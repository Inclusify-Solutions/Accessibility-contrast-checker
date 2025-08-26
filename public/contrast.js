// Utilities for color & WCAG contrast

export function normalizeHex(hex) {
  if (!hex) return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return `#${h.toLowerCase()}`;
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16)
  };
}

export function relativeLuminance({ r, g, b }) {
  // sRGB -> linear RGB
  const srgb = [r, g, b].map(v => v / 255).map(v =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  const [R, G, B] = srgb;
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(hex1, hex2) {
  const L1 = relativeLuminance(hexToRgb(hex1));
  const L2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function wcagVerdicts(ratio, { largeText = false } = {}) {
  // Normal text thresholds: AA >= 4.5, AAA >= 7.0
  // Large text thresholds:  AA >= 3.0, AAA >= 4.5
  const AA = largeText ? 3.0 : 4.5;
  const AAA = largeText ? 4.5 : 7.0;
  return {
    AA: ratio >= AA,
    AAA: ratio >= AAA,
    thresholds: { AA, AAA }
  };
}
