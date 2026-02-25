## Summary

<!-- Brief description of what this PR does and why -->

## Changes

<!-- List the key changes made -->

---

## Coding Standards Checklist

Please confirm each item before requesting review. See [CODING-STANDARDS.md](../CODING-STANDARDS.md) for full details.

### Security (ISO 27001)
- [ ] No secrets, API keys, or passwords in the code
- [ ] No `CORS_ALLOW_ALL_ORIGINS = True`
- [ ] All API calls use JWT Bearer token authentication
- [ ] All localStorage keys use the `zavmo_` prefix

### Code Quality
- [ ] All DOM access is null-safe (guarded with `if` checks)
- [ ] All async code has error handling (`try/catch` or `.catch()`)
- [ ] API responses are validated before accessing nested properties
- [ ] No `innerHTML` with user-generated content (use `textContent` or sanitise)
- [ ] Repeated strings are constants

### AI Governance (ISO 42001)
- [ ] System prompts are authored/approved by humans only
- [ ] No autonomous prompt modification
- [ ] AI interactions are transparent to learners
- [ ] Audit trail entries created for all write operations

### Testing
- [ ] All 365+ smoke tests pass (`node tests/smoke-test.js`)
- [ ] New features include new test coverage
- [ ] Django endpoints have success, 400, 401, and 404 tests (if applicable)

### General
- [ ] British English used throughout
- [ ] Code has been tested in the Prompt Studio before submitting

---

## Test Results

<!-- Paste test output here -->
```
node tests/smoke-test.js
```
