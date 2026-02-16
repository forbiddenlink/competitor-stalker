import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const assetsDir = resolve(process.cwd(), 'dist/assets');
const assetFiles = readdirSync(assetsDir);

const resolveAssetPath = (filename) => resolve(assetsDir, filename);

const toKb = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;

const sum = (values) => values.reduce((total, value) => total + value, 0);

const findOne = (regex, label) => {
  const matches = assetFiles.filter((file) => regex.test(file));
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${label} file, found ${matches.length}`);
  }
  return matches[0];
};

const fileSize = (filename) => statSync(resolveAssetPath(filename)).size;

const gzipSize = (filename) => gzipSync(readFileSync(resolveAssetPath(filename))).length;

const entryJs = findOne(/^index-[\w-]+\.js$/, 'entry JavaScript');
const entryCss = findOne(/^index-[\w-]+\.css$/, 'entry CSS');

const runtimeChunkRegexes = [
  /^index-[\w-]+\.js$/,
  /^react-core-[\w-]+\.js$/,
  /^router-[\w-]+\.js$/,
  /^vendor-[\w-]+\.js$/,
  /^icons-[\w-]+\.js$/,
];

const runtimeJsChunks = assetFiles.filter((file) =>
  runtimeChunkRegexes.some((regex) => regex.test(file)),
);

const entryJsRaw = fileSize(entryJs);
const entryJsGzip = gzipSize(entryJs);
const entryCssRaw = fileSize(entryCss);
const entryCssGzip = gzipSize(entryCss);
const runtimeJsRaw = sum(runtimeJsChunks.map((file) => fileSize(file)));
const runtimeJsGzip = sum(runtimeJsChunks.map((file) => gzipSize(file)));

const budgets = [
  { label: 'Entry JS (raw)', actual: entryJsRaw, max: 200 * 1024 },
  { label: 'Entry JS (gzip)', actual: entryJsGzip, max: 65 * 1024 },
  { label: 'Entry CSS (raw)', actual: entryCssRaw, max: 65 * 1024 },
  { label: 'Entry CSS (gzip)', actual: entryCssGzip, max: 12 * 1024 },
  { label: 'Runtime JS (raw)', actual: runtimeJsRaw, max: 340 * 1024 },
  { label: 'Runtime JS (gzip)', actual: runtimeJsGzip, max: 105 * 1024 },
];

const failures = budgets.filter((budget) => budget.actual > budget.max);

console.log('Bundle budget report');
console.log(`- Entry JS: ${entryJs}`);
console.log(`- Entry CSS: ${entryCss}`);
console.log(`- Runtime JS chunks: ${runtimeJsChunks.join(', ') || '(none)'}`);

for (const budget of budgets) {
  const status = budget.actual <= budget.max ? 'PASS' : 'FAIL';
  console.log(
    `- [${status}] ${budget.label}: ${toKb(budget.actual)} (limit ${toKb(budget.max)})`,
  );
}

if (failures.length > 0) {
  process.exitCode = 1;
}
