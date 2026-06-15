const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const metricsController = require("../controllers/metricsController");

router.get("/", verifyToken, metricsController.getDashboardMetrics);

module.exports = router;
