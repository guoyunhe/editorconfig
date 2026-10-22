#!/usr/bin/env node
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';

const presetsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'presets');
const presets = readdirSync(presetsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(presetsDir, d.name, '.editorconfig')))
  .map((d) => d.name);

p.intro('@guoyunhe/editorconfig');

const preset = await p.select({
  message: 'Choose a preset',
  options: presets.map((name) => ({ value: name, label: name })),
});
if (p.isCancel(preset)) {
  p.cancel('Cancelled.');
  process.exit(0);
}

const path = await p.text({
  message: 'Project path',
  initialValue: process.cwd(),
});
if (p.isCancel(path)) {
  p.cancel('Cancelled.');
  process.exit(0);
}

const target = join(resolve(path), '.editorconfig');
if (existsSync(target)) {
  const overwrite = await p.confirm({
    message: '.editorconfig already exists. Overwrite?',
    initialValue: false,
  });
  if (p.isCancel(overwrite) || !overwrite) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
}

try {
  copyFileSync(join(presetsDir, preset, '.editorconfig'), target);
  p.outro(`Created ${target} (${preset} preset)`);
} catch (e) {
  p.cancel(e.message);
  process.exitCode = 1;
}
