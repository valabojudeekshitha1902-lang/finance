const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access Denied"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const verified =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        req.user = verified;

        next();

    } catch (error) {

        return res.status(403).json({
            message: "Invalid Token"
        });

    }
};

exports.authorizeRoles = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {

            return res.status(403).json({
                message: "Unauthorized Role"
            });

        }

        next();

    };

};
