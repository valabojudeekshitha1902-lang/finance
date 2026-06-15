CREATE DATABASE IF NOT EXISTS bankops_ai;
USE bankops_ai;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM(
    'admin',
    'ceo',
    'credit_manager',
    'fraud_analyst',
    'collections_manager',
    'crm_manager',
    'treasury_manager'
  ) NOT NULL DEFAULT 'ceo',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dashboard VARCHAR(40) NOT NULL,
  metric_key VARCHAR(80) NOT NULL,
  label VARCHAR(120) NOT NULL,
  metric_value VARCHAR(40) NOT NULL,
  status ENUM('green', 'yellow', 'amber', 'red') NOT NULL,
  helper_text VARCHAR(255) NOT NULL,
  display_order INT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_dashboard_metric (dashboard, metric_key)
);

CREATE TABLE IF NOT EXISTS operational_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  case_type VARCHAR(120) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  risk_level ENUM('Green', 'Yellow', 'Amber', 'Red') NOT NULL,
  status ENUM('Open', 'In Review', 'Resolved', 'Escalated') NOT NULL,
  owner VARCHAR(120) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO dashboard_metrics
  (dashboard, metric_key, label, metric_value, status, helper_text, display_order)
VALUES
  ('ceo', 'net_interest_margin', 'Net Interest Margin', '3.42%', 'green', 'Green: above internal target of 3.30%.', 1),
  ('ceo', 'gross_npa_ratio', 'Gross NPA Ratio', '2.18%', 'yellow', 'Yellow: unsecured loans showing early stress.', 2),
  ('ceo', 'fraud_loss_exposure', 'Fraud Loss Exposure', 'Rs 42.6L', 'amber', 'Amber: card-not-present disputes increasing.', 3),
  ('ceo', 'liquidity_coverage_ratio', 'Liquidity Coverage Ratio', '126%', 'green', 'Green: above operating threshold of 115%.', 4),
  ('credit', 'dpd_accounts', '30+ DPD Accounts', '4,820', 'yellow', 'Yellow: 6.4% rise over previous cycle.', 1),
  ('credit', 'par_90', 'Portfolio at Risk 90+', '3.8%', 'amber', 'Amber: above 3.2% internal tolerance.', 2),
  ('credit', 'approval_quality_rate', 'Approval Quality Rate', '91.6%', 'green', 'Green: new approvals performing within policy bands.', 3),
  ('credit', 'high_risk_exposure', 'High-Risk Exposure', 'Rs 318 Cr', 'red', 'Red: concentration in unsecured loans.', 4),
  ('fraud', 'high_risk_cases', 'High-Risk Fraud Cases', '126', 'red', 'Red: account takeover and mule clusters need action.', 1),
  ('fraud', 'card_not_present_loss', 'Card-Not-Present Loss', 'Rs 28.4L', 'amber', 'Amber: ecommerce risk concentration.', 2),
  ('fraud', 'real_time_block_rate', 'Real-Time Block Rate', '93.2%', 'green', 'Green: automated prevention performing strongly.', 3),
  ('fraud', 'false_positive_rate', 'False Positive Rate', '4.7%', 'yellow', 'Yellow: manual review load increasing.', 4),
  ('collections', 'overdue_amount', 'Total Overdue Amount', 'Rs 86.7 Cr', 'amber', 'Amber: 31-60 DPD unsecured accounts rising.', 1),
  ('collections', 'roll_forward_rate', 'Roll-Forward Rate', '14.8%', 'yellow', 'Yellow: more accounts moving to 60+ DPD.', 2),
  ('collections', 'promise_to_pay_kept', 'Promise-to-Pay Kept', '72.5%', 'green', 'Green: digital reminder flow is effective.', 3),
  ('collections', 'legal_escalation_queue', 'Legal Escalation Queue', '342', 'red', 'Red: chronic delinquency needs review.', 4),
  ('crm', 'digital_active_customers', 'Digital Active Customers', '72.4%', 'green', 'Green: mobile banking adoption rising.', 1),
  ('crm', 'churn_risk_customers', 'Churn Risk Customers', '18,640', 'yellow', 'Yellow: salary account inactivity increasing.', 2),
  ('crm', 'complaint_sla_breaches', 'Complaint SLA Breaches', '312', 'amber', 'Amber: card dispute complaints driving pressure.', 3),
  ('crm', 'cross_sell_conversion', 'Cross-Sell Conversion', '12.8%', 'green', 'Green: pre-approved offers performing well.', 4),
  ('treasury', 'lcr', 'Liquidity Coverage Ratio', '126%', 'green', 'Green: above operating threshold.', 1),
  ('treasury', 'seven_day_cash_flow_gap', '7-Day Cash Flow Gap', 'Rs 142 Cr', 'yellow', 'Yellow: deposit maturities next week.', 2),
  ('treasury', 'interest_rate_var', 'Interest Rate VaR', 'Rs 18.6 Cr', 'amber', 'Amber: bond book sensitivity increased.', 3),
  ('treasury', 'fx_open_position', 'FX Open Position', 'Rs 24 Cr', 'green', 'Green: within Rs 50 Cr dealer limit.', 4)
ON DUPLICATE KEY UPDATE
  metric_value = VALUES(metric_value),
  status = VALUES(status),
  helper_text = VALUES(helper_text),
  display_order = VALUES(display_order);

INSERT INTO operational_cases
  (customer_name, case_type, amount, risk_level, status, owner, notes)
VALUES
  ('CUS-78542', 'Credit Card Collections', 186000.00, 'Yellow', 'Open', 'Collections Team', 'Promise-to-pay due in 2 days.'),
  ('CUS-81109', 'Personal Loan Recovery', 742000.00, 'Red', 'Escalated', 'Recovery Manager', 'Broken promises; needs recoverability review.'),
  ('FRD-24091', 'Account Takeover', 980000.00, 'Red', 'In Review', 'Fraud Analyst', 'New device, password reset, and high-value transfer.'),
  ('FRD-24108', 'Card-Not-Present Fraud', 460000.00, 'Amber', 'Open', 'Fraud Analyst', 'International ecommerce velocity pattern.')
ON DUPLICATE KEY UPDATE
  customer_name = VALUES(customer_name);
