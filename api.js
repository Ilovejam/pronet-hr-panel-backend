const express = require('express');
const router = express.Router();

// API Example Endpoint
router.get('/', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Another Example Endpoint
router.post('/data', (req, res) => {
    const data = req.body;
    res.json({ message: 'Data received!', data });
});

module.exports = router;
