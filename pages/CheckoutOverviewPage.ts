import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutOverviewPage extends BasePage {
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.paymentInfo = page.locator('[data-test="payment-info-value"]');
    this.shippingInfo = page.locator('[data-test="shipping-info-value"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Overview');
  }

  private parseMoney(text: string | null): number {
    const match = (text ?? '').match(/\$([\d.]+)/);
    if (!match) throw new Error(`Nominal tidak terbaca dari teks: "${text}"`);
    return parseFloat(match[1]);
  }

  async getSubtotal(): Promise<number> {
    return this.parseMoney(await this.subtotalLabel.textContent());
  }

  async getTax(): Promise<number> {
    return this.parseMoney(await this.taxLabel.textContent());
  }

  async getTotal(): Promise<number> {
    return this.parseMoney(await this.totalLabel.textContent());
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
