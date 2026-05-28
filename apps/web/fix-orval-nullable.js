#!/usr/bin/env node

/**
 * Post-generation fix for Orval's incorrect handling of OpenAPI `anyOf` with
 * `{ nullable: true, enum: [null] }` (no `type` field).
 *
 * The Zod v4 + fastify-type-provider-zod combo generates:
 *   { "anyOf": [{ "type": "string" }, { "nullable": true, "enum": [null] }] }
 *
 * Orval translates this to invalid TypeScript:
 *   export type X = string |  | null;
 *
 * This script replaces the broken `|  | null` pattern with `| null`
 * across all generated `.gen.ts` files.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const GEN_DIR = join(import.meta.dirname, 'src', 'http', 'gen');

let fixedCount = 0;
let fileCount = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith('.gen.ts')) {
      const content = readFileSync(fullPath, 'utf8');
      // Match `|  | null` (double pipe with empty type between) or `| | null`
      const fixed = content.replace(/\|\s+\|\s+null/g, '| null');
      if (fixed !== content) {
        writeFileSync(fullPath, fixed, 'utf8');
        fileCount++;
        fixedCount += (content.match(/\|\s+\|\s+null/g) || []).length;
      }
    }
  }
}

walk(GEN_DIR);

if (fixedCount > 0) {
  console.log(`✅ Fixed ${fixedCount} broken nullable type(s) across ${fileCount} file(s)`);
} else {
  console.log('✅ No broken nullable types found — all clean!');
}