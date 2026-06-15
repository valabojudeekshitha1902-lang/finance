const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const allowedRoles = [
      "ceo",
      "credit_manager",
      "fraud_analyst",
      "collections_manager",
      "crm_manager",
      "treasury_manager"
    ];

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const assignedRole =
      allowedRoles.includes(role) ? role : "ceo";

    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err, result) => {

        if (err) {
          return res.status(500).json(err);
        }

        if (result.length > 0) {
          return res.status(400).json({
            message: "Email already exists"
          });
        }

        const hashedPassword =
          await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users(name,email,password,role,is_active) VALUES(?,?,?,?,?)",
          [name, email, hashedPassword, assignedRole, 1],
          (err) => {

            if (err) {
              return res.status(500).json(err);
            }

            return res.status(201).json({
              message: "User Registered Successfully"
            });

          }
        );
      }
    );

  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.login = (req, res) => {

  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, result) => {

      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      const user = result[0];

      if (Number(user.is_active) === 0) {
        return res.status(403).json({
          message: "Account is inactive. Contact admin."
        });
      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!validPassword) {
        return res.status(401).json({
          message: "Invalid Password"
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d"
        }
      );

      res.json({
    message: "Login Successful",
    token,
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
});
    }
  );
};
