# Zavmo Coding Standards

All code contributed to Zavmo repositories must comply with these standards. Growth Engineering holds **ISO 27001** (Information Security) and **ISO 42001** (AI Management Systems) certifications. Every line of code is part of a certified system that handles real learners' educational data.

---

## JavaScript / Frontend Standards

### Null Safety
Every DOM element access must be guarded. The Prompt Studio is a single-page app where panels load dynamically — elements may not exist when a function runs.

```javascript
// Always do this
const el = document.getElementById('my-element');
if (el) {
    el.style.display = 'block';
}
```

### Async Error Handling
Every Promise needs error handling. Unhandled rejections fail silently and are nearly impossible to debug in production.

```javascript
// .then() chains need .catch()
fetch(url).then(handleSuccess).catch(handleError);

// await needs try/catch
try {
    const data = await fetch(url);
} catch (err) {
    showToast('Request failed: ' + (err.message || 'Unknown error'), 'error');
}
```

### API Response Validation
Third-party APIs (OpenAI, Anthropic) can return unexpected structures. Always validate before accessing nested properties.

```javascript
const data = await response.json();
if (!data.choices || !data.choices.length) {
    throw new Error('Unexpected API response structure');
}
```

### DOM Query Efficiency
Cache selector results. Never query the same selector twice in one function.

### No innerHTML for User Content
Use `textContent` for user-generated content to prevent XSS. If HTML is needed, sanitise first with DOMPurify or equivalent.

### Constants for Repeated Strings
localStorage keys, API endpoints, and magic strings should be constants. This prevents typos that cause subtle bugs.

---

## Python / Django Backend Standards

### PEP 8 + Type Hints
All Python follows PEP 8. All functions have type hints on parameters and return values.

### Serializer Validation
Never trust raw `request.data`. Always validate through DRF serializers for consistent error responses and input sanitisation.

### Standard API Response Format
Every Zavmo API endpoint returns:
- Success: `{"status": "success", "data": {...}}`
- Error: `{"status": "error", "message": "..."}`

Never return raw serializer data without the wrapper.

### Query Optimisation
Use `select_related()` for ForeignKey lookups and `prefetch_related()` for ManyToMany to prevent N+1 query problems.

### Audit Trail
Every write operation (prompt update, charter change, settings modification) must create a `PromptAuditLog` entry recording: who performed the action, what changed (old and new values), when, and from which system. This is a certification requirement.

---

## Security (ISO 27001)

### Never Commit Secrets
API keys, JWT secrets, database passwords — none of these may appear in source code. Use environment variables. The Prompt Studio access codes are stored as SHA-256 hashes, not plaintext.

### CORS Whitelist Only
Production must never use `CORS_ALLOW_ALL_ORIGINS = True`. Only whitelisted origins are permitted.

### Authenticate Everything
All API endpoints require JWT Bearer token authentication. No anonymous access to application data.

### localStorage Prefix
All localStorage keys must use the `zavmo_` prefix to avoid collisions and make audit easier.

---

## AI Governance (ISO 42001)

### Human-in-the-Loop
All system prompts are authored and approved by humans via the Prompt Configuration Studio. Agent 13 recommendations require explicit human approval. No autonomous prompt modification is permitted.

### Transparency
Learners must be informed they are interacting with AI. Character roles and teaching approaches must be documented. xAPI statements must accurately record interactions.

### Single Source of Truth
The Prompt Studio is the authoritative source for all character prompts. Never edit prompts directly in the Django Admin or database.

### Bias Testing
Character responses must be tested across diverse learner profiles using the LLM Evaluation Testing spreadsheet.

---

## Prompt Engineering

When writing or editing character system prompts:

- Start with a clear role definition
- Use uppercase section headers (CORE IDENTITY, TEACHING APPROACH, etc.)
- Keep total prompt length under 3,000 words per character
- Test every change using the Simulation page before pushing
- Run at least 3 different topic scenarios per character
- Document results in the LLM Evaluation Testing spreadsheet

---

## Testing

The Prompt Studio has **365 automated smoke tests** across 21 suites that run via a pre-commit hook and GitHub Actions. All tests must pass before merging:

```bash
node tests/smoke-test.js
```

For the Django backend, every endpoint needs at least 4 tests: success, 400 (bad input), 401 (auth failure), 404 (not found).

---

## British English

All user-facing text, comments, and documentation must use British English spelling (colour, organise, behaviour, centre, licence, defence, catalogue).
