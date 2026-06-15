require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const casesRoutes = require("./routes/casesRoutes");
const metricsRoutes = require("./routes/metricsRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
const dashboardRoutes =
require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api/admin", adminRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("BankOps AI Backend Running");
});

// Temporary Registration Test Route
app.get("/register-test", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash("12345678", 10);

    db.query(
      "SELECT id, email, role FROM users WHERE email=?",
      [
        "admin@test.com"
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        if (result.length > 0) {
          return res.json({
            message: "Admin user already exists",
            email: "admin@test.com",
            password: "12345678",
            role: result[0].role
          });
        }

        db.query(
          "INSERT INTO users(name,email,password,role,is_active) VALUES(?,?,?,?,?)",
          [
            "Admin User",
            "admin@test.com",
            hashedPassword,
            "admin",
            1
          ],
          (insertErr) => {
            if (insertErr) {
              return res.status(500).json({
                error: insertErr.message
              });
            }

            res.json({
              message: "Admin user inserted successfully",
              email: "admin@test.com",
              password: "12345678",
              role: "admin"
            });
          }
        );
      }
    );

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
