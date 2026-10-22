#!/usr/bin/env node
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const presetsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'presets');
const presets = readdirSync(presetsDir)
  .filter((f) => f.endsWith('.editorconfig'))
  .map((f) => f.replace(/\.editorconfig$/, ''));

const rl = createInterface({ input: process.stdin, output: process.stdout });

async function ask(question, fallback) {
  const answer = (await rl.question(`${question} (${fallback}): `)).trim();
  return answer || fallback;
}

try {
  console.log('Choose a preset:');
  presets.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  const choice = (await ask('Preset number or name', '1')).toLowerCase();
  const preset = presets[Number(choice) - 1] ?? presets.find((p) => p === choice);
  if (!preset) throw new Error(`Unknown preset: ${choice}`);

  const dir = resolve(await ask('Project path', process.cwd()));
  const target = join(dir, '.editorconfig');
  if (existsSync(target)) {
    const overwrite = (await ask('.editorconfig exists. Overwrite? [y/N]', 'N')).toLowerCase();
    if (overwrite !== 'y') {
      console.log('Aborted.');
      process.exit(0);
    }
  }
  copyFileSync(join(presetsDir, `${preset}.editorconfig`), target);
  console.log(`Created ${target} (${preset} preset)`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  rl.close();
}
