const router = require('express').Router();

// API router
router.use('/login', require('./login'));

// Router for no match
router.all('/*', (req, res) => {
  res.status(404).json({ url: req.url, message: 'not found' });
});

module.exports = router;