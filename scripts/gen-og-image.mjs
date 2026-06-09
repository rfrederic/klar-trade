import sharp from "../node_modules/sharp/lib/index.js";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, "..");

const W = 1200, H = 630;

// Equity curve points — gentle uptrend with realistic noise
const pts = [
  [0,520],[55,514],[110,506],[165,512],[220,500],[275,487],[330,478],
  [385,484],[440,468],[495,452],[550,440],[605,420],[660,406],[715,392],
  [770,378],[825,360],[880,345],[935,330],[990,314],[1045,298],[1100,282],[1200,258],
];
const lineD = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + " " + p[1]).join(" ");
const fillD = lineD + " L1200 630 L0 630 Z";

// Decorative candlesticks scattered along the bottom third
const candles = [
  [70,  490,485,496,487],[150,487,481,493,489],[230,489,483,496,484],
  [310,484,478,490,486],[390,486,479,492,481],[470,481,475,488,477],
  [550,477,471,483,473],[630,473,466,479,469],[710,469,462,476,464],
  [790,464,457,471,459],[870,459,452,466,454],[950,454,447,461,449],
  [1030,449,442,456,444],[1110,444,437,451,439],
];

const candleSVG = candles.map(([x, o, h, l, c]) => {
  const bull  = c >= o;
  const col   = bull ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.20)";
  const top   = Math.min(o, c);
  const ht    = Math.max(Math.abs(c - o), 2);
  return `<line x1="${x}" y1="${h}" x2="${x}" y2="${l}" stroke="${col}" stroke-width="1"/>
  <rect x="${x - 5}" y="${top}" width="10" height="${ht}" fill="${col}" rx="1"/>`;
}).join("\n  ");

const gridV = [1,2,3,4,5,6,7].map(i =>
  `<line x1="${i * 171}" y1="0" x2="${i * 171}" y2="${H}" stroke="rgba(99,102,241,0.05)" stroke-width="1"/>`
).join("\n  ");

const gridH = [1,2,3,4,5].map(i =>
  `<line x1="0" y1="${i * 105}" x2="${W}" y2="${i * 105}" stroke="rgba(99,102,241,0.06)" stroke-width="1"/>`
).join("\n  ");

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#04040b"/>
      <stop offset="100%" stop-color="#07071a"/>
    </linearGradient>
    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="topGlow" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <ellipse cx="600" cy="230" rx="540" ry="300" fill="url(#topGlow)"/>

  ${gridH}
  ${gridV}

  <path d="${fillD}" fill="url(#chartFill)"/>
  <path d="${lineD}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-opacity="0.30" stroke-linejoin="round" stroke-linecap="round"/>

  ${candleSVG}

  <text x="600" y="256" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="100" font-weight="800" fill="#F2F0EB" text-anchor="middle" letter-spacing="-4">Klar<tspan fill="#818cf8">Trade</tspan></text>

  <text x="600" y="320" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="26" font-weight="400" fill="#94a3b8" text-anchor="middle" letter-spacing="0.5">
    Trade with Clarity. Execute with Discipline.
  </text>

  <rect x="520" y="350" width="160" height="2" rx="1" fill="#6366f1" opacity="0.45"/>

  <text x="600" y="404" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="17" font-weight="500" fill="#475569" text-anchor="middle" letter-spacing="2.8">
    AI-POWERED TRADING INTELLIGENCE
  </text>

  <rect x="0" y="${H - 3}" width="${W}" height="3" fill="#6366f1" opacity="0.65"/>
</svg>`;

const logoInput = await sharp(join(root, "public/klar-removebg-preview.png"))
  .resize(76, 76, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

await sharp(Buffer.from(svg))
  .composite([{ input: logoInput, top: 152, left: 562 }])  // (1200-76)/2 = 562
  .png()
  .toFile(join(root, "public/og-image.png"));

console.log("✓ public/og-image.png generated (1200×630)");
