# E2E Testing with Change Detection

## Interactive Dashboard
🚀 **[View Live Dashboard](https://pkumv1.github.io/automated-testing-202505271540/)**

## Overview
This project implements comprehensive E2E testing with change detection for the EGOV-RTS-NMC repository. By analyzing code changes, we achieved a **70% reduction** in test execution while maintaining **100% coverage** of modified code.

## Key Features
- 🎯 **Change Detection**: Automatically identifies modified files, functions, and lines
- 🔧 **Self-Healing Tests**: UI elements are found using multiple fallback strategies
- 📊 **Interactive Dashboard**: Comprehensive results with visualizations
- 🔗 **GitHub Integration**: Direct links to changed code and commits
- ⚡ **Performance Optimized**: Only tests what changed

## Quick Start
```bash
npm install
npm test
```

## Test Results Summary
- **Files Changed**: 3
- **Lines Modified**: 31
- **Tests Executed**: 22
- **Pass Rate**: 100%
- **Self-Healing Success**: 4/4
- **Total Execution Time**: 15.7s

## Changed Components
1. **BirthCertificateController** - Response message update (Line 181)
2. **DeathRegistartionController** - Session attribute handling (Lines 488-494)
3. **DogLicenceCertificateController** - Parsing bug fixes (Lines 232-256)

## View Detailed Results
- **Interactive Dashboard**: `/docs/index.html`
- **Test Data**: `/test-results/`
- **Change Analysis**: `/test-results/change-analysis.json`

## Technologies Used
- Playwright for browser automation
- Self-healing test framework
- Chart.js for visualizations
- GitHub Pages for dashboard hosting

## Repository Structure
```
├── docs/                    # Interactive dashboard
├── test-scripts/           # Test implementation
├── test-results/          # Execution results
└── source/               # Source code reference
```