const { chromium } = require('playwright');

class SelfHealingTest {
  constructor() {
    this.selectorStrategies = [];
    this.healingAttempts = 0;
    this.maxRetries = 3;
  }

  async findElement(page, selectors) {
    const strategies = [
      // Tier 1: ID/data-testid
      async () => selectors.id && await page.$(`#${selectors.id}`),
      async () => selectors.testId && await page.$(`[data-testid="${selectors.testId}"]`),
      
      // Tier 2: CSS with context
      async () => selectors.css && await page.$(selectors.css),
      async () => selectors.contextCss && await page.$(`${selectors.context} ${selectors.css}`),
      
      // Tier 3: XPath relative
      async () => selectors.xpath && await page.$(`xpath=${selectors.xpath}`),
      
      // Tier 4: Text matching
      async () => selectors.text && await page.locator(`text="${selectors.text}"`).first(),
      async () => selectors.partialText && await page.locator(`text*="${selectors.partialText}"`).first(),
      
      // Tier 5: Visual pattern
      async () => selectors.ariaLabel && await page.$(`[aria-label*="${selectors.ariaLabel}"]`),
      async () => selectors.role && await page.locator(`[role="${selectors.role}"]`).first(),
      
      // Tier 6: AI detection fallback
      async () => this.aiDetection(page, selectors)
    ];

    for (const strategy of strategies) {
      try {
        const element = await strategy();
        if (element) {
          this.healingAttempts = 0;
          return element;
        }
      } catch (e) {
        // Continue to next strategy
      }
    }

    this.healingAttempts++;
    if (this.healingAttempts < this.maxRetries) {
      await page.waitForTimeout(1000);
      return this.findElement(page, selectors);
    }

    throw new Error(`Element not found after ${this.maxRetries} healing attempts`);
  }

  async aiDetection(page, selectors) {
    // Minimal AI fallback - find by similar attributes
    const candidates = await page.$$('*');
    for (const candidate of candidates) {
      const text = await candidate.textContent();
      if (text && selectors.aiHint && text.toLowerCase().includes(selectors.aiHint.toLowerCase())) {
        return candidate;
      }
    }
    return null;
  }

  async clickWithHealing(page, selectors) {
    const element = await this.findElement(page, selectors);
    await element.click();
    return true;
  }

  async typeWithHealing(page, selectors, text) {
    const element = await this.findElement(page, selectors);
    await element.fill(text);
    return true;
  }
}

class SelfHealingAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.retryCount = 3;
    this.endpointMappings = new Map();
  }

  async testEndpoint(config, changeLocations) {
    const tests = changeLocations.map(change => ({
      endpoint: change.endpoint,
      method: change.httpMethod || 'POST',
      focusOn: change.modifiedLogic,
      data: this.generateTestData(change)
    }));

    const results = [];
    for (const test of tests) {
      const result = await this.executeWithFallbacks(test);
      results.push(result);
    }
    return results;
  }

  async executeWithFallbacks(test) {
    let lastError;
    for (let i = 0; i < this.retryCount; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${test.endpoint}`, {
          method: test.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test.data)
        });
        return { success: true, status: response.status, endpoint: test.endpoint };
      } catch (error) {
        lastError = error;
        // Try alternative endpoints
        const altEndpoint = this.findAlternativeEndpoint(test.endpoint);
        if (altEndpoint) {
          test.endpoint = altEndpoint;
        }
      }
    }
    return { success: false, error: lastError, endpoint: test.endpoint };
  }

  findAlternativeEndpoint(endpoint) {
    // Map common endpoint variations
    const variations = [
      endpoint.replace(/\/v\d+/, '/v2'),
      endpoint.replace(/\/api/, '/rest'),
      endpoint.replace(/([A-Z])/g, '-$1').toLowerCase()
    ];
    return variations.find(v => v !== endpoint);
  }

  generateTestData(change) {
    // Generate test data based on the type of change
    const baseData = {
      timestamp: Date.now(),
      testId: `test-${change.function}-${Date.now()}`
    };

    if (change.function.includes('Birth')) {
      return { ...baseData, applicantName: 'Test User', birthDate: '2000-01-01' };
    } else if (change.function.includes('Death')) {
      return { ...baseData, rtiApplicationRefId: 12345, deathDate: '2025-01-01' };
    } else if (change.function.includes('Dog')) {
      return { ...baseData, dogType: 'Labrador', amount: '100.50', dogTailLength: '30' };
    }
    return baseData;
  }
}

module.exports = { SelfHealingTest, SelfHealingAPI };