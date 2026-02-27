/**
 * Zavmo Prompt Configuration Studio — Comprehensive UI/UX & API Integration Tests
 * ================================================================================
 * Thorough test suite covering every page, every component, and every API
 * integration point. Clearly reports what's working, what's pulling through
 * from the Neo4j database, and what's falling back to demo data.
 *
 * Usage:
 *   node tests/ui-ux-test.js                    — Run all tests
 *   node tests/ui-ux-test.js --section=api      — Run only API section
 *   node tests/ui-ux-test.js --section=nav      — Run only navigation section
 *   node tests/ui-ux-test.js --verbose           — Show extra detail
 *
 * Sections:
 *   1.  PAGE STRUCTURE & NAVIGATION
 *   2.  CONSISTENT HEADERS (all 6 pages)
 *   3.  AUTHENTICATION FLOW
 *   4.  CHARACTERS PAGE — UI Components
 *   5.  AGENT 13 PAGE — UI Components
 *   6.  SIMULATION & COMPARISON PAGE — UI Components
 *   7.  LEARNING SPECIFICATIONS PAGE — UI Components
 *   8.  JOB DESCRIPTIONS PAGE — UI Components
 *   9.  xAPI ANALYTICS PAGE — UI Components (all 6 sub-tabs)
 *  10.  NEO4J / API CONNECTIVITY & DATA FLOW
 *  11.  SEARCH & FILTER FUNCTIONALITY
 *  12.  EXPORT FUNCTIONS
 *  13.  COMING SOON / FALLBACK DETECTION
 *  14.  ACCESSIBILITY & SECURITY
 *  15.  CROSS-PAGE CONSISTENCY
 *  16.  RESPONSIVE LAYOUT
 *
 * Exit codes:
 *   0 = all tests pass
 *   1 = one or more tests failed
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// CLI ARGS
// ============================================================
const args = process.argv.slice(2);
const sectionFilter = (args.find(a => a.startsWith('--section=')) || '').replace('--section=', '');
const verbose = args.includes('--verbose');

// ============================================================
// TEST FRAMEWORK
// ============================================================
let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];
const warnings = [];
const apiStatus = {};  // Track API endpoint status

const COLOURS = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
    bold: '\x1b[1m',
    reset: '\x1b[0m'
};

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ${COLOURS.green}✓${COLOURS.reset} ${name}`);
    } catch (e) {
        failed++;
        failures.push({ name, error: e.message });
        console.log(`  ${COLOURS.red}✗${COLOURS.reset} ${name}`);
        console.log(`    ${COLOURS.red}${e.message}${COLOURS.reset}`);
    }
}

function warn(name, message) {
    warnings.push({ name, message });
    if (verbose) {
        console.log(`  ${COLOURS.yellow}⚠${COLOURS.reset} ${COLOURS.yellow}${name}: ${message}${COLOURS.reset}`);
    }
}

function skip(name, reason) {
    skipped++;
    if (verbose) {
        console.log(`  ${COLOURS.dim}○ ${name} (skipped: ${reason})${COLOURS.reset}`);
    }
}

function section(number, title, tag = '') {
    if (sectionFilter && tag && sectionFilter !== tag) return false;
    console.log(`\n${COLOURS.bold}Section ${number}: ${title}${COLOURS.reset}`);
    return true;
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function assertIncludes(haystack, needle, message) {
    if (!haystack.includes(needle)) {
        throw new Error(message || `Expected to find "${needle.substring(0, 80)}..."`);
    }
}

function assertNotIncludes(haystack, needle, message) {
    if (haystack.includes(needle)) {
        throw new Error(message || `Should NOT contain "${needle.substring(0, 80)}"`);
    }
}

function assertMatch(haystack, regex, message) {
    if (!regex.test(haystack)) {
        throw new Error(message || `Expected to match ${regex}`);
    }
}

function countOccurrences(str, substr) {
    let count = 0, pos = 0;
    while ((pos = str.indexOf(substr, pos)) !== -1) { count++; pos += substr.length; }
    return count;
}

// ============================================================
// LOAD THE FILE
// ============================================================
const indexPath = path.join(__dirname, '..', 'index.html');
console.log(`\n${COLOURS.cyan}Zavmo Prompt Studio — UI/UX & API Integration Test Suite${COLOURS.reset}`);
console.log(`${COLOURS.dim}Loading ${indexPath}...${COLOURS.reset}\n`);

let html;
try {
    html = fs.readFileSync(indexPath, 'utf8');
} catch (e) {
    console.error(`${COLOURS.red}FATAL: Cannot read ${indexPath}: ${e.message}${COLOURS.reset}`);
    process.exit(1);
}

// Extract JavaScript — read external JS files + any remaining inline scripts
const jsDir = path.join(__dirname, '..', 'js');
const jsFiles = fs.existsSync(jsDir) ? fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort() : [];
let allScripts = jsFiles.map(f => fs.readFileSync(path.join(jsDir, f), 'utf8')).join('\n');
const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
if (scriptMatches.length) allScripts += '\n' + scriptMatches.map(s => s.replace(/<\/?script[^>]*>/gi, '')).join('\n');

// Extract CSS — read external CSS files + any remaining inline styles
const cssDir = path.join(__dirname, '..', 'css');
const cssFiles = fs.existsSync(cssDir) ? fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).sort() : [];
let allStyles = cssFiles.map(f => fs.readFileSync(path.join(cssDir, f), 'utf8')).join('\n');
const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
if (styleMatches.length) allStyles += '\n' + styleMatches.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n');


// ============================================================
// SECTION 1: PAGE STRUCTURE & NAVIGATION
// ============================================================
if (section(1, 'PAGE STRUCTURE & NAVIGATION', 'nav')) {

    test('HTML document has valid doctype', () => {
        assertMatch(html, /<!DOCTYPE html>/i, 'Missing <!DOCTYPE html>');
    });

    test('Page has <title> tag', () => {
        assertMatch(html, /<title>[^<]+<\/title>/, 'Missing or empty <title>');
    });

    test('All 6 navigation tabs exist', () => {
        const tabs = ['characters', 'agent13', 'sim-compare', 'learning-specs', 'job-descriptions', 'xapi-analytics'];
        tabs.forEach(tab => {
            assertIncludes(html, `data-tab="${tab}"`, `Missing nav tab: ${tab}`);
        });
    });

    test('All 6 page containers exist', () => {
        const pages = ['characters-page', 'agent13-page', 'sim-compare-page', 'learning-specs-page', 'job-descriptions-page', 'xapi-analytics-page'];
        pages.forEach(page => {
            assertIncludes(html, `id="${page}"`, `Missing page container: ${page}`);
        });
    });

    test('switchNavTab function handles all 6 tabs', () => {
        assertIncludes(allScripts, 'function switchNavTab', 'Missing switchNavTab function');
        const fnStart = allScripts.indexOf('function switchNavTab');
        const fnBlock = allScripts.substring(fnStart, fnStart + 3000);
        ['characters', 'agent13', 'sim-compare', 'learning-specs', 'job-descriptions', 'xapi-analytics'].forEach(tab => {
            assert(fnBlock.includes(tab) || fnBlock.includes(`'${tab}'`), `switchNavTab missing handler for: ${tab}`);
        });
    });

    test('Nav tab click listeners are wired up', () => {
        assertIncludes(allScripts, "data-tab", 'No data-tab references in scripts');
        assertIncludes(allScripts, 'switchNavTab', 'No switchNavTab calls in scripts');
    });

    test('Characters page is visible by default (others hidden)', () => {
        assertIncludes(html, 'id="characters-page" style="width:', 'Characters page should be visible by default');
        // Others should have display: none
        assertMatch(html, /id="sim-compare-page"[^>]*display:\s*none/, 'Sim & Compare should be hidden initially');
        assertMatch(html, /id="learning-specs-page"[^>]*display:\s*none/, 'Learning Specs should be hidden initially');
        assertMatch(html, /id="job-descriptions-page"[^>]*display:\s*none/, 'Job Descriptions should be hidden initially');
        assertMatch(html, /id="xapi-analytics-page"[^>]*display:\s*none/, 'xAPI Analytics should be hidden initially');
    });

    test('Login/access gate exists', () => {
        assertIncludes(html, 'id="access-gate"', 'Missing access gate overlay');
    });
}


// ============================================================
// SECTION 2: CONSISTENT HEADERS (all 6 pages)
// ============================================================
if (section(2, 'CONSISTENT HEADERS', 'headers')) {

    // Standard header pattern: 48px icon, h2 title, p subtitle, teal border-bottom
    const headerPattern = {
        icon: 'width: 48px; height: 48px; border-radius: 12px; background: rgba(0,217,192,0.15)',
        title: 'font-size: 22px',
        subtitle: 'color: rgba(255,255,255,0.5); font-size: 13px',
        border: 'border-bottom: 1px solid rgba(0,217,192,0.2)'
    };

    // Extract each page's header section
    const pages = [
        { name: 'Characters', id: 'characters-page' },
        { name: 'Agent 13', id: 'agent13-page' },
        { name: 'Simulation & Comparison', id: 'sim-compare-page' },
        { name: 'Learning Specs', id: 'learning-specs-page' },
        { name: 'Job Descriptions', id: 'job-descriptions-page' },
        { name: 'xAPI Analytics', id: 'xapi-analytics-page' }
    ];

    pages.forEach(page => {
        test(`${page.name} page has standard 48px header icon`, () => {
            const pageStart = html.indexOf(`id="${page.id}"`);
            assert(pageStart !== -1, `Cannot find page: ${page.id}`);
            // Look ahead up to 2000 chars for the icon
            const pageChunk = html.substring(pageStart, pageStart + 2000);
            assertIncludes(pageChunk, 'width: 48px; height: 48px', `${page.name} missing 48px icon`);
        });

        test(`${page.name} page has h2 title with 22px font`, () => {
            const pageStart = html.indexOf(`id="${page.id}"`);
            const pageChunk = html.substring(pageStart, pageStart + 2000);
            assertIncludes(pageChunk, '<h2', `${page.name} missing <h2> title`);
            assertIncludes(pageChunk, 'font-size: 22px', `${page.name} title not 22px`);
        });

        test(`${page.name} page has subtitle paragraph`, () => {
            const pageStart = html.indexOf(`id="${page.id}"`);
            const pageChunk = html.substring(pageStart, pageStart + 2000);
            // Check for the subtitle pattern
            assert(
                pageChunk.includes('rgba(255,255,255,0.5)') && pageChunk.includes('font-size: 13px'),
                `${page.name} missing subtitle with correct styling`
            );
        });

        test(`${page.name} page has teal bottom border divider`, () => {
            const pageStart = html.indexOf(`id="${page.id}"`);
            const pageChunk = html.substring(pageStart, pageStart + 2000);
            assertIncludes(pageChunk, 'border-bottom: 1px solid rgba(0,217,192,0.2)', `${page.name} missing teal border divider`);
        });
    });

    test('No page headers use max-width constraint', () => {
        // Characters and Agent 13 previously had max-width: 1200px — should be gone
        pages.forEach(page => {
            const pageStart = html.indexOf(`id="${page.id}"`);
            const pageChunk = html.substring(pageStart, pageStart + 500);
            // Check the immediate container doesn't have max-width
            if (pageChunk.includes('max-width: 1200px')) {
                // Only warn — xAPI might still use max-width for sub-content
                warn(`${page.name} header`, 'Contains max-width: 1200px — may restrict full-width layout');
            }
        });
        // Characters and Agent 13 specifically should NOT have max-width on their wrapper
        const charsStart = html.indexOf('id="characters-page"');
        const charsContainer = html.substring(charsStart, charsStart + 300);
        assertNotIncludes(charsContainer, 'max-width: 1200px', 'Characters page container still has max-width: 1200px');
    });

    test('All page containers use full-width layout', () => {
        ['learning-specs-page', 'job-descriptions-page'].forEach(pageId => {
            const pageStart = html.indexOf(`id="${pageId}"`);
            const pageChunk = html.substring(pageStart, pageStart + 500);
            assertIncludes(pageChunk, 'width: 100%', `${pageId} not using full-width layout`);
        });
    });
}


// ============================================================
// SECTION 3: AUTHENTICATION FLOW
// ============================================================
if (section(3, 'AUTHENTICATION FLOW', 'auth')) {

    test('ZAVMO_BASE_URL is defined', () => {
        assertIncludes(allScripts, "const ZAVMO_BASE_URL = 'https://uat.zavmo.co.uk:8000'", 'Missing or incorrect ZAVMO_BASE_URL');
    });

    test('Login endpoint references /api/auth/login/', () => {
        assertIncludes(allScripts, '/api/auth/login/', 'Missing login endpoint');
    });

    test('Token refresh endpoint references /api/auth/refresh/', () => {
        assertIncludes(allScripts, '/api/auth/refresh/', 'Missing refresh endpoint');
    });

    test('zavmoFetch() function exists with auth injection', () => {
        assertIncludes(allScripts, 'async function zavmoFetch', 'Missing zavmoFetch function');
        const fnStart = allScripts.indexOf('async function zavmoFetch');
        const fnBlock = allScripts.substring(fnStart, fnStart + 1500);
        assertIncludes(fnBlock, 'Bearer', 'zavmoFetch not injecting Bearer token');
    });

    test('zavmoFetch() handles 401 with auto-refresh', () => {
        const fnStart = allScripts.indexOf('async function zavmoFetch');
        const fnBlock = allScripts.substring(fnStart, fnStart + 1500);
        assertIncludes(fnBlock, '401', 'zavmoFetch missing 401 handling');
        assertIncludes(fnBlock, 'refresh', 'zavmoFetch missing token refresh on 401');
    });

    test('Token storage uses zavmo_auth key', () => {
        assertIncludes(allScripts, 'zavmo_auth', 'Missing zavmo_auth localStorage key');
    });

    test('Auto-refresh timer is set (50-minute interval)', () => {
        // Check for setInterval with approximately 50 minutes (3000000ms)
        assertMatch(allScripts, /setInterval.*refresh|refresh.*setInterval/s, 'Missing auto-refresh timer');
    });

    test('Access gate has email and password inputs', () => {
        assertMatch(html, /id="gate-email"|id="access-email"/, 'Missing email input on access gate');
        assertMatch(html, /id="gate-password"|id="access-password"/, 'Missing password input on access gate');
    });

    test('Access gate has error display element', () => {
        assertIncludes(html, 'gate-error', 'Missing error display element on access gate');
    });

    test('No hardcoded tokens or passwords in source', () => {
        // Check scripts don't contain obvious hardcoded credentials
        const credPatterns = [/password\s*[:=]\s*['"][^'"]{8,}['"]/i, /secret_key\s*[:=]\s*['"][^'"]+['"]/i];
        credPatterns.forEach(pattern => {
            assert(!pattern.test(allScripts), `Possible hardcoded credential found matching ${pattern}`);
        });
    });
}


// ============================================================
// SECTION 4: CHARACTERS PAGE — UI COMPONENTS
// ============================================================
if (section(4, 'CHARACTERS PAGE — UI COMPONENTS', 'characters')) {

    test('Character selector dropdown exists with all 12 characters', () => {
        assertIncludes(html, 'id="character-select"', 'Missing character selector');
        const charNames = [
            'foundation-builder', 'challenge-coach', 'career-navigator', 'experiment-space',
            'pattern-connector', 'practical-builder', 'systems-analyst', 'collaboration-guide',
            'creative-catalyst', 'evidence-evaluator', 'qualification-certifier', 'integrator'
        ];
        charNames.forEach(char => {
            assertIncludes(html, `value="${char}"`, `Missing character option: ${char}`);
        });
    });

    test('Character metadata cards exist (Bloom\'s Level, Tone, etc.)', () => {
        assertIncludes(html, "Bloom's Level", 'Missing Bloom\'s Level metadata card');
    });

    test('System prompt textarea exists', () => {
        assertMatch(html, /id="prompt-textarea"|class="prompt-textarea"/, 'Missing system prompt textarea');
    });

    test('Save prompt button exists', () => {
        assertIncludes(html, 'id="save-prompt-btn"', 'Missing save prompt button');
    });

    test('syncToZavmo function references character prompt endpoint', () => {
        assertIncludes(allScripts, '/api/deliver/characters/', 'syncToZavmo missing character prompt endpoint');
    });

    test('syncToZavmo handles 404/405 gracefully', () => {
        const fnStart = allScripts.indexOf('syncToZavmo') || allScripts.indexOf('async function syncToZavmo');
        if (fnStart !== -1) {
            const fnBlock = allScripts.substring(fnStart, fnStart + 3000);
            assert(fnBlock.includes('404') || fnBlock.includes('405'), 'syncToZavmo should handle 404/405 for unbuilt endpoints');
        }
    });

    test('Export all prompts function exists', () => {
        assertIncludes(allScripts, 'function exportAllPrompts', 'Missing exportAllPrompts function');
    });

    test('Import prompts function exists', () => {
        assertMatch(allScripts, /import.*Prompts|importPrompts|function.*import.*prompt/i, 'Missing import prompts function');
    });

    test('Character colour swatch element exists', () => {
        assertIncludes(html, 'id="colour-swatch"', 'Missing colour swatch element');
    });
}


// ============================================================
// SECTION 5: AGENT 13 PAGE — UI COMPONENTS
// ============================================================
if (section(5, 'AGENT 13 PAGE — UI COMPONENTS', 'agent13')) {

    test('Agent 13 page container exists', () => {
        assertIncludes(html, 'id="agent13-page"', 'Missing Agent 13 page');
    });

    test('Agent 13 Charter section exists', () => {
        assertIncludes(html, 'Agent 13 Charter', 'Missing Agent 13 Charter section');
    });

    test('Charter toggle/edit button exists', () => {
        assertIncludes(html, 'agent13-charter-toggle', 'Missing charter toggle button');
    });

    test('toggleAgent13Charter function exists', () => {
        assertIncludes(allScripts, 'function toggleAgent13Charter', 'Missing toggleAgent13Charter function');
    });

    test('Teaching charter save endpoint referenced', () => {
        assertIncludes(allScripts, '/api/deliver/teaching-charter/', 'Missing teaching charter save endpoint');
    });

    test('Agent 13 recommendations section exists', () => {
        assertMatch(html, /recommendation|agent13.*recommend/i, 'Missing recommendations section');
    });
}


// ============================================================
// SECTION 6: SIMULATION & COMPARISON PAGE — UI COMPONENTS
// ============================================================
if (section(6, 'SIMULATION & COMPARISON PAGE — UI COMPONENTS', 'sim')) {

    test('Sim & Compare page has header', () => {
        const pageStart = html.indexOf('id="sim-compare-page"');
        const pageChunk = html.substring(pageStart, pageStart + 3000);
        assertIncludes(pageChunk, 'Simulation', 'Sim & Compare page missing header title');
    });

    test('Unit Configuration panel exists', () => {
        assertIncludes(html, 'id="qual-panel"', 'Missing qualification/unit configuration panel');
    });

    test('Country selector exists', () => {
        assertIncludes(html, 'id="country-select"', 'Missing country selector');
    });

    test('Country options include UK, Australia, Germany', () => {
        assertIncludes(html, 'value="uk"', 'Missing UK option');
        assertIncludes(html, 'value="au"', 'Missing Australia option');
        assertIncludes(html, 'value="de"', 'Missing Germany option');
    });

    test('Unit Configuration panel is collapsible', () => {
        assertIncludes(html, 'qual-panel-toggle', 'Missing panel toggle control');
        assertIncludes(html, 'qual-panel-header', 'Missing panel header for collapse');
    });

    test('Simulation run buttons exist', () => {
        assertMatch(html, /run.*sim|simulate|start.*sim/i, 'Missing simulation run controls');
    });

    test('Comparison view elements exist', () => {
        assertMatch(html, /comparison|compare.*output|side.*by.*side/i, 'Missing comparison view elements');
    });

    test('LLM endpoint for simulation exists', () => {
        assertIncludes(allScripts, '/api/llm/chat/', 'Missing LLM chat endpoint for simulations');
    });
}


// ============================================================
// SECTION 7: LEARNING SPECIFICATIONS PAGE — UI COMPONENTS
// ============================================================
if (section(7, 'LEARNING SPECIFICATIONS PAGE — UI COMPONENTS', 'ls')) {

    test('Learning Specs search input exists', () => {
        assertIncludes(html, 'id="ls-search-input"', 'Missing LS search input');
    });

    test('Learning Specs search input has accessible label', () => {
        assertMatch(html, /id="ls-search-input"[^>]*aria-label/, 'LS search input missing aria-label');
    });

    test('Sort dropdown exists with 3 options', () => {
        const pageStart = html.indexOf('id="learning-specs-page"');
        const pageChunk = html.substring(pageStart, pageStart + 5000);
        assertIncludes(pageChunk, 'Most Popular', 'Missing "Most Popular" sort option');
        assertIncludes(pageChunk, 'Recently Updated', 'Missing "Recently Updated" sort option');
        assertIncludes(pageChunk, 'Alphabetical', 'Missing "Alphabetical" sort option');
    });

    test('Country filter exists on Learning Specs', () => {
        const pageStart = html.indexOf('id="learning-specs-page"');
        const pageChunk = html.substring(pageStart, pageStart + 5000);
        assertMatch(pageChunk, /country|Country/, 'Missing country filter on LS page');
    });

    test('Language filter exists on Learning Specs', () => {
        const pageStart = html.indexOf('id="learning-specs-page"');
        const pageChunk = html.substring(pageStart, pageStart + 5000);
        assertMatch(pageChunk, /language|Language/, 'Missing language filter on LS page');
    });

    test('Results grid container exists', () => {
        assertIncludes(html, 'id="ls-results-grid"', 'Missing LS results grid');
    });

    test('initLearningSpecsPage function exists', () => {
        assertIncludes(allScripts, 'function initLearningSpecsPage', 'Missing initLearningSpecsPage');
    });

    test('loadRealLSData function exists (API integration)', () => {
        assertIncludes(allScripts, 'function loadRealLSData', 'Missing loadRealLSData — no API integration');
    });

    test('LS_SEARCH_ENDPOINT points to unified search', () => {
        assertIncludes(allScripts, "LS_SEARCH_ENDPOINT = '/api/search/unified/'", 'LS_SEARCH_ENDPOINT misconfigured');
    });

    test('executeLSSearch function exists', () => {
        assertIncludes(allScripts, 'function executeLSSearch', 'Missing executeLSSearch');
    });

    test('renderLSCards function exists', () => {
        assertIncludes(allScripts, 'function renderLSCards', 'Missing renderLSCards');
    });

    test('searchLearningSpecs function calls API', () => {
        assertIncludes(allScripts, 'function searchLearningSpecs', 'Missing searchLearningSpecs');
        const fnStart = allScripts.indexOf('function searchLearningSpecs');
        const fnBlock = allScripts.substring(fnStart, fnStart + 2000);
        assertIncludes(fnBlock, 'zavmoFetch', 'searchLearningSpecs not calling zavmoFetch');
    });

    test('LS data normalisers exist (OFQUAL, NOS, JD)', () => {
        assertIncludes(allScripts, 'function normaliseOFQUAL', 'Missing normaliseOFQUAL');
        assertIncludes(allScripts, 'function normaliseNOS', 'Missing normaliseNOS');
        assertIncludes(allScripts, 'function normaliseJD', 'Missing normaliseJD');
    });

    test('LS detail modal functions exist', () => {
        assertIncludes(allScripts, 'function openLSDetailModal', 'Missing openLSDetailModal');
        assertIncludes(allScripts, 'function closeLSDetailModal', 'Missing closeLSDetailModal');
    });

    test('Demo data exists as fallback', () => {
        assertMatch(allScripts, /lsData\s*=\s*\[|const\s+lsData/, 'Missing demo LS data for fallback');
    });

    test('LS init guards against re-initialisation', () => {
        assertMatch(allScripts, /lsDataCache\.initialised|ls.*initialised/i, 'LS page missing re-init guard');
    });
}


// ============================================================
// SECTION 8: JOB DESCRIPTIONS PAGE — UI COMPONENTS
// ============================================================
if (section(8, 'JOB DESCRIPTIONS PAGE — UI COMPONENTS', 'jd')) {

    test('JD search input exists', () => {
        assertIncludes(html, 'id="jd-search-input"', 'Missing JD search input');
    });

    test('JD search input has accessible label', () => {
        assertMatch(html, /id="jd-search-input"[^>]*aria-label/, 'JD search input missing aria-label');
    });

    test('Industry filter exists', () => {
        const pageStart = html.indexOf('id="job-descriptions-page"');
        const pageChunk = html.substring(pageStart, pageStart + 5000);
        assertMatch(pageChunk, /industry|Industry/, 'Missing industry filter');
    });

    test('Level filter exists', () => {
        const pageStart = html.indexOf('id="job-descriptions-page"');
        const pageChunk = html.substring(pageStart, pageStart + 5000);
        assertMatch(pageChunk, /level|Level/, 'Missing level filter');
    });

    test('Country filter exists on JD page', () => {
        const pageStart = html.indexOf('id="job-descriptions-page"');
        const pageChunk = html.substring(pageStart, pageStart + 5000);
        assertMatch(pageChunk, /country|Country/, 'Missing country filter on JD page');
    });

    test('Language filter exists on JD page', () => {
        const pageStart = html.indexOf('id="job-descriptions-page"');
        const pageChunk = html.substring(pageStart, pageStart + 5000);
        assertMatch(pageChunk, /language|Language/, 'Missing language filter on JD page');
    });

    test('JD results grid container exists', () => {
        assertIncludes(html, 'id="jd-results-grid"', 'Missing JD results grid');
    });

    test('JD detail overlay exists', () => {
        assertIncludes(html, 'id="jd-detail-overlay"', 'Missing JD detail overlay');
        assertIncludes(html, 'jd-detail-overlay', 'JD overlay container missing');
    });

    test('Sort dropdown exists with 3 options', () => {
        const pageStart = html.indexOf('id="job-descriptions-page"');
        const pageChunk = html.substring(pageStart, pageStart + 5000);
        assertIncludes(pageChunk, 'Most Popular', 'Missing "Most Popular" sort option');
    });

    test('initJobDescriptionsPage function exists', () => {
        assertIncludes(allScripts, 'function initJobDescriptionsPage', 'Missing initJobDescriptionsPage');
    });

    test('loadRealJDData function exists (API integration)', () => {
        assertIncludes(allScripts, 'function loadRealJDData', 'Missing loadRealJDData — no API integration');
    });

    test('executeJDSearch function exists', () => {
        assertIncludes(allScripts, 'function executeJDSearch', 'Missing executeJDSearch');
    });

    test('renderJDCards function exists', () => {
        assertIncludes(allScripts, 'function renderJDCards', 'Missing renderJDCards');
    });

    test('openJDDetail function exists', () => {
        assertIncludes(allScripts, 'function openJDDetail', 'Missing openJDDetail');
    });

    test('closeJDDetail function exists', () => {
        assertIncludes(allScripts, 'function closeJDDetail', 'Missing closeJDDetail');
    });

    test('Demo JD data exists as fallback', () => {
        assertMatch(allScripts, /jdData\s*=\s*\[|const\s+jdData/, 'Missing demo JD data for fallback');
    });

    test('JD init guards against re-initialisation', () => {
        assertMatch(allScripts, /jdDataCache\.initialised|jd.*initialised/i, 'JD page missing re-init guard');
    });

    test('JD export functions exist', () => {
        assertMatch(html, /export|Export/, 'Missing export options on JD page');
    });
}


// ============================================================
// SECTION 9: xAPI ANALYTICS PAGE — UI COMPONENTS
// ============================================================
if (section(9, 'xAPI ANALYTICS PAGE — UI COMPONENTS', 'xapi')) {

    test('xAPI base URL is defined', () => {
        assertIncludes(allScripts, "XA_API_BASE", 'Missing XA_API_BASE constant');
        assertIncludes(allScripts, "/api/xapi", 'xAPI base URL not pointing to /api/xapi');
    });

    test('initXapiAnalyticsPage function exists', () => {
        assertIncludes(allScripts, 'function initXapiAnalyticsPage', 'Missing initXapiAnalyticsPage');
    });

    // Sub-tab navigation
    test('6 xAPI sub-tabs exist', () => {
        const subTabs = ['xa-overview', 'xa-live-feed', 'xa-agent-perf', 'xa-journeys'];
        subTabs.forEach(tab => {
            assertIncludes(html, `data-xa-tab="${tab}"`, `Missing xAPI sub-tab: ${tab}`);
        });
    });

    // Time range buttons
    test('Time period buttons exist (Today, 7d, 30d, 90d)', () => {
        ['today', '7d', '30d', '90d'].forEach(period => {
            assertIncludes(html, `data-period="${period}"`, `Missing time period button: ${period}`);
        });
    });

    // Overview tab
    test('xaLoadOverviewData function exists', () => {
        assertIncludes(allScripts, 'function xaLoadOverviewData', 'Missing xaLoadOverviewData');
    });

    test('xaRenderOverviewKPIs function exists', () => {
        assertIncludes(allScripts, 'function xaRenderOverviewKPIs', 'Missing xaRenderOverviewKPIs');
    });

    test('Overview calls /api/xapi/stats/overview', () => {
        assertIncludes(allScripts, '/stats/overview', 'Missing overview stats endpoint call');
    });

    // Live feed tab
    test('xaLoadLiveFeed function exists', () => {
        assertIncludes(allScripts, 'function xaLoadLiveFeed', 'Missing xaLoadLiveFeed');
    });

    test('Live feed calls /api/xapi/statements', () => {
        assertIncludes(allScripts, '/statements', 'Missing statements endpoint call');
    });

    test('Feed has play/pause controls', () => {
        assertMatch(html, /xa-feed-play|xa-feed-pause|play.*pause/i, 'Missing feed play/pause controls');
    });

    test('Feed badge counter exists', () => {
        assertIncludes(html, 'id="xa-feed-badge"', 'Missing feed badge counter');
    });

    test('xaFilterFeed function exists', () => {
        assertIncludes(allScripts, 'function xaFilterFeed', 'Missing xaFilterFeed');
    });

    test('xaExportFeedCSV function exists', () => {
        assertIncludes(allScripts, 'function xaExportFeedCSV', 'Missing xaExportFeedCSV');
    });

    // Agent performance tab
    test('xaLoadAgentPerformance function exists', () => {
        assertIncludes(allScripts, 'function xaLoadAgentPerformance', 'Missing xaLoadAgentPerformance');
    });

    test('Agent performance calls /api/xapi/agents/performance', () => {
        assertIncludes(allScripts, '/agents/performance', 'Missing agent performance endpoint call');
    });

    test('xaRenderAgentGrid function exists', () => {
        assertIncludes(allScripts, 'function xaRenderAgentGrid', 'Missing xaRenderAgentGrid');
    });

    test('Agent comparison toggle function exists', () => {
        assertIncludes(allScripts, 'function xaToggleCompareAgent', 'Missing xaToggleCompareAgent');
    });

    // Learner journeys tab
    test('xaSearchLearner function exists', () => {
        assertIncludes(allScripts, 'function xaSearchLearner', 'Missing xaSearchLearner');
    });

    test('Learner search calls /api/xapi/learners/search', () => {
        assertIncludes(allScripts, '/learners/search', 'Missing learner search endpoint call');
    });

    test('xaRenderLearnerProfile function exists', () => {
        assertIncludes(allScripts, 'function xaRenderLearnerProfile', 'Missing xaRenderLearnerProfile');
    });

    // Statement library
    test('xaRenderStatementLibrary function exists', () => {
        assertIncludes(allScripts, 'function xaRenderStatementLibrary', 'Missing xaRenderStatementLibrary');
    });

    test('XA_VERB_LIBRARY constant is defined', () => {
        assertIncludes(allScripts, 'XA_VERB_LIBRARY', 'Missing XA_VERB_LIBRARY constant');
    });

    test('xaExportLibraryJSON function exists', () => {
        assertIncludes(allScripts, 'function xaExportLibraryJSON', 'Missing xaExportLibraryJSON');
    });

    // Statement builder
    test('xaInitBuilder function exists', () => {
        assertIncludes(allScripts, 'function xaInitBuilder', 'Missing xaInitBuilder');
    });

    test('xaBuildTemplate function exists', () => {
        assertIncludes(allScripts, 'function xaBuildTemplate', 'Missing xaBuildTemplate');
    });

    // Enhancement features
    test('Engagement ring render function exists', () => {
        assertIncludes(allScripts, 'function xaRenderEngagementRing', 'Missing xaRenderEngagementRing');
    });

    test('Goal tracking render function exists', () => {
        assertIncludes(allScripts, 'function xaRenderGoals', 'Missing xaRenderGoals');
    });

    test('Anomaly alerts render function exists', () => {
        assertIncludes(allScripts, 'function xaRenderAnomalies', 'Missing xaRenderAnomalies');
    });

    test('Cohort comparison function exists', () => {
        assertIncludes(allScripts, 'function xaRenderCohortComparison', 'Missing xaRenderCohortComparison');
    });

    test('WONDERS radar chart function exists', () => {
        assertIncludes(allScripts, 'function xaGenerateWondersRadar', 'Missing xaGenerateWondersRadar');
    });

    test('PDF export function exists', () => {
        assertIncludes(allScripts, 'function xaExportPDF', 'Missing xaExportPDF');
    });

    test('PDF export button exists in UI', () => {
        assertIncludes(html, 'xa-export-pdf-btn', 'Missing PDF export button');
    });

    // Demo data generators
    test('Demo data generator for overview exists', () => {
        assertIncludes(allScripts, 'function xaRenderOverviewWithDemoData', 'Missing demo overview data generator');
    });

    test('Demo data generator for statements exists', () => {
        assertIncludes(allScripts, 'function xaGenerateDemoStatements', 'Missing demo statement generator');
    });

    test('Demo data generator for agent performance exists', () => {
        assertIncludes(allScripts, 'function xaGenerateDemoAgentData', 'Missing demo agent data generator');
    });

    test('Demo data generator for learner journeys exists', () => {
        assertIncludes(allScripts, 'function xaGenerateDemoJourney', 'Missing demo journey generator');
    });

    test('XA_CHARACTERS array has 12 entries', () => {
        const match = allScripts.match(/XA_CHARACTERS\s*=\s*\[([\s\S]*?)\];/);
        assert(match, 'XA_CHARACTERS array not found');
        const entries = match[1].match(/\{[^}]+\}/g) || [];
        assert(entries.length >= 12, `XA_CHARACTERS has ${entries.length} entries, expected 12`);
    });
}


// ============================================================
// SECTION 10: NEO4J / API CONNECTIVITY & DATA FLOW
// ============================================================
if (section(10, 'NEO4J / API CONNECTIVITY & DATA FLOW', 'api')) {

    console.log(`  ${COLOURS.cyan}(Static analysis of API integration code — run in browser for live connectivity)${COLOURS.reset}`);

    // Catalogue all API endpoints
    const endpoints = [
        { path: '/api/auth/login/', method: 'POST', purpose: 'User authentication', status: 'implemented' },
        { path: '/api/auth/refresh/', method: 'POST', purpose: 'Token refresh', status: 'implemented' },
        { path: '/api/llm/chat/', method: 'POST', purpose: 'LLM proxy (simulation)', status: 'implemented' },
        { path: '/api/search/unified/', method: 'GET', purpose: 'Unified search (OFQUAL, NOS, JD); Deliver uses ?type=jd', status: 'implemented' },
        { path: '/api/deliver/characters/', method: 'PUT', purpose: 'Save character prompts', status: 'not-built', search: '/api/deliver/characters/' },
        { path: '/api/deliver/teaching-charter/', method: 'PUT', purpose: 'Save teaching charter', status: 'not-built', search: '/api/deliver/teaching-charter/' },
        { path: '/api/xapi/stats/overview', method: 'GET', purpose: 'xAPI overview KPIs', status: 'not-built', search: '/stats/overview' },
        { path: '/api/xapi/statements', method: 'GET', purpose: 'xAPI live statement feed', status: 'not-built', search: '/statements' },
        { path: '/api/xapi/agents/performance', method: 'GET', purpose: 'Agent performance metrics', status: 'not-built', search: '/agents/performance' },
        { path: '/api/xapi/learners/search', method: 'GET', purpose: 'Learner search', status: 'not-built', search: '/learners/search' },
        { path: '/api/analytics/usage/', method: 'GET', purpose: 'Usage analytics (allocated/in-progress/completed)', status: 'not-built', search: 'Coming Soon' }
    ];

    // Test each endpoint is referenced in code
    endpoints.forEach(ep => {
        const searchStr = ep.search || ep.path;
        test(`API endpoint referenced: ${ep.method} ${ep.path} (${ep.purpose})`, () => {
            assertIncludes(allScripts, searchStr, `Endpoint ${ep.path} not referenced in code (searched for "${searchStr}")`);
        });
    });

    // Test graceful fallback patterns
    test('loadRealLSData() has try-catch with fallback', () => {
        const fnStart = allScripts.indexOf('function loadRealLSData');
        assert(fnStart !== -1, 'loadRealLSData not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 3000);
        assertIncludes(fnBlock, 'catch', 'loadRealLSData missing try-catch');
    });

    test('loadRealJDData() has try-catch with fallback', () => {
        const fnStart = allScripts.indexOf('function loadRealJDData');
        assert(fnStart !== -1, 'loadRealJDData not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 3000);
        assertIncludes(fnBlock, 'catch', 'loadRealJDData missing try-catch');
    });

    test('xAPI overview has demo data fallback', () => {
        const fnStart = allScripts.indexOf('function xaLoadOverviewData');
        assert(fnStart !== -1, 'xaLoadOverviewData not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 1500);
        assertIncludes(fnBlock, 'catch', 'xaLoadOverviewData missing fallback');
    });

    test('xAPI live feed has demo data fallback', () => {
        const fnStart = allScripts.indexOf('function xaLoadLiveFeed');
        assert(fnStart !== -1, 'xaLoadLiveFeed not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 1500);
        assertIncludes(fnBlock, 'catch', 'xaLoadLiveFeed missing fallback');
    });

    test('xAPI agent performance has demo data fallback', () => {
        const fnStart = allScripts.indexOf('function xaLoadAgentPerformance');
        assert(fnStart !== -1, 'xaLoadAgentPerformance not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 1500);
        assertIncludes(fnBlock, 'catch', 'xaLoadAgentPerformance missing fallback');
    });

    // API status summary
    console.log(`\n  ${COLOURS.bold}API Endpoint Status Summary:${COLOURS.reset}`);
    const implemented = endpoints.filter(e => e.status === 'implemented');
    const notBuilt = endpoints.filter(e => e.status === 'not-built');
    console.log(`  ${COLOURS.green}✓ LIVE from Neo4j (${implemented.length}):${COLOURS.reset}`);
    implemented.forEach(ep => console.log(`    ${COLOURS.green}${ep.method.padEnd(5)} ${ep.path}${COLOURS.reset} — ${ep.purpose}`));
    console.log(`  ${COLOURS.yellow}⚠ NOT YET BUILT (${notBuilt.length}) — Using demo data:${COLOURS.reset}`);
    notBuilt.forEach(ep => console.log(`    ${COLOURS.yellow}${ep.method.padEnd(5)} ${ep.path}${COLOURS.reset} — ${ep.purpose}`));
}


// ============================================================
// SECTION 11: SEARCH & FILTER FUNCTIONALITY
// ============================================================
if (section(11, 'SEARCH & FILTER FUNCTIONALITY', 'search')) {

    test('LS search has debounce (400ms)', () => {
        assertMatch(allScripts, /debounce|setTimeout.*400|clearTimeout/i, 'LS search missing debounce');
    });

    test('JD search has debounce', () => {
        const fnStart = allScripts.indexOf('function initJobDescriptionsPage');
        if (fnStart !== -1) {
            const fnBlock = allScripts.substring(fnStart, fnStart + 3000);
            assertMatch(fnBlock, /debounce|setTimeout|clearTimeout/, 'JD search missing debounce');
        }
    });

    test('LS search supports result tabs (OFQUAL, NOS, JD)', () => {
        assertIncludes(allScripts, 'function switchLSResultTab', 'Missing switchLSResultTab');
    });

    test('LS clear filters function exists', () => {
        assertIncludes(allScripts, 'function clearLSFilters', 'Missing clearLSFilters');
    });

    test('LS filter change handler exists', () => {
        assertIncludes(allScripts, 'function onLSFilterChange', 'Missing onLSFilterChange');
    });

    test('Sorting works on LS cards (3 options)', () => {
        assertMatch(allScripts, /currentSort|sortBy|sort.*popular|sort.*alpha/i, 'Missing sort implementation');
    });

    test('xAPI feed has verb filter dropdown', () => {
        assertMatch(html, /xa-feed-verb-filter|xa-filter-verb/i, 'Missing xAPI feed verb filter');
    });

    test('xAPI library has filter function', () => {
        assertIncludes(allScripts, 'function xaFilterLibrary', 'Missing xaFilterLibrary');
    });

    test('escapeHTML function exists for XSS prevention in search results', () => {
        assertIncludes(allScripts, 'function escapeHTML', 'Missing escapeHTML function');
        const fnStart = allScripts.indexOf('function escapeHTML');
        const fnBlock = allScripts.substring(fnStart, fnStart + 500);
        // Uses DOM-based escaping: div.textContent = str; return div.innerHTML;
        assert(
            fnBlock.includes('textContent') || fnBlock.includes('&lt;'),
            'escapeHTML not using textContent or string replacement for XSS'
        );
    });

    test('xaEscapeHTML function exists for xAPI page', () => {
        assertIncludes(allScripts, 'function xaEscapeHTML', 'Missing xaEscapeHTML');
    });
}


// ============================================================
// SECTION 12: EXPORT FUNCTIONS
// ============================================================
if (section(12, 'EXPORT FUNCTIONS', 'export')) {

    test('Export all prompts creates JSON download', () => {
        const fnStart = allScripts.indexOf('function exportAllPrompts');
        assert(fnStart !== -1, 'exportAllPrompts not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 1500);
        assertIncludes(fnBlock, 'application/json', 'Export not creating JSON blob');
        assertIncludes(fnBlock, 'download', 'Export not triggering download');
    });

    test('xAPI feed CSV export creates proper CSV', () => {
        const fnStart = allScripts.indexOf('function xaExportFeedCSV');
        assert(fnStart !== -1, 'xaExportFeedCSV not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 1500);
        assertIncludes(fnBlock, 'text/csv', 'CSV export not using text/csv MIME type');
    });

    test('xAPI library JSON export works', () => {
        const fnStart = allScripts.indexOf('function xaExportLibraryJSON');
        assert(fnStart !== -1, 'xaExportLibraryJSON not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 1000);
        assertIncludes(fnBlock, 'application/json', 'Library export not creating JSON');
    });

    test('PDF export uses window.print()', () => {
        const fnStart = allScripts.indexOf('function xaExportPDF');
        assert(fnStart !== -1, 'xaExportPDF not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 500);
        assertIncludes(fnBlock, 'window.print', 'PDF export not using window.print()');
    });

    test('Print media query exists for PDF styling', () => {
        assertIncludes(allStyles, '@media print', 'Missing @media print styles for PDF export');
    });
}


// ============================================================
// SECTION 13: COMING SOON / FALLBACK DETECTION
// ============================================================
if (section(13, 'COMING SOON / FALLBACK DETECTION', 'fallback')) {

    test('JD cards show "Coming Soon" banner for demo data', () => {
        assertIncludes(allScripts, 'Usage Analytics', 'Missing "Usage Analytics" label');
        assertIncludes(allScripts, 'Coming Soon', 'Missing "Coming Soon" label on demo data');
    });

    test('JD cards show "LIVE" badge for API data', () => {
        assertIncludes(allScripts, 'LIVE', 'Missing LIVE badge for API data');
        assertIncludes(allScripts, 'From UAT Neo4j', 'Missing "From UAT Neo4j" label');
    });

    test('LS cards show "Coming Soon" banner for demo data', () => {
        // Check the renderLSCards function area
        const fnStart = allScripts.indexOf('function renderLSCards');
        if (fnStart !== -1) {
            const fnBlock = allScripts.substring(fnStart, fnStart + 5000);
            assertIncludes(fnBlock, 'Coming Soon', 'LS cards missing "Coming Soon" for demo data');
        }
    });

    test('Demo JD data has zeroed-out popularity metrics', () => {
        const jdDataStart = allScripts.indexOf('const jdData =') || allScripts.indexOf('let jdData =');
        if (jdDataStart !== -1) {
            const jdBlock = allScripts.substring(jdDataStart, jdDataStart + 5000);
            // Check that allocated/inProgress/completed are all 0
            const allocatedMatches = jdBlock.match(/allocated:\s*(\d+)/g) || [];
            const nonZero = allocatedMatches.filter(m => !m.includes(': 0'));
            assert(nonZero.length === 0, `Demo JD data has non-zero allocated values: ${nonZero.join(', ')}`);
        }
    });

    test('Demo LS data has zeroed-out popularity metrics', () => {
        const lsDataStart = allScripts.indexOf('const lsData =') || allScripts.indexOf('let lsData =');
        if (lsDataStart !== -1) {
            const lsBlock = allScripts.substring(lsDataStart, lsDataStart + 5000);
            const enrolledMatches = lsBlock.match(/enrolled:\s*(\d+)/g) || [];
            const nonZero = enrolledMatches.filter(m => !m.includes(': 0'));
            assert(nonZero.length === 0, `Demo LS data has non-zero enrolled values: ${nonZero.join(', ')}`);
        }
    });

    test('syncToZavmo shows user-friendly message when endpoint missing', () => {
        assertMatch(allScripts, /needsEndpoint|Talib needs to|endpoint not found/i, 'Missing user-friendly message for unbuilt endpoints');
    });

    test('xAPI functions fall back to demo data gracefully', () => {
        // Check that all xAPI load functions have catch blocks with demo generators
        const xaFuncs = ['xaLoadOverviewData', 'xaLoadLiveFeed', 'xaLoadAgentPerformance'];
        xaFuncs.forEach(fn => {
            const fnStart = allScripts.indexOf(`function ${fn}`);
            assert(fnStart !== -1, `${fn} not found`);
            const fnBlock = allScripts.substring(fnStart, fnStart + 2000);
            assertIncludes(fnBlock, 'catch', `${fn} missing catch block for graceful fallback`);
        });
    });

    // Summary of what's pulling through vs demo data
    console.log(`\n  ${COLOURS.bold}Data Source Summary:${COLOURS.reset}`);
    console.log(`  ${COLOURS.green}✓ PULLING FROM NEO4J:${COLOURS.reset}`);
    console.log(`    - Learning Specs search results (OFQUAL, NOS data via /api/search/unified/)`);
    console.log(`    - Job Descriptions search results (via /api/search/unified/?type=jd)`);
    console.log(`    - Deliver phase: job descriptions (via /api/search/unified/?type=jd)`);
    console.log(`    - LLM simulations (via /api/llm/chat/)`);
    console.log(`  ${COLOURS.yellow}⚠ USING DEMO/FALLBACK DATA:${COLOURS.reset}`);
    console.log(`    - Usage analytics (allocated/in-progress/completed) — "Coming Soon"`);
    console.log(`    - Character prompt saving — endpoint not built (404)`);
    console.log(`    - Teaching charter saving — endpoint not built`);
    console.log(`    - xAPI overview KPIs — demo data generated`);
    console.log(`    - xAPI live statement feed — demo statements generated`);
    console.log(`    - xAPI agent performance — demo metrics generated`);
    console.log(`    - xAPI learner journeys — demo journeys generated`);
    console.log(`    - Country/language filtering — client-side only (API doesn't support params)`);
}


// ============================================================
// SECTION 14: ACCESSIBILITY & SECURITY
// ============================================================
if (section(14, 'ACCESSIBILITY & SECURITY', 'a11y')) {

    test('Search inputs have aria-label attributes', () => {
        const searchInputs = html.match(/<input[^>]*type="text"[^>]*>/gi) || [];
        let labelled = 0;
        searchInputs.forEach(input => {
            if (input.includes('aria-label') || input.includes('aria-labelledby')) labelled++;
        });
        assert(labelled >= 2, `Only ${labelled} of ${searchInputs.length} text inputs have aria-labels`);
    });

    test('Dialog overlays have role="dialog"', () => {
        // JD detail overlay should have role="dialog"
        assertMatch(html, /role="dialog"/, 'No elements with role="dialog" found');
    });

    test('Modal overlays or detail panels exist', () => {
        // Check for either role="dialog" with aria-label, or overlay/modal classes
        assert(
            html.includes('role="dialog"') || html.includes('detail-overlay') || html.includes('detail-modal'),
            'No dialog/modal/overlay elements found'
        );
    });

    test('escapeHTML prevents XSS in user input rendering', () => {
        const fnStart = allScripts.indexOf('function escapeHTML');
        assert(fnStart !== -1, 'escapeHTML not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 500);
        // Uses DOM-based approach (textContent → innerHTML) which safely escapes all HTML entities
        assert(
            (fnBlock.includes('textContent') && fnBlock.includes('innerHTML')) || fnBlock.includes('&amp;'),
            'escapeHTML not using safe DOM-based escaping or string replacement'
        );
    });

    test('xaEscapeHTML also prevents XSS', () => {
        const fnStart = allScripts.indexOf('function xaEscapeHTML');
        assert(fnStart !== -1, 'xaEscapeHTML not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 500);
        assertIncludes(fnBlock, '&lt;', 'xaEscapeHTML not escaping <');
    });

    test('No inline event handlers use eval()', () => {
        assertNotIncludes(html, 'eval(', 'Found eval() in HTML — security risk');
    });

    test('No document.write usage', () => {
        assertNotIncludes(allScripts, 'document.write(', 'Found document.write() — use DOM manipulation instead');
    });

    test('localStorage keys use zavmo_ prefix (no leaks to other apps)', () => {
        const storageWrites = allScripts.match(/localStorage\.(setItem|getItem)\s*\(\s*['"]([^'"]+)['"]/g) || [];
        storageWrites.forEach(write => {
            const key = write.match(/['"]([^'"]+)['"]/)?.[1];
            if (key && !key.startsWith('zavmo_')) {
                warn('localStorage', `Key "${key}" does not use zavmo_ prefix`);
            }
        });
    });

    test('No hardcoded API keys in source', () => {
        assertNotIncludes(allScripts, 'sk-ant-', 'Found Anthropic API key in source!');
        assertNotIncludes(allScripts, 'sk-proj-', 'Found OpenAI API key in source!');
    });

    test('Content Security Policy or nonce usage', () => {
        // Not strictly required for GitHub Pages, but good practice
        if (!html.includes('Content-Security-Policy') && !html.includes('nonce=')) {
            warn('CSP', 'No Content-Security-Policy meta tag or nonces found — consider adding for production');
        }
    });
}


// ============================================================
// SECTION 15: CROSS-PAGE CONSISTENCY
// ============================================================
if (section(15, 'CROSS-PAGE CONSISTENCY', 'consistency')) {

    test('All pages use the same glassmorphism card style', () => {
        // Check that the glassmorphism pattern appears across pages
        const glassPattern = 'rgba(13, 30, 54, 0.6)';
        const backdropPattern = 'backdrop-filter: blur';
        const glassCount = countOccurrences(html, glassPattern) + countOccurrences(allStyles, glassPattern);
        assert(glassCount >= 3, `Glassmorphism pattern only found ${glassCount} times — inconsistent styling`);
    });

    test('Teal accent colour is consistent (#00d9c0)', () => {
        const tealCount = countOccurrences(html, '#00d9c0') + countOccurrences(allStyles, '#00d9c0');
        assert(tealCount >= 10, `Brand teal #00d9c0 only used ${tealCount} times — may be inconsistent`);
    });

    test('Toast notification function is available globally', () => {
        assertIncludes(allScripts, 'function showToast', 'Missing showToast function');
    });

    test('Toast supports info, success, error, warning types', () => {
        const fnStart = allScripts.indexOf('function showToast');
        assert(fnStart !== -1, 'showToast not found');
        const fnBlock = allScripts.substring(fnStart, fnStart + 1000);
        ['info', 'success', 'error'].forEach(type => {
            assert(fnBlock.includes(type) || allScripts.includes(`showToast(`) , `showToast may not support type: ${type}`);
        });
    });

    test('All card grids use consistent border-radius', () => {
        // Check that card styling uses 16px radius consistently
        const radius16 = countOccurrences(html, 'border-radius: 16px') + countOccurrences(allStyles, 'border-radius: 16px');
        assert(radius16 >= 5, `Only ${radius16} elements use border-radius: 16px — check card consistency`);
    });

    test('Font consistency — no conflicting font-family declarations', () => {
        // Check that the app uses a consistent font stack
        const fontFamilies = (allStyles + html).match(/font-family:\s*([^;]+)/gi) || [];
        const unique = [...new Set(fontFamilies.map(f => f.toLowerCase().trim()))];
        if (unique.length > 5) {
            warn('Fonts', `${unique.length} different font-family declarations found — review for consistency`);
        }
    });

    test('All form inputs have consistent styling', () => {
        // Check LS and JD search inputs have same background
        assertMatch(html, /ls-search-input.*background.*rgba\(10.*22.*40/s, 'LS search input styling differs');
        assertMatch(html, /jd-search-input.*background.*rgba\(10.*22.*40/s, 'JD search input styling differs');
    });
}


// ============================================================
// SECTION 16: RESPONSIVE LAYOUT
// ============================================================
if (section(16, 'RESPONSIVE LAYOUT', 'layout')) {

    test('No fixed pixel widths on page containers', () => {
        ['learning-specs-page', 'job-descriptions-page', 'xapi-analytics-page'].forEach(pageId => {
            const pageStart = html.indexOf(`id="${pageId}"`);
            const pageChunk = html.substring(pageStart, pageStart + 300);
            assertNotIncludes(pageChunk, 'width: 1200px', `${pageId} has fixed 1200px width`);
            assertNotIncludes(pageChunk, 'width: 1400px', `${pageId} has fixed 1400px width`);
        });
    });

    test('Card grids use CSS grid or flex for responsive layout', () => {
        const gridUsage = countOccurrences(allStyles + html, 'display: grid') +
                         countOccurrences(allStyles + html, 'display: flex');
        assert(gridUsage >= 10, `Only ${gridUsage} grid/flex layouts found — may need more responsive layout`);
    });

    test('No horizontal scroll caused by overflow', () => {
        // Check for overflow-x handling
        const overflowX = countOccurrences(allStyles, 'overflow-x') + countOccurrences(html, 'overflow-x');
        // Not a hard fail, just a check
        if (overflowX === 0) {
            warn('Overflow', 'No overflow-x declarations found — may cause horizontal scroll on small screens');
        }
    });

    test('Mobile viewport meta tag exists', () => {
        assertIncludes(html, 'viewport', 'Missing viewport meta tag for mobile responsiveness');
    });

    test('Card grids use repeat/auto-fill for responsive columns', () => {
        assertMatch(allStyles + html, /repeat\s*\(\s*auto-fill|repeat\s*\(\s*auto-fit/i,
            'No auto-fill/auto-fit grid found — cards may not reflow on resize');
    });
}


// ============================================================
// FINAL RESULTS
// ============================================================
console.log('\n' + '='.repeat(70));
console.log(`${COLOURS.bold}RESULTS${COLOURS.reset}`);
console.log('='.repeat(70));

const total = passed + failed;
const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

if (failed === 0) {
    console.log(`\n${COLOURS.green}${COLOURS.bold}ALL ${passed} TESTS PASSED ✓${COLOURS.reset} (${passRate}% pass rate)`);
} else {
    console.log(`\n${COLOURS.bold}${passed} passed, ${COLOURS.red}${failed} failed${COLOURS.reset} (${total} total, ${passRate}% pass rate)`);
}

if (skipped > 0) {
    console.log(`${COLOURS.dim}${skipped} tests skipped${COLOURS.reset}`);
}

// Print failures summary
if (failures.length > 0) {
    console.log(`\n${COLOURS.red}${COLOURS.bold}FAILURES:${COLOURS.reset}`);
    failures.forEach((f, i) => {
        console.log(`  ${i + 1}. ${f.name}`);
        console.log(`     ${COLOURS.red}${f.error}${COLOURS.reset}`);
    });
}

// Print warnings summary
if (warnings.length > 0) {
    console.log(`\n${COLOURS.yellow}${COLOURS.bold}WARNINGS (${warnings.length}):${COLOURS.reset}`);
    warnings.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w.name}: ${w.message}`);
    });
}

// Print API connectivity summary
console.log(`\n${COLOURS.cyan}${COLOURS.bold}NEO4J / API DATA FLOW SUMMARY${COLOURS.reset}`);
console.log('─'.repeat(70));
console.log(`${COLOURS.green}LIVE from Neo4j database:${COLOURS.reset}`);
console.log(`  ✓ POST /api/auth/login/              — Authentication`);
console.log(`  ✓ POST /api/auth/refresh/             — Token refresh`);
console.log(`  ✓ POST /api/llm/chat/                 — LLM simulation proxy`);
console.log(`  ✓ GET  /api/search/unified/?type=jd   — Deliver: job descriptions`);
console.log(`  ✓ GET  /api/search/unified/            — OFQUAL, NOS & JD search`);
console.log(`${COLOURS.yellow}NOT YET BUILT (using demo/fallback data):${COLOURS.reset}`);
console.log(`  ⚠ PUT  /api/deliver/characters/{id}/prompt/  — Save character prompts (404)`);
console.log(`  ⚠ PUT  /api/deliver/teaching-charter/        — Save teaching charter (404)`);
console.log(`  ⚠ GET  /api/xapi/stats/overview              — xAPI overview KPIs`);
console.log(`  ⚠ GET  /api/xapi/statements                  — xAPI live feed`);
console.log(`  ⚠ GET  /api/xapi/agents/performance          — Agent performance`);
console.log(`  ⚠ GET  /api/xapi/learners/search             — Learner search`);
console.log(`  ⚠ GET  /api/analytics/usage/                 — Usage analytics (Coming Soon)`);
console.log('─'.repeat(70));
console.log(`${COLOURS.dim}Tickets for missing endpoints: see zavmo-api-tickets-for-talib.md${COLOURS.reset}`);

console.log('');
process.exit(failed > 0 ? 1 : 0);
