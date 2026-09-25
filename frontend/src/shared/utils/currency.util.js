/**
 * Universal Currency Formatter Utility
 * Guarantees exact 2 decimal places without integer rounding.
 *
 * @param {number|string} val - Currency amount
 * @param {string} curr - Currency code ('INR' | 'USD' | etc.)
 * @returns {string} Formatted currency string (e.g. "₹999.00", "$2.30")
 */
export const formatCurrency = (val, curr = 'INR') => {
  const num = Number(val) || 0;
  const targetCurrency = (curr || 'INR').toUpperCase();
  const localeMap = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
  };
  const targetLocale = localeMap[targetCurrency] || 'en-US';

  try {
    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch (e) {
    const sym = targetCurrency === 'INR' ? '₹' : targetCurrency === 'USD' ? '$' : `${targetCurrency} `;
    return `${sym}${num.toFixed(2)}`;
  }
};
