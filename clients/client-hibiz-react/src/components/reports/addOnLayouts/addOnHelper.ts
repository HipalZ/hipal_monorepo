export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-IN").format(num)
}

export const calculateAveragePrice = (amount: number, quantity: number) => {
  if (quantity === 0) return 0
  return amount / quantity
}

export const formatPercentage = (value: number, total: number) => {
  if (total === 0) return "0%"
  return `${((value / total) * 100).toFixed(1)}%`
}

export const getAddonIcon = (addonName: string) => {
  const name = addonName.toLowerCase()
  if (name.includes("sauce") || name.includes("chutney")) return "🥄"
  if (name.includes("drink") || name.includes("up") || name.includes("cola")) return "🥤"
  if (name.includes("fry") || name.includes("fried")) return "🍟"
  if (name.includes("cheese")) return "🧀"
  if (name.includes("spice") || name.includes("hot")) return "🌶️"
  if (name.includes("mango")) return "🥭"
  return "🍽️"
}
