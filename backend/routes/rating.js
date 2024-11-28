const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/submit', async (req, res) => {
    const { userId, rating, comment } = req.body;

    if (typeof userId !== 'number' || typeof rating !== 'number' || typeof comment !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        let ratingEntry = await prisma.rating.findUnique({
            where: { userId: userId }
        });

        if (ratingEntry) {
            // Update existing rating
            ratingEntry = await prisma.rating.update({
                where: { userId: userId },
                data: { rating, comment }
            });
        } else {
            // Create new rating
            ratingEntry = await prisma.rating.create({
                data: { userId, rating, comment }
            });
        }

        res.status(200).json({ message: 'Rating submitted successfully', rating: ratingEntry });
    } catch (error) {
        console.error('Failed to submit rating:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
});

router.get('/user/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId, 10);

    try {
        const ratingEntry = await prisma.rating.findUnique({
            where: { userId: userId }
        });

        if (ratingEntry) {
            res.json(ratingEntry);
        } else {
            res.status(404).json({ message: 'No rating found for this user' });
        }
    } catch (error) {
        console.error('Failed to fetch rating:', error);
        res.status(500).json({ error: 'Failed to fetch rating' });
    }
});

router.get('/random', async (req, res) => {
    try {
        const ratings = await prisma.rating.findMany({
            take: 3,
            orderBy: {
                createdAt: 'asc'
            },
        });

        res.json({ feedbacks: ratings });
    } catch (error) {
        console.error('Failed to fetch ratings:', error);
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

module.exports = router;