export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-IN").format(num)
}

export const calculateNetRevenue = (amount: number, discount: number, tax: number) => {
  return amount - discount + tax
}

export const formatPercentage = (value: number, total: number) => {
  if (total === 0) return "0%"
  return `${((value / total) * 100).toFixed(1)}%`
}
