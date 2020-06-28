const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('./constant')

function decode(req) {
    const authorization = req.get('Authorization')
    let token = '';
    if (authorization.indexOf('Bearer') >= 0) {
        token = authorization.replace('Bearer ', '');
    }
    else {
        token = authorization;
    }
    return jwt.verify(token, PRIVATE_KEY);
}

function md5(s) {
    return crypto.createHash('md5').update(String(s)).digest('hex');
}

module.exports = {
    md5,decode
}