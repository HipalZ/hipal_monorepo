export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-IN").format(num)
}

export const formatDiscountName = (discountName: string) => {
  // Convert camelCase to readable format
  const formatted = discountName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()

  // Handle specific cases
  const nameMap: Record<string, string> = {
    claimedCoins: "Claimed Coins",
    couponDiscount: "Coupon Discount",
    discount: "General Discount",
  }

  return nameMap[discountName] || formatted
}

export const getDiscountIcon = (discountName: string) => {
  const iconMap: Record<string, string> = {
    claimedCoins: "🪙",
    couponDiscount: "🎫",
    discount: "💰",
  }

  return iconMap[discountName] || "🏷️"
}

export const formatPercentage = (value: number, total: number) => {
  if (total === 0) return "0%"
  return `${((value / total) * 100).toFixed(1)}%`
}
