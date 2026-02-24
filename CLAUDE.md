# Zavmo Prompt Configuration Studio — Coding Standards

These standards apply to ALL code written for this project. Follow them without exception.

## Project Overview

Single-file HTML/CSS/JS application (~8200 lines) for configuring and testing Zavmo AI teaching character prompts. Deployed on GitHub Pages. Backend is Django REST Framework at uat.zavmo.co.uk:8000 with JWT authentication.

## ISO Compliance

This project must comply with **ISO 27001** (Information Security) and **ISO 42001** (AI Management Systems). All code changes must respect audit trail requirements, data classification, and the human-in-the-loop AI governance model.

## Critical Rules

### 1. Null Safety — ALWAYS check DOM elements before use
Every `document.getElementById()` or `document.querySelector()` call MUST be followed by a null check before accessing properties.

```javascript
// CORRECT
const el = document.getElementById('my-element');
if (el) {
    el.style.display = 'block';
}

// WRONG — will crash if element doesn't exist
const el = document.getElementById('my-element');
el.style.display = 'block';
```

### 2. Async Error Handling — ALWAYS handle Promise rejections
Every `.then()` must have a `.catch()`. Every `await` must be in a `try/catch`. No exceptions.

```javascript
// CORRECT
navigator.clipboard.writeText(text).then(() => {
    showToast('Copied!', 'success');
}).catch(() => {
    showToast('Copy failed', 'error');
});

// WRONG
navigator.clipboard.writeText(text).then(() => {
    showToast('Copied!', 'success');
});
```

### 3. API Response Validation — NEVER trust API response structure
Always check nested properties exist before accessing them.

```javascript
// CORRECT
const data = await response.json();
if (!data.choices || !data.choices.length) {
    throw new Error('No choices returned');
}
return data.choices[0].message.content;

// WRONG
return data.choices[0].message.content;
```

### 4. No Magic Strings — Use constants for repeated values
localStorage keys, API URLs, and repeated string identifiers should be constants.

### 5. No Duplicate DOM Queries — Cache selector results
Never call `querySelectorAll()` with the same selector twice in one function.

```javascript
// CORRECT
const buttons = document.querySelectorAll('.tab-btn');
buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) btn.classList.add('active');
});

// WRONG
document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
document.querySelectorAll('.tab-btn').forEach(b => { ... }); // queried twice!
```

### 6. Security
- **Never hardcode API keys, JWT tokens, or passwords** in source code
- Access codes must be stored as SHA-256 hashes, never plaintext
- Use `textContent` not `innerHTML` for user-generated content (XSS prevention)
- All localStorage keys must use the `zavmo_` prefix

### 7. Audit Trail
Every write operation to the Zavmo backend must create a PromptAuditLog entry recording who, what, when, and from where. This is an ISO 27001 and ISO 42001 requirement.

### 8. Human-in-the-Loop AI Governance
- All system prompts are authored and approved by humans via the Prompt Studio
- Agent 13 recommendations require explicit human approval before application
- No autonomous prompt modification without human review
- The Prompt Studio is the single source of truth for all character prompts

## API Contract

Zavmo API responses follow this format:
```json
{"status": "success", "data": {...}}
```

Push endpoints:
- `PUT /api/deliver/characters/{id}/prompt/` — body: `{system_prompt, teaching_charter, updated_from, updated_by}`
- `PUT /api/deliver/teaching-charter/` — body: `{content, updated_by, updated_from}`

Authentication: `Authorization: Bearer <JWT>`

## Character Mapping (Studio → Backend)

| Studio Key | Backend ID |
|---|---|
| foundation-builder | builder |
| challenge-coach | coach |
| career-navigator | navigator |
| pattern-connector | connector |
| systems-analyst | analyst |
| collaboration-guide | collaborator |
| evidence-evaluator | challenger |
| experiment-space | (not yet mapped) |
| practical-builder | (not yet mapped) |
| creative-catalyst | (not yet mapped) |
| qualification-certifier | (not yet mapped) |
| integrator | (not yet mapped) |

## Testing

Run the automated smoke tests before committing:
```bash
node tests/smoke-test.js
```

All 68 tests must pass. GitHub Actions runs these automatically on every push.

## Commit Messages

Use imperative mood, first line under 72 chars. Explain why, not what.

## British English

All user-facing text, comments, and documentation must use British English spelling (e.g. colour, organise, behaviour, centre).
