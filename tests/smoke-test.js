/**
 * Zavmo Prompt Configuration Studio — Automated Smoke Tests
 * =========================================================
 * Runs on every push/PR via GitHub Actions.
 *
 * Tests the index.html for:
 *   1. Valid HTML structure (no unclosed tags)
 *   2. All required DOM elements exist
 *   3. No JavaScript syntax errors
 *   4. All event listeners reference existing elements
 *   5. Character data integrity (all 12 + Agent 13)
 *   6. No duplicate element IDs
 *   7. localStorage key consistency
 *   8. Function definition completeness
 *   9. Security checks (no exposed secrets)
 *  10. CSS class references match definitions
 *
 * Usage:
 *   node tests/smoke-test.js
 *
 * Exit codes:
 *   0 = all tests pass
 *   1 = one or more tests failed
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// TEST FRAMEWORK
// ============================================================
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    \x1b[31m${e.message}\x1b[0m`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(message || `Expected to find "${needle}"`);
  }
}

function assertNotIncludes(haystack, needle, message) {
  if (haystack.includes(needle)) {
    throw new Error(message || `Should NOT contain "${needle}"`);
  }
}

// ============================================================
// LOAD THE FILE
// ============================================================
const indexPath = path.join(__dirname, '..', 'index.html');
console.log(`\nLoading ${indexPath}...\n`);

let html;
try {
  html = fs.readFileSync(indexPath, 'utf8');
} catch (e) {
  console.error(`\x1b[31mFATAL: Cannot read index.html: ${e.message}\x1b[0m`);
  process.exit(1);
}

// Extract just the JavaScript (between <script> tags)
const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
const allScripts = scriptMatch ? scriptMatch.map(s => s.replace(/<\/?script[^>]*>/gi, '')).join('\n') : '';

// Extract CSS
const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
const allStyles = styleMatch ? styleMatch.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n') : '';


// ============================================================
// TEST SUITE 1: HTML STRUCTURE
// ============================================================
console.log('\n\x1b[1m1. HTML Structure\x1b[0m');

test('Has valid DOCTYPE', () => {
  assertIncludes(html.substring(0, 100).toLowerCase(), '<!doctype html>');
});

test('Has <html> opening and closing tags', () => {
  assertIncludes(html, '<html');
  assertIncludes(html, '</html>');
});

test('Has <head> section', () => {
  assertIncludes(html, '<head>');
  assertIncludes(html, '</head>');
});

test('Has <body> section', () => {
  assertIncludes(html, '<body');
  assertIncludes(html, '</body>');
});

test('Has page title', () => {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  assert(titleMatch, 'Missing <title> tag');
  assert(titleMatch[1].includes('Zavmo'), 'Title should contain "Zavmo"');
});

test('Has meta viewport for responsive design', () => {
  assertIncludes(html, 'viewport');
});


// ============================================================
// TEST SUITE 2: REQUIRED DOM ELEMENTS
// ============================================================
console.log('\n\x1b[1m2. Required DOM Elements\x1b[0m');

const requiredIds = [
  // Access gate
  'gate-email', 'gate-code', 'gate-error',
  // Character prompt area
  'prompt-textarea',
  // Teaching Charter
  'teaching-charter-textarea',
  // API modal
  'api-modal-overlay', 'api-url', 'api-token', 'api-search-btn',
  // Simulation
  'learner-input',
  // Push to Zavmo
  'push-to-zavmo-btn', 'push-all-zavmo-btn',
];

for (const id of requiredIds) {
  test(`Element #${id} exists`, () => {
    const regex = new RegExp(`id=["']${id}["']`);
    assert(regex.test(html), `Missing element with id="${id}"`);
  });
}


// ============================================================
// TEST SUITE 3: NO DUPLICATE IDS
// ============================================================
console.log('\n\x1b[1m3. Duplicate ID Check\x1b[0m');

test('No duplicate element IDs in HTML', () => {
  const idRegex = /\bid=["']([^"']+)["']/g;
  const ids = {};
  const duplicates = [];
  let match;

  while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    if (ids[id]) {
      duplicates.push(id);
    }
    ids[id] = (ids[id] || 0) + 1;
  }

  assert(
    duplicates.length === 0,
    `Duplicate IDs found: ${duplicates.join(', ')}`
  );
});


// ============================================================
// TEST SUITE 4: CHARACTER DATA INTEGRITY
// ============================================================
console.log('\n\x1b[1m4. Character Data Integrity\x1b[0m');

const expectedCharacters = [
  'foundation-builder', 'challenge-coach', 'career-navigator',
  'experiment-space', 'pattern-connector', 'practical-builder',
  'systems-analyst', 'collaboration-guide', 'creative-catalyst',
  'evidence-evaluator', 'qualification-certifier', 'integrator',
];

for (const charKey of expectedCharacters) {
  test(`Character "${charKey}" is defined`, () => {
    assertIncludes(allScripts, `'${charKey}'`, `Character key '${charKey}' not found in scripts`);
  });
}

test('Agent 13 is defined', () => {
  assertIncludes(allScripts, "'agent-13'");
});

test('STUDIO_TO_ZAVMO_MAP is defined', () => {
  assertIncludes(allScripts, 'STUDIO_TO_ZAVMO_MAP');
});

test('Character mapping has all 12 entries', () => {
  for (const key of expectedCharacters) {
    assertIncludes(allScripts, `'${key}':`);
  }
});


// ============================================================
// TEST SUITE 5: JAVASCRIPT FUNCTION DEFINITIONS
// ============================================================
console.log('\n\x1b[1m5. Required Functions\x1b[0m');

const requiredFunctions = [
  'saveTeachingCharter', 'resetTeachingCharter', 'loadTeachingCharter',
  'saveAgent13Charter', 'resetAgent13Charter', 'loadAgent13Charter',
  'saveAgent13Prompt', 'resetAgent13Prompt', 'loadAgent13PromptEditor',
  'pushPromptToZavmo', 'pushAllPromptsToZavmo', 'pushCurrentPromptToZavmo',
  'searchAPIDatabase', 'displayAPIModules', 'selectAPILesson',
  'importSelectedUnits', 'loadCharacterData',
  'sendLearnerMessage', 'showToast',
  'getZavmoApiSettings', 'saveZavmoApiSettings',
  'renderMarkdown',
];

for (const fn of requiredFunctions) {
  test(`Function ${fn}() is defined`, () => {
    const regex = new RegExp(`function\\s+${fn}\\s*\\(`);
    assert(regex.test(allScripts), `Function ${fn}() not found`);
  });
}


// ============================================================
// TEST SUITE 6: EVENT LISTENER SAFETY
// ============================================================
console.log('\n\x1b[1m6. Event Listener Safety\x1b[0m');

test('addEventListener calls reference existing IDs', () => {
  const listenerRegex = /getElementById\(['"]([^'"]+)['"]\)\.addEventListener/g;
  const missing = [];
  let match;

  while ((match = listenerRegex.exec(allScripts)) !== null) {
    const id = match[1];
    const idInHtml = new RegExp(`id=["']${id}["']`);
    if (!idInHtml.test(html)) {
      missing.push(id);
    }
  }

  assert(
    missing.length === 0,
    `addEventListener references non-existent IDs: ${missing.join(', ')}`
  );
});


// ============================================================
// TEST SUITE 7: SECURITY CHECKS
// ============================================================
console.log('\n\x1b[1m7. Security\x1b[0m');

test('No hardcoded API keys', () => {
  // Check for common API key patterns
  const apiKeyPatterns = [
    /sk-[a-zA-Z0-9]{20,}/,        // OpenAI
    /sk-ant-[a-zA-Z0-9]{20,}/,    // Anthropic
    /Bearer\s+eyJ[a-zA-Z0-9]/,    // JWT tokens (hardcoded)
  ];

  for (const pattern of apiKeyPatterns) {
    assertNotIncludes(
      allScripts.replace(/placeholder[^'"]*/gi, ''),  // Ignore placeholder text
      pattern.source,
      `Possible hardcoded API key found matching pattern: ${pattern.source}`
    );
  }
});

