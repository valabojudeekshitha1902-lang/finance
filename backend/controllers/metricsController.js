const db = require("../config/db");

exports.getDashboardMetrics = (req, res) => {
  const dashboard = req.query.dashboard;
  const access = {
    admin: ["ceo", "credit", "fraud", "collections", "crm", "treasury"],
    ceo: ["ceo"],
    credit_manager: ["credit"],
    fraud_analyst: ["fraud"],
    collections_manager: ["collections"],
    crm_manager: ["crm"],
    treasury_manager: ["treasury"]
  };
  const allowedForRole = access[req.user.role] || [];
  const allowedDashboards = [
    "ceo",
    "credit",
    "fraud",
    "collections",
    "crm",
    "treasury"
  ];

  if (dashboard && !allowedDashboards.includes(dashboard)) {
    return res.status(400).json({
      message: "Invalid dashboard"
    });
  }

  if (dashboard && !allowedForRole.includes(dashboard)) {
    return res.status(403).json({
      message: "Unauthorized Dashboard"
    });
  }

  if (!allowedForRole.length) {
    return res.status(403).json({
      message: "Unauthorized Role"
    });
  }

  let query =
    "SELECT dashboard, metric_key, label, metric_value, status, helper_text, updated_at FROM dashboard_metrics";
  const params = [];

  if (dashboard) {
    query += " WHERE dashboard=?";
    params.push(dashboard);
  } else {
    query += ` WHERE dashboard IN (${allowedForRole.map(() => "?").join(",")})`;
    params.push(...allowedForRole);
  }

  query += " ORDER BY dashboard, display_order";

  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
};
