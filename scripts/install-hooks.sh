#!/bin/sh
#
# Install Zavmo git hooks
# Run this after cloning: sh scripts/install-hooks.sh
#

HOOK_DIR="$(git rev-parse --show-toplevel)/.git/hooks"

cat > "$HOOK_DIR/pre-commit" << 'HOOK'
#!/bin/sh
echo ""
echo "=== Zavmo Pre-Commit Gate ==="
echo "Running smoke tests..."
echo ""

node tests/smoke-test.js
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "========================================="
    echo "  COMMIT BLOCKED — Tests failed!"
    echo "  Fix the failures above, then try again."
    echo "========================================="
    echo ""
    exit 1
fi

echo ""
echo "All tests passed — commit proceeding."
echo ""
exit 0
HOOK

chmod +x "$HOOK_DIR/pre-commit"
echo "Pre-commit hook installed successfully."
