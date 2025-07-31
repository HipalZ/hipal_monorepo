export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-IN").format(num);
};
