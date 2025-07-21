export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-IN").format(num)
}

export const calculateDailyAverage = (amount: number, fromDate: string, toDate: string) => {
  try {
    const from = new Date(fromDate.split("-").reverse().join("-"))
    const to = new Date(toDate.split("-").reverse().join("-"))
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end dates

    if (diffDays === 0) return amount
    return amount / diffDays
  } catch (error) {
    console.error("Error calculating daily average:", error)
    return 0
  }
}

export const formatPercentage = (value: number, total: number) => {
  if (total === 0) return "0%"
  return `${((value / total) * 100).toFixed(1)}%`
}

export const getServiceChargeStatus = (amount: number) => {
  if (amount === 0) return { status: "No Charge", color: "gray" }
  if (amount < 1000) return { status: "Low", color: "yellow" }
  if (amount < 5000) return { status: "Medium", color: "blue" }
  return { status: "High", color: "green" }
}
