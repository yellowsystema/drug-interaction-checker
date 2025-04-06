const express = require('express');
const router = express.Router();

router.post('/submit', (req, res) => {
    const { illness, medications, allergies } = req.body;

    console.log('Received Data:', { illness, medications, allergies });

    // Process the data (e.g., save to a database or perform some logic)
    // For now, just send a success response
    res.status(200).json({ message: 'Data received successfully!' });
});

module.exports = router;
