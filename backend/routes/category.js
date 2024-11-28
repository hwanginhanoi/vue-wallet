const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        // Retrieve and convert userId from query parameters
        const userId = parseInt(req.query.userId, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        // Retrieve pagination parameters from query parameters
        const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page if not provided

        // Validate pagination parameters
        if (page <= 0 || limit <= 0) {
            return res.status(400).json({ error: 'Invalid page or limit' });
        }

        // Retrieve search query from query parameters
        const search = req.query.search || '';

        // Calculate the offset for pagination
        const offset = (page - 1) * limit;

        // Fetch categories with search and pagination
        const categories = await prisma.category.findMany({
            where: {
                userId: userId,
                name: { contains: search, mode: 'insensitive' } // Search functionality
            },
            skip: offset,
            take: limit,
        });

        // Get total count of categories for pagination metadata
        const totalCategories = await prisma.category.count({
            where: {
                userId: userId,
                name: { contains: search, mode: 'insensitive' } // Count with search
            },
        });

        // Send response with categories and pagination metadata
        res.json({
            categories,
            pagination: {
                page,
                limit,
                total: totalCategories,
                totalPages: Math.ceil(totalCategories / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

router.post('/', async (req, res) => {
    try {
        const name = req.body.name;
        const userId = req.body.userId;

        const existingCategory = await prisma.category.findFirst({
            where: {
                name: name,
                userId: userId,
            },
        });

        if (existingCategory) {
            return res.status(409).json({ error: 'Category already exists' });
        }

        const newCategory = await prisma.category.create({
            data: {
                name: name,
                userId: userId,
            },
        });
        res.status(201).json(newCategory);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

router.delete('/', async (req, res) => {
    const { userId, categoryIds } = req.body;

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        return res.status(400).json({ error: 'No categories selected' });
    }

    try {
        await prisma.category.deleteMany({
            where: {
                id: { in: categoryIds },
                userId: userId,
            }
        });
        res.status(200).json({ message: 'Categories deleted successfully' });
    } catch (error) {
        console.error('Error deleting categories:', error);
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;