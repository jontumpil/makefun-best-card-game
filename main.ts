// Ember Court — main.ts
// Menyerahkan entri: menyalin game/ dan screenshots/ dari samping
// file ini ke direktori output, lalu menulis dossier.json dengan
// buildDossier dari vendor/makefun-game.ts.
//
// Direktori output: MAKEFUN_OUTPUT_DIR bila diset, kalau tidak /output.
// Hanya memakai pustaka standar Node.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(name: string): void {
  const from = join(here, name);
  const to = join(outDir, name);
  if (!existsSync(from)) return;
  cpSync(from, to, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
rmSync(join(outDir, 'game'), { recursive: true, force: true });
rmSync(join(outDir, 'screenshots'), { recursive: true, force: true });
copyTree('game');
copyTree('screenshots');

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log('Ember Court handed in: dossier written to ' + join(outDir, 'dossier.json'));
