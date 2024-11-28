let express = require('express');
let router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/remaining', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const today = new Date();
    const previous7DaysStart = new Date();
    previous7DaysStart.setDate(today.getDate() - 7);
    const previous7DaysEnd = new Date(today);
    previous7DaysEnd.setDate(today.getDate() - 1);

    // Calculate total for all-time transactions
    const allTimeTotal = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: parseInt(userId)
      }
    });

    // Calculate total for the previous 7 days
    const last7DaysTotal = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: parseInt(userId),
        date: {
          gte: previous7DaysStart,
          lt: previous7DaysEnd
        }
      }
    });

    // Calculate remaining amounts
    const allTimeRemaining = allTimeTotal._sum.amount || 0;
    const last7DaysRemaining = last7DaysTotal._sum.amount || 0;

    // Calculate percentage change
    const percentageChange = last7DaysRemaining !== 0
        ? ((allTimeRemaining - last7DaysRemaining) / Math.abs(last7DaysRemaining)) * 100
        : allTimeRemaining > 0
            ? 100
            : -100;

    res.json({
      allTimeRemaining,
      percentageChange
    });
  } catch (error) {
    console.error('Error fetching amounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/expenses', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const today = new Date();
    const last7DaysEnd = new Date(today);
    last7DaysEnd.setDate(today.getDate() - 1);
    const last7DaysStart = new Date(last7DaysEnd);
    last7DaysStart.setDate(last7DaysEnd.getDate() - 6);

    const previous7DaysEnd = new Date(last7DaysStart);
    previous7DaysEnd.setDate(last7DaysStart.getDate() - 1);
    const previous7DaysStart = new Date(previous7DaysEnd);
    previous7DaysStart.setDate(previous7DaysEnd.getDate() - 6);

    // Calculate total for the last 7 days
    const last7DaysTotal = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: parseInt(userId),
        amount: { lt: 0 },
        date: {
          gte: last7DaysStart,
          lt: last7DaysEnd
        }
      }
    });

    // Calculate total for the previous 7 days
    const previous7DaysTotal = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: parseInt(userId),
        amount: { lt: 0 },
        date: {
          gte: previous7DaysStart,
          lt: previous7DaysEnd
        }
      }
    });

    const last7DaysExpenses = last7DaysTotal._sum.amount || 0;
    const previous7DaysExpenses = previous7DaysTotal._sum.amount || 0;

    // Calculate percentage change
    const percentageChange = previous7DaysExpenses !== 0
        ? ((last7DaysExpenses - previous7DaysExpenses) / Math.abs(previous7DaysExpenses)) * 100
        : last7DaysExpenses > 0
            ? 100
            : -100;

    res.json({
      last7DaysExpenses,
      percentageChange
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/income', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const today = new Date();
    const last7DaysEnd = new Date(today);
    last7DaysEnd.setDate(today.getDate() - 1);
    const last7DaysStart = new Date(last7DaysEnd);
    last7DaysStart.setDate(last7DaysEnd.getDate() - 6);

    const previous7DaysEnd = new Date(last7DaysStart);
    previous7DaysEnd.setDate(last7DaysStart.getDate() - 1);
    const previous7DaysStart = new Date(previous7DaysEnd);
    previous7DaysStart.setDate(previous7DaysEnd.getDate() - 6);

    // Calculate total for the last 7 days
    const last7DaysTotal = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: parseInt(userId),
        amount: { gt: 0 },
        date: {
          gte: last7DaysStart,
          lt: last7DaysEnd
        }
      }
    });

    console.log(last7DaysTotal);

    // Calculate total for the previous 7 days
    const previous7DaysTotal = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: parseInt(userId),
        amount: { gt: 0 },
        date: {
          gte: previous7DaysStart,
          lt: previous7DaysEnd
        }
      }
    });

    const last7DaysIncome = last7DaysTotal._sum.amount || 0;
    const previous7DaysIncome = previous7DaysTotal._sum.amount || 0;

    // Calculate percentage change
    const percentageChange = previous7DaysIncome !== 0
        ? ((last7DaysIncome - previous7DaysIncome) / Math.abs(previous7DaysIncome)) * 100
        : last7DaysIncome > 0
            ? 100
            : -100;

    res.json({
      last7DaysIncome,
      percentageChange
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/expenses-by-category', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const today = new Date();
    const last7DaysStart = new Date();
    last7DaysStart.setDate(today.getDate() - 7);

    // Calculate expenses for the last 7 days by category
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: parseInt(userId),
        amount: {
          lt: 0
        },
        date: {
          gte: last7DaysStart,
          lt: today
        }
      },
      _sum: {
        amount: true,
      }
    });


    const result = await Promise.all(expensesByCategory.map(async item => {
      const category = await prisma.category.findUnique({
        where: { id: item.categoryId }
      });
      return {
        category: category.name,
        amount: Math.abs(item._sum.amount) // Convert to positive value for display purposes
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/financial-series', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const today = new Date();
    const startOfLast7Days = new Date(today);
    startOfLast7Days.setDate(today.getDate() - 6);

    const incomeSeries = Array(7).fill(0);
    const expensesSeries = Array(7).fill(0);

    const incomeData = await prisma.transaction.findMany({
      where: {
        userId: parseInt(userId),
        amount: { gt: 0 },
        date: {
          gte: startOfLast7Days,
          lte: today
        }
      }
    });

    incomeData.forEach(transaction => {
      const dayIndex = Math.floor((today.getTime() - new Date(transaction.date).getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex < 7) {
        incomeSeries[6 - dayIndex] += transaction.amount;
      }
    });

    const expensesData = await prisma.transaction.findMany({
      where: {
        userId: parseInt(userId),
        amount: { lt: 0 },
        date: {
          gte: startOfLast7Days,
          lte: today
        }
      }
    });

    expensesData.forEach(transaction => {
      const dayIndex = Math.floor((today.getTime() - new Date(transaction.date).getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex < 7) {
        expensesSeries[6 - dayIndex] += Math.abs(transaction.amount);
      }
    });

    const labels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    });

    res.json({
      incomeSeries,
      expensesSeries,
      labels
    });
  } catch (error) {
    console.error('Error fetching financial series:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;