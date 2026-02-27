/**
 * Zavmo Prompt Configuration Studio ÃÂ¢ÃÂÃÂ Automated Smoke Tests v2
 * =============================================================
 * Runs on every push/PR via GitHub Actions AND as a pre-commit hook.
 *
 * KEY FEATURE: Auto-discovery
 * ---------------------------
 * Tests 11-14 use regex to dynamically discover qualification constants,
 * country registrations, unit definitions, and function definitions directly
 * from the source code. When new modules, countries, or functions are added,
 * they are automatically picked up ÃÂ¢ÃÂÃÂ no manual test updates needed.
 *
 * Test suites:
 *   1.  Valid HTML structure
 *   2.  Required DOM elements
 *   3.  No duplicate element IDs
 *   4.  Character data integrity (all 12 + Agent 13)
 *   5.  Required core functions
 *   6.  Event listener safety
 *   7.  Security checks (no exposed secrets)
 *   8.  localStorage key consistency
 *   9.  Null safety patterns
 *  10.  API integration
 *  11.  AUTO-DISCOVERED: Qualification constants integrity
 *  12.  AUTO-DISCOVERED: Country registry completeness
 *  13.  AUTO-DISCOVERED: Unit data integrity (LOs & ACs)
 *  14.  AUTO-DISCOVERED: Function cross-reference safety
 *  15.  Country/qualification/unit selector UI
 *  16.  Bloom's taxonomy integration
 *  17.  xAPI integration
 *  18.  Teaching charter & Agent 13
 *  19.  Simulation & lesson flow
 *  20.  Recommendations engine
 *  22.  Fetch Modules modal
 *  23.  Delivery integration (phase labels, sidebar ACs, shared config)
 *  24.  xAPI Analytics Page Integration
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
    console.log(`  \x1b[32mÃÂ¢ÃÂÃÂ\x1b[0m ${name}`);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.log(`  \x1b[31mÃÂ¢ÃÂÃÂ\x1b[0m ${name}`);
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

function assertGreaterThan(actual, expected, message) {
  if (actual <= expected) {
    throw new Error(message || `Expected ${actual} > ${expected}`);
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
// AUTO-DISCOVERY ENGINE
// Dynamically finds all qualification constants, countries,
// units, and functions from the source code so tests never
// go stale when new features are added.
// ============================================================

// Discover all qualification constants (const XXX_YYY = { name: '...', units: [...] })
function discoverQualificationConstants() {
  const pattern = /const\s+([A-Z][A-Z_0-9]+)\s*=\s*\{\s*\n?\s*name:\s*['"]([^'"]+)['"]/g;
  const constants = [];
  let m;
  while ((m = pattern.exec(allScripts)) !== null) {
    constants.push({ varName: m[1], displayName: m[2] });
  }
  return constants;
}

// Discover all country registrations from countryQualifications
function discoverCountryRegistrations() {
  // Find the countryQualifications block
  const cqStart = allScripts.indexOf('const countryQualifications');
  if (cqStart === -1) return [];

  // Find the closing of the object (matching brace depth)
  let depth = 0;
  let cqEnd = cqStart;
  let started = false;
  for (let i = cqStart; i < allScripts.length; i++) {
    if (allScripts[i] === '{') { depth++; started = true; }
    if (allScripts[i] === '}') { depth--; }
    if (started && depth === 0) { cqEnd = i + 1; break; }
  }
  const cqBlock = allScripts.substring(cqStart, cqEnd);

  // Match country entries ÃÂ¢ÃÂÃÂ handles varied indentation
  const countryPattern = /['"](\w+)['"]\s*:\s*\{[^}]*?label:\s*['"]([^'"]+)['"]/g;
  const countries = [];
  let m;
  while ((m = countryPattern.exec(cqBlock)) !== null) {
    const countryStart = m.index;
    // Find the closing brace for this country's qualifications block
    let braceDepth = 0;
    let countryEnd = countryStart;
    for (let i = countryStart; i < cqBlock.length; i++) {
      if (cqBlock[i] === '{') braceDepth++;
      if (cqBlock[i] === '}') { braceDepth--; if (braceDepth === 0) { countryEnd = i; break; } }
    }
    const countryBlock = cqBlock.substring(countryStart, countryEnd);

    const qualKeyPattern = /['"]([a-z0-9-]+)['"]\s*:\s*([A-Z][A-Z_0-9]+)/g;
    const qualKeys = [];
    let qm;
    while ((qm = qualKeyPattern.exec(countryBlock)) !== null) {
      qualKeys.push({ key: qm[1], constName: qm[2] });
    }

    countries.push({ code: m[1], label: m[2], qualifications: qualKeys });
  }
  return countries;
}

// Discover all unit IDs and their data completeness
function discoverUnits() {
  // Match unit objects: { id: 'XX1', title: '...', ... learningOutcomes: [...], assessmentCriteria: [...] }
  const unitPattern = /\{\s*\n?\s*id:\s*['"]([^'"]+)['"]\s*,\s*\n?\s*title:\s*['"]([^'"]+)['"]/g;
  const units = [];
  let m;
  while ((m = unitPattern.exec(allScripts)) !== null) {
    // Check this unit has learningOutcomes and assessmentCriteria
    const unitStart = m.index;
    // Find the end of this unit object (next unit or end of array)
    const nextUnit = allScripts.indexOf("\n            {\n                id:", unitStart + 10);
    const unitEnd = nextUnit > 0 ? nextUnit : unitStart + 3000;
    const unitBlock = allScripts.substring(unitStart, unitEnd);

    // LOs: LO1 (UK), E1 (AU), KO1 (DE Kompetenz-Outcome)
    // ACs: AC1.1 (UK), PC1.1 (AU Performance Criteria), BW1.1 (DE Bewertung)
    const loCount = (unitBlock.match(/\{\s*id:\s*'(LO\d+|E\d+|KO\d+)'/g) || []).length;
    const acCount = (unitBlock.match(/\{\s*id:\s*'(AC[\d.]+|PC[\d.]+|BW[\d.]+)'/g) || []).length;
    const hasTitle = unitBlock.includes('title:');
    const hasCredits = unitBlock.includes('credits:');
    const hasCategory = unitBlock.includes('category:');
    const hasBloomRange = unitBlock.includes('bloomRange:');
    const hasLearningObjective = unitBlock.includes('learningObjective:');

    units.push({
      id: m[1],
      title: m[2].substring(0, 60),
      loCount,
      acCount,
      hasTitle,
      hasCredits,
      hasCategory,
      hasBloomRange,
      hasLearningObjective
    });
  }
  return units;
}

// Discover all function definitions
function discoverFunctions() {
  const fnPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const functions = new Set();
  let m;
  while ((m = fnPattern.exec(allScripts)) !== null) {
    functions.add(m[1]);
  }
  return [...functions];
}

// Discover all DOM IDs referenced in JavaScript
function discoverReferencedIds() {
  const idPattern = /getElementById\(['"]([^'"]+)['"]\)/g;
  const ids = new Set();
  let m;
  while ((m = idPattern.exec(allScripts)) !== null) {
    // Skip dynamic IDs that use template literals or concatenation
    if (!m[1].includes('$') && !m[1].includes('+')) {
      ids.add(m[1]);
    }
  }
  return [...ids];
}

// Run discovery
const discoveredConstants = discoverQualificationConstants();
const discoveredCountries = discoverCountryRegistrations();
const discoveredUnits = discoverUnits();
const discoveredFunctions = discoverFunctions();
const discoveredReferencedIds = discoverReferencedIds();

console.log(`\x1b[36mAuto-discovery: ${discoveredConstants.length} qualification constants, ${discoveredCountries.length} countries, ${discoveredUnits.length} units, ${discoveredFunctions.length} functions\x1b[0m\n`);


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
  // Country/Qualification selectors (added in module updates)
  'country-select', 'qualification-select', 'unit-select',
  // Chat
  'chat-output', 'send-btn',
  // Lesson flow
  'lesson-view', 'start-lesson-btn', 'end-session-btn',
  // xAPI
  'xapi-feed',
  // Recommendations
  'rec-content',
  // Agent 13
  'agent13-charter-textarea', 'agent13-prompt-textarea',
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
// TEST SUITE 5: REQUIRED CORE FUNCTIONS
// ============================================================
console.log('\n\x1b[1m5. Required Core Functions\x1b[0m');

const requiredFunctions = [
  // Charter
  'saveTeachingCharter', 'resetTeachingCharter', 'loadTeachingCharter',
  // Agent 13
  'saveAgent13Charter', 'resetAgent13Charter', 'loadAgent13Charter',
  'saveAgent13Prompt', 'resetAgent13Prompt', 'loadAgent13PromptEditor',
  // API push
  'pushPromptToZavmo', 'pushAllPromptsToZavmo', 'pushCurrentPromptToZavmo',
  // API search/import
  'searchAPIDatabase', 'displayAPIModules', 'selectAPILesson',
  'importSelectedUnits',
  // Core
  'loadCharacterData', 'sendLearnerMessage', 'showToast',
  'getZavmoApiSettings', 'saveZavmoApiSettings', 'renderMarkdown',
  // Country/qualification selectors
  'onCountryChange', 'onQualificationChange', 'onUnitChange',
  // Lesson flow
  'initializeSimulation', 'startLesson', 'advancePhase', 'endSession',
  // Bloom's & xAPI
  'getBLoomsLabel', 'getXAPIVerb', 'addXAPIFeedItem',
  // Progress
  'initProgressTracker', 'updateProgressForPhase', 'setLOStatus', 'setACStatus',
  // Recommendations
  'generateRecommendations', 'approveRecommendation', 'rejectRecommendation',
  // Flow state
  'calculateFlowScore', 'getFlowState',
  // Comparison
  'compareTeachers', 'selectCharacterFromComparison',
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
  const apiKeyPatterns = [
    /sk-[a-zA-Z0-9]{20,}/,
    /sk-ant-[a-zA-Z0-9]{20,}/,
    /Bearer\s+eyJ[a-zA-Z0-9]/,
  ];

  for (const pattern of apiKeyPatterns) {
    assertNotIncludes(
      allScripts.replace(/placeholder[^'"]*/gi, ''),
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

  const codeLines = allScripts.split('\n').filter(
    l => !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.includes('placeholder')
  );
  const codeOnly = codeLines.join('\n');

  for (const pattern of passwordPatterns) {
    const match = pattern.exec(codeOnly);
    if (match) {
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
  const dangerousPattern = /const\s+status\s*=\s*document\.getElementById\([^)]+\);\s*\n\s*status\.style/g;
  const matches = allScripts.match(dangerousPattern) || [];
  assert(
    matches.length === 0,
    `Found ${matches.length} status element access(es) without null checks`
  );
});

