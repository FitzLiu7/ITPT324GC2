const express = require('express');
const router = express.Router();
const { getData } = require('../models/dataModel');

router.get('/forecast', async (req, res) => {
    try {
        const data = await getData('inventoryForecast');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