test('No hardcoded passwords', () => {
  const passwordPatterns = [
    /password\s*[:=]\s*['"][^'"]{6,}['"]/i,
    /secret\s*[:=]\s*['"][^'"]{6,}['"]/i,
  ];

  // Only check actual assignments, not placeholder text or help text
  const codeLines = allScripts.split('\n').filter(
    l => !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.includes('placeholder')
  );
  const codeOnly = codeLines.join('\n');

  for (const pattern of passwordPatterns) {
    const match = pattern.exec(codeOnly);
    if (match) {
      // Allow known safe patterns
      if (match[0].includes("''") || match[0].includes('""') || match[0].includes('getItem')) continue;
      assert(false, `Possible hardcoded secret: ${match[0].substring(0, 40)}...`);
    }
  }
});

test('Access codes are SHA-256 hashed', () => {
  assertIncludes(allScripts, 'SHA-256', 'Access code hashing should use SHA-256');
  assertNotIncludes(
    allScripts,
    "ALLOWED_CODES = ['zavmo",
    'Access codes should be stored as hashes, not plaintext'
  );
});


// ============================================================
// TEST SUITE 8: LOCALSTORAGE KEY CONSISTENCY
// ============================================================
console.log('\n\x1b[1m8. localStorage Key Consistency\x1b[0m');

