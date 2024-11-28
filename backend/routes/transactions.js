const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new transaction
router.post('/', async (req, res) => {
    try {
        const { date, amount, payee, categoryId, userId } = req.body;
        const newTransaction = await prisma.transaction.create({
            data: {
                date: new Date(date),
                amount: amount,
                payee: payee,
                categoryId: categoryId,
                userId: userId,
            },
        });
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// Get all transactions for a user with pagination
router.get('/', async (req, res) => {
    try {
        const userId = parseInt(req.query.userId, 10);
        const page = parseInt(req.query.page, 10) || 1; // Default to page 1
        const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
        const skip = (page - 1) * limit;
        const category = req.query.category;

        const where = { userId: userId };
        if (category) {
            where.category = { name: category };
        }

        const [transactions, totalCount] = await Promise.all([
            prisma.transaction.findMany({
                where: where,
                include: { category: true },
                skip: skip,
                take: limit,
            }),
            prisma.transaction.count({
                where: where,
            }),
        ]);

        res.json({
            items: transactions,
            totalPages: Math.ceil(totalCount / limit),
            totalCount: totalCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Get a single transaction by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const transaction = await prisma.transaction.findUnique({
            where: { id: id },
            include: { category: true },
        });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
});

// Update a transaction
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { date, amount, payee, categoryId } = req.body;
        const updatedTransaction = await prisma.transaction.update({
            where: { id: id },
            data: {
                date: new Date(date),
                amount: amount,
                payee: payee,
                categoryId: categoryId,
            },
        });
        res.json(updatedTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

router.post('/delete', async (req, res) => {
    const { transactionIds } = req.body;

    if (!transactionIds || !Array.isArray(transactionIds)) {
        return res.status(400).json({ error: 'Invalid transaction IDs' });
    }

    try {
        await prisma.transaction.deleteMany({
            where: {
                id: { in: transactionIds }
            }
        });
        res.status(200).json({ message: 'Transactions deleted successfully' });
    } catch (error) {
        console.error('Failed to delete transactions:', error);
        res.status(500).json({ error: 'Failed to delete transactions' });
    }
});

router.put('/transactions/:id', async (req, res) => {
    const transactionId = parseInt(req.params.id, 10);
    const { date, category, payee, amount } = req.body;

    try {
        // Update transaction logic
        await updateTransaction(transactionId, { date, category, payee, amount });
        res.status(200).json({ message: 'Transaction updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

module.exports = router;