import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutInfoPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Your Information');
  }

  async fillForm(info: Partial<ShippingInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstNameInput.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastNameInput.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCodeInput.fill(info.postalCode);
  }

  async submit(): Promise<void> {
    await this.continueButton.click();
  }

  async expectErrorContains(text: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(text);
  }
}
