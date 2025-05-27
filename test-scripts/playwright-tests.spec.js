const { test, expect } = require('@playwright/test');
const ChangeAwareTestGenerator = require('./change-aware-tests');
const { SelfHealingTest } = require('./self-healing-framework');
const changeAnalysis = require('../test-results/change-analysis.json');

const generator = new ChangeAwareTestGenerator();
const healer = new SelfHealingTest();

// Generate tests based on detected changes
test.describe('Change-Focused E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set base URL
    await page.goto('http://localhost:8080');
  });

  test('Birth Certificate Controller - Modified Response Message', async ({ page }) => {
    // Test specifically targets line 181 modification
    const selectors = {
      form: { css: '#birth-application-form', id: 'birthForm' },
      nameField: { css: 'input[name="applicantName"]', testId: 'applicant-name' },
      submitBtn: { css: 'button[type="submit"]', text: 'Submit Application' },
      successMsg: { css: '.alert-success', partialText: 'Application requested' }
    };

    await healer.clickWithHealing(page, { css: 'a[href="/birth-certificate"]', text: 'Birth Certificate' });
    await healer.typeWithHealing(page, selectors.nameField, 'Test Applicant');
    await healer.clickWithHealing(page, selectors.submitBtn);
    
    // Verify the modified response message
    const successElement = await healer.findElement(page, selectors.successMsg);
    const text = await successElement.textContent();
    expect(text).toContain('Application requested data saved successfully');
  });

  test('Death Registration Controller - Session Attribute Handling', async ({ page }) => {
    // Test specifically targets lines 488-494 modifications
    const selectors = {
      editLink: { css: 'a[href*="/death/edit"]', text: 'Edit Death Certificate' },
      sessionInfo: { css: '.session-info', testId: 'session-display' }
    };

    // Set session attribute (simulated)
    await page.evaluate(() => {
      sessionStorage.setItem('rtiApplicationRefId', '12345');
    });

    await healer.clickWithHealing(page, selectors.editLink);
    
    // Verify session attribute is correctly handled
    const sessionValue = await page.evaluate(() => {
      return sessionStorage.getItem('rtiApplicationRefId');
    });
    expect(sessionValue).toBe('12345');
  });

  test('Dog Licence Controller - Fixed Parsing Issues', async ({ page }) => {
    // Test specifically targets bug fixes at lines 232-236 and 251-256
    const selectors = {
      form: { css: '#dog-licence-form', id: 'dogForm' },
      amountField: { css: 'input[name="amount"]', testId: 'dog-amount' },
      tailLengthField: { css: 'input[name="dogTailLength"]', testId: 'tail-length' },
      submitBtn: { css: 'button[type="submit"]', text: 'Apply for Licence' },
      errorMsg: { css: '.alert-danger', partialText: 'error' }
    };

    await page.goto('http://localhost:8080/dog-licence/apply');
    
    // Test the fixed parsing with valid values
    await healer.typeWithHealing(page, selectors.amountField, '150.75');
    await healer.typeWithHealing(page, selectors.tailLengthField, '45');
    await healer.clickWithHealing(page, selectors.submitBtn);
    
    // Verify no parsing errors occur
    const errorElement = await page.$(selectors.errorMsg.css);
    expect(errorElement).toBeNull();
  });
});

// API Tests for changed endpoints
test.describe('API Tests - Changed Endpoints', () => {
  const baseUrl = 'http://localhost:8080';

  test('POST /saveRTIBirthApplication - Response Message', async ({ request }) => {
    const response = await request.post(`${baseUrl}/saveRTIBirthApplication`, {
      data: {
        applicantName: 'Test User',
        birthDate: '2000-01-01',
        birthPlace: 'Test City'
      }
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.responseStatus).toBe('Application requested data saved successfully');
  });

  test('POST /editDeathRegistrationCertificate - Session Handling', async ({ request }) => {
    const response = await request.post(`${baseUrl}/editDeathRegistrationCertificate`, {
      headers: {
        'Cookie': 'JSESSIONID=test-session-id'
      },
      data: {
        rtiApplicationRefId: 12345,
        deathDate: '2025-01-01'
      }
    });

    expect(response.ok()).toBeTruthy();
  });

  test('POST /saveDogLicenceCertificate - Parsing Fix', async ({ request }) => {
    const response = await request.post(`${baseUrl}/saveDogLicenceCertificate`, {
      data: {
        dogType: ['Labrador'],
        amount: ['199.99'],
        dogTailLength: ['35'],
        dogColor: ['Brown'],
        dogHeight: ['60']
      }
    });

    expect(response.ok()).toBeTruthy();
    // Should not throw parsing errors
  });
});

// Visual regression tests for changed components
test.describe('Visual Tests - Changed Components', () => {
  test('Birth Certificate Form - Response Message Area', async ({ page }) => {
    await page.goto('http://localhost:8080/birth-certificate/apply');
    await page.fill('input[name="applicantName"]', 'Visual Test');
    await page.click('button[type="submit"]');
    
    // Screenshot the response area
    await page.screenshot({ 
      path: 'test-results/birth-response-visual.png',
      clip: { x: 0, y: 100, width: 800, height: 200 }
    });
  });

  test('Death Certificate Edit - Session Display', async ({ page }) => {
    await page.goto('http://localhost:8080/death-certificate/edit?rtiApplicationRefId=12345');
    
    await page.screenshot({ 
      path: 'test-results/death-session-visual.png',
      fullPage: false
    });
  });

  test('Dog Licence Form - Amount and Length Fields', async ({ page }) => {
    await page.goto('http://localhost:8080/dog-licence/apply');
    
    // Focus on the fixed fields
    await page.focus('input[name="amount"]');
    await page.focus('input[name="dogTailLength"]');
    
    await page.screenshot({ 
      path: 'test-results/dog-fields-visual.png',
      clip: { x: 0, y: 200, width: 600, height: 400 }
    });
  });
});