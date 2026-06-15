const express = require("express");

const router = express.Router();

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.get(
    "/ceo",
    verifyToken,
    authorizeRoles("ceo", "admin"),
    (req, res) => {
        res.json({
            dashboard: "CEO Dashboard"
        });
    }
);

router.get(
    "/credit",
    verifyToken,
    authorizeRoles("credit_manager", "admin"),
    (req, res) => {
        res.json({
            dashboard: "Credit Dashboard"
        });
    }
);

router.get(
    "/fraud",
    verifyToken,
    authorizeRoles("fraud_analyst", "admin"),
    (req, res) => {
        res.json({
            dashboard: "Fraud Dashboard"
        });
    }
);

router.get(
    "/collections",
    verifyToken,
    authorizeRoles("collections_manager", "admin"),
    (req, res) => {
        res.json({
            dashboard: "Collections Dashboard"
        });
    }
);

router.get(
    "/crm",
    verifyToken,
    authorizeRoles("crm_manager", "admin"),
    (req, res) => {
        res.json({
            dashboard: "CRM Dashboard"
        });
    }
);

router.get(
    "/treasury",
    verifyToken,
    authorizeRoles("treasury_manager", "admin"),
    (req, res) => {
        res.json({
            dashboard: "Treasury Dashboard"
        });
    }
);

module.exports = router;