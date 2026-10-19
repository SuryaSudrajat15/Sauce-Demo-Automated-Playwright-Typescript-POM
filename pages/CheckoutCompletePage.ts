import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly completeImage: Locator;
  readonly backHomeButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.completeImage = page.locator('[data-test="pony-express"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-complete\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Complete!');
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
    await expect(this.completeText).toContainText('Your order has been dispatched');
    await expect(this.completeImage).toBeVisible();
    await expect(this.backHomeButton).toBeEnabled();
    await expect(this.cartBadge).toHaveCount(0);
  }

  async backToProducts(): Promise<void> {
    await this.backHomeButton.click();
  }
}
