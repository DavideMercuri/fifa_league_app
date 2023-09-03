const jwt = require('jsonwebtoken');

const SECRET_KEY = '7l5Ywkc6gV';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).send({ message: 'Token non fornito.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send({ message: 'Token non valido.' });
    req.user = user;
    next();
  });
};
