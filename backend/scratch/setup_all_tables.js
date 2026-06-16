const db = require("../config/db");

const sqlStatements = [
  // 1. CEO Segments table
  `CREATE TABLE IF NOT EXISTS ceo_segments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    segment_name VARCHAR(100) NOT NULL,
    revenue VARCHAR(50) NOT NULL,
    portfolio_size VARCHAR(100) NOT NULL,
    risk_score INT NOT NULL,
    risk_indicator VARCHAR(20) NOT NULL,
    fraud_exposure VARCHAR(50) NOT NULL,
    management_signal VARCHAR(255) NOT NULL,
    owner VARCHAR(100) NOT NULL
  )`,
  
  // 2. Fraud Cases table
  `CREATE TABLE IF NOT EXISTS fraud_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id VARCHAR(50) NOT NULL UNIQUE,
    fraud_typology VARCHAR(100) NOT NULL,
    channel VARCHAR(100) NOT NULL,
    amount_at_risk VARCHAR(50) NOT NULL,
    signal_pattern TEXT NOT NULL,
    risk_score INT NOT NULL,
    risk_indicator VARCHAR(20) NOT NULL,
    fraud_action VARCHAR(255) NOT NULL
  )`,

  // 3. Collections Cases table
  `CREATE TABLE IF NOT EXISTS collections_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL UNIQUE,
    product VARCHAR(100) NOT NULL,
    outstanding VARCHAR(50) NOT NULL,
    dpd_bucket VARCHAR(50) NOT NULL,
    recovery_score INT NOT NULL,
    last_contact VARCHAR(100) NOT NULL,
    ptp_status VARCHAR(100) NOT NULL,
    risk VARCHAR(20) NOT NULL,
    treatment VARCHAR(255) NOT NULL
  )`,

  // 4. Treasury Positions table
  `CREATE TABLE IF NOT EXISTS treasury_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    treasury_position VARCHAR(100) NOT NULL,
    exposure VARCHAR(50) NOT NULL,
    position_limit VARCHAR(50) NOT NULL,
    utilisation_percent INT NOT NULL,
    market_signal VARCHAR(255) NOT NULL,
    risk_score INT NOT NULL,
    risk VARCHAR(20) NOT NULL,
    recommended_action VARCHAR(255) NOT NULL
  )`,

  // Seed CEO Segments
  `INSERT INTO ceo_segments (id, segment_name, revenue, portfolio_size, risk_score, risk_indicator, fraud_exposure, management_signal, owner) VALUES
  (1, 'Retail Banking', '₹184.2 Cr', '₹5,420 Cr', 28, 'Green', '₹6.8L', 'Stable deposit-led growth', 'Head of Retail'),
  (2, 'Credit Cards', '₹72.4 Cr', '₹1,240 Cr receivables', 72, 'Amber', '₹28.4L', 'Fraud dispute rate needs action', 'Cards Business Head'),
  (3, 'Digital Lending', '₹41.7 Cr', '₹860 Cr', 58, 'Yellow', '₹7.4L', 'Early delinquency increasing', 'FinTech Lending Lead')
  ON DUPLICATE KEY UPDATE segment_name=VALUES(segment_name), revenue=VALUES(revenue), portfolio_size=VALUES(portfolio_size), risk_score=VALUES(risk_score), risk_indicator=VALUES(risk_indicator), fraud_exposure=VALUES(fraud_exposure), management_signal=VALUES(management_signal), owner=VALUES(owner)`,

  // Seed Fraud Cases
  `INSERT INTO fraud_cases (id, case_id, fraud_typology, channel, amount_at_risk, signal_pattern, risk_score, risk_indicator, fraud_action) VALUES
  (1, 'FRD-24091', 'Account Takeover', 'Mobile Banking', '₹9.8L', 'New device + password reset + instant beneficiary transfer', 94, 'Red', 'Freeze transfer and call customer'),
  (2, 'FRD-24108', 'Card-Not-Present', 'Ecommerce', '₹4.6L', 'International transactions within 8 minutes', 78, 'Amber', 'Block card and require step-up authentication'),
  (3, 'FRD-24122', 'Mule Account Pattern', 'UPI / Wallet', '₹7.2L', 'Multiple credits followed by immediate cash-out', 91, 'Red', 'Hold account and initiate AML review'),
  (4, 'FRD-24137', 'Velocity Abuse', 'Credit Card', '₹1.1L', 'Six failed attempts followed by approved transaction', 56, 'Yellow', 'Monitor and require OTP reverification')
  ON DUPLICATE KEY UPDATE case_id=VALUES(case_id), fraud_typology=VALUES(fraud_typology), channel=VALUES(channel), amount_at_risk=VALUES(amount_at_risk), signal_pattern=VALUES(signal_pattern), risk_score=VALUES(risk_score), risk_indicator=VALUES(risk_indicator), fraud_action=VALUES(fraud_action)`,

  // Seed Collections Cases
  `INSERT INTO collections_cases (id, customer_id, product, outstanding, dpd_bucket, recovery_score, last_contact, ptp_status, risk, treatment) VALUES
  (1, 'CUS-78542', 'Credit Card', '₹1.86L', '31-60 DPD', 68, 'SMS accepted', 'Promise due in 2 days', 'Yellow', 'Send digital reminder and payment link'),
  (2, 'CUS-81109', 'Personal Loan', '₹7.42L', '91+ DPD', 32, 'No response', 'Broken twice', 'Red', 'Escalate after recoverability scoring'),
  (3, 'CUS-79031', 'Two-Wheeler Loan', '₹68,400', '16-30 DPD', 84, 'Phone connected', 'Likely to pay', 'Green', 'Offer partial payment plan'),
  (4, 'CUS-80318', 'Digital Personal Loan', '₹3.25L', '61-90 DPD', 51, 'WhatsApp delivered', 'No commitment', 'Amber', 'Assign human collector and offer restructuring')
  ON DUPLICATE KEY UPDATE customer_id=VALUES(customer_id), product=VALUES(product), outstanding=VALUES(outstanding), dpd_bucket=VALUES(dpd_bucket), recovery_score=VALUES(recovery_score), last_contact=VALUES(last_contact), ptp_status=VALUES(ptp_status), risk=VALUES(risk), treatment=VALUES(treatment)`,

  // Seed Treasury Positions
  `INSERT INTO treasury_positions (id, treasury_position, exposure, position_limit, utilisation_percent, market_signal, risk_score, risk, recommended_action) VALUES
  (1, 'Government Securities Book', '₹1,260 Cr', '₹1,500 Cr', 84, 'Yield volatility elevated', 74, 'Amber', 'Reduce duration or use hedge overlay'),
  (2, 'FX Open Position', '₹24 Cr', '₹50 Cr', 48, 'Within dealer appetite', 26, 'Green', 'Continue intraday monitoring'),
  (3, 'Wholesale Deposit Maturity', '₹310 Cr', '₹400 Cr', 78, 'Concentrated maturity next week', 57, 'Yellow', 'Pre-arrange repo or short-term borrowing'),
  (4, 'High Quality Liquid Assets', '₹890 Cr', '₹760 Cr minimum', 100, 'Comfortable liquidity buffer', 20, 'Green', 'Maintain buffer for stress scenario')
  ON DUPLICATE KEY UPDATE treasury_position=VALUES(treasury_position), exposure=VALUES(exposure), position_limit=VALUES(position_limit), utilisation_percent=VALUES(utilisation_percent), market_signal=VALUES(market_signal), risk_score=VALUES(risk_score), risk=VALUES(risk), recommended_action=VALUES(recommended_action)`
];

function runQueries(index = 0) {
  if (index >= sqlStatements.length) {
    console.log("Migration complete!");
    process.exit(0);
  }

  db.query(sqlStatements[index], (err, result) => {
    if (err) {
      console.error(`Error executing query ${index}:`, err);
      process.exit(1);
    }
    console.log(`Executed query ${index + 1}/${sqlStatements.length} successfully`);
    runQueries(index + 1);
  });
}

runQueries();
