import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly inventoryItems: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*inventory\.html/);
    await expect(this.pageTitle).toHaveText('Products');
    await expect(this.inventoryItems).not.toHaveCount(0);
  }

  async addToCart(slug: string): Promise<void> {
    await this.page.locator(`[data-test="add-to-cart-${slug}"]`).click();
  }

  private itemByname(name: string): Locator {
    const escapedName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    return this.inventoryItems.filter({
    has: this.page.locator('[data-test="inventory_item_name"]',
       { hasText: new RegExp(`^${escapedName}$`) }), 
  });
}

  async addToCartByName(name: string): Promise<boolean> {
    const item = this.itemByname(name);
    if (await item.count() === 0) return false;
    await item.getByRole('button', { name: 'Add to cart' }).click();
    return true; 
  }
  async expectRemoveButtonVisible(slug: string): Promise<void> {
    await expect(this.page.locator(`[data-test="remove-${slug}"]`)).toBeVisible();
  }

  async expectCartCount(count: number): Promise<void> {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
