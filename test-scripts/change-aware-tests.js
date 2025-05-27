const { SelfHealingTest, SelfHealingAPI } = require('./self-healing-framework');
const changeAnalysis = require('../test-results/change-analysis.json');
const { chromium } = require('playwright');

class ChangeAwareTestGenerator {
  constructor() {
    this.healingTest = new SelfHealingTest();
    this.apiTest = new SelfHealingAPI('http://localhost:8080');
  }

  async generateTests(changedFiles) {
    const tests = [];
    
    for (const [file, changes] of Object.entries(changedFiles)) {
      if (changes.functions) {
        for (const [funcName, changeType] of Object.entries(changes.functions)) {
          if (changeType === 'modified') {
            const test = await this.generateFunctionTest(file, funcName, changes.lines);
            tests.push(test);
          }
        }
      }
      
      // Visual tests for UI changes
      if (file.includes('Controller') && changes.lines.modified) {
        const visualTest = await this.generateVisualTest({
          component: file,
          targetLines: changes.lines.modified,
          focusArea: this.calculateUIImpactArea(changes)
        });
        tests.push(visualTest);
      }
      
      // API tests for endpoint changes
      if (file.includes('Controller') && changes.functions) {
        const apiTest = await this.generateAPITest({
          endpoint: this.deriveEndpoint(file, changes.functions),
          changedMethods: Object.keys(changes.functions)
        });
        tests.push(apiTest);
      }
    }
    
    return tests;
  }

  async generateFunctionTest(file, funcName, changedLines) {
    const controllerName = file.split('/').pop().replace('.java', '');
    
    return {
      name: `Test ${funcName} in ${controllerName}`,
      type: 'function',
      targetFunction: funcName,
      targetLines: changedLines,
      selectors: this.generateSelectors(funcName),
      testSteps: this.generateTestSteps(funcName)
    };
  }

  generateSelectors(funcName) {
    // Generate smart selectors based on function name
    const baseSelectors = {
      id: funcName.toLowerCase().replace(/([A-Z])/g, '-$1'),
      css: `.${funcName.toLowerCase()}-form`,
      text: funcName.replace(/([A-Z])/g, ' $1').trim(),
      aiHint: funcName
    };

    if (funcName.includes('save')) {
      return {
        ...baseSelectors,
        submitButton: { text: 'Save', css: 'button[type="submit"]', role: 'button' },
        successMessage: { text: 'saved successfully', partialText: 'success' }
      };
    } else if (funcName.includes('edit')) {
      return {
        ...baseSelectors,
        editButton: { text: 'Edit', css: '.edit-btn', role: 'button' },
        updateButton: { text: 'Update', css: 'button[type="submit"]' }
      };
    }
    
    return baseSelectors;
  }

  generateTestSteps(funcName) {
    const steps = [];
    
    if (funcName === 'saveRTIBirthApplication') {
      steps.push(
        { action: 'navigate', url: '/birth-certificate/apply' },
        { action: 'fill', selector: 'applicantName', value: 'Test User' },
        { action: 'fill', selector: 'birthDate', value: '2000-01-01' },
        { action: 'click', selector: 'submitButton' },
        { action: 'waitFor', selector: 'successMessage' },
        { action: 'verify', text: 'Application requested data saved successfully' }
      );
    } else if (funcName === 'editDeathRegistrationCertificate') {
      steps.push(
        { action: 'navigate', url: '/death-certificate/edit' },
        { action: 'setSession', key: 'rtiApplicationRefId', value: '12345' },
        { action: 'click', selector: 'editButton' },
        { action: 'verify', sessionAttribute: 'rtiApplicationRefId' }
      );
    } else if (funcName === 'saveDogLicenceCertificate') {
      steps.push(
        { action: 'navigate', url: '/dog-licence/apply' },
        { action: 'fill', selector: 'dogType', value: 'Labrador' },
        { action: 'fill', selector: 'amount', value: '100.50' },
        { action: 'fill', selector: 'dogTailLength', value: '30' },
        { action: 'click', selector: 'submitButton' },
        { action: 'verify', noError: true }
      );
    }
    
    return steps;
  }

  async generateVisualTest(config) {
    return {
      name: `Visual test for ${config.component}`,
      type: 'visual',
      component: config.component,
      targetLines: config.targetLines,
      screenshots: [
        { name: 'before-interaction', fullPage: false },
        { name: 'after-interaction', fullPage: false }
      ],
      focusArea: config.focusArea
    };
  }

  async generateAPITest(config) {
    return {
      name: `API test for ${config.endpoint}`,
      type: 'api',
      endpoint: config.endpoint,
      methods: ['POST'],
      testCases: [
        { name: 'valid-data', expectedStatus: 200 },
        { name: 'invalid-data', expectedStatus: 400 },
        { name: 'session-handling', expectedStatus: 200 }
      ],
      focusOn: config.changedMethods
    };
  }

  calculateUIImpactArea(changes) {
    // Calculate which UI areas are impacted by the changes
    const impactedAreas = [];
    
    if (changes.impact) {
      changes.impact.forEach(impact => {
        if (impact.includes('response message')) {
          impactedAreas.push('notification-area');
        } else if (impact.includes('session')) {
          impactedAreas.push('session-management');
        } else if (impact.includes('parsing')) {
          impactedAreas.push('form-validation');
        }
      });
    }
    
    return impactedAreas;
  }

  deriveEndpoint(file, functions) {
    const controllerName = file.split('/').pop()
      .replace('Controller.java', '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase();
    
    const functionName = Object.keys(functions)[0];
    
    if (functionName.includes('save')) {
      return `/${controllerName}/save`;
    } else if (functionName.includes('edit')) {
      return `/${controllerName}/edit`;
    }
    
    return `/${controllerName}`;
  }
}

module.exports = ChangeAwareTestGenerator;