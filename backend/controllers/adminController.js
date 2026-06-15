const db = require("../config/db");

const allowedRoles = [
  "admin",
  "ceo",
  "credit_manager",
  "fraud_analyst",
  "collections_manager",
  "crm_manager",
  "treasury_manager"
];

exports.getUsers = (req, res) => {
  db.query(
    "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC, id DESC",
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
};

exports.updateUserAccess = (req, res) => {
  const { role, is_active } = req.body;

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role"
    });
  }

  db.query(
    "UPDATE users SET role=?, is_active=? WHERE id=?",
    [role, is_active ? 1 : 0, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "User access updated"
      });
    }
  );
};
