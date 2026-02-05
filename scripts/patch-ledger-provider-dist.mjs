import fs from "node:fs";
import path from "node:path";

/**
 * Patch ledger-wallet-provider bundles to avoid `undefined.length` crashes.
 *
 * Why this exists:
 * - Vite rebuilds `dist/index.js` on Vercel.
 * - Some bundled dependency code can do `state.installedApps.length === 0`
 *   while `installedApps` is still undefined in certain session states.
 * - This script makes the check defensive *after* bundling.
 *
 * Usage:
 *   node ../../scripts/patch-ledger-provider-dist.mjs dist/index.js
 */

const targetArg = process.argv[2];
if (!targetArg) {
  console.error("Missing path argument. Example: node patch-ledger-provider-dist.mjs dist/index.js");
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), targetArg);
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const src = fs.readFileSync(filePath, "utf8");

// Idempotency: if already patched, do nothing.
if (src.includes(".installedApps === void 0 ||") || src.includes(".installedApps==null||")) {
  process.exit(0);
}

// Replace:   <obj>.installedApps.length === 0
// With:      <obj>.installedApps === void 0 || <obj>.installedApps.length === 0
//
// Keep it narrow to avoid unintended replacements.
const re = /([A-Za-z_$][\w$]*\s*\.\s*installedApps)\s*\.\s*length\s*===\s*0/g;
const next = src.replace(re, "$1 === void 0 || $1.length === 0");

if (next === src) {
  // Nothing to patch (maybe upstream already fixed / code shape differs)
  process.exit(0);
}

fs.writeFileSync(filePath, next, "utf8");
