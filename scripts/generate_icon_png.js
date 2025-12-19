const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let k = 0; k < 8; k++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const dataBuf = data ? Buffer.from(data) : Buffer.alloc(0);
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(dataBuf.length, 0);
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, dataBuf]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
}

function buildPngRgba(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[(stride + 1) * y] = 0;
    rgbaBuffer.copy(raw, (stride + 1) * y + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

function makeIconBitmap(size) {
  const width = size;
  const height = size;
  const buf = Buffer.alloc(width * height * 4);

  const set = (x, y, r, g, b, a) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = (y * width + x) * 4;
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
    buf[idx + 3] = a;
  };

  const fillSquircle = (cx, cy, radius, n, color) => {
    const [r, g, b, a] = color;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = (x + 0.5 - cx) / radius;
        const dy = (y + 0.5 - cy) / radius;
        const v = Math.pow(Math.abs(dx), n) + Math.pow(Math.abs(dy), n);
        if (v <= 1) set(x, y, r, g, b, a);
      }
    }
  };

  const drawGlyph = (glyph, x0, y0, scale, italicSlope, color) => {
    const [r, g, b, a] = color;
    const rows = glyph.length;
    const cols = glyph[0].length;
    for (let gy = 0; gy < rows; gy++) {
      const row = glyph[gy];
      const skew = Math.floor((rows - 1 - gy) * italicSlope);
      for (let gx = 0; gx < cols; gx++) {
        if (row[gx] !== '#') continue;
        const px0 = x0 + (gx + skew) * scale;
        const py0 = y0 + gy * scale;
        for (let yy = 0; yy < scale; yy++) {
          for (let xx = 0; xx < scale; xx++) set(px0 + xx, py0 + yy, r, g, b, a);
        }
      }
    }
  };

  const php_p = [
    "#####..",
    "#....#.",
    "#....#.",
    "#####..",
    "#......",
    "#......",
    "#......",
    ".......",
    "......."
  ];

  const php_h = [
    "#......",
    "#......",
    "#.####.",
    "##...#.",
    "#....#.",
    "#....#.",
    "#....#.",
    ".......",
    "......."
  ];

  const center = size / 2;
  fillSquircle(center, center, size * 0.42, 4, [0x35, 0x67, 0xb7, 0xff]);

  const scale = Math.floor(size / 34);
  const spacing = Math.floor(scale * 0.9);
  const glyphW = php_p[0].length;
  const glyphH = php_p.length;
  const textW = (glyphW * 3 + spacing * 2) * scale;
  const textH = glyphH * scale;
  const xStart = Math.floor(center - textW / 2);
  const yStart = Math.floor(center - textH / 2);
  const italic = 0.22;

  drawGlyph(php_p, xStart, yStart, scale, italic, [0xff, 0xff, 0xff, 0xff]);
  drawGlyph(php_h, xStart + glyphW * scale + spacing, yStart, scale, italic, [0xff, 0xff, 0xff, 0xff]);
  drawGlyph(php_p, xStart + (glyphW * 2) * scale + spacing * 2, yStart, scale, italic, [0xff, 0xff, 0xff, 0xff]);

  return { width, height, rgba: buf };
}

function main() {
  const size = 512;
  const { width, height, rgba } = makeIconBitmap(size);
  const png = buildPngRgba(width, height, rgba);
  const outPath = path.join(process.cwd(), 'icon.png');
  fs.writeFileSync(outPath, png);
}

main();

