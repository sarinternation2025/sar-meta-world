#!/bin/bash

echo "🚀 SAR Meta World - Production Build Success & Failure Report"
echo "============================================================"

cd /Users/sar-international/Desktop/meta-world/sar-meta-world/packages/react-app

echo ""
echo "📋 CURRENT BUILD ENVIRONMENT:"
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo "   Vite: $(npx vite --version)"
echo ""

# Test 1: Successful build
echo "✅ Testing successful production build..."
npm run build > /tmp/build-success.log 2>&1
if [ $? -eq 0 ]; then
    BUILD_SUCCESS=true
    BUILD_SUCCESS_TIME=$(date +%s)
    echo "   ✓ Build completed successfully"
    
    # Extract build metrics
    BUILD_SIZE=$(grep -o 'index-[^.]*\.js.*[0-9,]*\.[0-9]* kB' /tmp/build-success.log | awk '{print $2" "$3}')
    TOTAL_CHUNKS=$(grep -c 'dist/' /tmp/build-success.log)
    echo "   📦 Bundle size: $BUILD_SIZE"
    echo "   📄 Total files: $TOTAL_CHUNKS"
else
    BUILD_SUCCESS=false
    echo "   ❌ Build failed unexpectedly"
fi

# Test 2: Force a critical build failure
echo ""
echo "💥 Testing build failure scenario..."

# Create a backup of the original file
cp src/App.jsx src/App.jsx.backup

# Create a JSX syntax error that will definitely fail
cat > src/App.jsx << 'EOF'
import React from 'react'
import './App.css'

// CRITICAL ERROR: Malformed JSX and missing closing bracket
function App() {
  return (
    <div className="App">
      <h1>Test</h1>
      <div unclosed-tag-here
      // Missing closing bracket and broken JSX
    </div>
  )
// Missing closing bracket for function

export default App
EOF

npm run build > /tmp/build-failure.log 2>&1
if [ $? -eq 0 ]; then
    BUILD_FAIL_TEST=false
    echo "   ⚠️  Build unexpectedly succeeded (Vite is very tolerant)"
else
    BUILD_FAIL_TEST=true
    BUILD_FAIL_TIME=$(date +%s)
    echo "   ✓ Build failed as expected"
    
    # Extract error information
    ERROR_MSG=$(head -20 /tmp/build-failure.log | grep -i error | head -1)
    echo "   🐛 Error: $ERROR_MSG"
fi

# Restore the original file
mv src/App.jsx.backup src/App.jsx

# Test 3: Recovery build
echo ""
echo "🔄 Testing recovery build after fix..."
npm run build > /tmp/build-recovery.log 2>&1
if [ $? -eq 0 ]; then
    BUILD_RECOVERY=true
    BUILD_RECOVERY_TIME=$(date +%s)
    echo "   ✓ Recovery build successful"
else
    BUILD_RECOVERY=false
    echo "   ❌ Recovery build failed"
fi

# Generate comprehensive report
echo ""
echo "============================================================"
echo "📊 FINAL PRODUCTION BUILD REPORT"
echo "============================================================"

echo ""
echo "📈 BUILD TEST RESULTS:"
if [ "$BUILD_SUCCESS" = true ]; then
    echo "   ✅ Initial Build: SUCCESS"
else
    echo "   ❌ Initial Build: FAILED"
fi

if [ "$BUILD_FAIL_TEST" = true ]; then
    echo "   ✅ Failure Test: PASSED (Build failed as expected)"
else
    echo "   ⚠️  Failure Test: PARTIAL (Build was too tolerant)"
fi

if [ "$BUILD_RECOVERY" = true ]; then
    echo "   ✅ Recovery Build: SUCCESS"
else
    echo "   ❌ Recovery Build: FAILED"
fi

# Overall assessment
TOTAL_TESTS=3
PASSED_TESTS=0
[ "$BUILD_SUCCESS" = true ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ "$BUILD_FAIL_TEST" = true ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ "$BUILD_RECOVERY" = true ] && PASSED_TESTS=$((PASSED_TESTS + 1))

SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo ""
echo "📊 SUMMARY METRICS:"
echo "   Tests Passed: $PASSED_TESTS/$TOTAL_TESTS"
echo "   Success Rate: $SUCCESS_RATE%"
echo "   Bundle Size: ${BUILD_SIZE:-'N/A'}"

if [ "$BUILD_SUCCESS" = true ] && [ "$BUILD_RECOVERY" = true ]; then
    echo "   Build Status: 🟢 HEALTHY"
elif [ "$BUILD_SUCCESS" = true ] || [ "$BUILD_RECOVERY" = true ]; then
    echo "   Build Status: 🟡 PARTIAL"
else
    echo "   Build Status: 🔴 CRITICAL"
fi

echo ""
echo "📋 DETAILED LOGS:"
echo "   ✅ Success log: /tmp/build-success.log"
echo "   💥 Failure log: /tmp/build-failure.log"  
echo "   🔄 Recovery log: /tmp/build-recovery.log"

echo ""
echo "🎯 RECOMMENDATIONS:"
if [ "$SUCCESS_RATE" -eq 100 ]; then
    echo "   • Build system is robust and working correctly"
    echo "   • Production deployment ready"
elif [ "$SUCCESS_RATE" -ge 67 ]; then
    echo "   • Build system mostly functional"
    echo "   • Monitor build process during deployment"
else
    echo "   • Build system needs investigation"
    echo "   • Fix critical build issues before production"
fi

echo ""
echo "⚡ PERFORMANCE INSIGHTS:"
if [ -n "$BUILD_SIZE" ]; then
    SIZE_NUM=$(echo "$BUILD_SIZE" | grep -o '[0-9,]*\.[0-9]*' | tr -d ',')
    if (( $(echo "$SIZE_NUM > 1000" | bc -l 2>/dev/null || echo 0) )); then
        echo "   ⚠️  Large bundle size detected (${BUILD_SIZE})"
        echo "   💡 Consider code splitting and tree shaking"
    else
        echo "   ✅ Bundle size is reasonable (${BUILD_SIZE})"
    fi
fi

# Check dist directory
if [ -d "dist" ]; then
    DIST_FILES=$(find dist -type f | wc -l)
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    echo "   📁 Output files: $DIST_FILES"
    echo "   💾 Total dist size: $DIST_SIZE"
fi

echo ""
echo "============================================================"
echo "Report generated: $(date)"
echo "============================================================"
