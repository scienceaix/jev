const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8'));
const assetsDir = path.join(root, 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

const colors = {
  ink: '#11151f',
  ink2: '#202938',
  paper: '#f6f8fb',
  paper2: '#e9eff6',
  line: '#c9d4e1',
  muted: '#687688',
  white: '#ffffff',
  coral: '#f46d61',
  cyan: '#27a6c1',
  cyanSoft: '#b9e9f0',
  amber: '#e2a33b',
  violet: '#8177e6',
  green: '#38a875'
};

const roleColor = {
  official: colors.coral,
  application: colors.cyan,
  infrastructure: colors.violet,
  research: colors.amber,
  curation: colors.green
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function text(x, y, value, options = {}) {
  const attrs = [
    `x="${x}"`, `y="${y}"`, `fill="${options.fill || colors.ink}"`,
    `font-family="${options.family || 'Arial, sans-serif'}"`,
    `font-size="${options.size || 16}px"`,
    `font-weight="${options.weight || 400}"`,
    `letter-spacing="${options.spacing || 0}px"`
  ];
  if (options.anchor) attrs.push(`text-anchor="${options.anchor}"`);
  if (options.opacity) attrs.push(`opacity="${options.opacity}"`);
  return `<text ${attrs.join(' ')}>${esc(value)}</text>`;
}

function line(x1, y1, x2, y2, stroke = colors.line, width = 1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
}

function rect(x, y, width, height, fill, stroke = 'none', strokeWidth = 0, rx = 0) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" rx="${rx}"/>`;
}

function wrap(value, max = 38) {
  const words = String(value).split(/\s+/);
  const rows = [];
  let row = '';
  words.forEach((word) => {
    if ((row + ' ' + word).trim().length > max && row) {
      rows.push(row);
      row = word;
    } else {
      row = (row + ' ' + word).trim();
    }
  });
  if (row) rows.push(row);
  return rows;
}

function tableSvg() {
  const width = 1800;
  const rowHeight = 73;
  const headerHeight = 180;
  const tableTop = 252;
  const footerHeight = 112;
  const height = tableTop + projects.length * rowHeight + footerHeight;
  const xs = { rank: 54, project: 140, role: 590, stars: 770, license: 920, maturity: 1080, access: 1286, best: 1518 };
  let out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`];
  out.push(rect(0, 0, width, height, colors.paper));
  out.push(rect(0, 0, width, headerHeight, colors.ink));
  out.push(text(56, 60, 'AWESOME JEV / SIGNAL TABLE', { fill: colors.cyanSoft, family: 'monospace', size: 15, weight: 500, spacing: 2 }));
  out.push(text(56, 121, 'The ecosystem at a glance.', { fill: colors.white, family: 'Arial, sans-serif', size: 48, weight: 700, spacing: -1.8 }));
  out.push(text(56, 154, 'Snapshot 28 Sep 2026 · stars measure attention, not readiness', { fill: '#aebdcd', family: 'monospace', size: 14, weight: 400, spacing: .4 }));
  out.push(text(width - 54, 60, 'STATE → QUESTIONS → PROBABILITIES → ACTION', { fill: colors.cyanSoft, family: 'monospace', size: 13, weight: 500, anchor: 'end', spacing: 1 }));
  out.push(text(width - 54, 154, '12 curated projects', { fill: '#aebdcd', family: 'monospace', size: 14, anchor: 'end' }));

  out.push(rect(0, tableTop - 43, width, 43, colors.paper2));
  const headers = [['#', xs.rank], ['PROJECT', xs.project], ['ROLE', xs.role], ['STARS', xs.stars], ['LICENSE', xs.license], ['MATURITY', xs.maturity], ['ACCESS', xs.access], ['BEST USE', xs.best]];
  headers.forEach(([label, x]) => out.push(text(x, tableTop - 15, label, { fill: colors.muted, family: 'monospace', size: 11, weight: 500, spacing: 1 })));

  projects.forEach((project, index) => {
    const y = tableTop + index * rowHeight;
    const fill = index % 2 === 0 ? colors.white : '#f0f4f8';
    out.push(rect(0, y, width, rowHeight, fill));
    out.push(line(0, y + rowHeight, width, y + rowHeight, colors.line, 1));
    out.push(rect(54, y + 25, 10, 10, roleColor[project.role] || colors.cyan, 'none', 0, 5));
    out.push(text(80, y + 35, String(project.rank).padStart(2, '0'), { fill: colors.muted, family: 'monospace', size: 13, weight: 500 }));
    out.push(text(xs.project, y + 29, project.name, { fill: colors.ink, size: 18, weight: 700 }));
    out.push(text(xs.project, y + 51, project.repo, { fill: colors.muted, family: 'monospace', size: 11 }));
    out.push(text(xs.role, y + 35, project.role, { fill: roleColor[project.role] || colors.ink, family: 'monospace', size: 12, weight: 500 }));
    out.push(text(xs.stars, y + 35, project.starsLabel || 'HF model', { fill: colors.ink, family: 'monospace', size: 14, weight: 500 }));
    out.push(text(xs.license, y + 35, project.license, { fill: colors.ink, family: 'monospace', size: 12 }));
    out.push(text(xs.maturity, y + 35, project.maturity, { fill: colors.ink, family: 'monospace', size: 12 }));
    out.push(text(xs.access, y + 35, project.access, { fill: colors.ink, family: 'monospace', size: 12 }));
    out.push(text(xs.best, y + 35, project.recommendation, { fill: colors.ink, size: 13, weight: 600 }));
  });

  const footerY = tableTop + projects.length * rowHeight;
  out.push(rect(0, footerY, width, footerHeight, colors.ink2));
  out.push(text(56, footerY + 42, 'READ THE CAVEAT', { fill: colors.cyanSoft, family: 'monospace', size: 11, weight: 500, spacing: 1.5 }));
  out.push(text(56, footerY + 75, 'This is a map of a two-week ecosystem — not a production certification.', { fill: colors.white, size: 20, weight: 600 }));
  out.push(text(width - 54, footerY + 74, 'awesome-jev / field guide', { fill: '#aebdcd', family: 'monospace', size: 12, anchor: 'end' }));
  out.push('</svg>');
  return out.join('');
}

function posterSvg() {
  const width = 1400;
  const panelHeight = 570;
  const gutter = 24;
  const height = panelHeight * 4 + gutter * 3;
  const maxStars = projects.find((project) => project.stars)?.stars || 1;
  let out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`];
  out.push(rect(0, 0, width, height, colors.ink));

  // Panel 1: thesis
  let y = 0;
  out.push(rect(0, y, width, panelHeight, colors.ink));
  out.push(text(66, y + 66, 'AWESOME JEV / FIELD GUIDE', { fill: colors.cyanSoft, family: 'monospace', size: 14, weight: 500, spacing: 2 }));
  out.push(text(66, y + 164, 'State in.', { fill: colors.white, size: 82, weight: 700, spacing: -3 }));
  out.push(text(66, y + 252, 'Typed decisions out.', { fill: colors.cyanSoft, size: 82, weight: 700, spacing: -3 }));
  out.push(text(70, y + 322, 'A visual field guide to the young Jev ecosystem.', { fill: '#b7c4d2', size: 21, weight: 400 }));
  out.push(text(70, y + 372, 'STATE', { fill: colors.muted, family: 'monospace', size: 12, weight: 500, spacing: 1.5 }));
  out.push(text(264, y + 372, 'TYPED QUESTIONS', { fill: colors.cyanSoft, family: 'monospace', size: 12, weight: 500, spacing: 1.5 }));
  out.push(text(560, y + 372, 'PROBABILITIES', { fill: '#ffb0a8', family: 'monospace', size: 12, weight: 500, spacing: 1.5 }));
  out.push(text(846, y + 372, 'ACTION', { fill: colors.amber, family: 'monospace', size: 12, weight: 500, spacing: 1.5 }));
  out.push(line(70, y + 401, 1130, y + 401, '#4a5c70', 1));
  out.push(text(70, y + 449, 'The useful boundary: choose with a decision model,', { fill: '#b7c4d2', size: 18 }));
  out.push(text(70, y + 477, 'execute and verify with deterministic code.', { fill: '#b7c4d2', size: 18 }));
  out.push(text(width - 68, y + 66, '01', { fill: colors.coral, family: 'monospace', size: 16, weight: 500, anchor: 'end' }));

  // Panel 2: layers
  y += panelHeight + gutter;
  out.push(rect(0, y, width, panelHeight, colors.paper));
  out.push(text(66, y + 66, '02 / WHERE THE WORK LANDS', { fill: colors.coral, family: 'monospace', size: 14, weight: 500, spacing: 2 }));
  out.push(text(66, y + 135, 'Three layers, one protocol shape.', { fill: colors.ink, size: 47, weight: 700, spacing: -1.7 }));
  const layerY = y + 207;
  const layerW = 384;
  const layerGap = 28;
  const layerData = [
    ['A', 'APPLICATIONS', 'Jev Ultrafast', 'fast-jev-compaction', 'typesafe-computer-use', colors.cyan],
    ['B', 'INFRASTRUCTURE', 'official SDKs', 'System One adapter', 'Ollaya local runtime', colors.violet],
    ['C', 'OPEN RESEARCH', 'NanoJev', 'jevlike', 'JEV-27B', colors.amber]
  ];
  layerData.forEach((layer, i) => {
    const x = 66 + i * (layerW + layerGap);
    out.push(rect(x, layerY, layerW, 234, '#ffffff', colors.line, 1));
    out.push(rect(x, layerY, 7, 234, layer[5]));
    out.push(text(x + 28, layerY + 40, layer[0], { fill: layer[5], family: 'monospace', size: 14, weight: 500 }));
    out.push(text(x + 72, layerY + 40, layer[1], { fill: colors.muted, family: 'monospace', size: 11, weight: 500, spacing: 1.3 }));
    out.push(text(x + 28, layerY + 94, layer[2], { fill: colors.ink, size: 23, weight: 700 }));
    out.push(text(x + 28, layerY + 135, layer[3], { fill: colors.ink, size: 18, weight: 600 }));
    out.push(text(x + 28, layerY + 174, layer[4], { fill: colors.ink, size: 18, weight: 600 }));
    out.push(line(x + 28, layerY + 198, x + layerW - 28, layerY + 198, colors.line));
    out.push(text(x + 28, layerY + 219, i === 0 ? 'choose in real loops' : i === 1 ? 'make interfaces portable' : 'test the hypothesis', { fill: colors.muted, size: 12 }));
  });
  out.push(text(width - 68, y + 66, '02', { fill: colors.coral, family: 'monospace', size: 16, weight: 500, anchor: 'end' }));

  // Panel 3: traction
  y += panelHeight + gutter;
  out.push(rect(0, y, width, panelHeight, '#d9edf2'));
  out.push(text(66, y + 66, '03 / MOMENTUM', { fill: '#19758a', family: 'monospace', size: 14, weight: 500, spacing: 2 }));
  out.push(text(66, y + 135, 'Attention is concentrated.', { fill: colors.ink, size: 49, weight: 700, spacing: -1.7 }));
  out.push(text(66, y + 177, 'GitHub stars, snapshot 28 Sep 2026', { fill: '#53707c', family: 'monospace', size: 13 }));
  projects.filter((project) => Number.isFinite(project.stars)).slice(0, 8).forEach((project, i) => {
    const rowY = y + 220 + i * 32;
    const barW = Math.max(4, (project.stars / maxStars) * 650);
    out.push(text(66, rowY + 13, project.name, { fill: colors.ink, size: 14, weight: i === 0 ? 700 : 500 }));
    out.push(rect(300, rowY + 2, 650, 14, '#bdd7dc'));
    out.push(rect(300, rowY + 2, barW, 14, i === 0 ? colors.coral : i === 2 ? colors.amber : colors.cyan));
    out.push(text(980, rowY + 14, project.starsLabel, { fill: colors.ink, family: 'monospace', size: 13, weight: 500 }));
  });
  out.push(text(66, y + 514, 'The breakout app has more stars than the next several Jev-centric projects combined.', { fill: '#53707c', size: 15 }));
  out.push(text(width - 68, y + 66, '03', { fill: colors.coral, family: 'monospace', size: 16, weight: 500, anchor: 'end' }));

  // Panel 4: trial guide
  y += panelHeight + gutter;
  out.push(rect(0, y, width, panelHeight, colors.paper));
  out.push(text(66, y + 66, '04 / FIRST TRIAL', { fill: colors.coral, family: 'monospace', size: 14, weight: 500, spacing: 2 }));
  out.push(text(66, y + 135, 'Measure the loop before you trust it.', { fill: colors.ink, size: 46, weight: 700, spacing: -1.7 }));
  const recs = [
    ['01', 'HOSTED', 'Official SDK + adapter', 'gate confidence · measure p95 · keep a fallback', colors.coral],
    ['02', 'LOCAL', 'Ollaya + open models', 'pin versions · compare families · validate locally', colors.cyan],
    ['03', 'RESEARCH', 'NanoJev / jevlike / JEV-27B', 'study different objectives · do not call one “the open Jev”', colors.amber]
  ];
  recs.forEach((rec, i) => {
    const x = 66 + i * 424;
    out.push(line(x, y + 205, x + 360, y + 205, colors.line, 1));
    out.push(text(x, y + 244, rec[0], { fill: rec[4], family: 'monospace', size: 14, weight: 500 }));
    out.push(text(x + 50, y + 244, rec[1], { fill: colors.muted, family: 'monospace', size: 11, weight: 500, spacing: 1.5 }));
    out.push(text(x, y + 292, rec[2], { fill: colors.ink, size: 23, weight: 700 }));
    wrap(rec[3], 41).forEach((row, rowIndex) => out.push(text(x, y + 334 + rowIndex * 23, row, { fill: colors.muted, size: 15 })));
  });
  out.push(line(66, y + 475, width - 66, y + 475, colors.line, 1));
  out.push(text(66, y + 514, 'The ecosystem is young. Treat every benchmark as a hypothesis that needs a workload.', { fill: colors.muted, size: 16 }));
  out.push(text(width - 68, y + 66, '04', { fill: colors.coral, family: 'monospace', size: 16, weight: 500, anchor: 'end' }));

  out.push('</svg>');
  return out.join('');
}

function writeAndPng(name, svg) {
  const svgPath = path.join(assetsDir, `${name}.svg`);
  const pngPath = path.join(assetsDir, `${name}.png`);
  fs.writeFileSync(svgPath, svg);
  execFileSync('convert', ['-background', 'none', '-density', '144', svgPath, pngPath], { stdio: 'inherit' });
  console.log(`wrote ${path.relative(root, svgPath)} and ${path.relative(root, pngPath)}`);
}

writeAndPng('jev-infographic-table', tableSvg());
writeAndPng('jev-poster-slides', posterSvg());
