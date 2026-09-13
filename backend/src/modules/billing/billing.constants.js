/**
 * Enterprise Subscription & Billing Constants
 * Volume Discount Matrix & Plan Rules
 */

export const FREE_PLAN_LIMITS = {
  POST_LIMIT: 5,
  PLAN_NAME: 'FREE',
};

export const PRO_SLIDER_LIMITS = {
  MIN_POSTS: 10,
  MAX_POSTS: 100,
  DEFAULT_POSTS: 15,
};

export const BASE_PRICES = {
  INR: 40, // Base ₹40 per post
  USD: 0.8, // Base $0.80 per post
};

/**
 * Calculates volume discounted total price and per-post rate
 * @param {number} postCount - Desired number of posts (10 to 100)
 * @param {string} currency - 'INR' or 'USD'
 */
export const calculatePlanPricing = (postCount, currency = 'INR') => {
  const count = Math.max(
    PRO_SLIDER_LIMITS.MIN_POSTS,
    Math.min(PRO_SLIDER_LIMITS.MAX_POSTS, Number(postCount) || PRO_SLIDER_LIMITS.DEFAULT_POSTS)
  );

  const isUsd = currency.toUpperCase() === 'USD';
  const basePricePerPost = isUsd ? BASE_PRICES.USD : BASE_PRICES.INR;

  let discountPercentage = 0;
  if (count >= 51) {
    discountPercentage = 0.3; // 30% discount for 51-100 posts
  } else if (count >= 21) {
    discountPercentage = 0.2; // 20% discount for 21-50 posts
  } else if (count >= 10) {
    discountPercentage = 0.1; // 10% discount for 10-20 posts
  }

  const rawTotal = count * basePricePerPost;
  const discountAmount = rawTotal * discountPercentage;
  const finalTotal = Math.round((rawTotal - discountAmount) * 100) / 100;
  const effectivePricePerPost = Math.round((finalTotal / count) * 100) / 100;

  return {
    postCount: count,
    currency: isUsd ? 'USD' : 'INR',
    currencySymbol: isUsd ? '$' : '₹',
    basePricePerPost,
    discountPercentage: Math.round(discountPercentage * 100),
    rawTotal,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalTotal,
    effectivePricePerPost,
  };
};
