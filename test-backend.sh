#!/bin/bash

echo "=== Testing Backend Connectivity ==="
echo ""

# Test 1: Check if Apache is running on localhost
echo "Test 1: localhost:80"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost/HomeInventoryClaude/backend/public/api/auth/login 2>&1 | head -1

# Test 2: Try 127.0.0.1
echo "Test 2: 127.0.0.1:80"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://127.0.0.1/HomeInventoryClaude/backend/public/api/auth/login 2>&1 | head -1

# Test 3: Get Windows IP from WSL2
echo ""
echo "Possible Windows IPs from WSL2:"
cat /etc/resolv.conf | grep nameserver | awk '{print $2}'

echo ""
echo "Test 4: Testing with Windows IP..."
WIN_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://$WIN_IP/HomeInventoryClaude/backend/public/api/auth/login 2>&1 | head -1

echo ""
echo "If you see 'HTTP Status: 400', the backend is accessible!"
echo "Use that URL in frontend/src/app/services/api.service.ts"
