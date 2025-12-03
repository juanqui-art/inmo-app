#!/bin/bash

# Security Headers Testing Script
# Tests security headers in development and production environments

set -e

echo "🔒 Security Headers Testing Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
check_server() {
  local url=$1
  if curl -s --head "$url" > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Test specific header
test_header() {
  local url=$1
  local header_key=$2
  local expected_contains=$3

  local actual=$(curl -s -I "$url" | grep -i "^${header_key}:" | cut -d' ' -f2- | tr -d '\r')

  if [ -z "$actual" ]; then
    echo -e "${RED}✗${NC} ${header_key}: NOT FOUND"
    return 1
  elif [[ "$actual" == *"$expected_contains"* ]]; then
    echo -e "${GREEN}✓${NC} ${header_key}: $actual"
    return 0
  else
    echo -e "${YELLOW}⚠${NC} ${header_key}: $actual (expected to contain: $expected_contains)"
    return 1
  fi
}

# Test Development Headers
test_dev_headers() {
  local url="http://localhost:3000"

  echo "📍 Testing Development Headers ($url)"
  echo "----------------------------------------"

  if ! check_server "$url"; then
    echo -e "${RED}✗${NC} Development server is not running at $url"
    echo ""
    echo "Start the server with: bun run dev"
    exit 1
  fi

  echo ""
  echo "Base Headers:"
  test_header "$url" "X-Frame-Options" "DENY"
  test_header "$url" "X-Content-Type-Options" "nosniff"
  test_header "$url" "Referrer-Policy" "origin-when-cross-origin"

  echo ""
  echo "Development CSP (should be permissive):"
  test_header "$url" "Content-Security-Policy" "unsafe-eval"
  test_header "$url" "Content-Security-Policy" "unsafe-inline"
  test_header "$url" "Content-Security-Policy" "ws:"

  echo ""
  echo "HSTS (should NOT be present in dev):"
  if curl -s -I "$url" | grep -i "Strict-Transport-Security" > /dev/null; then
    echo -e "${RED}✗${NC} Strict-Transport-Security: PRESENT (should not be in dev)"
  else
    echo -e "${GREEN}✓${NC} Strict-Transport-Security: NOT PRESENT (correct for dev)"
  fi
}

# Test Production Headers
test_prod_headers() {
  local url=$1

  if [ -z "$url" ]; then
    echo "📍 Testing Production Headers (SKIPPED - no URL provided)"
    echo "-----------------------------------------------------------"
    echo ""
    echo "To test production headers, run:"
    echo "  ./scripts/test-security-headers.sh https://your-app.vercel.app"
    return
  fi

  echo ""
  echo ""
  echo "📍 Testing Production Headers ($url)"
  echo "----------------------------------------"

  if ! check_server "$url"; then
    echo -e "${RED}✗${NC} Production server is not accessible at $url"
    exit 1
  fi

  echo ""
  echo "Base Headers:"
  test_header "$url" "X-Frame-Options" "DENY"
  test_header "$url" "X-Content-Type-Options" "nosniff"
  test_header "$url" "Referrer-Policy" "origin-when-cross-origin"

  echo ""
  echo "Production CSP (should be strict):"
  test_header "$url" "Content-Security-Policy" "default-src 'self'"

  # Check that unsafe-eval is NOT present in production
  local csp=$(curl -s -I "$url" | grep -i "^Content-Security-Policy:" | cut -d' ' -f2- | tr -d '\r')
  if [[ "$csp" == *"unsafe-eval"* ]]; then
    echo -e "${RED}✗${NC} CSP contains 'unsafe-eval' (should not be in production)"
  else
    echo -e "${GREEN}✓${NC} CSP does not contain 'unsafe-eval' (correct for production)"
  fi

  echo ""
  echo "HSTS (should be present in production):"
  test_header "$url" "Strict-Transport-Security" "max-age"
}

# Run tests
echo ""
test_dev_headers
test_prod_headers "$1"

echo ""
echo "=================================="
echo "✅ Security Headers Test Complete"
echo ""
