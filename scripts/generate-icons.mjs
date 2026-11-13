/**
 * Generates VERA app icons, touch icons and the social preview image.
 * Run once with: npm run icons
 *
 * All artwork is derived from the original VERA geometric mark so the
 * identity stays consistent across favicon, PWA and social surfaces.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(root, "src", "app");
const publicDir = path.join(root, "public");

const BRAND = "#635BFF";
const BRAND_DEEP = "#4F46E5";

/** Geometric VERA mark drawn on a 0..64 viewBox, rendered at `size` px. */
function markSvg(size, { stroke, node }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <g fill="none" stroke="${stroke}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 20 L26.8 42.2" />
    <path d="M50 13 L35.9 42" />
  </g>
  <circle cx="15" cy="20" r="5.2" fill="${node}" />
  <circle cx="50" cy="13" r="5.2" fill="${node}" />
  <path fill-rule="evenodd" fill="${node}" d="M31.5 44.4 A6.6 6.6 0 1 0 31.5 57.6 A6.6 6.6 0 1 0 31.5 44.4 Z M31.5 48.2 A2.8 2.8 0 1 1 31.5 53.8 A2.8 2.8 0 1 1 31.5 48.2 Z" />
</svg>`;
}

function roundedCanvas(size, bg, radius) {
  const r = radius ?? size * 0.22;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/>
    </svg>`,
  );
}

/** Opaque app icon: brand field + white mark. */
function appIcon(size, { bg = BRAND, radius, padding = 0.19 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const mark = Buffer.from(
    markSvg(inner, { stroke: "#FFFFFF", node: "#FFFFFF" }),
  );
  const off = Math.round((size - inner) / 2);
  return sharp(roundedCanvas(size, bg, radius))
    .composite([{ input: mark, left: off, top: off }])
    .png()
    .toBuffer();
}

/** Social preview: 1200x630 with wordmark and tagline. */
async function ogImage() {
  const width = 1200;
  const height = 630;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${BRAND}"/>
        <stop offset="100%" stop-color="${BRAND_DEEP}"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.82" cy="0.12" r="0.7">
        <stop offset="0%" stop-color="rgba(255,255,255,0.28)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <rect width="${width}" height="${height}" fill="url(#glow)"/>
    <g opacity="0.16" stroke="#FFFFFF" stroke-width="1">
      <path d="M0 160 H1200 M0 320 H1200 M0 480 H1200"/>
      <path d="M200 0 V630 M400 0 V630 M600 0 V630 M800 0 V630 M1000 0 V630"/>
    </g>
    <g transform="translate(96 190)">
      <rect x="-8" y="-8" width="192" height="192" rx="40" fill="rgba(255,255,255,0.12)"/>
    </g>
    <text x="320" y="290" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      font-size="112" font-weight="700" letter-spacing="-5" fill="#FFFFFF">VERA</text>
    <text x="322" y="352" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      font-size="34" font-weight="500" letter-spacing="-0.4" fill="rgba(255,255,255,0.92)">Your Life. Your Work. Your Proof.</text>
    <text x="322" y="416" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      font-size="26" font-weight="400" fill="rgba(255,255,255,0.75)">AI-powered personal workspace &amp; verifiable trust network</text>
    <g transform="translate(96 190) scale(2.75)">
      ${markSvg(64, { stroke: "#FFFFFF", node: "#FFFFFF" })
        .replace(/^<svg[^>]*>/, "")
        .replace(/<\/svg>$/, "")}
    </g>
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function main() {
  await mkdir(appDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });

  const writes = [
    // Apple touch icon (opaque, no transparency allowed)
    [path.join(appDir, "apple-icon.png"), await appIcon(180, { radius: 0, bg: BRAND, padding: 0.2 })],
    [path.join(publicDir, "apple-touch-icon.png"), await appIcon(180, { radius: 0, bg: BRAND, padding: 0.2 })],
    // PWA icons
    [path.join(publicDir, "icon-192.png"), await appIcon(192)],
    [path.join(publicDir, "icon-512.png"), await appIcon(512)],
    [
      path.join(publicDir, "icon-512-maskable.png"),
      await appIcon(512, { radius: 0, bg: BRAND, padding: 0.3 }),
    ],
    // Splash / static fallback mark on white
    [
      path.join(publicDir, "vera-mark-static.png"),
      await sharp(Buffer.from(markSvg(256, { stroke: BRAND, node: BRAND })))
        .png()
        .toBuffer(),
    ],
    // Social preview
    [path.join(publicDir, "og-image.png"), await ogImage()],
  ];

  for (const [file, buf] of writes) {
    await writeFile(file, buf);
    const rel = path.relative(root, file).replace(/\\/g, "/");
    console.log(`âœ“ ${rel} (${buf.length} bytes)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
