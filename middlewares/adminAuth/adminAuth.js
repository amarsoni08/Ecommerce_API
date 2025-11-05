import jwt from 'jsonwebtoken';
import 'dotenv/config';
const jwtSecret = process.env.JWT_SECRET;
const adminauthenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    };

    const token = authHeader.split(' ')[1];
    jwt.verify(token, jwtSecret, (err, admin) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.admin = admin;
    
        next();
    });
};
const adminVerification = (req, res, next) => {
    try {
        if (req.admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        };

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export {
    adminauthenticateJWT,
    adminVerification
};