const db = require("../config/db");

const allowedStatuses = ["Open", "In Review", "Resolved", "Escalated"];
const allowedRisks = ["Green", "Yellow", "Amber", "Red"];

exports.getCases = (req, res) => {
  const search = `%${req.query.search || ""}%`;
  const status = req.query.status || "";
  const risk = req.query.risk || "";
  const params = [search, search, search];

  let query =
    "SELECT * FROM operational_cases WHERE (customer_name LIKE ? OR case_type LIKE ? OR owner LIKE ?)";

  if (status) {
    query += " AND status=?";
    params.push(status);
  }

  if (risk) {
    query += " AND risk_level=?";
    params.push(risk);
  }

  query += " ORDER BY id ASC";

  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
};

exports.createCase = (req, res) => {
  const {
    customer_name,
    case_type,
    amount,
    risk_level,
    status,
    owner,
    notes
  } = req.body;

  if (!customer_name || !case_type || !risk_level || !status || !owner) {
    return res.status(400).json({
      message: "Customer, case type, risk, status, and owner are required"
    });
  }

  if (!allowedRisks.includes(risk_level) || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid risk or status"
    });
  }

  db.query(
    "INSERT INTO operational_cases(customer_name,case_type,amount,risk_level,status,owner,notes) VALUES(?,?,?,?,?,?,?)",
    [customer_name, case_type, amount || 0, risk_level, status, owner, notes || ""],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(201).json({
        message: "Case created",
        id: result.insertId
      });
    }
  );
};

exports.updateCase = (req, res) => {
  const {
    customer_name,
    case_type,
    amount,
    risk_level,
    status,
    owner,
    notes
  } = req.body;

  if (!customer_name || !case_type || !risk_level || !status || !owner) {
    return res.status(400).json({
      message: "Customer, case type, risk, status, and owner are required"
    });
  }

  if (!allowedRisks.includes(risk_level) || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid risk or status"
    });
  }

  db.query(
    "UPDATE operational_cases SET customer_name=?, case_type=?, amount=?, risk_level=?, status=?, owner=?, notes=? WHERE id=?",
    [customer_name, case_type, amount || 0, risk_level, status, owner, notes || "", req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Case updated"
      });
    }
  );
};

exports.deleteCase = (req, res) => {
  db.query(
    "DELETE FROM operational_cases WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Case deleted"
      });
    }
  );
};
