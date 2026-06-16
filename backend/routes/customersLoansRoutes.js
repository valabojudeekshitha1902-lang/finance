const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// ==========================================
// 1. CUSTOMERS
// ==========================================

// GET /api/data/customers
router.get("/customers", verifyToken, (req, res) => {
  const { search, segment } = req.query;
  let query = "SELECT * FROM customers";
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push("(customer_name LIKE ? OR city LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (segment) {
    conditions.push("segment = ?");
    params.push(segment);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY id ASC";

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// POST /api/data/customers
router.post("/customers", verifyToken, (req, res) => {
  const { customer_name, age, city, segment, account_balance } = req.body;
  db.query(
    "INSERT INTO customers (customer_name, age, city, segment, account_balance) VALUES (?, ?, ?, ?, ?)",
    [customer_name, age, city, segment, account_balance],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Customer created", id: result.insertId });
    }
  );
});

// PUT /api/data/customers/:id
router.put("/customers/:id", verifyToken, (req, res) => {
  const { customer_name, age, city, segment, account_balance } = req.body;
  db.query(
    "UPDATE customers SET customer_name=?, age=?, city=?, segment=?, account_balance=? WHERE id=?",
    [customer_name, age, city, segment, account_balance, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Customer updated" });
    }
  );
});

// DELETE /api/data/customers/:id
router.delete("/customers/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM customers WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Customer deleted" });
  });
});


// ==========================================
// 2. LOANS
// ==========================================

// GET /api/data/loans
router.get("/loans", verifyToken, (req, res) => {
  const { search, status, risk } = req.query;
  let query = "SELECT l.*, c.customer_name FROM loans l LEFT JOIN customers c ON l.customer_id = c.id";
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push("(c.customer_name LIKE ? OR l.loan_type LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    conditions.push("l.loan_status = ?");
    params.push(status);
  }

  if (risk) {
    conditions.push("l.risk_grade = ?");
    params.push(risk);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY l.id ASC";

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// POST /api/data/loans
router.post("/loans", verifyToken, (req, res) => {
  const { customer_id, loan_amount, loan_type, risk_grade, loan_status } = req.body;
  db.query(
    "INSERT INTO loans (customer_id, loan_amount, loan_type, risk_grade, loan_status) VALUES (?, ?, ?, ?, ?)",
    [customer_id, loan_amount, loan_type, risk_grade, loan_status],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Loan created", id: result.insertId });
    }
  );
});

// PUT /api/data/loans/:id
router.put("/loans/:id", verifyToken, (req, res) => {
  const { customer_id, loan_amount, loan_type, risk_grade, loan_status } = req.body;
  db.query(
    "UPDATE loans SET customer_id=?, loan_amount=?, loan_type=?, risk_grade=?, loan_status=? WHERE id=?",
    [customer_id, loan_amount, loan_type, risk_grade, loan_status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Loan updated" });
    }
  );
});

// DELETE /api/data/loans/:id
router.delete("/loans/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM loans WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Loan deleted" });
  });
});


// ==========================================
// 3. CEO SEGMENTS
// ==========================================

// GET /api/data/ceo-segments
router.get("/ceo-segments", verifyToken, (req, res) => {
  db.query("SELECT * FROM ceo_segments ORDER BY id ASC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// POST /api/data/ceo-segments
router.post("/ceo-segments", verifyToken, (req, res) => {
  const { segment_name, revenue, portfolio_size, risk_score, risk_indicator, fraud_exposure, management_signal, owner } = req.body;
  db.query(
    "INSERT INTO ceo_segments (segment_name, revenue, portfolio_size, risk_score, risk_indicator, fraud_exposure, management_signal, owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [segment_name, revenue, portfolio_size, risk_score, risk_indicator, fraud_exposure, management_signal, owner],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Segment created", id: result.insertId });
    }
  );
});

// PUT /api/data/ceo-segments/:id
router.put("/ceo-segments/:id", verifyToken, (req, res) => {
  const { segment_name, revenue, portfolio_size, risk_score, risk_indicator, fraud_exposure, management_signal, owner } = req.body;
  db.query(
    "UPDATE ceo_segments SET segment_name=?, revenue=?, portfolio_size=?, risk_score=?, risk_indicator=?, fraud_exposure=?, management_signal=?, owner=? WHERE id=?",
    [segment_name, revenue, portfolio_size, risk_score, risk_indicator, fraud_exposure, management_signal, owner, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Segment updated" });
    }
  );
});

// DELETE /api/data/ceo-segments/:id
router.delete("/ceo-segments/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM ceo_segments WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Segment deleted" });
  });
});


// ==========================================
// 4. FRAUD CASES
// ==========================================

