import { prisma } from '../../config/database.js';
import {
  BILLING_CURRENCIES,
  BILLING_PLANS,
  PAYMENT_GATEWAYS,
  SUBSCRIPTION_STATUSES,
  TRANSACTION_STATUSES,
} from './billing.constants.js';

/**
 * Aggregate executive financial overview & revenue metrics
 *
 * @returns {Promise<Object>} Executive financial metrics
 */
export const getFinancialOverview = async () => {
  // 1. Total revenue from completed transactions
  const totalRevenueResult = await prisma.billingTransaction.aggregate({
    where: { status: TRANSACTION_STATUSES.COMPLETED },
    _sum: { pricePaid: true },
    _count: { id: true },
  });

  const totalRevenue = totalRevenueResult._sum.pricePaid || 0;
  const totalCompletedTransactions = totalRevenueResult._count.id || 0;

  // 2. Active, Expired, and Total Subscriptions
  const [activeSubsCount, expiredSubsCount, totalUsersCount] = await Promise.all([
    prisma.subscription.count({ where: { status: SUBSCRIPTION_STATUSES.ACTIVE } }),
    prisma.subscription.count({ where: { status: SUBSCRIPTION_STATUSES.EXPIRED } }),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  // 3. Payment Gateway Breakdown (grouped by Gateway AND Currency)
  const gatewayGroup = await prisma.billingTransaction.groupBy({
    by: ['paymentGateway', 'currency'],
    where: { status: TRANSACTION_STATUSES.COMPLETED },
    _sum: { pricePaid: true },
    _count: { id: true },
  });

  const gatewayBreakdown = gatewayGroup.map((g) => ({
    gateway: g.paymentGateway || PAYMENT_GATEWAYS.FREE,
    currency: (g.currency || BILLING_CURRENCIES.INR).toUpperCase(),
    revenue: g._sum.pricePaid || 0,
    count: g._count.id || 0,
  }));

  // 3b. Currency Breakdown (INR vs USD)
  const currencyGroup = await prisma.billingTransaction.groupBy({
    by: ['currency'],
    where: { status: TRANSACTION_STATUSES.COMPLETED },
    _sum: { pricePaid: true },
    _count: { id: true },
  });

  const currencyBreakdown = currencyGroup.map((c) => ({
    currency: (c.currency || BILLING_CURRENCIES.INR).toUpperCase(),
    revenue: c._sum.pricePaid || 0,
    count: c._count.id || 0,
  }));

  // 4. Plan Type Breakdown (grouped by Plan AND Currency)
  const planGroup = await prisma.subscription.groupBy({
    by: ['plan', 'currency'],
    _count: { id: true },
    _sum: { pricePaid: true },
  });

  const planBreakdown = planGroup.map((p) => ({
    plan: p.plan,
    currency: (p.currency || BILLING_CURRENCIES.INR).toUpperCase(),
    userCount: p._count.id || 0,
    totalRevenue: p._sum.pricePaid || 0,
  }));

  // 5. Monthly Revenue Trends (Past 12 Months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const recentTransactions = await prisma.billingTransaction.findMany({
    where: {
      status: TRANSACTION_STATUSES.COMPLETED,
      createdAt: { gte: twelveMonthsAgo },
    },
    select: {
      pricePaid: true,
      currency: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group transactions by YYYY-MM
  const monthlyMap = {};
  recentTransactions.forEach((tx) => {
    const monthKey = `${tx.createdAt.getFullYear()}-${String(tx.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = 0;
    }
    monthlyMap[monthKey] += tx.pricePaid;
  });

  const monthlyRevenueTrends = Object.entries(monthlyMap).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  // 6. MRR & ARR Calculations (Separated strictly by Currency)
  const activePaidSubs = await prisma.subscription.findMany({
    where: {
      status: SUBSCRIPTION_STATUSES.ACTIVE,
      pricePaid: { gt: 0 },
    },
    select: { pricePaid: true, currency: true },
  });

  let mrrINR = 0;
  let mrrUSD = 0;

  activePaidSubs.forEach((sub) => {
    const c = (sub.currency || BILLING_CURRENCIES.INR).toUpperCase();
    if (c === BILLING_CURRENCIES.USD) {
      mrrUSD += sub.pricePaid || 0;
    } else {
      mrrINR += sub.pricePaid || 0;
    }
  });

  const arrINR = mrrINR * 12;
  const arrUSD = mrrUSD * 12;

  const paidUsersCount = activePaidSubs.length;

  return {
    totalRevenue,
    totalCompletedTransactions,
    activeSubsCount,
    expiredSubsCount,
    totalUsersCount,
    paidUsersCount,
    mrrINR,
    mrrUSD,
    arrINR,
    arrUSD,
    gatewayBreakdown,
    currencyBreakdown,
    planBreakdown,
    monthlyRevenueTrends,
  };
};

/**
 * Get paginated billing transactions with search & filter
 *
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const getPaginatedTransactions = async ({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  paymentGateway = '',
  currency = '',
  plan = '',
  startDate = '',
  endDate = '',
}) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (paymentGateway) {
    where.paymentGateway = paymentGateway;
  }

  if (currency) {
    where.currency = currency;
  }

  if (plan) {
    where.plan = plan;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (search) {
    where.OR = [
      { paymentId: { contains: search, mode: 'insensitive' } },
      { orderId: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [items, totalCount] = await Promise.all([
    prisma.billingTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            brandKit: {
              select: {
                businessName: true,
                phone: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
    }),
    prisma.billingTransaction.count({ where }),
  ]);

  return {
    items,
    totalCount,
    totalPages: Math.ceil(totalCount / limit) || 1,
    currentPage: page,
  };
};

/**
 * Log a manual transaction & update user subscription
 *
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const recordManualTransaction = async ({
  userId,
  plan = BILLING_PLANS.PRO,
  transactionType = 'PLAN_PURCHASE',
  paymentGateway = PAYMENT_GATEWAYS.ADMIN_MANUAL,
  pricePaid = 0,
  currency = BILLING_CURRENCIES.INR,
  postCount = 100,
  paymentId = null,
  orderId = null,
  status = TRANSACTION_STATUSES.COMPLETED,
}) => {
  // 1. Create transaction log
  const transaction = await prisma.billingTransaction.create({
    data: {
      userId,
      plan,
      transactionType,
      paymentGateway,
      pricePaid: Number(pricePaid),
      currency,
      postCount: Number(postCount),
      paymentId: paymentId || `MANUAL_${Date.now()}`,
      orderId: orderId || `MANUAL_ORD_${Date.now()}`,
      status,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    },
  });

  // 2. Update user subscription if transaction is COMPLETED
  if (status === TRANSACTION_STATUSES.COMPLETED) {
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
        totalPostsAllowed: Number(postCount),
        postsUsed: 0,
        pricePaid: Number(pricePaid),
        currency,
        paymentGateway,
        paymentId: transaction.paymentId,
        orderId: transaction.orderId,
      },
      update: {
        plan,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
        totalPostsAllowed: Number(postCount),
        postsUsed: 0,
        pricePaid: Number(pricePaid),
        currency,
        paymentGateway,
        paymentId: transaction.paymentId,
        orderId: transaction.orderId,
      },
    });
  }

  return transaction;
};

/**
 * Fetch all matching transactions for CSV export
 *
 * @param {Object} params
 * @returns {Promise<Array>}
 */
export const getAllMatchingTransactionsForExport = async ({
  search = '',
  status = '',
  paymentGateway = '',
  currency = '',
  plan = '',
  startDate = '',
  endDate = '',
} = {}) => {
  const where = {};

  if (status) where.status = status;
  if (paymentGateway) where.paymentGateway = paymentGateway;
  if (currency) where.currency = currency;
  if (plan) where.plan = plan;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (search) {
    where.OR = [
      { paymentId: { contains: search, mode: 'insensitive' } },
      { orderId: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return prisma.billingTransaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          brandKit: {
            select: {
              businessName: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Billing Admin Repository singleton for backward-compatible consumption
 */
export const billingAdminRepository = {
  getFinancialOverview,
  getPaginatedTransactions,
  recordManualTransaction,
  getAllMatchingTransactionsForExport,
};
