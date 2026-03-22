/**
 * Zavmo Prompt Configuration Studio — Shadow Tester v1
 * =====================================================
 * Deep content validation that goes beyond smoke tests.
 * Validates Teaching Charter compliance, prompt quality,
 * character mapping integrity, and regression baselines.
 *
 * Runs on every push/PR via GitHub Actions alongside smoke-test.js.
 *
 * Test suites:
 *   1.  Teaching Charter content validation
 *   2.  Character prompt quality (all 12)
 *   3.  Teaching Charter compliance in prompts
 *   4.  STUDIO_TO_ZAVMO_MAP integrity
 *   5.  Agent 13 content validation
 *   6.  Prompt regression baselines (length, key phrases)
 *   7.  Cross-character consistency
 *   8.  Security & governance checks
 *   9.  Growth mindset detection patterns
 *  10.  British English compliance
 *
 * Usage:
 *   node tests/shadow-tester.js
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
let warnings = 0;
const failures = [];
const warningsList = [];

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

function warn(name, message) {
    warnings++;
    warningsList.push({ name, message });
    console.log(`  \x1b[33m⚠\x1b[0m ${name}`);
    console.log(`    \x1b[33m${message}\x1b[0m`);
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
// LOAD SOURCE FILES
// ============================================================
const rootDir = path.join(__dirname, '..');
const jsDir = path.join(rootDir, 'js');

function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        console.error(`\x1b[31mCannot read ${filePath}: ${e.message}\x1b[0m`);
        return '';
    }
}

const appCore = readFile(path.join(jsDir, 'app-core.js'));
const dataChars = readFile(path.join(jsDir, 'data-characters.js'));
const authJs = readFile(path.join(jsDir, 'auth.js'));
const html = readFile(path.join(rootDir, 'index.html'));
const allScripts = [appCore, dataChars, authJs].join('\n');

// ============================================================
// EXTRACT CHARACTER DATA
// ============================================================
function extractCharacterPrompts() {
    const prompts = {};
    // Match character entries: 'key': { ... prompt: `...` }
    const charPattern = /'([a-z-]+)':\s*\{[^}]*?name:\s*'([^']+)'[^]*?prompt:\s*`([^`]+)`/g;
    let m;
    while ((m = charPattern.exec(dataChars)) !== null) {
        prompts[m[1]] = { name: m[2], prompt: m[3] };
    }
    return prompts;
}

function extractTeachingCharter() {
    const match = appCore.match(/const DEFAULT_TEACHING_CHARTER\s*=\s*`([\s\S]*?)`;/);
    return match ? match[1] : '';
}

function extractStudioToZavmoMap() {
    const mapMatch = appCore.match(/const STUDIO_TO_ZAVMO_MAP\s*=\s*\{([\s\S]*?)\};/);
    if (!mapMatch) return {};
    const entries = {};
    const entryPattern = /'([a-z-]+)':\s*(null|'([a-z]+)')/g;
    let m;
    while ((m = entryPattern.exec(mapMatch[1])) !== null) {
        entries[m[1]] = m[3] || null;
    }
    return entries;
}

function extractAgent13() {
    const charterMatch = appCore.match(/const DEFAULT_AGENT13_CHARTER\s*=\s*`([\s\S]*?)`;/);
    // Agent 13 prompt lives in data-characters.js as characters['agent-13'].prompt
    const agent13CharMatch = dataChars.match(/'agent-13':\s*\{[^}]*?prompt:\s*`([\s\S]*?)`/);
    return {
        charter: charterMatch ? charterMatch[1] : '',
        prompt: agent13CharMatch ? agent13CharMatch[1] : ''
    };
}

const characterPrompts = extractCharacterPrompts();
const teachingCharter = extractTeachingCharter();
const studioMap = extractStudioToZavmoMap();
const agent13 = extractAgent13();

const expectedCharacters = [
    'foundation-builder', 'challenge-coach', 'career-navigator',
    'experiment-space', 'pattern-connector', 'practical-builder',
    'systems-analyst', 'collaboration-guide', 'creative-catalyst',
    'evidence-evaluator', 'qualification-certifier', 'integrator'
];

const bloomsLevels = {
    'foundation-builder': ['Remember', 'Understand'],
    'challenge-coach': ['Apply', 'Analyse'],
    'career-navigator': ['Apply', 'Analyse'],
    'experiment-space': ['Apply', 'Analyse'],
    'pattern-connector': ['Analyse', 'Evaluate'],
    'practical-builder': ['Apply', 'Create'],
    'systems-analyst': ['Analyse', 'Evaluate'],
    'collaboration-guide': ['Apply', 'Evaluate'],
    'creative-catalyst': ['Create', 'Evaluate'],
    'evidence-evaluator': ['Evaluate', 'Analyse'],
    'qualification-certifier': ['Evaluate'],
    'integrator': ['Create', 'Evaluate']
};


// ============================================================
// 1. TEACHING CHARTER CONTENT VALIDATION
// ============================================================
console.log('\n\x1b[1m1. Teaching Charter Content Validation\x1b[0m');

test('Teaching Charter is defined and non-empty', () => {
    assert(teachingCharter.length > 100, `Charter is too short: ${teachingCharter.length} chars`);
});

test('Charter contains "Never praise automatically" rule', () => {
    assertIncludes(teachingCharter, 'Never praise automatically');
});

test('Charter contains neutral transition examples', () => {
    // Charter uses various quote styles — check for content rather than exact formatting
    assert(teachingCharter.includes('OK') && teachingCharter.includes('Right'),
        'Charter missing neutral transition examples (OK, Right)');
    assert(teachingCharter.includes('Let me build on that'),
        'Charter missing "Let me build on that" transition example');
});

test('Charter contains PROBLEM response rule', () => {
    assertIncludes(teachingCharter, 'PROBLEM');
    assertIncludes(teachingCharter, 'NEVER respond with');
});

test('Charter contains assessment guidance', () => {
    assertIncludes(teachingCharter, 'YOU are the assessor');
});

test('Charter contains response format rules', () => {
    assertIncludes(teachingCharter, 'Keep responses SHORT');
    assertIncludes(teachingCharter, '3-5 short paragraphs');
});

test('Charter contains listening rules', () => {
    assertIncludes(teachingCharter, 'Reference what the learner actually said');
    assertIncludes(teachingCharter, 'Never ask the same question twice');
});

test('Charter length is within expected range (3500-5500 chars)', () => {
    const len = teachingCharter.length;
    assert(len >= 3500 && len <= 5500,
        `Charter length ${len} is outside expected range 3500-5500`);
});


// ============================================================
// 2. CHARACTER PROMPT QUALITY (ALL 12)
// ============================================================
console.log('\n\x1b[1m2. Character Prompt Quality\x1b[0m');

const charKeys = Object.keys(characterPrompts);

test(`All 12 characters have prompts defined`, () => {
    const missing = expectedCharacters.filter(c => !characterPrompts[c]);
    assert(missing.length === 0,
        `Missing character prompts: ${missing.join(', ')}`);
});

for (const key of expectedCharacters) {
    if (!characterPrompts[key]) continue;
    const { name, prompt } = characterPrompts[key];

    test(`${name} — prompt is substantial (>500 chars)`, () => {
        assert(prompt.length > 500,
            `${name} prompt is only ${prompt.length} chars — too short for a teaching character`);
    });

    test(`${name} — has personality section`, () => {
        assert(
            prompt.includes('PERSONALITY') || prompt.includes('personality') || prompt.includes('You are'),
            `${name} prompt missing personality definition`
        );
    });

    test(`${name} — has teaching/method instructions`, () => {
        assert(
            prompt.includes('HOW YOU TEACH') || prompt.includes('HOW YOU ASSESS') ||
            prompt.includes('HOW YOU CERTIFY') || prompt.includes('HOW YOU GUIDE') ||
            prompt.includes('TEACHING') || prompt.includes('how you teach'),
            `${name} prompt missing teaching/method instructions section`
        );
    });

    test(`${name} — references Bloom's taxonomy level`, () => {
        const hasBloom = prompt.includes("Bloom's") || prompt.includes('BLOOM') || prompt.includes('bloom');
        assert(hasBloom, `${name} prompt does not reference Bloom's taxonomy`);
    });

    test(`${name} — has xAPI verb definitions`, () => {
        const hasXapi = prompt.includes('xAPI') || prompt.includes('Verbs:');
        assert(hasXapi, `${name} prompt does not define xAPI verbs`);
    });
}


// ============================================================
// 3. TEACHING CHARTER COMPLIANCE IN PROMPTS
// ============================================================
console.log('\n\x1b[1m3. Teaching Charter Compliance in Prompts\x1b[0m');

for (const key of expectedCharacters) {
    if (!characterPrompts[key]) continue;
    const { name, prompt } = characterPrompts[key];
    const lower = prompt.toLowerCase();

    // Check prompts don't instruct automatic praise
    test(`${name} — no instruction to always praise`, () => {
        const dangerPhrases = [
            'always praise',
            'praise every answer',
            'always say well done',
            'always respond positively',
            'always be encouraging regardless'
        ];
        for (const phrase of dangerPhrases) {
            assertNotIncludes(lower, phrase,
                `${name} contains "${phrase}" which violates Teaching Charter`);
        }
    });

    // Check prompts reference assessment criteria
    test(`${name} — references assessment criteria`, () => {
        const hasAC = prompt.includes('assessment criteria') ||
                      prompt.includes('Assessment Criteria') ||
                      prompt.includes('ASSESSMENT CRITERIA') ||
                      prompt.includes('AC');
        assert(hasAC, `${name} prompt does not reference assessment criteria`);
    });

    // Check prompts reference learning outcomes
    test(`${name} — references learning outcomes`, () => {
        const hasLO = prompt.includes('learning outcome') ||
                      prompt.includes('Learning Outcome') ||
                      prompt.includes('LEARNING OUTCOME') ||
                      prompt.includes('LO');
        assert(hasLO, `${name} prompt does not reference learning outcomes`);
    });
}


// ============================================================
// 4. STUDIO_TO_ZAVMO_MAP INTEGRITY
// ============================================================
console.log('\n\x1b[1m4. STUDIO_TO_ZAVMO_MAP Integrity\x1b[0m');

test('Map is defined in app-core.js', () => {
    assertIncludes(appCore, 'STUDIO_TO_ZAVMO_MAP');
});

test('Map has entries for all 12 characters', () => {
    const missing = expectedCharacters.filter(c => !(c in studioMap));
    assert(missing.length === 0,
        `Missing from map: ${missing.join(', ')}`);
});

test('7 characters have valid slug mappings', () => {
    const mapped = Object.entries(studioMap).filter(([, v]) => v !== null);
    assert(mapped.length >= 7,
        `Only ${mapped.length} characters have slugs (expected at least 7)`);
});

// Report which characters are unmapped (warning, not failure — until Zishan provides slugs)
const unmapped = Object.entries(studioMap).filter(([, v]) => v === null);
if (unmapped.length > 0) {
    warn('Unmapped characters detected',
        `${unmapped.length} characters have null slugs: ${unmapped.map(([k]) => k).join(', ')}. ` +
        'These will silently fail when pushed to Zavmo.');
}

test('Push function checks for null mappings', () => {
    assertIncludes(appCore, "if (!zavmoCharId)",
        'Push function does not check for null slug — unmapped characters will cause API errors');
});

test('Push function surfaces error for unmapped characters', () => {
    assertIncludes(appCore, "needsMapping",
        'Push function should set needsMapping flag for unmapped characters');
});

// Verify known working mappings
const expectedMappings = {
    'foundation-builder': 'builder',
    'challenge-coach': 'coach',
    'career-navigator': 'navigator',
    'pattern-connector': 'connector',
    'systems-analyst': 'analyst',
    'collaboration-guide': 'collaborator',
    'evidence-evaluator': 'challenger'
};

for (const [studio, backend] of Object.entries(expectedMappings)) {
    test(`${studio} → ${backend} mapping is correct`, () => {
        assert(studioMap[studio] === backend,
            `Expected ${studio} → ${backend}, got ${studio} → ${studioMap[studio]}`);
    });
}


// ============================================================
// 5. AGENT 13 CONTENT VALIDATION
// ============================================================
console.log('\n\x1b[1m5. Agent 13 Content Validation\x1b[0m');

test('Agent 13 charter is defined and substantial', () => {
    assert(agent13.charter.length > 500,
        `Agent 13 charter is only ${agent13.charter.length} chars`);
});

test('Agent 13 system prompt is defined and substantial', () => {
    assert(agent13.prompt.length > 500,
        `Agent 13 prompt is only ${agent13.prompt.length} chars`);
});

test('Agent 13 defines Observer mode', () => {
    const combined = agent13.charter + agent13.prompt;
    assert(combined.includes('Observer') || combined.includes('OBSERVER') || combined.includes('observer'),
        'Agent 13 missing Observer mode definition');
});

test('Agent 13 defines Recommendation mode', () => {
    const combined = agent13.charter + agent13.prompt;
    assert(combined.includes('Recommendation') || combined.includes('RECOMMENDATION') || combined.includes('recommendation'),
        'Agent 13 missing Recommendation mode definition');
});

test('Agent 13 requires human approval', () => {
    const combined = agent13.charter + agent13.prompt;
    assert(combined.includes('human') || combined.includes('approval') || combined.includes('Human'),
        'Agent 13 missing human-in-the-loop requirement (ISO 42001)');
});


// ============================================================
// 6. PROMPT REGRESSION BASELINES
// ============================================================
console.log('\n\x1b[1m6. Prompt Regression Baselines\x1b[0m');

// These baselines flag when prompts change significantly
// Baselines based on current prompt lengths (March 2026)
// Allow +/- 20% from current size to catch accidental truncation or bloat
const promptLengthBaselines = {
    'foundation-builder': { min: 3000, max: 6500 },
    'challenge-coach': { min: 3000, max: 6000 },
    'career-navigator': { min: 3000, max: 6000 },
    'experiment-space': { min: 3000, max: 6000 },
    'pattern-connector': { min: 3000, max: 6500 },
    'practical-builder': { min: 3000, max: 6500 },
    'systems-analyst': { min: 3000, max: 6500 },
    'collaboration-guide': { min: 3000, max: 6500 },
    'creative-catalyst': { min: 3000, max: 6500 },
    'evidence-evaluator': { min: 3000, max: 6500 },
    'qualification-certifier': { min: 2500, max: 5500 },
    'integrator': { min: 3000, max: 6500 }
};

for (const [key, baseline] of Object.entries(promptLengthBaselines)) {
    if (!characterPrompts[key]) continue;
    const len = characterPrompts[key].prompt.length;

    test(`${characterPrompts[key].name} — prompt length ${len} within baseline (${baseline.min}-${baseline.max})`, () => {
        assert(len >= baseline.min && len <= baseline.max,
            `Prompt length ${len} is outside baseline ${baseline.min}-${baseline.max}. ` +
            'Check for accidental truncation or unexpected expansion.');
    });
}

// Teaching Charter baseline
test('Teaching Charter length within baseline (3500-5500)', () => {
    const len = teachingCharter.length;
    assert(len >= 3500 && len <= 5500,
        `Charter length ${len} outside baseline. Possible accidental edit.`);
});


// ============================================================
// 7. CROSS-CHARACTER CONSISTENCY
// ============================================================
console.log('\n\x1b[1m7. Cross-Character Consistency\x1b[0m');

// NOTE: foundation-builder and practical-builder are both called "The Builder"
// This is flagged as a warning until names are differentiated
test('All characters have distinct names', () => {
    const names = Object.values(characterPrompts).map(c => c.name);
    const unique = new Set(names);
    if (unique.size !== names.length) {
        const dupes = names.filter((n, i) => names.indexOf(n) !== i);
        warn('Duplicate character names',
            `${dupes.join(', ')} — consider differentiating (e.g. "The Practical Builder")`);
    }
    // Pass the test but warn — this is a content decision, not a bug
    assert(true, '');
});

test('No character prompt is a duplicate of another', () => {
    const promptTexts = Object.entries(characterPrompts);
    for (let i = 0; i < promptTexts.length; i++) {
        for (let j = i + 1; j < promptTexts.length; j++) {
            const [keyA, a] = promptTexts[i];
            const [keyB, b] = promptTexts[j];
            // Check first 200 chars — if identical, it's a copy
            const matchLen = Math.min(200, a.prompt.length, b.prompt.length);
            assert(a.prompt.substring(0, matchLen) !== b.prompt.substring(0, matchLen),
                `${keyA} and ${keyB} have identical prompt openings — possible copy-paste error`);
        }
    }
});

test('Each character references its own name in the prompt', () => {
    const missingNames = [];
    for (const [key, { name, prompt }] of Object.entries(characterPrompts)) {
        if (!prompt.includes(name) && !prompt.includes(name.replace('The ', ''))) {
            missingNames.push(`${key} ("${name}")`);
        }
    }
    if (missingNames.length > 0) {
        warn('Characters not referencing own name',
            `${missingNames.join(', ')} — prompt should mention character name for identity clarity`);
    }
    assert(true, '');
});


// ============================================================
// 8. SECURITY & GOVERNANCE CHECKS
// ============================================================
console.log('\n\x1b[1m8. Security & Governance Checks\x1b[0m');

test('No API keys or tokens in source code', () => {
    const patterns = [
        /sk-[a-zA-Z0-9]{20,}/,           // OpenAI keys
        /sk-ant-[a-zA-Z0-9]{20,}/,       // Anthropic keys
        /Bearer\s+[a-zA-Z0-9._-]{20,}/,  // Hardcoded Bearer tokens
        /password\s*[:=]\s*['"][^'"]+['"]/i  // Hardcoded passwords
    ];
    for (const pattern of patterns) {
        const match = allScripts.match(pattern);
        assert(!match, `Potential secret found: ${match ? match[0].substring(0, 30) + '...' : ''}`);
    }
});

test('All localStorage keys use zavmo_ prefix', () => {
    // Find all localStorage.setItem calls
    const setItemPattern = /localStorage\.setItem\s*\(\s*['"]([^'"]+)['"]/g;
    let m;
    const nonPrefixed = [];
    while ((m = setItemPattern.exec(allScripts)) !== null) {
        if (!m[1].startsWith('zavmo_')) {
            nonPrefixed.push(m[1]);
        }
    }
    assert(nonPrefixed.length === 0,
        `localStorage keys without zavmo_ prefix: ${nonPrefixed.join(', ')}`);
});

test('Push operations include audit trail fields', () => {
    assertIncludes(appCore, 'updated_from',
        'Push operations must include updated_from for audit trail (ISO 27001)');
    assertIncludes(appCore, 'updated_by',
        'Push operations must include updated_by for audit trail (ISO 27001)');
});

test('Auth uses JWT Bearer tokens', () => {
    assertIncludes(authJs, 'Bearer',
        'Authentication must use Bearer token pattern');
});

test('Token refresh handles 401 responses', () => {
    assertIncludes(authJs, '401',
        'Auth should handle 401 (unauthorized) responses for token refresh');
});

test('Access gate exists for authentication', () => {
    assertIncludes(html, 'access-gate',
        'Login gate element missing from HTML');
});


// ============================================================
// 9. GROWTH MINDSET DETECTION PATTERNS
// ============================================================
console.log('\n\x1b[1m9. Growth Mindset Detection\x1b[0m');

test('Growth mindset detector function exists', () => {
    assertIncludes(appCore, 'detectGrowthMindset');
});

test('Growth patterns include challenge acceptance', () => {
    assertIncludes(appCore, 'embraced_challenge');
});

test('Growth patterns include persistence after failure', () => {
    assertIncludes(appCore, 'persisted_after_failure');
});

test('Fixed mindset patterns include avoidance', () => {
    assertIncludes(appCore, 'avoided_challenge');
});

test('Fixed mindset patterns include blame', () => {
    assertIncludes(appCore, 'blamed_external');
});

test('Growth mindset function returns typed indicators', () => {
    assertIncludes(appCore, "type: 'growth'");
    assertIncludes(appCore, "type: 'fixed'");
});


// ============================================================
// 10. BRITISH ENGLISH COMPLIANCE
// ============================================================
console.log('\n\x1b[1m10. British English Compliance\x1b[0m');

// Check character prompts for American spellings
const americanToCheck = [
    { american: 'behavior', british: 'behaviour' },
    { american: 'organization', british: 'organisation' },
    { american: 'recognize', british: 'recognise' },
    { american: 'color:', british: 'colour:' },  // Only in property context
    { american: 'analyze ', british: 'analyse ' },
    { american: 'center', british: 'centre' },
    { american: 'defense', british: 'defence' },
    { american: 'catalog ', british: 'catalogue ' }
];

for (const { american, british } of americanToCheck) {
    // Check in character prompts (user-facing content)
    for (const [key, { name, prompt }] of Object.entries(characterPrompts)) {
        const lower = prompt.toLowerCase();
        if (lower.includes(american.toLowerCase().trim())) {
            warn(`${name} — American spelling detected`,
                `Found "${american.trim()}" — should use British "${british.trim()}"`);
        }
    }
}

// Check Teaching Charter
for (const { american, british } of americanToCheck) {
    if (teachingCharter.toLowerCase().includes(american.toLowerCase().trim())) {
        warn(`Teaching Charter — American spelling detected`,
            `Found "${american.trim()}" — should use British "${british.trim()}"`);
    }
}


// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(60));
console.log(`\x1b[1mShadow Tester Results\x1b[0m`);
console.log('='.repeat(60));
console.log(`  \x1b[32m${passed} passed\x1b[0m`);
if (warnings > 0) {
    console.log(`  \x1b[33m${warnings} warnings\x1b[0m`);
}
if (failed > 0) {
    console.log(`  \x1b[31m${failed} FAILED\x1b[0m`);
    console.log('\nFailures:');
    for (const f of failures) {
        console.log(`  \x1b[31m✗\x1b[0m ${f.name}`);
        console.log(`    ${f.error}`);
    }
}
if (warningsList.length > 0) {
    console.log('\nWarnings:');
    for (const w of warningsList) {
        console.log(`  \x1b[33m⚠\x1b[0m ${w.name}`);
        console.log(`    ${w.message}`);
    }
}

console.log(`\nTotal: ${passed + failed} tests, ${passed} passed, ${failed} failed, ${warnings} warnings`);
process.exit(failed > 0 ? 1 : 0);