// GET /api/data/fraud-cases
router.get("/fraud-cases", verifyToken, (req, res) => {
  db.query("SELECT * FROM fraud_cases ORDER BY id ASC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// POST /api/data/fraud-cases
router.post("/fraud-cases", verifyToken, (req, res) => {
  const { case_id, fraud_typology, channel, amount_at_risk, signal_pattern, risk_score, risk_indicator, fraud_action } = req.body;
  db.query(
    "INSERT INTO fraud_cases (case_id, fraud_typology, channel, amount_at_risk, signal_pattern, risk_score, risk_indicator, fraud_action) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [case_id, fraud_typology, channel, amount_at_risk, signal_pattern, risk_score, risk_indicator, fraud_action],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Fraud case created", id: result.insertId });
    }
  );
});

// PUT /api/data/fraud-cases/:id
router.put("/fraud-cases/:id", verifyToken, (req, res) => {
  const { case_id, fraud_typology, channel, amount_at_risk, signal_pattern, risk_score, risk_indicator, fraud_action } = req.body;
  db.query(
    "UPDATE fraud_cases SET case_id=?, fraud_typology=?, channel=?, amount_at_risk=?, signal_pattern=?, risk_score=?, risk_indicator=?, fraud_action=? WHERE id=?",
    [case_id, fraud_typology, channel, amount_at_risk, signal_pattern, risk_score, risk_indicator, fraud_action, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Fraud case updated" });
    }
  );
});

// DELETE /api/data/fraud-cases/:id
router.delete("/fraud-cases/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM fraud_cases WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Fraud case deleted" });
  });
});


// ==========================================
// 5. COLLECTIONS CASES
// ==========================================

// GET /api/data/collections-cases
router.get("/collections-cases", verifyToken, (req, res) => {
  db.query("SELECT * FROM collections_cases ORDER BY id ASC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// POST /api/data/collections-cases
router.post("/collections-cases", verifyToken, (req, res) => {
  const { customer_id, product, outstanding, dpd_bucket, recovery_score, last_contact, ptp_status, risk, treatment } = req.body;
  db.query(
    "INSERT INTO collections_cases (customer_id, product, outstanding, dpd_bucket, recovery_score, last_contact, ptp_status, risk, treatment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [customer_id, product, outstanding, dpd_bucket, recovery_score, last_contact, ptp_status, risk, treatment],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Collections case created", id: result.insertId });
    }
  );
});

// PUT /api/data/collections-cases/:id
router.put("/collections-cases/:id", verifyToken, (req, res) => {
  const { customer_id, product, outstanding, dpd_bucket, recovery_score, last_contact, ptp_status, risk, treatment } = req.body;
  db.query(
    "UPDATE collections_cases SET customer_id=?, product=?, outstanding=?, dpd_bucket=?, recovery_score=?, last_contact=?, ptp_status=?, risk=?, treatment=? WHERE id=?",
    [customer_id, product, outstanding, dpd_bucket, recovery_score, last_contact, ptp_status, risk, treatment, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Collections case updated" });
    }
  );
});

// DELETE /api/data/collections-cases/:id
router.delete("/collections-cases/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM collections_cases WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Collections case deleted" });
  });
});


// ==========================================
// 6. TREASURY POSITIONS
// ==========================================

// GET /api/data/treasury-positions
router.get("/treasury-positions", verifyToken, (req, res) => {
  db.query("SELECT * FROM treasury_positions ORDER BY id ASC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// POST /api/data/treasury-positions
router.post("/treasury-positions", verifyToken, (req, res) => {
  const { treasury_position, exposure, position_limit, utilisation_percent, market_signal, risk_score, risk, recommended_action } = req.body;
  db.query(
    "INSERT INTO treasury_positions (treasury_position, exposure, position_limit, utilisation_percent, market_signal, risk_score, risk, recommended_action) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [treasury_position, exposure, position_limit, utilisation_percent, market_signal, risk_score, risk, recommended_action],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Treasury position created", id: result.insertId });
    }
  );
});

// PUT /api/data/treasury-positions/:id
router.put("/treasury-positions/:id", verifyToken, (req, res) => {
  const { treasury_position, exposure, position_limit, utilisation_percent, market_signal, risk_score, risk, recommended_action } = req.body;
  db.query(
    "UPDATE treasury_positions SET treasury_position=?, exposure=?, position_limit=?, utilisation_percent=?, market_signal=?, risk_score=?, risk=?, recommended_action=? WHERE id=?",
    [treasury_position, exposure, position_limit, utilisation_percent, market_signal, risk_score, risk, recommended_action, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Treasury position updated" });
    }
  );
});

// DELETE /api/data/treasury-positions/:id
router.delete("/treasury-positions/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM treasury_positions WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Treasury position deleted" });
  });
});

module.exports = router;
