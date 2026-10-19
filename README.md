# Sauce Demo - Playwright + TypeScript (POM)

## Setup
npm install
npx playwright install

## Run
npm test                # semua test, headless
npm run test:headed     # lihat browser
npm run test:ui         # UI mode
npm run report          # buka HTML report

## Struktur
pages/       Page Object per halaman (Login, Inventory, Cart, CheckoutInfo, CheckoutOverview, CheckoutComplete)
fixtures/    Fixture yang meng-inject semua page object ke test
test-data/   Data user, produk, shipping info
tests/       Spec E2E + negative scenario
