/**
 * Genera icon-192x192.png e icon-512x512.png válidos para PWA (Chrome exige PNG reales).
 * Ejecutar: node scripts/generate-pwa-icons.cjs
 */
const fs = require("fs");
const path = require("path");

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Instala sharp en el frontend: npm install -D sharp");
    process.exit(1);
  }

  const publicDir = path.join(__dirname, "..", "public");
  const bg = { r: 10, g: 10, b: 10 }; // fondo oscuro

  for (const size of [192, 512]) {
    const buf = await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: bg,
      },
    })
      .png()
      .toBuffer();

    const out = path.join(publicDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(out, buf);
    console.log("Creado:", out, buf.length, "bytes");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
