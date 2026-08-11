/**
 * Fin-Tracker — Calculation Functions
 *
 * Every function here is pure (no database calls, no side effects).
 * They take plain data and return a number or object.
 * Each has a one-line comment with the formula so you can explain it
 * in an interview without reading the code.
 */

// ──────────────────────────────────────────────
// Types — lightweight, no Prisma dependency here
// ──────────────────────────────────────────────

/** Minimal shape of a sale entry needed for calculations */
export interface SaleEntryForCalc {
  date: Date;
  quantitySold: number;
  revenueReceived: number;
  profit: number;
}

/** Minimal shape of a product needed for summary calculations */
export interface ProductForCalc {
  unitsManufactured: number;
}

/** Output of getProductSummary */
export interface ProductSummary {
  unitsSold: number;
  unitsRemaining: number;
  revenueGenerated: number;
  profitGenerated: number;
}

// ──────────────────────────────────────────────
// Calculation Functions
// ──────────────────────────────────────────────

/**
 * profit = revenue × (profitMarginPct / 100)
 * Example: ₹1000 revenue at 40% margin → ₹400 profit
 */
export function calculateProfit(
  revenue: number,
  profitMarginPct: number
): number {
  return revenue * (profitMarginPct / 100);
}

/**
 * Total revenue = sum of revenueReceived across all sale entries (all time)
 */
export function getTotalRevenueTillDate(
  saleEntries: SaleEntryForCalc[]
): number {
  return saleEntries.reduce((sum, entry) => sum + entry.revenueReceived, 0);
}

/**
 * Monthly sales = sum of revenueReceived where the entry's date falls
 * in the given calendar month and year.
 * month is 0-indexed (0 = January) to match JavaScript's Date.getMonth().
 */
export function getMonthlySales(
  saleEntries: SaleEntryForCalc[],
  month: number,
  year: number
): number {
  return saleEntries
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, e) => sum + e.revenueReceived, 0);
}

/**
 * Monthly profit = sum of stored profit where the entry's date falls
 * in the given calendar month and year.
 * month is 0-indexed (0 = January) to match JavaScript's Date.getMonth().
 */
export function getMonthlyProfit(
  saleEntries: SaleEntryForCalc[],
  month: number,
  year: number
): number {
  return saleEntries
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, e) => sum + e.profit, 0);
}

/**
 * Trailing profit = sum of stored profit for entries whose date is within
 * the last `months` calendar months from today.
 * If the business has fewer than `months` of data, this naturally returns
 * the sum of all available profit (which is the desired behaviour per spec).
 */
export function getTrailingProfit(
  saleEntries: SaleEntryForCalc[],
  months: number = 12,
  today: Date = new Date()
): number {
  // Calculate the cutoff date: go back `months` months from today
  const cutoff = new Date(today);
  cutoff.setMonth(cutoff.getMonth() - months);

  return saleEntries
    .filter((e) => new Date(e.date) >= cutoff)
    .reduce((sum, e) => sum + e.profit, 0);
}

/**
 * Simple valuation = trailing profit × multiplier
 * This is a placeholder methodology (not a DCF) — the multiplier is
 * editable so the owner can refine it later.
 */
export function getValuation(
  trailingProfit: number,
  multiplier: number
): number {
  return trailingProfit * multiplier;
}

/**
 * Per-product summary:
 *   unitsSold       = sum of quantitySold across the product's sale entries
 *   unitsRemaining  = unitsManufactured − unitsSold
 *   revenueGenerated = sum of revenueReceived
 *   profitGenerated  = sum of profit
 */
export function getProductSummary(
  product: ProductForCalc,
  saleEntries: SaleEntryForCalc[]
): ProductSummary {
  const unitsSold = saleEntries.reduce(
    (sum, e) => sum + e.quantitySold,
    0
  );

  return {
    unitsSold,
    unitsRemaining: product.unitsManufactured - unitsSold,
    revenueGenerated: saleEntries.reduce(
      (sum, e) => sum + e.revenueReceived,
      0
    ),
    profitGenerated: saleEntries.reduce((sum, e) => sum + e.profit, 0),
  };
}
