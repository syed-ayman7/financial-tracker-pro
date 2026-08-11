/**
 * Fin-Tracker — Unit Tests for Calculation Functions
 *
 * Uses Node's built-in test runner (no Jest needed).
 * Run with: npx tsx --test src/lib/calculations.test.ts
 *
 * Every test uses hand-verifiable inputs so you can check the maths
 * on paper.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  calculateProfit,
  getTotalRevenueTillDate,
  getMonthlySales,
  getMonthlyProfit,
  getTrailingProfit,
  getValuation,
  getProductSummary,
  SaleEntryForCalc,
} from "./calculations";

// ── Helper: build a sale entry quickly ──────────────────────────────
function sale(
  date: string,
  quantitySold: number,
  revenueReceived: number,
  profit: number
): SaleEntryForCalc {
  return {
    date: new Date(date),
    quantitySold,
    revenueReceived,
    profit,
  };
}

// ====================================================================
// calculateProfit
// ====================================================================
describe("calculateProfit", () => {
  it("₹100 revenue at 50% margin → ₹50 profit", () => {
    assert.equal(calculateProfit(100, 50), 50);
  });

  it("₹1000 revenue at 40% margin → ₹400 profit", () => {
    assert.equal(calculateProfit(1000, 40), 400);
  });

  it("₹0 revenue at any margin → ₹0 profit", () => {
    assert.equal(calculateProfit(0, 75), 0);
  });

  it("₹500 revenue at 100% margin → ₹500 (all revenue is profit)", () => {
    assert.equal(calculateProfit(500, 100), 500);
  });

  it("₹200 revenue at 0% margin → ₹0 (no profit)", () => {
    assert.equal(calculateProfit(200, 0), 0);
  });
});

// ====================================================================
// getTotalRevenueTillDate
// ====================================================================
describe("getTotalRevenueTillDate", () => {
  it("3 sales of ₹100 each → ₹300 total revenue", () => {
    const entries = [
      sale("2024-01-01", 1, 100, 50),
      sale("2024-02-01", 1, 100, 50),
      sale("2024-03-01", 1, 100, 50),
    ];
    assert.equal(getTotalRevenueTillDate(entries), 300);
  });

  it("empty list → ₹0", () => {
    assert.equal(getTotalRevenueTillDate([]), 0);
  });

  it("single sale of ₹2500 → ₹2500", () => {
    assert.equal(
      getTotalRevenueTillDate([sale("2024-06-15", 5, 2500, 1000)]),
      2500
    );
  });
});

// ====================================================================
// getMonthlySales
// ====================================================================
describe("getMonthlySales", () => {
  const entries = [
    sale("2024-01-15", 1, 100, 50),
    sale("2024-01-20", 1, 200, 100),
    sale("2024-02-10", 1, 300, 150),
    sale("2024-03-05", 1, 400, 200),
  ];

  it("January 2024 has ₹100 + ₹200 = ₹300 in sales", () => {
    // month is 0-indexed: January = 0
    assert.equal(getMonthlySales(entries, 0, 2024), 300);
  });

  it("February 2024 has ₹300 in sales", () => {
    assert.equal(getMonthlySales(entries, 1, 2024), 300);
  });

  it("December 2024 (no entries) → ₹0", () => {
    assert.equal(getMonthlySales(entries, 11, 2024), 0);
  });
});

// ====================================================================
// getMonthlyProfit
// ====================================================================
describe("getMonthlyProfit", () => {
  // 3 sales of ₹100 at 50% margin = ₹50 profit each
  const entries = [
    sale("2024-06-01", 1, 100, 50),
    sale("2024-06-15", 1, 100, 50),
    sale("2024-06-30", 1, 100, 50),
  ];

  it("3 sales of ₹100 at 50% margin in June → ₹150 total profit", () => {
    assert.equal(getMonthlyProfit(entries, 5, 2024), 150); // June = 5
  });

  it("July (no entries) → ₹0", () => {
    assert.equal(getMonthlyProfit(entries, 6, 2024), 0);
  });
});

// ====================================================================
// getTrailingProfit
// ====================================================================
describe("getTrailingProfit", () => {
  it("entries within 12 months are included, older ones excluded", () => {
    const today = new Date("2024-07-01");
    const entries = [
      sale("2023-01-01", 1, 100, 50), // > 12 months ago → excluded
      sale("2023-08-01", 1, 100, 40), // within 12 months → included
      sale("2024-03-01", 1, 100, 60), // within 12 months → included
    ];
    // Only ₹40 + ₹60 = ₹100
    assert.equal(getTrailingProfit(entries, 12, today), 100);
  });

  it("all entries within trailing window → returns total profit", () => {
    const today = new Date("2024-07-01");
    const entries = [
      sale("2024-01-01", 1, 200, 80),
      sale("2024-04-01", 1, 300, 120),
    ];
    assert.equal(getTrailingProfit(entries, 12, today), 200);
  });

  it("empty list → ₹0", () => {
    assert.equal(getTrailingProfit([], 12, new Date()), 0);
  });
});

// ====================================================================
// getValuation
// ====================================================================
describe("getValuation", () => {
  it("₹100,000 trailing profit × 4 multiplier = ₹400,000 valuation", () => {
    assert.equal(getValuation(100000, 4), 400000);
  });

  it("₹0 trailing profit × any multiplier = ₹0", () => {
    assert.equal(getValuation(0, 10), 0);
  });

  it("₹50,000 profit × 6 multiplier = ₹300,000", () => {
    assert.equal(getValuation(50000, 6), 300000);
  });
});

// ====================================================================
// getProductSummary
// ====================================================================
describe("getProductSummary", () => {
  it("10 manufactured, 3 sold across 2 entries → 7 remaining", () => {
    const product = { unitsManufactured: 10 };
    const entries = [
      sale("2024-01-01", 1, 100, 50),
      sale("2024-02-01", 2, 200, 100),
    ];
    const summary = getProductSummary(product, entries);

    assert.equal(summary.unitsSold, 3);
    assert.equal(summary.unitsRemaining, 7);
    assert.equal(summary.revenueGenerated, 300);
    assert.equal(summary.profitGenerated, 150);
  });

  it("no sales → all units remaining, zero revenue/profit", () => {
    const product = { unitsManufactured: 50 };
    const summary = getProductSummary(product, []);

    assert.equal(summary.unitsSold, 0);
    assert.equal(summary.unitsRemaining, 50);
    assert.equal(summary.revenueGenerated, 0);
    assert.equal(summary.profitGenerated, 0);
  });

  it("all units sold → 0 remaining", () => {
    const product = { unitsManufactured: 5 };
    const entries = [sale("2024-03-01", 5, 500, 250)];
    const summary = getProductSummary(product, entries);

    assert.equal(summary.unitsSold, 5);
    assert.equal(summary.unitsRemaining, 0);
    assert.equal(summary.revenueGenerated, 500);
    assert.equal(summary.profitGenerated, 250);
  });
});
