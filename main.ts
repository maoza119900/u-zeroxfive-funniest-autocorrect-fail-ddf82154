// Funniest Autocorrect Fail — make.fun program/v1 entry.
// Writes one line, the autocorrect fail itself, to <MAKEFUN_OUTPUT_DIR>/entry.txt.
// Deterministic: fixed text, no randomness, no timestamps, no network, no secrets.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: exactly one line, 101 characters, well inside the 1-199 gate.
const ENTRY: string =
  "Texted my husband 'I picked up your prescription' — autocorrect sent 'I picked up your prostitution.'";

function fail(message: string): never {
  console.error(`entry failed self-check: ${message}`);
  process.exit(1);
}

function main(): void {
  const outDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

  // Self-checks against the competition gate (entry.txt: UTF-8, 1-199 chars,
  // not only whitespace, a single line).
  if (ENTRY.length < 1 || ENTRY.length > 199) {
    fail(`length ${ENTRY.length} is outside the 1-199 character gate`);
  }
  if (ENTRY.trim().length === 0) {
    fail("entry is only whitespace");
  }
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    fail("entry must be a single line");
  }
  for (const ch of ENTRY) {
    const code: number = ch.codePointAt(0) as number;
    if (code < 0x20 && ch !== "\t") {
      fail(`entry holds a control character U+${code.toString(16).padStart(4, "0")}`);
    }
  }

  // Write the entry byte for byte: no trailing newline, so the file content
  // IS the entry text and nothing else. Then read it back and confirm the
  // bytes on disk are exactly the entry, so a silent write failure cannot
  // pass unnoticed.
  mkdirSync(outDir, { recursive: true });
  const target: string = join(outDir, "entry.txt");
  writeFileSync(target, ENTRY, "utf8");
  if (readFileSync(target, "utf8") !== ENTRY) {
    fail("entry.txt on disk does not match the entry text");
  }
}

main();
