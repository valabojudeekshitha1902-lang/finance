const express = require("express");

const router = express.Router();

const {
  verifyToken,
  authorizeRoles
} = require("../middleware/authMiddleware");
const casesController = require("../controllers/casesController");

router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "fraud_analyst", "collections_manager", "credit_manager"),
  casesController.getCases
);

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "fraud_analyst", "collections_manager", "credit_manager"),
  casesController.createCase
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "fraud_analyst", "collections_manager", "credit_manager"),
  casesController.updateCase
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  casesController.deleteCase
);

module.exports = router;
