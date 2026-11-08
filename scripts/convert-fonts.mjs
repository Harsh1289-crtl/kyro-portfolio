import fs from 'fs';
import path from 'path';
import opentype from 'opentype.js';

function fontToTypeface(font) {
  const round = Math.round;
  const resolution = font.unitsPerEm || 1000;
  const scale = 1000 / resolution;
  const glyphs = {};

  const glyphMap = font.tables.cmap?.glyphIndexMap || {};
  const unicodes = Object.keys(glyphMap);

  for (let i = 0; i < unicodes.length; i++) {
    const unicode = parseInt(unicodes[i], 10);
    const glyphIndex = glyphMap[unicode];
    const glyph = font.glyphs.get(glyphIndex);

    if (glyph && unicode) {
      const char = String.fromCodePoint(unicode);
      const token = {
        ha: round(glyph.advanceWidth * scale),
        x_min: round((glyph.xMin ?? 0) * scale),
        x_max: round((glyph.xMax ?? 0) * scale),
        o: '',
      };

      if (glyph.path && glyph.path.commands) {
        glyph.path.commands.forEach((cmd) => {
          const type = cmd.type.toLowerCase();
          if (type === 'm') {
            token.o += `m ${round(cmd.x * scale)} ${round(cmd.y * scale)} `;
          } else if (type === 'l') {
            token.o += `l ${round(cmd.x * scale)} ${round(cmd.y * scale)} `;
          } else if (type === 'q') {
            token.o += `q ${round(cmd.x1 * scale)} ${round(cmd.y1 * scale)} ${round(cmd.x * scale)} ${round(cmd.y * scale)} `;
          } else if (type === 'c') {
            // Cubic bezier is 'b' in typeface format
            token.o += `b ${round(cmd.x1 * scale)} ${round(cmd.y1 * scale)} ${round(cmd.x2 * scale)} ${round(cmd.y2 * scale)} ${round(cmd.x * scale)} ${round(cmd.y * scale)} `;
          } else if (type === 'z') {
            // Close path
            token.o += ' ';
          }
        });
      }

      glyphs[char] = token;
    }
  }

  // Ensure space character exists
  if (!glyphs[' ']) {
    glyphs[' '] = {
      ha: round((font.charToGlyph(' ')?.advanceWidth || resolution * 0.25) * scale),
      x_min: 0,
      x_max: 0,
      o: '',
    };
  }

  const name = font.names.fullName?.en || font.names.fontFamily?.en || 'CustomFont';

  return {
    glyphs,
    cssFontWeight: 'bold',
    ascender: round(font.ascender * scale),
    descender: round(font.descender * scale),
    underlinePosition: round((font.tables.post?.underlinePosition || -100) * scale),
    underlineThickness: round((font.tables.post?.underlineThickness || 50) * scale),
    boundingBox: {
      yMin: round((font.tables.head?.yMin || 0) * scale),
      xMin: round((font.tables.head?.xMin || 0) * scale),
      yMax: round((font.tables.head?.yMax || 1000) * scale),
      xMax: round((font.tables.head?.xMax || 1000) * scale),
    },
    resolution: 1000,
    original_font_information: font.names,
    cssFontStyle: 'normal',
    lineHeight: round((font.ascender - font.descender) * scale),
    familyName: name,
  };
}

async function convertFile(inputPath, outputPath) {
  const buf = fs.readFileSync(inputPath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const font = opentype.parse(ab);
  const tf = fontToTypeface(font);
  fs.writeFileSync(outputPath, JSON.stringify(tf));
  console.log(`Converted: ${inputPath} -> ${outputPath} (${Object.keys(tf.glyphs).length} glyphs, ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
  return tf;
}

async function main() {
  await convertFile(
    'public/fonts/odisean-tech/ODISEAN-Tech-FFP.ttf',
    'public/fonts/odisean_tech.typeface.json'
  );

  await convertFile(
    'public/fonts/cuba-technology-demo/CubaTechnologyDemo-Regular.otf',
    'public/fonts/cuba_technology.typeface.json'
  );

  console.log('All typeface conversions completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