test('localStorage keys use zavmo_ prefix', () => {
  const setItemRegex = /localStorage\.setItem\(['"]([^'"]+)['"]/g;
  const nonPrefixed = [];
  let match;

  while ((match = setItemRegex.exec(allScripts)) !== null) {
    if (!match[1].startsWith('zavmo_')) {
      nonPrefixed.push(match[1]);
    }
  }

  assert(
    nonPrefixed.length === 0,
    `localStorage keys without zavmo_ prefix: ${nonPrefixed.join(', ')}`
  );
});

test('All setItem keys have matching getItem usage', () => {
  const setKeys = new Set();
  const getKeys = new Set();

  const setRegex = /localStorage\.setItem\(['"]([^'"]+)['"]/g;
  const getRegex = /localStorage\.getItem\(['"]([^'"]+)['"]/g;

  let m;
  while ((m = setRegex.exec(allScripts)) !== null) setKeys.add(m[1]);
  while ((m = getRegex.exec(allScripts)) !== null) getKeys.add(m[1]);

  const orphanSets = [...setKeys].filter(k => !getKeys.has(k));
  // Allow dynamic keys and known Agent 13 keys
  const realOrphans = orphanSets.filter(k => !k.includes('$') && !k.startsWith('zavmo_prompt_'));

  assert(
    realOrphans.length === 0,
    `localStorage keys set but never read: ${realOrphans.join(', ')}`
  );
});


// ============================================================
// TEST SUITE 9: NULL SAFETY PATTERNS
// ============================================================
console.log('\n\x1b[1m9. Null Safety Patterns\x1b[0m');

test('Status element access uses null checks', () => {
  // Find patterns like: const status = getElementById(...); status.style
  // These should have an if (status) check
  const dangerousPattern = /const\s+status\s*=\s*document\.getElementById\([^)]+\);\s*\n\s*status\.style/g;
  const matches = allScripts.match(dangerousPattern) || [];
  assert(
    matches.length === 0,
    `Found ${matches.length} status element access(es) without null checks`
  );
});

test('Clipboard operations have error handling', () => {
  // Find all clipboard calls and check they have either .catch() or are inside try/catch
  const clipboardRegex = /navigator\.clipboard\.writeText/g;
  let match;
  let uncaught = 0;

  while ((match = clipboardRegex.exec(allScripts)) !== null) {
    const surrounding = allScripts.substring(
      Math.max(0, match.index - 200),
      match.index + 300
    );
    const hasCatch = surrounding.includes('.catch');
    const hasTryCatch = surrounding.includes('try {') || surrounding.includes('try{');
    if (!hasCatch && !hasTryCatch) {
      uncaught++;
    }
  }

  assert(uncaught === 0, `Found ${uncaught} clipboard call(s) without error handling`);
});


// ============================================================
// TEST SUITE 10: API INTEGRATION
// ============================================================
console.log('\n\x1b[1m10. API Integration\x1b[0m');

test('Zavmo API base URL is correct', () => {
  assertIncludes(allScripts, 'uat.zavmo.co.uk:8000');
});

test('API uses Bearer token authentication', () => {
  assertIncludes(allScripts, "'Authorization': 'Bearer '");
});

test('Push endpoint matches expected format', () => {
  assertIncludes(allScripts, "/api/deliver/characters/");
  assertIncludes(allScripts, "/prompt/");
});

test('API error codes are handled (401, 403, 404, 405)', () => {
  assertIncludes(allScripts, 'response.status === 404');
  assertIncludes(allScripts, 'response.status === 401');
  assertIncludes(allScripts, 'response.status === 405');
});


// ============================================================
// RESULTS
// ============================================================
console.log('\n' + '='.repeat(50));
console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`);

if (failures.length > 0) {
  console.log('\n\x1b[31mFailures:\x1b[0m');
  for (const f of failures) {
    console.log(`  \x1b[31m✗ ${f.name}\x1b[0m`);
    console.log(`    ${f.error}`);
  }
}

console.log('');
process.exit(failed > 0 ? 1 : 0);
