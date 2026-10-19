import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*cart\.html/);
    await expect(this.pageTitle).toHaveText('Your Cart');
  }

  async expectItems(names: string[]): Promise<void> {
    await expect(this.cartItems).toHaveCount(names.length);
    await expect(this.itemNames).toHaveText(names);
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
