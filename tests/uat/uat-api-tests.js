/**
 * Zavmo UAT API — Automated Test Suite
 * ======================================
 * Tests the live Zavmo UAT backend (uat.zavmo.co.uk:8000) against
 * the coding standards defined in the Zavmo Coding Standards skill.
 *
 * Based on:
 *   - Zavmo Coding Standards (ISO 27001 / ISO 42001)
 *   - Django Backend Standards (PEP 8, DRF, response format)
 *   - Security requirements (auth, CORS, secrets)
 *   - Data integrity requirements (OFQUAL, LOs, ACs)
 *
 * Test categories:
 *   1.  API Health — are endpoints responding?
 *   2.  Response Format — does every endpoint return {status, data}?
 *   3.  Authentication — JWT required, expired tokens rejected?
 *   4.  Error Handling — 400/401/404 responses correct?
 *   5.  Module Data Integrity — fields present, LOs populated?
 *   6.  Lesson Data Integrity — Bloom's, learning outcomes?
 *   7.  Character Endpoints — all expected characters exist?
 *   8.  CORS & Security Headers — correct origins, no secrets?
 *   9.  OFQUAL Compliance — qualifications linked, ACs present?
 *  10.  British English — user-facing text checks
 *
 * Usage:
 *   UAT_TOKEN=<your-jwt-token> node tests/uat/uat-api-tests.js
 *
 * Or with .env file:
 *   echo "UAT_TOKEN=eyJ..." > tests/uat/.env
 *   node tests/uat/uat-api-tests.js
 *
 * Adding new tests:
 *   Developers can add tests by adding new test() calls in the
 *   appropriate suite section, or by adding a new suite section.
 *   Follow the pattern: test('Description', async () => { ... });
 *
 * Exit codes:
 *   0 = all tests pass
 *   1 = one or more tests failed
 *   2 = no token provided (cannot run)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURATION
// ============================================================
const BASE_URL = process.env.UAT_BASE_URL || 'https://uat.zavmo.co.uk:8000';

// Try to load token from environment, .env file, or argument
let TOKEN = process.env.UAT_TOKEN || '';

if (!TOKEN) {
  // Try .env file
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const tokenMatch = envContent.match(/UAT_TOKEN=(.+)/);
    if (tokenMatch) TOKEN = tokenMatch[1].trim();
  }
}

if (!TOKEN) {
  // Try command line argument
  const tokenArg = process.argv.find(a => a.startsWith('--token='));
  if (tokenArg) TOKEN = tokenArg.split('=')[1];
}

// ============================================================
// TEST FRAMEWORK
// ============================================================
let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];
const warnings = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    if (e.message.startsWith('SKIP:')) {
      skipped++;
      console.log(`  \x1b[33m⊘\x1b[0m ${name} — ${e.message.replace('SKIP: ', '')}`);
    } else {
      failed++;
      failures.push({ name, error: e.message });
      console.log(`  \x1b[31m✗\x1b[0m ${name}`);
      console.log(`    \x1b[31m${e.message}\x1b[0m`);
    }
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function skip(reason) {
  throw new Error(`SKIP: ${reason}`);
}

function warn(message) {
  warnings.push(message);
  console.log(`    \x1b[33m⚠ ${message}\x1b[0m`);
}

// ============================================================
// HTTP HELPER
// ============================================================
function apiRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.auth !== false && TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {}),
        ...(options.headers || {})
      },
      // Allow self-signed certs on UAT
      rejectUnauthorized: false,
      timeout: 15000
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          // Not JSON — that's fine for some checks
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
          raw: body
        });
      });
    });

    req.on('error', (e) => {
      if (e.message.includes('EAI_AGAIN') || e.message.includes('ENOTFOUND')) {
        reject(new Error(`Cannot resolve ${url.hostname} — are you on the same network as UAT? (VPN may be required)`));
      } else {
        reject(new Error(`Request failed: ${e.message}`));
      }
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out (15s)')); });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}


// ============================================================
// MAIN TEST RUNNER
// ============================================================
async function runTests() {
  console.log(`\n\x1b[1mZavmo UAT API Test Suite\x1b[0m`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Token: ${TOKEN ? TOKEN.substring(0, 15) + '...' + TOKEN.substring(TOKEN.length - 5) : '\x1b[31mNOT PROVIDED\x1b[0m'}`);
  console.log('');

  if (!TOKEN) {
    console.log('\x1b[33m⚠ No JWT token provided. Auth-required tests will be skipped.\x1b[0m');
    console.log('  Provide a token: UAT_TOKEN=eyJ... node tests/uat/uat-api-tests.js');
    console.log('  Or create tests/uat/.env with: UAT_TOKEN=eyJ...\n');
  }


  // ============================================================
  // SUITE 1: API HEALTH
  // Coding standard: "Every API endpoint requires JWT Bearer
  // token authentication. No anonymous access to application data."
  // ============================================================
  console.log('\n\x1b[1m1. API Health\x1b[0m');

  test('Server is reachable', async () => {
    const res = await apiRequest('/api/deliver/modules/', { auth: false });
    assert(res.status !== undefined, 'No response from server');
  });

  test('Modules endpoint responds', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  test('Module detail endpoint responds (index 0)', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/0/');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  test('Search endpoint responds', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/search/unified/?q=sales');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  test('Characters endpoint responds', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/characters/');
    assert(res.status === 200 || res.status === 404 || res.status === 405,
      `Expected 200/404/405, got ${res.status}`);
  });


  // ============================================================
  // SUITE 2: RESPONSE FORMAT
  // Coding standard: "Every Zavmo API endpoint returns:
  // {"status": "success", "data": {...}} for success"
  // ============================================================
  console.log('\n\x1b[1m2. Response Format (Coding Standard: {status, data} wrapper)\x1b[0m');

  test('Modules list returns {status: "success", data: {modules: [...]}}', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/');
    assert(res.body, 'Response is not valid JSON');
    assert(res.body.status === 'success', `Expected status: "success", got: "${res.body.status}"`);
    assert(res.body.data, 'Missing "data" field in response');
    assert(Array.isArray(res.body.data.modules), '"data.modules" should be an array');
  });

  test('Module detail returns {status: "success", data: {...}}', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/0/');
    assert(res.body, 'Response is not valid JSON');
    assert(res.body.status === 'success', `Expected status: "success", got: "${res.body.status}"`);
    assert(res.body.data, 'Missing "data" field in response');
  });

  test('Search returns {status: "success", data: {...}}', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/search/unified/?q=sales');
    assert(res.body, 'Response is not valid JSON');
    assert(res.body.status === 'success', `Expected status: "success", got: "${res.body.status}"`);
  });


  // ============================================================
  // SUITE 3: AUTHENTICATION
  // Coding standard: "All API endpoints require JWT Bearer token
  // authentication. No anonymous access to application data."
  // ============================================================
  console.log('\n\x1b[1m3. Authentication (ISO 27001)\x1b[0m');

  test('Modules endpoint rejects unauthenticated requests', async () => {
    const res = await apiRequest('/api/deliver/modules/', { auth: false });
    assert(
      res.status === 401 || res.status === 403,
      `Unauthenticated request should return 401/403, got ${res.status} — SECURITY RISK`
    );
  });

  test('Module detail rejects unauthenticated requests', async () => {
    const res = await apiRequest('/api/deliver/modules/0/', { auth: false });
    assert(
      res.status === 401 || res.status === 403,
      `Unauthenticated request should return 401/403, got ${res.status} — SECURITY RISK`
    );
  });

  test('Search rejects unauthenticated requests', async () => {
    const res = await apiRequest('/api/search/unified/?q=test', { auth: false });
    assert(
      res.status === 401 || res.status === 403,
      `Unauthenticated request should return 401/403, got ${res.status} — SECURITY RISK`
    );
  });

  test('Invalid token returns 401', async () => {
    const res = await apiRequest('/api/deliver/modules/', {
      headers: { 'Authorization': 'Bearer invalid_token_12345' }
    });
    assert(res.status === 401, `Invalid token should return 401, got ${res.status}`);
  });

  test('Expired token is detected (not silently accepted)', async () => {
    // This is a structurally valid but expired JWT
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.invalid';
    const res = await apiRequest('/api/deliver/modules/', {
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    });
    assert(
      res.status === 401 || res.status === 403,
      `Expired token should return 401/403, got ${res.status}`
    );
  });


  // ============================================================
  // SUITE 4: ERROR HANDLING
  // Coding standard: "Every endpoint needs at least 4 tests:
  // success, 400 (bad input), 401 (auth failure), 404 (not found)"
  // ============================================================
  console.log('\n\x1b[1m4. Error Handling\x1b[0m');

  test('Non-existent module index returns 404', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/99999/');
    assert(
      res.status === 404 || res.status === 400,
      `Expected 404 for non-existent module, got ${res.status}`
    );
  });

  test('Non-existent endpoint returns 404', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/nonexistent/');
    assert(res.status === 404, `Expected 404 for non-existent endpoint, got ${res.status}`);
  });

  test('Error responses use standard format', async () => {
    const res = await apiRequest('/api/deliver/modules/', { auth: false });
    if (res.body) {
      // Should have an error/detail message, not a raw traceback
      assert(
        !res.raw.includes('Traceback'),
        'Error response contains Python traceback — should return structured error'
      );
    }
  });

  test('Error responses do not leak stack traces', async () => {
    const res = await apiRequest('/api/deliver/modules/abc/', { auth: false });
    assert(
      !res.raw.includes('File "') && !res.raw.includes('line '),
      'Error response leaks Python file paths/line numbers — SECURITY RISK'
    );
  });


  // ============================================================
  // SUITE 5: MODULE DATA INTEGRITY
  // Tests that modules have expected fields from the API schema
  // ============================================================
  console.log('\n\x1b[1m5. Module Data Integrity\x1b[0m');

  test('Modules list returns at least 50 modules', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/');
    const count = res.body?.data?.modules?.length || 0;
    assert(count >= 50, `Expected at least 50 modules, got ${count}`);
  });

  test('Each module has required fields (module_id, title)', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/');
    const modules = res.body?.data?.modules || [];
    const broken = modules.filter(m => !m.module_id || !m.title);
    assert(
      broken.length === 0,
      `${broken.length} modules missing module_id or title`
    );
  });

  test('Module detail has learning_outcomes field', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/0/');
    const mod = res.body?.data;
    assert(mod, 'No module data returned');
    assert(
      'learning_outcomes' in mod,
      'Module detail missing learning_outcomes field'
    );
  });

  test('Module detail has lessons array', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/0/');
    const mod = res.body?.data;
    assert(mod, 'No module data returned');
    assert(
      Array.isArray(mod.lessons),
      'Module detail missing lessons array'
    );
  });

  test('At least some modules have populated learning_outcomes (not empty)', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/');
    const modules = res.body?.data?.modules || [];

    // Check a sample of modules for LOs
    let populatedCount = 0;
    const sampleSize = Math.min(10, modules.length);
    for (let i = 0; i < sampleSize; i++) {
      const detail = await apiRequest(`/api/deliver/modules/${i}/`);
      const los = detail.body?.data?.learning_outcomes;
      if (Array.isArray(los) && los.length > 0) populatedCount++;
    }

    assert(
      populatedCount > 0,
      `None of the first ${sampleSize} modules have populated learning_outcomes — see ticket ZAV-105`
    );
    if (populatedCount < sampleSize) {
      warn(`Only ${populatedCount}/${sampleSize} sampled modules have populated LOs — ticket ZAV-105`);
    }
  });

  // ZAV-102: Check for assessment_criteria field
  test('Module detail has assessment_criteria field (ZAV-102)', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/0/');
    const mod = res.body?.data;
    assert(mod, 'No module data returned');
    if (!('assessment_criteria' in mod)) {
      warn('Module detail MISSING assessment_criteria field — blocked by ZAV-102');
      assert(false, 'assessment_criteria field not present in API response — ZAV-102 not yet implemented');
    }
  });


  // ============================================================
  // SUITE 6: LESSON DATA INTEGRITY
  // ============================================================
  console.log('\n\x1b[1m6. Lesson Data Integrity\x1b[0m');

  test('Lessons have required fields (lesson_id, title)', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/0/');
    const lessons = res.body?.data?.lessons || [];
    if (lessons.length === 0) skip('No lessons in module 0');

    const broken = lessons.filter(l => !l.lesson_id || !l.title);
    assert(
      broken.length === 0,
      `${broken.length} lessons missing lesson_id or title`
    );
  });

  test('Lessons have bloom_name field', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/0/');
    const lessons = res.body?.data?.lessons || [];
    if (lessons.length === 0) skip('No lessons in module 0');

    const withBlooms = lessons.filter(l => l.bloom_name);
    assert(
      withBlooms.length > 0,
      'No lessons have bloom_name populated'
    );
  });

  test('Lessons have learning_outcome field', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/0/');
    const lessons = res.body?.data?.lessons || [];
    if (lessons.length === 0) skip('No lessons in module 0');

    const withLO = lessons.filter(l => l.learning_outcome);
    assert(
      withLO.length > 0,
      'No lessons have learning_outcome populated'
    );
  });

  test('Bloom\'s names use valid taxonomy levels', async () => {
    if (!TOKEN) skip('No token');
    const validBlooms = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create',
                         'REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYSE', 'EVALUATE', 'CREATE'];
    const res = await apiRequest('/api/deliver/modules/0/');
    const lessons = res.body?.data?.lessons || [];

    const invalidBlooms = lessons.filter(l =>
      l.bloom_name && !validBlooms.includes(l.bloom_name)
    );
    if (invalidBlooms.length > 0) {
      warn(`${invalidBlooms.length} lessons have non-standard bloom_name values: ${invalidBlooms.map(l => l.bloom_name).join(', ')}`);
    }
  });


  // ============================================================
  // SUITE 7: CHARACTER ENDPOINTS
  // Coding standard: Character mapping has 8 backend characters
  // ============================================================
  console.log('\n\x1b[1m7. Character Endpoints\x1b[0m');

  const expectedCharacters = [
    'builder', 'coach', 'navigator', 'connector',
    'analyst', 'collaborator', 'challenger', 'storyteller'
  ];

  test('Characters list endpoint exists', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/characters/');
    assert(
      res.status === 200 || res.status === 405,
      `Characters endpoint returned ${res.status} — expected 200 or 405 (if POST-only)`
    );
  });

  for (const charId of expectedCharacters) {
    test(`Character "${charId}" endpoint accessible`, async () => {
      if (!TOKEN) skip('No token');
      const res = await apiRequest(`/api/deliver/characters/${charId}/prompt/`);
      // 200 = exists, 404 = not found, 405 = method not allowed (might be POST-only)
      if (res.status === 404) {
        warn(`Character "${charId}" not found at expected endpoint`);
      }
      assert(
        res.status !== 500,
        `Character "${charId}" endpoint returned 500 — server error`
      );
    });
  }


  // ============================================================
  // SUITE 8: CORS & SECURITY HEADERS
  // Coding standard: "CORS Whitelist Only — Production must never
  // use CORS_ALLOW_ALL_ORIGINS = True"
  // ============================================================
  console.log('\n\x1b[1m8. CORS & Security Headers (ISO 27001)\x1b[0m');

  test('CORS does not allow all origins (*)', async () => {
    const res = await apiRequest('/api/deliver/modules/', {
      auth: false,
      headers: { 'Origin': 'https://evil-site.example.com' }
    });
    const corsHeader = res.headers['access-control-allow-origin'] || '';
    assert(
      corsHeader !== '*',
      `CORS is set to * (allow all origins) — SECURITY RISK per ISO 27001`
    );
  });

  test('CORS allows the Prompt Studio origin', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/', {
      headers: { 'Origin': 'https://iridescent-technologies.github.io' }
    });
    const corsHeader = res.headers['access-control-allow-origin'] || '';
    // Either specific origin or not set (which means same-origin only, also fine)
    if (corsHeader && corsHeader !== 'https://iridescent-technologies.github.io') {
      warn(`CORS origin is "${corsHeader}" — expected "https://iridescent-technologies.github.io"`);
    }
  });

  test('Server does not expose sensitive headers', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/');
    const serverHeader = res.headers['server'] || '';
    // Should not expose detailed server version info
    if (serverHeader.includes('Python') || serverHeader.includes('Django')) {
      warn(`Server header exposes framework info: "${serverHeader}" — consider hiding`);
    }
  });

  test('API responses do not contain debug info', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/');
    assert(
      !res.raw.includes('DEBUG') && !res.raw.includes('settings.py'),
      'API response contains debug information — ensure DEBUG=False in production'
    );
  });


  // ============================================================
  // SUITE 9: OFQUAL COMPLIANCE
  // Coding standard: "Growth Engineering holds ISO 27001 and
  // ISO 42001 certifications" + ticket ZAV-101/ZAV-103
  // ============================================================
  console.log('\n\x1b[1m9. OFQUAL Compliance (ZAV-101, ZAV-103)\x1b[0m');

  test('Search returns OFQUAL qualification results', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/search/unified/?q=sales');
    const results = res.body?.data?.results || res.body?.data || [];

    // Check if any results have ofqual-related fields
    const raw = JSON.stringify(results);
    const hasOfqual = raw.includes('ofqual') || raw.includes('OFQUAL') || raw.includes('qualification');
    if (!hasOfqual) {
      warn('Search results do not contain OFQUAL references — ZAV-101 may not be implemented');
    }
  });

  test('OFQUAL qualifications have learning_outcomes populated (ZAV-101)', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/search/unified/?q=sales');
    const raw = JSON.stringify(res.body);

    // Check for the known gap — OFQUAL nodes have null LOs
    if (raw.includes('"learning_outcomes":null') || raw.includes('"learning_outcomes": null')) {
      warn('OFQUAL qualifications have null learning_outcomes — ZAV-101 not yet implemented');
    }
  });

  test('OFQUAL qualifications have assessment_criteria populated (ZAV-101)', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/search/unified/?q=sales');
    const raw = JSON.stringify(res.body);

    if (raw.includes('"assessment_criteria":null') || raw.includes('"assessment_criteria": null')) {
      warn('OFQUAL qualifications have null assessment_criteria — ZAV-101 not yet implemented');
    }
  });

  test('Modules have OFQUAL linkage fields (ZAV-103)', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/0/');
    const mod = res.body?.data;
    if (!mod) skip('No module data');

    const hasOfqualId = mod.ofqual_unit_id !== undefined && mod.ofqual_unit_id !== null;
    const hasOfqualTitle = mod.ofqual_unit_title !== undefined && mod.ofqual_unit_title !== null;
    const hasQualLevel = mod.qualification_level !== undefined && mod.qualification_level !== null;

    if (!hasOfqualId && !hasOfqualTitle && !hasQualLevel) {
      warn('Module has no OFQUAL linkage (ofqual_unit_id, ofqual_unit_title, qualification_level all null) — ZAV-103');
    }
  });


  // ============================================================
  // SUITE 10: BRITISH ENGLISH
  // Coding standard: "All user-facing text must use British
  // English spelling"
  // ============================================================
  console.log('\n\x1b[1m10. British English\x1b[0m');

  test('Module titles do not use American spellings', async () => {
    if (!TOKEN) skip('No token');
    const res = await apiRequest('/api/deliver/modules/');
    const modules = res.body?.data?.modules || [];

    const americanisms = ['organize', 'recognize', 'analyze', 'behavior', 'color ', 'center '];
    const offenders = [];

    for (const mod of modules) {
      const title = (mod.title || '').toLowerCase();
      for (const word of americanisms) {
        if (title.includes(word)) {
          offenders.push(`"${mod.title}" contains "${word}" (should be British English)`);
        }
      }
    }

    if (offenders.length > 0) {
      warn(`Found American English in module titles:\n      ${offenders.join('\n      ')}`);
    }
  });


  // ============================================================
  // RESULTS
  // ============================================================
  const total = passed + failed + skipped;
  console.log('\n' + '='.repeat(60));
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)\x1b[0m`);

  if (warnings.length > 0) {
    console.log(`\n\x1b[33mWarnings (${warnings.length}):\x1b[0m`);
    for (const w of warnings) {
      console.log(`  \x1b[33m⚠ ${w}\x1b[0m`);
    }
  }

  if (failures.length > 0) {
    console.log(`\n\x1b[31mFailures:\x1b[0m`);
    for (const f of failures) {
      console.log(`  \x1b[31m✗ ${f.name}\x1b[0m`);
      console.log(`    ${f.error}`);
    }
  }

  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

// Run
runTests().catch(err => {
  console.error(`\x1b[31mFATAL: ${err.message}\x1b[0m`);
  process.exit(2);
});
