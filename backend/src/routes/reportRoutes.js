const express = require('express');
const { getReportSummary } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getReportSummary);

module.exports = router;
