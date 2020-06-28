const expressJwt = require('express-jwt');
const { PRIVATE_KEY } = require('../utils/constant');

const jwtAuth = expressJwt({
    secret: PRIVATE_KEY,
    credentialsRequired: true
}).unless({
    path: [
        '/',
        '/user/login'
    ], // 设置jwt认证白名单
});

module.exports = jwtAuth;