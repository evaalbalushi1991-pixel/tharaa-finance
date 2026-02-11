export const formatCurrency = (amount: number): string => {
  return amount.toFixed(1);
};

export const formatCurrencyWithSymbol = (amount: number): string => {
  return `${formatCurrency(amount)} ر.ع`;
};

export const parseCurrency = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.round(parsed * 10) / 10;
};
