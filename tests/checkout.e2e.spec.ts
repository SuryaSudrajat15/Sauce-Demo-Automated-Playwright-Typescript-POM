import { test, expect } from '../fixtures/pages';
import { USERS } from '../test-data/users';
import {
  PRODUCTS,
  SHIPPING_INFO,
  TAX_RATE,
  PAYMENT_INFO,
  SHIPPING_METHOD,
} from '../test-data/checkout';

test.describe('Sauce Demo - E2E checkout', () => {
  test('user bisa login, checkout 2 produk, dan melihat konfirmasi order', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    const { backpack, bikeLight } = PRODUCTS;
    const expectedSubtotal = +(backpack.price + bikeLight.price).toFixed(2);
    const expectedTax = +(expectedSubtotal * TAX_RATE).toFixed(2);
    const expectedTotal = +(expectedSubtotal + expectedTax).toFixed(2);

    await test.step('1. Login', async () => {
      await loginPage.open();
      await loginPage.login(USERS.standard.username, USERS.standard.password);
      await inventoryPage.expectLoaded();
    });

    await test.step('2. Tambah produk ke keranjang', async () => {
      await inventoryPage.addToCart(backpack.slug);
      await inventoryPage.expectRemoveButtonVisible(backpack.slug);
      await inventoryPage.expectCartCount(1);

      await inventoryPage.addToCart(bikeLight.slug);
      await inventoryPage.expectRemoveButtonVisible(bikeLight.slug);
      await inventoryPage.expectCartCount(2);
    });


    await test.step('3. Review keranjang', async () => {
      await inventoryPage.openCart();
      await cartPage.expectLoaded();
      await cartPage.expectItems([backpack.name, bikeLight.name]);
    });

    await test.step('4. Isi form shipping info', async () => {
      await cartPage.proceedToCheckout();
      await checkoutInfoPage.expectLoaded();
      await checkoutInfoPage.fillForm(SHIPPING_INFO);
      await expect(checkoutInfoPage.firstNameInput).toHaveValue(SHIPPING_INFO.firstName);
      await expect(checkoutInfoPage.lastNameInput).toHaveValue(SHIPPING_INFO.lastName);
      await expect(checkoutInfoPage.postalCodeInput).toHaveValue(SHIPPING_INFO.postalCode);
      await checkoutInfoPage.submit();
    });

    await test.step('5. Verifikasi overview: item, payment, shipping, harga', async () => {
      await checkoutOverviewPage.expectLoaded();
      await expect(checkoutOverviewPage.itemNames).toHaveText([backpack.name, bikeLight.name]);
      await expect(checkoutOverviewPage.itemPrices).toHaveText([
        `$${backpack.price}`,
        `$${bikeLight.price}`,
      ]);
      await expect(checkoutOverviewPage.paymentInfo).toHaveText(PAYMENT_INFO);
      await expect(checkoutOverviewPage.shippingInfo).toHaveText(SHIPPING_METHOD);

      expect(await checkoutOverviewPage.getSubtotal()).toBeCloseTo(expectedSubtotal, 2);
      expect(await checkoutOverviewPage.getTax()).toBeCloseTo(expectedTax, 2);
      expect(await checkoutOverviewPage.getTotal()).toBeCloseTo(expectedTotal, 2);
    });

    await test.step('6. Selesaikan pembayaran dan cek halaman konfirmasi', async () => {
      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectOrderComplete();
    });

    await test.step('7. Kembali ke produk, keranjang harus kosong', async () => {
      await checkoutCompletePage.backToProducts();
      await inventoryPage.expectLoaded();
      await expect(inventoryPage.cartBadge).toHaveCount(0);
    });
  });
});

test.describe('Sauce Demo - negative scenarios', () => {
  test('login gagal dengan kredensial salah', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(USERS.invalid.username, USERS.invalid.password);
    await loginPage.expectErrorContains('Username and password do not match');
  });

  test('login gagal untuk user yang terkunci', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);
    await loginPage.expectErrorContains('this user has been locked out');
  });

    test('form shipping menolak input kosong', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInfoPage,
  }) => {
    await loginPage.open();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.addToCart(PRODUCTS.backpack.slug);
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();

    await checkoutInfoPage.submit();
    await checkoutInfoPage.expectErrorContains('First Name is required');

    await checkoutInfoPage.fillForm({ firstName: 'Kitiii' });
    await checkoutInfoPage.submit();
    await checkoutInfoPage.expectErrorContains('Last Name is required');

    await checkoutInfoPage.fillForm({ lastName: 'Tester' });
    await checkoutInfoPage.submit();
    await checkoutInfoPage.expectErrorContains('Postal Code is required');
  });
});

test.describe('Sauce Demo - produk tidak valid diabaikan', () => {
  test('produk tidak valid diabaikan saat checkout', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    const productA = { name: 'Sauce Labs Backpack', slug: 'sauce-labs-backpack', price: 29.99 };
    const productB = { name: 'Invalid Product', slug: 'invalid-product', price: 99.99 };
    const wantToBuy = [productA, productB];
    
    const added: string[] = [];
    const skipped: string[] = [];

    await test.step('1. Login', async () => {
      await loginPage.open();
      await loginPage.login(USERS.standard.username, USERS.standard.password);
      await inventoryPage.expectLoaded();
    });

    await test.step('2. tambah produk ke keranjang, produk tidak valid diabaikan', async () => {
      for (const product of wantToBuy) {
        const addedSuccessfully = await inventoryPage.addToCartByName(product.name);
        if (addedSuccessfully) {
          added.push(product.name);
        } else {
          skipped.push(product.name);
        }
      }
      await inventoryPage.expectCartCount(added.length);
    });

    await test.step('3. Review keranjang, produk tidak valid diabaikan', async () => {
      await inventoryPage.openCart();
      await cartPage.expectLoaded();
      await cartPage.expectItems(added);
    });

    await test.step('4. Isi form shipping info', async () => {
      await cartPage.proceedToCheckout();
      await checkoutInfoPage.expectLoaded();
      await checkoutInfoPage.fillForm(SHIPPING_INFO);
      await checkoutInfoPage.submit();
    });

    await test.step('5. Verifikasi overview: item, payment, shipping, harga', async () => {
      await checkoutOverviewPage.expectLoaded();
      await expect(checkoutOverviewPage.itemNames).toHaveText(added);
    });

    await test.step('6. Selesaikan pembayaran dan cek halaman konfirmasi', async () => {
      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectOrderComplete();
    });
  });
});