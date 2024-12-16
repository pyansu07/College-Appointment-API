const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if(!token)
    return res.status(401).json({ message: 'Authentication required' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error){
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = auth;