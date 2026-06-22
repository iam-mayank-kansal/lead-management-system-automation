import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async navigate() {
    await this.page.goto('/login');
  }

  async login(email: string, pass: string) {
    await this.page.locator('#email').fill(email);
    await this.page.locator('#password').fill(pass);
    await this.page.locator('#login-btn').click();
    await expect(this.page).toHaveURL(/.*\/dashboard\/analytics/);
  }
}