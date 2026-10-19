import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected readonly pageTitle: Locator;

  constructor(protected readonly page: Page) {
    this.pageTitle = page.locator('[data-test="title"]');
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return (await this.pageTitle.textContent()) ?? '';
  }
}
