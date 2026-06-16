const mysql = require("mysql2");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "fin@vsb",
  database: process.env.DB_NAME || "bankops_ai"
});

db.connect(async (err) => {
  if (err) {
    console.error("Database Connection Failed in Test Script:", err);
    process.exit(1);
  }
  console.log("✅ MySQL Connected Successfully in Test Script");

  // Check users in database
  db.query("SELECT id, name, email, role FROM users", async (err, result) => {
    if (err) {
      console.error("Error querying users:", err);
      db.end();
      process.exit(1);
    }
    console.log("Current Users in DB:", result);

    try {
      await runApiTests();
    } catch (apiErr) {
      console.error("API tests failed:", apiErr);
    } finally {
      db.end();
    }
  });
});

async function runApiTests() {
  const email = "admin_test@bankops.ai";
  const password = "password123";
  
  // Register a test admin user (through API register, it defaults role to ceo but we can update role to admin in DB for testing)
  console.log("Registering a test user...");
  let res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Admin Tester",
      email: email,
      password: password,
      role: "admin"
    })
  });
  
  let regData = await res.json();
  console.log("Register Response:", regData);

  // Set the user's role to admin in the database directly so we can perform deletes and access all dashboards
  await new Promise((resolve, reject) => {
    db.query("UPDATE users SET role = 'admin' WHERE email = ?", [email], (err) => {
      if (err) reject(err);
      else {
        console.log("Updated test user to admin role in database");
        resolve();
      }
    });
  });

  // Login
  console.log("Logging in...");
  res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  
  const loginData = await res.json();
  console.log("Login Response status:", res.status, loginData.message);
  if (!loginData.token) {
    throw new Error("Could not log in and get JWT token!");
  }
  
  const token = loginData.token;
  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  // 1. CEO SEGMENTS CRUD TEST
  console.log("\n--- CEO Segments CRUD Test ---");
  // POST
  res = await fetch("http://localhost:5000/api/data/ceo-segments", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      segment_name: "Test Segment",
      revenue: "₹50 Cr",
      portfolio_size: "₹100 Cr",
      risk_score: 45,
      risk_indicator: "Yellow",
      fraud_exposure: "₹1L",
      management_signal: "Monitor closely",
      owner: "Test Owner"
    })
  });
  let segment = await res.json();
  console.log("POST Segment Response:", segment);
  const segmentId = segment.id;

  // GET ALL
  res = await fetch("http://localhost:5000/api/data/ceo-segments", { headers: authHeaders });
  let segments = await res.json();
  console.log(`GET Segments Count: ${segments.length}`);

  // PUT
  res = await fetch(`http://localhost:5000/api/data/ceo-segments/${segmentId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      segment_name: "Test Segment Updated",
      revenue: "₹60 Cr",
      portfolio_size: "₹120 Cr",
      risk_score: 55,
      risk_indicator: "Amber",
      fraud_exposure: "₹1.5L",
      management_signal: "Action required",
      owner: "Test Owner Updated"
    })
  });
  console.log("PUT Segment Response:", await res.json());

  // DELETE
  res = await fetch(`http://localhost:5000/api/data/ceo-segments/${segmentId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  console.log("DELETE Segment Response:", await res.json());

  // 2. LOANS CRUD TEST
  console.log("\n--- Loans CRUD Test ---");
  // First we need a customer_id, we will find/create one.
  res = await fetch("http://localhost:5000/api/data/customers", { headers: authHeaders });
  let customers = await res.json();
  let customerId = customers[0]?.id;
  if (!customerId) {
    // Create customer first
    res = await fetch("http://localhost:5000/api/data/customers", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        customer_name: "Temporary Customer",
        age: 30,
        city: "Mumbai",
        segment: "Retail",
        account_balance: 10000.00
      })
    });
    let cust = await res.json();
    customerId = cust.id;
    console.log("Created Temporary Customer ID:", customerId);
  }

  // POST Loan
  res = await fetch("http://localhost:5000/api/data/loans", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      customer_id: customerId,
      loan_amount: 50000.00,
      loan_type: "Personal Test Loan",
      risk_grade: "B",
      loan_status: "Active"
    })
  });
  let loan = await res.json();
  console.log("POST Loan Response:", loan);
  const loanId = loan.id;

  // GET ALL Loans
  res = await fetch("http://localhost:5000/api/data/loans", { headers: authHeaders });
  console.log(`GET Loans Count: ${(await res.json()).length}`);

  // PUT Loan
  res = await fetch(`http://localhost:5000/api/data/loans/${loanId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      customer_id: customerId,
      loan_amount: 55000.00,
      loan_type: "Personal Test Loan Updated",
      risk_grade: "A",
      loan_status: "In Review"
    })
  });
  console.log("PUT Loan Response:", await res.json());

  // DELETE Loan
  res = await fetch(`http://localhost:5000/api/data/loans/${loanId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  console.log("DELETE Loan Response:", await res.json());

  // 3. FRAUD CASES CRUD TEST
  console.log("\n--- Fraud Cases CRUD Test ---");
  // POST Fraud Case
  res = await fetch("http://localhost:5000/api/data/fraud-cases", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      case_id: "FRD-TEST-999",
      fraud_typology: "Identity Theft",
      channel: "Web Portal",
      amount_at_risk: "₹10L",
      signal_pattern: "Multiple logons from different countries",
      risk_score: 95,
      risk_indicator: "Red",
      fraud_action: "Block Account"
    })
  });
  let fraud = await res.json();
  console.log("POST Fraud Case Response:", fraud);
  const fraudId = fraud.id;

  // GET ALL
  res = await fetch("http://localhost:5000/api/data/fraud-cases", { headers: authHeaders });
  console.log(`GET Fraud Cases Count: ${(await res.json()).length}`);

  // PUT
  res = await fetch(`http://localhost:5000/api/data/fraud-cases/${fraudId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      case_id: "FRD-TEST-999",
      fraud_typology: "Identity Theft Updated",
      channel: "Mobile App",
      amount_at_risk: "₹12L",
      signal_pattern: "Multiple logons and devices",
      risk_score: 98,
      risk_indicator: "Red",
      fraud_action: "Deactivate and alert customer"
    })
  });
  console.log("PUT Fraud Case Response:", await res.json());

  // DELETE
  res = await fetch(`http://localhost:5000/api/data/fraud-cases/${fraudId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  console.log("DELETE Fraud Case Response:", await res.json());

  // 4. COLLECTIONS CASES CRUD TEST
  console.log("\n--- Collections Cases CRUD Test ---");
  // POST Collections Case
  res = await fetch("http://localhost:5000/api/data/collections-cases", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      customer_id: "CUS-TEST-999",
      product: "Credit Card Test",
      outstanding: "₹2.5L",
      dpd_bucket: "61-90 DPD",
      recovery_score: 42,
      last_contact: "Email read",
      ptp_status: "Broken",
      risk: "Amber",
      treatment: "Call team contact"
    })
  });
  let collection = await res.json();
  console.log("POST Collections Case Response:", collection);
  const collectionId = collection.id;

  // GET ALL
  res = await fetch("http://localhost:5000/api/data/collections-cases", { headers: authHeaders });
  console.log(`GET Collections Cases Count: ${(await res.json()).length}`);

  // PUT
  res = await fetch(`http://localhost:5000/api/data/collections-cases/${collectionId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      customer_id: "CUS-TEST-999",
      product: "Credit Card Test Updated",
      outstanding: "₹3L",
      dpd_bucket: "91+ DPD",
      recovery_score: 30,
      last_contact: "No response",
      ptp_status: "Escalated",
      risk: "Red",
      treatment: "Send legal notice"
    })
  });
  console.log("PUT Collections Case Response:", await res.json());

  // DELETE
  res = await fetch(`http://localhost:5000/api/data/collections-cases/${collectionId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  console.log("DELETE Collections Case Response:", await res.json());

  // 5. CUSTOMERS CRUD TEST (CRM)
  console.log("\n--- Customers CRUD Test ---");
  // POST Customer
  res = await fetch("http://localhost:5000/api/data/customers", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      customer_name: "CRM Test Customer",
      age: 28,
      city: "Delhi",
      segment: "Premium",
      account_balance: 75000.00
    })
  });
  let custObj = await res.json();
  console.log("POST Customer Response:", custObj);
  const newCustId = custObj.id;

  // GET ALL
  res = await fetch("http://localhost:5000/api/data/customers", { headers: authHeaders });
  console.log(`GET Customers Count: ${(await res.json()).length}`);

  // PUT
  res = await fetch(`http://localhost:5000/api/data/customers/${newCustId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      customer_name: "CRM Test Customer Updated",
      age: 29,
      city: "Gurugram",
      segment: "Corporate",
      account_balance: 95000.00
    })
  });
  console.log("PUT Customer Response:", await res.json());

  // DELETE
  res = await fetch(`http://localhost:5000/api/data/customers/${newCustId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  console.log("DELETE Customer Response:", await res.json());

  // 6. TREASURY POSITIONS CRUD TEST
  console.log("\n--- Treasury Positions CRUD Test ---");
  // POST Treasury Position
  res = await fetch("http://localhost:5000/api/data/treasury-positions", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      treasury_position: "Short-term Commercial Paper",
      exposure: "₹150 Cr",
      position_limit: "₹200 Cr",
      utilisation_percent: 75,
      market_signal: "Yields dropping",
      risk_score: 35,
      risk: "Green",
      recommended_action: "Hold to maturity"
    })
  });
  let treasury = await res.json();
  console.log("POST Treasury Response:", treasury);
  const treasuryId = treasury.id;

  // GET ALL
  res = await fetch("http://localhost:5000/api/data/treasury-positions", { headers: authHeaders });
  console.log(`GET Treasury Count: ${(await res.json()).length}`);

  // PUT
  res = await fetch(`http://localhost:5000/api/data/treasury-positions/${treasuryId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      treasury_position: "Short-term Commercial Paper Updated",
      exposure: "₹180 Cr",
      position_limit: "₹200 Cr",
      utilisation_percent: 90,
      market_signal: "Yields stable",
      risk_score: 45,
      risk: "Yellow",
      recommended_action: "Monitor limit breach"
    })
  });
  console.log("PUT Treasury Response:", await res.json());

  // DELETE
  res = await fetch(`http://localhost:5000/api/data/treasury-positions/${treasuryId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  console.log("DELETE Treasury Response:", await res.json());

  // Clean up test admin user
  await new Promise((resolve, reject) => {
    db.query("DELETE FROM users WHERE email = ?", [email], (err) => {
      if (err) reject(err);
      else {
        console.log("\nCleaned up test admin user from database");
        resolve();
      }
    });
  });

  console.log("\n🎉 ALL CRUD API TESTS COMPLETED SUCCESSFULY!");
}
