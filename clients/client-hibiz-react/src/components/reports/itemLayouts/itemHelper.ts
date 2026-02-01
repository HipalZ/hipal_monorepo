export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-IN").format(num)
}

/**
 * Net Revenue = final item total (net amount + GST + service charge).
 * Use totalSales when available so Item/Category reports reconcile with Sales Total.
 * Fallback: amount (net) + tax for backwards compatibility.
 */
export const calculateNetRevenue = (
  amount: number,
  _discount: number,
  tax: number,
  totalSales?: number,
) => {
  if (typeof totalSales === "number" && !Number.isNaN(totalSales)) return totalSales;
  return amount + tax;
};

export const formatPercentage = (value: number, total: number) => {
  if (total === 0) return "0%"
  return `${((value / total) * 100).toFixed(1)}%`
}