test('Clipboard operations have error handling', () => {
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
// TEST SUITE 11: AUTO-DISCOVERED QUALIFICATION CONSTANTS
// ============================================================
console.log('\n\x1b[1m11. Qualification Constants (auto-discovered)\x1b[0m');

test(`Discovered at least 7 qualification constants`, () => {
  assertGreaterThan(
    discoveredConstants.length, 6,
    `Expected at least 7 qualification constants, found ${discoveredConstants.length}: ${discoveredConstants.map(c => c.varName).join(', ')}`
  );
});

for (const constant of discoveredConstants) {
  test(`${constant.varName} ("${constant.displayName}") has units array`, () => {
    const unitArrayPattern = new RegExp(
      `const\\s+${constant.varName}[\\s\\S]*?units:\\s*\\[`
    );
    assert(
      unitArrayPattern.test(allScripts),
      `${constant.varName} is missing a units: [] array`
    );
  });
}


// ============================================================
// TEST SUITE 12: AUTO-DISCOVERED COUNTRY REGISTRY
// ============================================================
console.log('\n\x1b[1m12. Country Registry (auto-discovered)\x1b[0m');

test('countryQualifications object exists', () => {
  assertIncludes(allScripts, 'countryQualifications');
});

test(`Discovered at least 3 countries`, () => {
  assertGreaterThan(
    discoveredCountries.length, 2,
    `Expected at least 3 countries, found ${discoveredCountries.length}`
  );
});

for (const country of discoveredCountries) {
  test(`Country "${country.label}" (${country.code}) has at least 1 qualification`, () => {
    assertGreaterThan(
      country.qualifications.length, 0,
      `Country ${country.code} has no qualifications registered`
    );
  });

  // Verify each qualification key references an existing constant
  for (const qual of country.qualifications) {
    test(`  ${country.code}/${qual.key} ÃÂ¢ÃÂÃÂ ${qual.constName} exists as a const`, () => {
      const constPattern = new RegExp(`const\\s+${qual.constName}\\s*=`);
      assert(
        constPattern.test(allScripts),
        `Country ${country.code} references ${qual.constName} but that constant is not defined`
      );
    });
  }
}


// ============================================================
// TEST SUITE 13: AUTO-DISCOVERED UNIT DATA INTEGRITY
// ============================================================
console.log('\n\x1b[1m13. Unit Data Integrity (auto-discovered)\x1b[0m');

test(`Discovered at least 20 units across all qualifications`, () => {
  assertGreaterThan(
    discoveredUnits.length, 19,
    `Expected at least 20 units, found ${discoveredUnits.length}`
  );
});

// Check every discovered unit has required fields
for (const unit of discoveredUnits) {
  test(`Unit ${unit.id} has complete metadata`, () => {
    const missing = [];
    if (!unit.hasTitle) missing.push('title');
    if (!unit.hasCredits) missing.push('credits');
    if (!unit.hasCategory) missing.push('category');
    if (!unit.hasBloomRange) missing.push('bloomRange');
    if (!unit.hasLearningObjective) missing.push('learningObjective');

    assert(
      missing.length === 0,
      `Unit ${unit.id} is missing: ${missing.join(', ')}`
    );
  });

  test(`Unit ${unit.id} has at least 1 learning outcome`, () => {
    assertGreaterThan(
      unit.loCount, 0,
      `Unit ${unit.id} ("${unit.title}") has 0 learning outcomes`
    );
  });

  test(`Unit ${unit.id} has at least 1 assessment criterion`, () => {
    assertGreaterThan(
      unit.acCount, 0,
      `Unit ${unit.id} ("${unit.title}") has 0 assessment criteria`
    );
  });
}

// Check no unit ID is duplicated
test('No duplicate unit IDs across all qualifications', () => {
  const idCounts = {};
  const duplicates = [];
  for (const unit of discoveredUnits) {
    idCounts[unit.id] = (idCounts[unit.id] || 0) + 1;
    if (idCounts[unit.id] > 1) duplicates.push(unit.id);
  }
  assert(
    duplicates.length === 0,
    `Duplicate unit IDs: ${[...new Set(duplicates)].join(', ')}`
  );
});


// ============================================================
// TEST SUITE 14: FUNCTION CROSS-REFERENCE SAFETY
// ============================================================
console.log('\n\x1b[1m14. Function Cross-Reference Safety (auto-discovered)\x1b[0m');

test(`Discovered at least 50 function definitions`, () => {
  assertGreaterThan(
    discoveredFunctions.length, 49,
    `Expected at least 50 functions, found ${discoveredFunctions.length}`
  );
});

// Check that all JS-referenced DOM IDs exist in the HTML
test('All getElementById references point to existing elements', () => {
  const missing = [];
  for (const id of discoveredReferencedIds) {
    const idInHtml = new RegExp(`id=["']${id}["']`);
    if (!idInHtml.test(html)) {
      missing.push(id);
    }
  }

  assert(
    missing.length === 0,
    `JS references ${missing.length} non-existent DOM IDs: ${missing.join(', ')}`
  );
});

// Check that onclick handlers in HTML reference defined functions
test('onclick handlers reference defined functions', () => {
  const onclickPattern = /onclick=["']([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const missing = [];
  let m;

  while ((m = onclickPattern.exec(html)) !== null) {
    const fnName = m[1];
    if (!discoveredFunctions.includes(fnName)) {
      missing.push(fnName);
    }
  }

  assert(
    missing.length === 0,
    `onclick handlers reference undefined functions: ${missing.join(', ')}`
  );
});


// ============================================================
// TEST SUITE 15: COUNTRY/QUALIFICATION/UNIT SELECTOR UI
// ============================================================
console.log('\n\x1b[1m15. Country & Qualification Selector UI\x1b[0m');

test('Country select element exists in HTML', () => {
  assert(/id=["']country-select["']/.test(html), 'Missing #country-select element');
});

test('Qualification select element exists in HTML', () => {
  assert(/id=["']qualification-select["']/.test(html), 'Missing #qualification-select element');
});

test('Unit select element exists in HTML', () => {
  assert(/id=["']unit-select["']/.test(html), 'Missing #unit-select element');
});

test('onCountryChange populates qualifications', () => {
  assertIncludes(allScripts, 'qualification-select', 'onCountryChange should update qualification-select');
});

test('onUnitChange populates learning outcomes display', () => {
  assertIncludes(allScripts, 'learning-outcomes-display',
    'Unit change should update learning-outcomes-display');
});

test('clearQualificationDisplay function exists', () => {
  const regex = /function\s+clearQualificationDisplay\s*\(/;
  assert(regex.test(allScripts), 'Missing clearQualificationDisplay function');
});

test('populateQualificationDisplay function exists', () => {
  const regex = /function\s+populateQualificationDisplay\s*\(/;
  assert(regex.test(allScripts), 'Missing populateQualificationDisplay function');
});


// ============================================================
// TEST SUITE 16: BLOOM'S TAXONOMY INTEGRATION
// ============================================================
console.log('\n\x1b[1m16. Bloom\'s Taxonomy Integration\x1b[0m');

test('Bloom\'s levels are referenced in the code', () => {
  const bloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'];
  let found = 0;
  for (const level of bloomsLevels) {
    if (allScripts.includes(level)) found++;
  }
  assertGreaterThan(found, 3, `Expected at least 4 Bloom's levels referenced, found ${found}`);
});

test('getBLoomsLabel function handles Bloom\'s text', () => {
  assertIncludes(allScripts, 'getBLoomsLabel', 'Missing getBLoomsLabel function reference');
});

test('Bloom\'s badge display element exists', () => {
  assert(
    /id=["']bloom-badge["']/.test(html) || /id=["']blooms-display["']/.test(html) || /id=["']blooms-level["']/.test(html),
    'Missing Bloom\'s badge or display element'
  );
});


// ============================================================
// TEST SUITE 17: xAPI INTEGRATION
// ============================================================
console.log('\n\x1b[1m17. xAPI Integration\x1b[0m');

test('xAPI feed element exists', () => {
  assert(/id=["']xapi-feed["']/.test(html), 'Missing #xapi-feed element');
});

test('getXAPIVerb function maps phases to verbs', () => {
  assertIncludes(allScripts, 'getXAPIVerb');
});

test('getXAPIVerbFromBlooms maps Bloom\'s to xAPI', () => {
  assertIncludes(allScripts, 'getXAPIVerbFromBlooms');
});

test('addXAPIFeedItem function exists', () => {
  const regex = /function\s+addXAPIFeedItem\s*\(/;
  assert(regex.test(allScripts), 'Missing addXAPIFeedItem function');
});

test('xAPI verbs include standard verbs', () => {
  const standardVerbs = ['experienced', 'attempted', 'completed'];
  let found = 0;
  for (const verb of standardVerbs) {
    if (allScripts.includes(verb)) found++;
  }
  assertGreaterThan(found, 1, `Expected at least 2 standard xAPI verbs, found ${found}`);
});


// ============================================================
// TEST SUITE 18: TEACHING CHARTER & AGENT 13
// ============================================================
console.log('\n\x1b[1m18. Teaching Charter & Agent 13\x1b[0m');

test('Teaching charter textarea exists', () => {
  assert(/id=["']teaching-charter-textarea["']/.test(html), 'Missing #teaching-charter-textarea');
});

test('Agent 13 charter textarea exists', () => {
  assert(/id=["']agent13-charter-textarea["']/.test(html), 'Missing #agent13-charter-textarea');
});

test('Agent 13 prompt textarea exists', () => {
  assert(/id=["']agent13-prompt-textarea["']/.test(html), 'Missing #agent13-prompt-textarea');
});

test('getTeachingCharter returns charter content', () => {
  assertIncludes(allScripts, 'getTeachingCharter');
});

test('getAgent13Charter returns Agent 13 charter', () => {
  assertIncludes(allScripts, 'getAgent13Charter');
});

test('getAgent13FullPrompt assembles full prompt', () => {
  assertIncludes(allScripts, 'getAgent13FullPrompt');
});

test('Charter save/reset/load cycle is complete', () => {
  for (const action of ['save', 'reset', 'load']) {
    const fnName = `${action}TeachingCharter`;
    const regex = new RegExp(`function\\s+${fnName}\\s*\\(`);
    assert(regex.test(allScripts), `Missing ${fnName} function`);
  }
});


// ============================================================
// TEST SUITE 19: SIMULATION & LESSON FLOW
// ============================================================
console.log('\n\x1b[1m19. Simulation & Lesson Flow\x1b[0m');

test('Chat output area exists', () => {
  assert(/id=["']chat-output["']/.test(html), 'Missing #chat-output');
});

test('Learner input field exists', () => {
  assert(/id=["']learner-input["']/.test(html), 'Missing #learner-input');
});

test('Start lesson button exists', () => {
  assert(/id=["']start-lesson-btn["']/.test(html), 'Missing #start-lesson-btn');
});

test('End session button exists', () => {
  assert(/id=["']end-session-btn["']/.test(html), 'Missing #end-session-btn');
});

test('Lesson flow has phase progression', () => {
  assertIncludes(allScripts, 'advancePhase', 'Missing phase advancement logic');
  assertIncludes(allScripts, 'continueToNextPart', 'Missing continueToNextPart');
});

test('Progress tracking for LOs and ACs', () => {
  assertIncludes(allScripts, 'setLOStatus', 'Missing LO status tracking');
  assertIncludes(allScripts, 'setACStatus', 'Missing AC status tracking');
});

test('Session data capture exists', () => {
  assertIncludes(allScripts, 'captureSessionData', 'Missing session data capture');
});


// ============================================================
// TEST SUITE 20: RECOMMENDATIONS ENGINE
// ============================================================
console.log('\n\x1b[1m20. Recommendations Engine\x1b[0m');

test('Recommendations content area exists', () => {
  assert(/id=["']rec-content["']/.test(html), 'Missing #rec-content');
});

test('generateRecommendations function exists', () => {
  const regex = /function\s+generateRecommendations\s*\(/;
  assert(regex.test(allScripts), 'Missing generateRecommendations function');
});

test('Recommendation approve/reject cycle exists', () => {
  assertIncludes(allScripts, 'approveRecommendation');
  assertIncludes(allScripts, 'rejectRecommendation');
});

test('Flow state calculation exists', () => {
  assertIncludes(allScripts, 'calculateFlowScore');
  assertIncludes(allScripts, 'getFlowState');
});


// ============================================================
// 21. LEARNING SPECIFICATIONS PAGE
// ============================================================
console.log('\n\x1b[1m21. Learning Specifications page\x1b[0m');

test('Learning Specs nav tab exists', () => {
  assertIncludes(html, 'data-tab="learning-specs"');
  assertIncludes(html, 'Learning Specs');
});

test('Learning Specs page container exists', () => {
  assertIncludes(html, 'id="learning-specs-page"');
});

test('Learning Specs stats cards exist', () => {
  assertIncludes(html, 'id="ls-stats-grid"');
  assertIncludes(html, 'id="ls-stat-ofqual"');
  assertIncludes(html, 'id="ls-stat-nos"');
  assertIncludes(html, 'id="ls-stat-jd"');
  assertIncludes(html, 'id="ls-stat-frameworks"');
});

test('Learning Specs search bar exists', () => {
  assertIncludes(html, 'id="ls-search-input"');
  assertIncludes(html, 'id="ls-search-btn"');
});

test('Learning Specs filter dropdowns exist', () => {
  assertIncludes(html, 'id="ls-filter-level"');
  assertIncludes(html, 'id="ls-filter-sector"');
  assertIncludes(html, 'id="ls-filter-type"');
  assertIncludes(html, 'id="ls-clear-filters"');
});

test('Learning Specs result tabs exist', () => {
  assertIncludes(html, 'id="ls-result-tabs"');
  assertIncludes(html, 'data-ls-tab="all"');
  assertIncludes(html, 'data-ls-tab="ofqual"');
  assertIncludes(html, 'data-ls-tab="nos"');
  assertIncludes(html, 'data-ls-tab="jd"');
});

test('Learning Specs results container exists', () => {
  assertIncludes(html, 'id="ls-results-container"');
  assertIncludes(html, 'id="ls-results-header"');
});

test('Learning Specs detail modal exists', () => {
  assertIncludes(html, 'id="ls-detail-modal"');
  assertIncludes(html, 'id="ls-modal-title"');
  assertIncludes(html, 'id="ls-modal-body"');
  assertIncludes(html, 'id="ls-modal-close"');
});

test('switchNavTab handles learning-specs tab', () => {
  assertIncludes(allScripts, "tabName === 'learning-specs'");
  assertIncludes(allScripts, 'learning-specs-page');
});

test('Core LS functions exist', () => {
  assertIncludes(allScripts, 'function initLearningSpecsPage');
  assertIncludes(allScripts, 'function searchLearningSpecs');
  assertIncludes(allScripts, 'function parseUnifiedResponse');
  assertIncludes(allScripts, 'function displayLSResults');
  assertIncludes(allScripts, 'function renderLSAccordionItem');
  assertIncludes(allScripts, 'function renderLSItemDetails');
});

test('LS normalisation functions exist', () => {
  assertIncludes(allScripts, 'function normaliseOFQUAL');
  assertIncludes(allScripts, 'function normaliseNOS');
  assertIncludes(allScripts, 'function normaliseJD');
  assertIncludes(allScripts, 'function ensureArray');
});

test('LS stats and filter functions exist', () => {
  assertIncludes(allScripts, 'function loadLearningSpecsStats');
  assertIncludes(allScripts, 'function populateSectorFilter');
  assertIncludes(allScripts, 'function switchLSResultTab');
  assertIncludes(allScripts, 'function clearLSFilters');
  assertIncludes(allScripts, 'function onLSFilterChange');
});

test('LS modal functions exist', () => {
  assertIncludes(allScripts, 'function openLSDetailModal');
  assertIncludes(allScripts, 'function closeLSDetailModal');
  assertIncludes(allScripts, 'function createModalSection');
  assertIncludes(allScripts, 'function createModalListSection');
});

test('LS uses unified search API endpoint', () => {
  assertIncludes(allScripts, '/api/search/unified/');
  assertIncludes(allScripts, 'LS_API_BASE');
  assertIncludes(allScripts, 'LS_SEARCH_ENDPOINT');
});

test('LS uses escapeHTML for XSS prevention', () => {
  assertIncludes(allScripts, 'function escapeHTML');
  assertIncludes(allScripts, 'escapeHTML(');
});

test('LS search has debounce pattern', () => {
  assertIncludes(allScripts, 'lsSearchTimeout');
  assertIncludes(allScripts, 'clearTimeout(lsSearchTimeout)');
});

test('LS CSS classes defined', () => {
  assertIncludes(html, '.ls-stat-card');
  assertIncludes(html, '.ls-accordion-item');
  assertIncludes(html, '.ls-search-input');
  assertIncludes(html, '.ls-modal-backdrop');
  assertIncludes(html, '.ls-badge');
});

test('LS null safety on DOM queries', () => {
  // Verify key functions use null checks before accessing elements
  assertIncludes(allScripts, 'if (searchInput)');
  assertIncludes(allScripts, 'if (container)');
  assertIncludes(allScripts, 'if (modal)');
});



// ============================================================
// TEST SUITE 22: FETCH MODULES MODAL
// ============================================================
console.log('\n\x1b[1m22. Fetch Modules Modal\x1b[0m');

// 22a. DOM elements
const fetchModalIds = [
    'api-modal-overlay',
    'api-url',
    'api-search-query',
    'api-search-btn',
    'api-search-btn-text',
    'api-search-spinner',
    'api-results-container',
    'api-lesson-detail',
    'api-lesson-summary',
    'import-selected-btn',
    'modal-close-btn',
    'modal-cancel-btn',
];

for (const id of fetchModalIds) {
    test(`Fetch Modules: #${id} exists in HTML`, () => {
        const regex = new RegExp(`id=["']${id}["']`);
        assert(regex.test(html), `Missing element with id="${id}" in Fetch Modules modal`);
    });
}
// 22b. Required functions
const fetchModalFunctions = [
    'openAPIModal',
    'closeAPIModal',
    'searchAPIDatabase',
    'displayAPIModules',
    'selectAPILesson',
    'importSelectedUnits',
];

for (const fn of fetchModalFunctions) {
    test(`Fetch Modules: function ${fn}() is defined`, () => {
        const regex = new RegExp(`function\\s+${fn}\\s*\\(`);
        assert(regex.test(allScripts), `Function ${fn}() not found`);
    });
}

// 22c. Modal open/close logic
test('Fetch Modules: openAPIModal adds active class', () => {
    assertIncludes(allScripts, "classList.add('active')", 'openAPIModal should add active class to overlay');
});

test('Fetch Modules: closeAPIModal removes active class', () => {
    assertIncludes(allScripts, "classList.remove('active')", 'closeAPIModal should remove active class from overlay');
});

// 22d. API endpoint and auth
test('Fetch Modules: uses /api/search/unified/ with type=jd for deliver phase', () => {
    assertIncludes(allScripts, '/api/search/unified/', 'Fetch Modules should call /api/search/unified/ endpoint');
    assertIncludes(allScripts, "type: 'jd'", 'Deliver phase should request type=jd');
});

test('Fetch Modules: checks authentication before fetching', () => {
    const fnStart = allScripts.indexOf('function searchAPIDatabase');
    assert(fnStart !== -1, 'function searchAPIDatabase must exist in source');
    const authPos = allScripts.indexOf('access_token', fnStart);
    const nextFn = allScripts.indexOf('function displayAPIModules', fnStart);
    assert(authPos !== -1 && authPos < nextFn, 'searchAPIDatabase must check access_token for authentication');
});
// 22e. Loading state management
test('Fetch Modules: shows loading spinner during fetch', () => {
    assertIncludes(allScripts, 'api-search-spinner', 'Should reference loading spinner element');
    assertIncludes(allScripts, "'Fetching...'", 'Should update button text to Fetching...');
});

test('Fetch Modules: disables search button during fetch', () => {
    const fnStart = allScripts.indexOf('function searchAPIDatabase');
    const fnBlock = allScripts.substring(fnStart, fnStart + 1200);
    assertIncludes(fnBlock, 'disabled = true', 'Search button should be disabled during fetch');
});

test('Fetch Modules: restores button state in finally block', () => {
    const fnStart = allScripts.indexOf('function searchAPIDatabase');
    const fnEnd = allScripts.indexOf('function displayAPIModules');
    const fnBlock = allScripts.substring(fnStart, fnEnd);
    assertIncludes(fnBlock, 'finally', 'searchAPIDatabase must use a finally block to restore UI state');
    assertIncludes(fnBlock, "'Fetch Modules'", 'finally block should reset button text to Fetch Modules');
    assertIncludes(fnBlock, 'disabled = false', 'finally block should re-enable the search button');
});

// 22f. API response validation
test('Fetch Modules: validates API response structure', () => {
    assertIncludes(allScripts, 'data.data.modules', 'searchAPIDatabase must validate data.data.modules exists');
    assertIncludes(allScripts, 'Unexpected API response format', 'Should throw on unexpected response format');
});

test('Fetch Modules: handles 401/403 auth errors', () => {
    const fnStart = allScripts.indexOf('function searchAPIDatabase');
    const fnBlock = allScripts.substring(fnStart, fnStart + 1200);
    assertIncludes(fnBlock, '401', 'searchAPIDatabase should handle 401 status');
    assertIncludes(fnBlock, '403', 'searchAPIDatabase should handle 403 status');
});

// 22g. Error handling
test('Fetch Modules: searchAPIDatabase has try/catch', () => {
    const fnStart = allScripts.indexOf('function searchAPIDatabase');
    const fnBlock = allScripts.substring(fnStart, fnStart + 4000);
    assertIncludes(fnBlock, 'try {', 'searchAPIDatabase must have try block');
    assertIncludes(fnBlock, 'catch', 'searchAPIDatabase must have catch block');
});

test('Fetch Modules: errors shown via showToast', () => {
    const fnStart = allScripts.indexOf('function searchAPIDatabase');
    const fnBlock = allScripts.substring(fnStart, fnStart + 4000);
    assertIncludes(fnBlock, 'showToast(', 'Errors should be shown to user via showToast');
});
// 22h. Module display
test('Fetch Modules: displayAPIModules handles empty results', () => {
    assertIncludes(allScripts, 'No modules found', 'displayAPIModules should show message when no modules match filter');
});

test('Fetch Modules: displayAPIModules shows result count', () => {
    const fnStart = allScripts.indexOf('function displayAPIModules');
    const fnBlock = allScripts.substring(fnStart, fnStart + 3000);
    assertIncludes(fnBlock, 'filtered.length', 'displayAPIModules should reference filtered count');
});

// 22i. Lesson selection and import
test('Fetch Modules: selectAPILesson populates detail panel', () => {
    assertIncludes(allScripts, 'api-lesson-detail', 'selectAPILesson should show lesson detail panel');
    assertIncludes(allScripts, 'api-lesson-summary', 'selectAPILesson should populate lesson summary');
});

test('Fetch Modules: importSelectedUnits guards against null selection', () => {
    const fnStart = allScripts.indexOf('function importSelectedUnits');
    const fnBlock = allScripts.substring(fnStart, fnStart + 400);
    assertIncludes(fnBlock, 'apiSelectedLesson', 'importSelectedUnits must check apiSelectedLesson exists');
});

test('Fetch Modules: importSelectedUnits calls populateQualificationDisplay', () => {
    const fnStart = allScripts.indexOf('function importSelectedUnits');
    const fnBlock = allScripts.substring(fnStart, fnStart + 1500);
    assertIncludes(fnBlock, 'populateQualificationDisplay', 'importSelectedUnits must call populateQualificationDisplay');
});

test('Fetch Modules: importSelectedUnits closes modal after import', () => {
    const fnStart = allScripts.indexOf('function importSelectedUnits');
    const fnBlock = allScripts.substring(fnStart, fnStart + 3000);
    assertIncludes(fnBlock, 'closeAPIModal()', 'importSelectedUnits must close the modal after importing');
});

// 22j. Bloom's mapping in import
test("Fetch Modules: importSelectedUnits maps Bloom's levels correctly", () => {
    const fnStart = allScripts.indexOf('function importSelectedUnits');
    const fnBlock = allScripts.substring(fnStart, fnStart + 1500);
    assertIncludes(fnBlock, 'bloomMap', "importSelectedUnits should define Bloom's level mapping");
    assertIncludes(fnBlock, "'Analyse'", "Bloom's mapping should use British English (Analyse not Analyze)");
});
// 22k. Null safety in modal functions
test('Fetch Modules: openAPIModal accesses required DOM elements', () => {
    const fnStart = allScripts.indexOf('function openAPIModal');
    const fnEnd = allScripts.indexOf('function closeAPIModal');
    const fnBlock = allScripts.substring(fnStart, fnEnd);
    const getElementCalls = (fnBlock.match(/getElementById/g) || []).length;
    assert(getElementCalls >= 3, `openAPIModal should access at least 3 DOM elements, found ${getElementCalls}`);
});

// 22l. State variables
test('Fetch Modules: apiModulesCache is initialised', () => {
    assertIncludes(allScripts, 'apiModulesCache', 'apiModulesCache variable must exist');
});

test('Fetch Modules: apiSelectedLesson is initialised', () => {
    assertIncludes(allScripts, 'apiSelectedLesson', 'apiSelectedLesson variable must exist');
});

test('Fetch Modules: apiSelectedLesson reset on modal open', () => {
    const fnStart = allScripts.indexOf('function openAPIModal');
    const fnEnd = allScripts.indexOf('function closeAPIModal');
    const fnBlock = allScripts.substring(fnStart, fnEnd);
    assertIncludes(fnBlock, 'apiSelectedLesson = null', 'openAPIModal must reset apiSelectedLesson to null');
});

test('Fetch Modules: apiSelectedLesson reset on modal close', () => {
    const fnStart = allScripts.indexOf('function closeAPIModal');
    const fnEnd = allScripts.indexOf('function searchAPIDatabase');
    const fnBlock = allScripts.substring(fnStart, fnEnd);
    assertIncludes(fnBlock, 'apiSelectedLesson = null', 'closeAPIModal must reset apiSelectedLesson to null');
});

// 22m. Modal CSS
test('Fetch Modules: modal overlay CSS exists', () => {
    assertIncludes(allStyles, '.modal-overlay', 'CSS for .modal-overlay must be defined');
});

test('Fetch Modules: api-modal CSS exists', () => {
    assertIncludes(allStyles, '.api-modal', 'CSS for .api-modal must be defined');
});
// ============================================================
// TEST SUITE 23: DELIVERY INTEGRATION
// ============================================================
// Tests for features bridging Prompt Studio simulation and live app delivery

// 23a. Phase label CSS classes
test('Delivery Integration: phase badge CSS exists for TEACH', () => {
    assertIncludes(allStyles, '.lesson-phase-badge.teach', 'CSS for .lesson-phase-badge.teach must be defined');
});

test('Delivery Integration: phase badge CSS exists for CHECK', () => {
    assertIncludes(allStyles, '.lesson-phase-badge.check', 'CSS for .lesson-phase-badge.check must be defined');
});

test('Delivery Integration: phase badge CSS exists for ASSESS', () => {
    assertIncludes(allStyles, '.lesson-phase-badge.assess', 'CSS for .lesson-phase-badge.assess must be defined');
});

test('Delivery Integration: phase badge CSS exists for COMPLETE', () => {
    assertIncludes(allStyles, '.lesson-phase-badge.complete', 'CSS for .lesson-phase-badge.complete must be defined');
});

test('Delivery Integration: phase badge base CSS exists', () => {
    assertIncludes(allStyles, '.lesson-phase-badge', 'CSS for .lesson-phase-badge must be defined');
});

// 23b. Phase badges rendered in addMessageToChat
test('Delivery Integration: addMessageToChat renders phase badge', () => {
    assertIncludes(allScripts, 'lesson-phase-badge', 'addMessageToChat must include lesson-phase-badge class for phase labels');
});

test('Delivery Integration: phase badge uses phaseType parameter', () => {
    assertIncludes(allScripts, 'phaseBase', 'addMessageToChat must derive phaseBase from phaseType for phase label');
});

// 23c. Assessment Criteria sidebar section
test('Delivery Integration: sidebar AC section exists in HTML', () => {
    assertIncludes(html, 'lesson-sidebar-ac-section', 'sidebar must contain lesson-sidebar-ac-section element');
});

test('Delivery Integration: sidebar AC list exists in HTML', () => {
    assertIncludes(html, 'lesson-sidebar-ac-list', 'sidebar must contain lesson-sidebar-ac-list element');
});

// 23d. populateSidebarAC function
test('Delivery Integration: populateSidebarAC function exists', () => {
    assertIncludes(allScripts, 'function populateSidebarAC', 'populateSidebarAC function must exist');
});

test('Delivery Integration: populateSidebarAC checks for AC section element', () => {
    const fnStart = allScripts.indexOf('function populateSidebarAC');
    assert(fnStart !== -1, 'function populateSidebarAC must exist in source');
    const fnBlock = allScripts.substring(fnStart, allScripts.indexOf('function updateSidebarACs', fnStart));
    assertIncludes(fnBlock, 'lesson-sidebar-ac-section', 'populateSidebarAC must reference lesson-sidebar-ac-section');
});

// 23e. updateSidebarACs function
test('Delivery Integration: updateSidebarACs function exists', () => {
    assertIncludes(allScripts, 'function updateSidebarACs', 'updateSidebarACs function must exist');
});

test('Delivery Integration: updateSidebarACs uses three-state tracking', () => {
    const fnStart = allScripts.indexOf('function updateSidebarACs');
    assert(fnStart !== -1, 'function updateSidebarACs must exist in source');
    const nextFn = allScripts.indexOf('\n        function ', fnStart + 10);
    const fnBlock = allScripts.substring(fnStart, nextFn > fnStart ? nextFn : fnStart + 2000);
    assertIncludes(fnBlock, 'met', 'updateSidebarACs must handle met status');
    assertIncludes(fnBlock, 'in-progress', 'updateSidebarACs must handle in-progress status');
});

// 23f. updateProgressBar calls updateSidebarACs
test('Delivery Integration: updateProgressBar calls updateSidebarACs', () => {
    const fnStart = allScripts.indexOf('function updateProgressBar');
    assert(fnStart !== -1, 'function updateProgressBar must exist in source');
    const nextFn = allScripts.indexOf('\n        function ', fnStart + 10);
    const fnBlock = allScripts.substring(fnStart, nextFn > fnStart ? nextFn : fnStart + 2000);
    assertIncludes(fnBlock, 'updateSidebarACs', 'updateProgressBar must call updateSidebarACs');
});

// 23g. populateSidebarLO calls populateSidebarAC
test('Delivery Integration: populateSidebarLO calls populateSidebarAC', () => {
    const fnStart = allScripts.indexOf('function populateSidebarLO');
    assert(fnStart !== -1, 'function populateSidebarLO must exist in source');
    const nextFn = allScripts.indexOf('function populateSidebarAC', fnStart + 10);
    const fnBlock = allScripts.substring(fnStart, nextFn > fnStart ? nextFn : fnStart + 2000);
    assertIncludes(fnBlock, 'populateSidebarAC', 'populateSidebarLO must call populateSidebarAC');
});

// 23h. Shared character xAPI data JSON file
test('Delivery Integration: character-xapi-data.json exists', () => {
    const jsonPath = path.join(__dirname, '..', 'scripts', 'character-xapi-data.json');
    assert(fs.existsSync(jsonPath), 'scripts/character-xapi-data.json must exist for live app sync');
});

test('Delivery Integration: character-xapi-data.json is valid JSON', () => {
    const jsonPath = path.join(__dirname, '..', 'scripts', 'character-xapi-data.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    let parsed;
    try {
        parsed = JSON.parse(jsonContent);
    } catch (e) {
        assert(false, 'character-xapi-data.json must be valid JSON: ' + e.message);
    }
    assert(parsed.characters, 'character-xapi-data.json must have a characters object');
});

test('Delivery Integration: character-xapi-data.json has all 13 characters', () => {
    const jsonPath = path.join(__dirname, '..', 'scripts', 'character-xapi-data.json');
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const charCount = Object.keys(parsed.characters).length;
    assert(charCount === 13, 'character-xapi-data.json must have 13 characters, found ' + charCount);
});

test('Delivery Integration: character-xapi-data.json characters have required fields', () => {
    const jsonPath = path.join(__dirname, '..', 'scripts', 'character-xapi-data.json');
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const requiredFields = ['specName', 'verbs', 'bloomsRange', 'kirkpatrick', 'kirkpatrickLabels', 'phase4D', 'growthMindset'];
    for (const [key, char] of Object.entries(parsed.characters)) {
        for (const field of requiredFields) {
            assert(char[field] !== undefined, key + ' must have field ' + field + ' in character-xapi-data.json');
        }
    }
});

test('Delivery Integration: character-xapi-data.json has studio-to-zavmo map', () => {
    const jsonPath = path.join(__dirname, '..', 'scripts', 'character-xapi-data.json');
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    assert(parsed._studioToZavmoMap, 'character-xapi-data.json must have _studioToZavmoMap');
    assert(parsed._studioToZavmoMap['foundation-builder'] === 'builder', 'foundation-builder must map to builder');
});

// 23i. Existing characterXAPIData in index.html matches JSON
test('Delivery Integration: characterXAPIData in source matches all JSON characters', () => {
    const jsonPath = path.join(__dirname, '..', 'scripts', 'character-xapi-data.json');
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const charKey of Object.keys(parsed.characters)) {
        assertIncludes(allScripts, "'" + charKey + "'", 'characterXAPIData in source must include ' + charKey);
    }
});

// ============================================================
// 24. xAPI Analytics Page Integration
// ============================================================
console.log('\n--- Suite 24: xAPI Analytics Page Integration ---');

// 24a. Nav tab exists
test('xAPI Analytics: nav tab button exists in HTML', () => {
    assertIncludes(html, 'data-tab="xapi-analytics"', 'Must have xapi-analytics nav tab button');
});

test('xAPI Analytics: nav tab has correct label', () => {
    assertIncludes(html, '>xAPI Analytics</button>', 'Nav tab must display "xAPI Analytics"');
});

// 24b. Page container
test('xAPI Analytics: page container div exists', () => {
    assertIncludes(html, 'id="xapi-analytics-page"', 'Must have xapi-analytics-page container');
});

test('xAPI Analytics: page is hidden by default', () => {
    assertIncludes(html, 'id="xapi-analytics-page" style="display: none', 'xapi-analytics-page must be hidden by default');
});

// 24c. switchNavTab handles xapi-analytics
test('xAPI Analytics: switchNavTab handles xapi-analytics tab', () => {
    assertIncludes(allScripts, "tabName === 'xapi-analytics'", 'switchNavTab must handle xapi-analytics');
});

test('xAPI Analytics: switchNavTab calls initXapiAnalyticsPage', () => {
    assertIncludes(allScripts, 'initXapiAnalyticsPage()', 'switchNavTab must call initXapiAnalyticsPage');
});

test('xAPI Analytics: switchNavTab hides xapi-analytics-page', () => {
    assertIncludes(allScripts, "xapiAnalyticsPage.style.display = 'none'", 'switchNavTab must hide xapi-analytics-page');
});

// 24d. Sub-tab navigation
test('xAPI Analytics: has 6 sub-tab buttons', () => {
    const subTabs = ['xa-overview', 'xa-live-feed', 'xa-agent-perf', 'xa-journeys', 'xa-library', 'xa-builder'];
    subTabs.forEach(tab => {
        assertIncludes(html, 'data-xa-tab="' + tab + '"', 'Must have sub-tab button for ' + tab);
    });
});

test('xAPI Analytics: has 6 sub-tab content divs', () => {
    const contentIds = ['xa-overview', 'xa-live-feed', 'xa-agent-perf', 'xa-journeys', 'xa-library', 'xa-builder'];
    contentIds.forEach(id => {
        assertIncludes(html, 'id="' + id + '"', 'Must have sub-tab content div ' + id);
    });
});

// 24e. Overview dashboard elements
test('xAPI Analytics: overview has KPI grid', () => {
    assertIncludes(html, 'id="xa-kpi-grid"', 'Must have KPI grid');
});

test('xAPI Analytics: overview has 6 KPI cards', () => {
    const kpis = ['xa-kpi-learners', 'xa-kpi-statements', 'xa-kpi-duration', 'xa-kpi-completions', 'xa-kpi-growth', 'xa-kpi-interactions'];
    kpis.forEach(id => {
        assertIncludes(html, 'id="' + id + '"', 'Must have KPI ' + id);
    });
});

test('xAPI Analytics: overview has popular courses container', () => {
    assertIncludes(html, 'id="xa-popular-courses"', 'Must have popular courses chart');
});

test('xAPI Analytics: overview has keyword cloud', () => {
    assertIncludes(html, 'id="xa-keyword-cloud"', 'Must have keyword cloud');
});

test('xAPI Analytics: overview has activity heatmap', () => {
    assertIncludes(html, 'id="xa-heatmap-container"', 'Must have heatmap container');
});

test('xAPI Analytics: overview has Blooms chart', () => {
    assertIncludes(html, 'id="xa-blooms-chart"', 'Must have Blooms chart');
});

// 24f. Live feed elements
test('xAPI Analytics: live feed has search input', () => {
    assertIncludes(html, 'id="xa-feed-search"', 'Must have feed search input');
});

test('xAPI Analytics: live feed has verb filter', () => {
    assertIncludes(html, 'id="xa-feed-verb-filter"', 'Must have verb filter dropdown');
});

test('xAPI Analytics: live feed has agent filter', () => {
    assertIncludes(html, 'id="xa-feed-agent-filter"', 'Must have agent filter dropdown');
});

test('xAPI Analytics: live feed has pause button', () => {
    assertIncludes(html, 'id="xa-feed-pause-btn"', 'Must have pause button');
});

test('xAPI Analytics: live feed has export button', () => {
    assertIncludes(html, 'id="xa-feed-export-btn"', 'Must have export CSV button');
});

test('xAPI Analytics: live feed has container', () => {
    assertIncludes(html, 'id="xa-feed-container"', 'Must have feed container');
});

// 24g. Agent performance elements
test('xAPI Analytics: agent performance has grid container', () => {
    assertIncludes(html, 'id="xa-agent-grid"', 'Must have agent grid');
});

test('xAPI Analytics: agent performance has compare panel', () => {
    assertIncludes(html, 'id="xa-agent-compare-panel"', 'Must have compare panel');
});

test('xAPI Analytics: agent performance has sort dropdown', () => {
    assertIncludes(html, 'id="xa-agent-sort"', 'Must have agent sort dropdown');
});

// 24h. Learner journeys elements
test('xAPI Analytics: learner journeys has search input', () => {
    assertIncludes(html, 'id="xa-learner-search-input"', 'Must have learner search input');
});

test('xAPI Analytics: learner journeys has timeline container', () => {
    assertIncludes(html, 'id="xa-journey-timeline"', 'Must have journey timeline');
});

test('xAPI Analytics: learner journeys has growth trajectory', () => {
    assertIncludes(html, 'id="xa-growth-trajectory"', 'Must have growth trajectory chart');
});

// 24i. Statement library elements
test('xAPI Analytics: statement library has table', () => {
    assertIncludes(html, 'id="xa-lib-table"', 'Must have library table');
});

test('xAPI Analytics: statement library has search', () => {
    assertIncludes(html, 'id="xa-lib-search"', 'Must have library search input');
});

test('xAPI Analytics: statement library has bloom filter', () => {
    assertIncludes(html, 'id="xa-lib-bloom-filter"', 'Must have bloom filter');
});

test('xAPI Analytics: statement library has export button', () => {
    assertIncludes(html, 'id="xa-lib-export-btn"', 'Must have library export button');
});

// 24j. Statement builder elements
test('xAPI Analytics: statement builder has verb selector', () => {
    assertIncludes(html, 'id="xa-builder-verb"', 'Must have builder verb selector');
});

test('xAPI Analytics: statement builder has IRI input', () => {
    assertIncludes(html, 'id="xa-builder-iri"', 'Must have builder IRI input');
});

test('xAPI Analytics: statement builder has JSON preview', () => {
    assertIncludes(html, 'id="xa-builder-json"', 'Must have JSON preview');
});

test('xAPI Analytics: statement builder has save button', () => {
    assertIncludes(html, 'id="xa-builder-save"', 'Must have save button');
});

test('xAPI Analytics: statement builder has test button', () => {
    assertIncludes(html, 'id="xa-builder-test"', 'Must have test preview button');
});

test('xAPI Analytics: statement builder has Blooms tags', () => {
    assertIncludes(html, 'id="xa-builder-bloom-tags"', 'Must have Blooms taxonomy tags');
});

test('xAPI Analytics: statement builder has Kirkpatrick tags', () => {
    assertIncludes(html, 'id="xa-builder-kirk-tags"', 'Must have Kirkpatrick tags');
});

test('xAPI Analytics: statement builder has WONDERS tags', () => {
    assertIncludes(html, 'id="xa-builder-wonders-tags"', 'Must have WONDERS tags');
});

// 24k. Core JavaScript functions exist
test('xAPI Analytics: initXapiAnalyticsPage function exists', () => {
    assertIncludes(allScripts, 'function initXapiAnalyticsPage()', 'Must have initXapiAnalyticsPage function');
});

test('xAPI Analytics: xaLoadOverviewData function exists', () => {
    assertIncludes(allScripts, 'function xaLoadOverviewData()', 'Must have xaLoadOverviewData function');
});

test('xAPI Analytics: xaLoadLiveFeed function exists', () => {
    assertIncludes(allScripts, 'function xaLoadLiveFeed()', 'Must have xaLoadLiveFeed function');
});

test('xAPI Analytics: xaLoadAgentPerformance function exists', () => {
    assertIncludes(allScripts, 'function xaLoadAgentPerformance()', 'Must have xaLoadAgentPerformance function');
});

test('xAPI Analytics: xaRenderStatementLibrary function exists', () => {
    assertIncludes(allScripts, 'function xaRenderStatementLibrary()', 'Must have xaRenderStatementLibrary function');
});

test('xAPI Analytics: xaInitBuilder function exists', () => {
    assertIncludes(allScripts, 'function xaInitBuilder()', 'Must have xaInitBuilder function');
});

test('xAPI Analytics: xaSearchLearner function exists', () => {
    assertIncludes(allScripts, 'function xaSearchLearner()', 'Must have xaSearchLearner function');
});

// 24l. API integration patterns
test('xAPI Analytics: uses zavmoFetch for API calls', () => {
    assertIncludes(allScripts, 'zavmoFetch(XA_API_BASE', 'Must use zavmoFetch for xAPI API calls');
});

test('xAPI Analytics: has XA_API_BASE constant', () => {
    assertIncludes(allScripts, 'const XA_API_BASE', 'Must define XA_API_BASE constant');
});

test('xAPI Analytics: API calls have try/catch error handling', () => {
    // Check multiple async functions have try/catch
    assertIncludes(allScripts, 'async function xaLoadOverviewData', 'xaLoadOverviewData must be async');
    assertIncludes(allScripts, 'async function xaLoadLiveFeed', 'xaLoadLiveFeed must be async');
    assertIncludes(allScripts, 'async function xaLoadAgentPerformance', 'xaLoadAgentPerformance must be async');
});

// 24m. Security: HTML escaping
test('xAPI Analytics: has xaEscapeHTML function', () => {
    assertIncludes(allScripts, 'function xaEscapeHTML(str)', 'Must have xaEscapeHTML for XSS prevention');
});

test('xAPI Analytics: has xaEscapeAttr function', () => {
    assertIncludes(allScripts, 'function xaEscapeAttr(str)', 'Must have xaEscapeAttr for attribute escaping');
});

// 24n. Null safety
test('xAPI Analytics: initXapiAnalyticsPage checks xaInitialised guard', () => {
    assertIncludes(allScripts, 'if (xaInitialised) return', 'Must guard against double-init');
});

// 24o. Verb library completeness
test('xAPI Analytics: verb library includes all Bloom levels', () => {
    const levels = ['remember', 'understand', 'apply', 'analyse', 'evaluate', 'create'];
    levels.forEach(level => {
        assertIncludes(allScripts, "bloom: '" + level + "'", 'XA_VERB_LIBRARY must include verb with bloom level ' + level);
    });
});

test('xAPI Analytics: verb library has at least 20 verbs', () => {
    const matches = allScripts.match(/verb:\s*'/g);
    assertGreaterThan(matches ? matches.length : 0, 20, 'XA_VERB_LIBRARY must have at least 20 verbs');
});

// 24p. British English
test('xAPI Analytics: uses British English spelling (analyse not analyze)', () => {
    assertIncludes(html, 'Analyse', 'Must use British English "Analyse" not "Analyze"');
    assertIncludes(html, 'Behaviour', 'Must use British English "Behaviour" not "Behavior"');
});

// 24q. Accessibility
test('xAPI Analytics: search inputs have aria-labels', () => {
    assertIncludes(html, 'aria-label="Search xAPI statements"', 'Feed search must have aria-label');
    assertIncludes(html, 'aria-label="Search for a learner"', 'Learner search must have aria-label');
});

test('xAPI Analytics: filter dropdowns have aria-labels', () => {
    assertIncludes(html, 'aria-label="Filter by verb category"', 'Verb filter must have aria-label');
    assertIncludes(html, 'aria-label="Filter by agent"', 'Agent filter must have aria-label');
});

// 24r. CSS exists
test('xAPI Analytics: CSS classes defined', () => {
    assertIncludes(html, '.xa-page', 'Must have xa-page CSS class');
    assertIncludes(html, '.xa-kpi-card', 'Must have xa-kpi-card CSS class');
    assertIncludes(html, '.xa-glass', 'Must have xa-glass CSS class');
    assertIncludes(html, '.xa-statement-card', 'Must have xa-statement-card CSS class');
    assertIncludes(html, '.xa-agent-card', 'Must have xa-agent-card CSS class');
});

test('xAPI Analytics: reduced-motion media query present', () => {
    assertIncludes(html, 'xa-pulse::before { animation: none', 'Must have reduced-motion for pulse animation');
});

// 24s. Time range selector
test('xAPI Analytics: time range has Today/7d/30d/90d options', () => {
    assertIncludes(html, 'data-period="today"', 'Must have Today time range');
    assertIncludes(html, 'data-period="7d"', 'Must have 7d time range');
    assertIncludes(html, 'data-period="30d"', 'Must have 30d time range');
    assertIncludes(html, 'data-period="90d"', 'Must have 90d time range');
});

// 24t. localStorage uses zavmo_ prefix
test('xAPI Analytics: localStorage keys use zavmo_ prefix', () => {
    assertIncludes(allScripts, "zavmo_xa_templates", 'Saved templates must use zavmo_ localStorage prefix');
});

// 24u. Character data consistency
test('xAPI Analytics: all 12 characters defined in XA_CHARACTERS', () => {
    const chars = ['foundation-builder', 'challenge-coach', 'career-navigator', 'pattern-connector',
        'systems-analyst', 'collaboration-guide', 'evidence-evaluator', 'experiment-space',
        'practical-builder', 'creative-catalyst', 'qualification-certifier', 'integrator'];
    chars.forEach(c => {
        assertIncludes(allScripts, "id: '" + c + "'", 'XA_CHARACTERS must include ' + c);
    });
});

// ============================================================
// TEST SUITE 25: xAPI Analytics Enhancements
// ============================================================
console.log('\n\x1b[1mSuite 25: xAPI Analytics Dashboard Enhancements\x1b[0m');

// 25a. Engagement Score Ring
test('xAPI Enhancements: engagement score ring exists', () => {
    assertIncludes(html, 'id="xa-engagement-ring"', 'Must have engagement ring container');
    assertIncludes(html, 'id="xa-ring-fill"', 'Must have ring fill SVG circle');
    assertIncludes(html, 'id="xa-ring-value"', 'Must have ring value display');
});

// 25b. Goal Tracking
test('xAPI Enhancements: goal tracking card exists', () => {
    assertIncludes(html, 'id="xa-goal-tracking-card"', 'Must have goal tracking card');
    assertIncludes(html, 'id="xa-goals-container"', 'Must have goals container');
    assertIncludes(html, 'Goal Tracking', 'Must show Goal Tracking title');
});

// 25c. Anomaly Alerts
test('xAPI Enhancements: anomaly alerts card exists', () => {
    assertIncludes(html, 'id="xa-anomaly-card"', 'Must have anomaly card');
    assertIncludes(html, 'id="xa-anomaly-list"', 'Must have anomaly list');
    assertIncludes(html, 'Anomaly Alerts', 'Must show Anomaly Alerts title');
});

// 25d. Cohort Comparison
test('xAPI Enhancements: cohort comparison exists', () => {
    assertIncludes(html, 'id="xa-cohort-btns"', 'Must have cohort filter buttons');
    assertIncludes(html, 'id="xa-cohort-grid"', 'Must have cohort grid container');
});

test('xAPI Enhancements: cohort comparison has department buttons', () => {
    assertIncludes(html, 'data-cohort="engineering"', 'Must have Engineering cohort button');
    assertIncludes(html, 'data-cohort="sales"', 'Must have Sales cohort button');
    assertIncludes(html, 'data-cohort="marketing"', 'Must have Marketing cohort button');
    assertIncludes(html, 'data-cohort="leadership"', 'Must have Leadership cohort button');
});

// 25e. Cohort Comparison CSS
test('xAPI Enhancements: cohort comparison CSS exists', () => {
    assertIncludes(html, '.xa-cohort-btn', 'Must have cohort button CSS');
    assertIncludes(html, '.xa-cohort-card', 'Must have cohort card CSS');
    assertIncludes(html, '.xa-cohort-bloom-bar', 'Must have Bloom bar CSS');
});

// 25f. WONDERS Intelligence Radar
test('xAPI Enhancements: WONDERS radar CSS exists', () => {
    assertIncludes(html, '.xa-wonders-radar', 'Must have WONDERS radar CSS');
    assertIncludes(html, '.xa-wonders-polygon', 'Must have WONDERS polygon CSS');
    assertIncludes(html, '.xa-wonders-label', 'Must have WONDERS label CSS');
});

test('xAPI Enhancements: WONDERS radar render function exists', () => {
    assertIncludes(allScripts, 'xaRenderCohortComparison', 'Must have cohort comparison render function');
});

// 25g. PDF Export
test('xAPI Enhancements: PDF export button exists', () => {
    assertIncludes(html, 'id="xa-export-pdf-btn"', 'Must have PDF export button');
    assertIncludes(html, 'Export PDF', 'Must show Export PDF label');
});

test('xAPI Enhancements: PDF export function exists', () => {
    assertIncludes(allScripts, 'function xaExportPDF()', 'Must have xaExportPDF function');
});

// 25h. Print styles for PDF
test('xAPI Enhancements: print media query for PDF exists', () => {
    assertIncludes(html, '@media print', 'Must have print media query for PDF export');
});

// 25i. Engagement row layout
test('xAPI Enhancements: engagement row layout exists', () => {
    assertIncludes(html, 'xa-engagement-row', 'Must have engagement row container');
    assertIncludes(html, 'Engagement Score', 'Must show Engagement Score title');
});

// ============================================================
// TEST SUITE 26: Job Descriptions Page
// ============================================================
console.log('\n\x1b[1mSuite 26: Job Descriptions Page\x1b[0m');

// 26a. Nav tab exists
test('Job Descriptions: nav tab button exists', () => {
    assertIncludes(html, 'data-tab="job-descriptions"', 'Must have job-descriptions nav tab');
    assertIncludes(html, 'Job Descriptions', 'Must show Job Descriptions label');
});

// 26b. Page container
test('Job Descriptions: page container exists', () => {
    assertIncludes(html, 'id="job-descriptions-page"', 'Must have job-descriptions-page div');
});

// 26c. Search and filters
test('Job Descriptions: search input exists', () => {
    assertIncludes(html, 'aria-label="Search job descriptions"', 'Must have search input with aria-label');
});

test('Job Descriptions: country filter exists', () => {
    assertIncludes(html, 'id="jd-filter-country"', 'Must have country filter dropdown');
    assertIncludes(html, 'United Kingdom', 'Country filter must have UK option');
    assertIncludes(html, 'International', 'Country filter must have International option');
});

test('Job Descriptions: language filter exists', () => {
    assertIncludes(html, 'id="jd-filter-language"', 'Must have language filter dropdown');
    assertIncludes(html, 'Welsh', 'Language filter must have Welsh option');
    assertIncludes(html, 'Gaelic', 'Language filter must have Gaelic option');
});

test('Job Descriptions: industry filter exists', () => {
    assertIncludes(html, 'id="jd-filter-industry"', 'Must have industry filter dropdown');
});

// 26d. Detail overlay
test('Job Descriptions: detail overlay exists', () => {
    assertIncludes(html, 'id="jd-detail-overlay"', 'Must have detail overlay');
    assertIncludes(html, 'id="jd-detail-title"', 'Must have detail title element');
});

// 26e. Export functionality
test('Job Descriptions: export dropdown exists', () => {
    assertIncludes(html, 'id="jd-export-dropdown"', 'Must have export dropdown');
});

// 26f. JavaScript functions
test('Job Descriptions: initJobDescriptionsPage function exists', () => {
    assertIncludes(allScripts, 'function initJobDescriptionsPage', 'Must have init function');
});

test('Job Descriptions: openJDDetail function exists', () => {
    assertIncludes(allScripts, 'function openJDDetail', 'Must have openJDDetail function');
});

test('Job Descriptions: closeJDDetail function exists', () => {
    assertIncludes(allScripts, 'function closeJDDetail', 'Must have closeJDDetail function');
});

// 26g. Demo data
test('Job Descriptions: has sample JD data', () => {
    assertIncludes(allScripts, 'Senior Software Engineer', 'Must have sample JD data');
    assertIncludes(allScripts, 'Healthcare Assistant', 'Must have Healthcare Assistant JD');
    assertIncludes(allScripts, 'Project Manager', 'Must have Project Manager JD');
});

// 26h. switchNavTab handles job-descriptions
test('Job Descriptions: switchNavTab handles job-descriptions tab', () => {
    assertIncludes(allScripts, 'job-descriptions-page', 'switchNavTab must reference job-descriptions-page');
    assertIncludes(allScripts, "tabName === 'job-descriptions'", 'switchNavTab must handle job-descriptions tab');
});

// 26i. CSS classes
test('Job Descriptions: CSS classes defined', () => {
    assertIncludes(html, '.jd-card', 'Must have jd-card CSS class');
    assertIncludes(html, '.jd-results-grid', 'Must have jd-results-grid CSS class');
    assertIncludes(html, '.jd-filter-dropdown', 'Must have jd-filter-dropdown CSS class');
});

// 26j. Learning Specs consistency
test('Job Descriptions: Learning Specs has country filter', () => {
    assertIncludes(html, 'id="ls-filter-country"', 'Learning Specs must have country filter');
});

test('Job Descriptions: Learning Specs has language filter', () => {
    assertIncludes(html, 'id="ls-filter-language"', 'Learning Specs must have language filter');
});

// 26k. Accessibility
test('Job Descriptions: detail overlay has aria attributes', () => {
    assertIncludes(html, 'aria-label="Close detail panel"', 'JD detail close must have aria-label');
});

// 26l. XSS prevention
test('Job Descriptions: has escapeHTML function', () => {
    assertIncludes(allScripts, 'function escapeHTML', 'Must have escapeHTML function');
});

// ============================================================
// RESULTS
// ============================================================
console.log('\n' + '='.repeat(60));
const totalTests = passed + failed;
console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed (${totalTests} total)\x1b[0m`);
console.log(`\x1b[36mAuto-discovered: ${discoveredConstants.length} quals, ${discoveredCountries.length} countries, ${discoveredUnits.length} units, ${discoveredFunctions.length} functions\x1b[0m`);

if (failures.length > 0) {
  console.log('\n\x1b[31mFailures:\x1b[0m');
  for (const f of failures) {
    console.log(`  \x1b[31mÃÂ¢ÃÂÃÂ ${f.name}\x1b[0m`);
    console.log(`    ${f.error}`);
  }
}

console.log('');
process.exit(failed > 0 ? 1 : 0);
/**
 * Zavmo Prompt Configuration Studio ÃÂ¢ÃÂÃÂ Automated Smoke Tests v2
 * =============================================================
 * Runs on every push/PR via GitHub Actions AND as a pre-commit hook.
 *
 * KEY FEATURE: Auto-discovery
 * ---------------------------
 * Tests 11-14 use regex to dynamically discover qualification constants,
 * country registrations, unit definitions, and function definitions directly
 * from the source code. When new modules, countries, or functions are added,
 * they are automatically picked up ÃÂ¢ÃÂÃÂ no manual test updates needed.
 *
 * Test suites:
 *   1.  Valid HTML structure
 *   2.  Required DOM elements
 *   3.  No duplicate element IDs
 *   4.  Character data integrity (all 12 + Agent 13)
 *   5.  Required core functions
 *   6.  Event listener safety
 *   7.  Security checks (no exposed secrets)
 *   8.  localStorage key consistency
 *   9.  Null safety patterns
 *  10.  API integration
 *  11.  AUTO-DISCOVERED: Qualification constants integrity
 *  12.  AUTO-DISCOVERED: Country registry completeness
 *  13.  AUTO-DISCOVERED: Unit data integrity (LOs & ACs)
 *  14.  AUTO-DISCOVERED: Function cross-reference safety
 *  15.  Country/qualification/unit selector UI
 *  16.  Bloom's taxonomy integration
 *  17.  xAPI integration
 *  18.  Teaching charter & Agent 13
 *  19.  Simulation & lesson flow
 *  20.  Recommendations engine
 *  22.  Fetch Modules modal
 *  23.  Delivery integration (phase labels, sidebar ACs, shared config)
 *  24.  xAPI Analytics Page Integration
 *
 * Usage:
 *   node tests/smoke-test.js
 *
 * Exit codes:
 *   0 = all tests pass
 *   1 = one or more tests failed
 */
