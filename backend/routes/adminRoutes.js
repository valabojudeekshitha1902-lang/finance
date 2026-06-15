const express = require("express");

const router = express.Router();

const {
  verifyToken,
  authorizeRoles
} = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

router.get(
  "/users",
  verifyToken,
  authorizeRoles("admin"),
  adminController.getUsers
);

router.put(
  "/users/:id",
  verifyToken,
  authorizeRoles("admin"),
  adminController.updateUserAccess
);

module.exports = router;
