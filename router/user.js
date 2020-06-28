const express = require('express')
const Result = require('../models/Result.js')
const { login, findUser } = require('../services/user')
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const { md5, decode, PWD_SALT } = require('../utils')
const { PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')

const router = express.Router()

router.post('/login', 
    [
        body('username').isString().withMessage('username类型不正确'),
        body('password').isString().withMessage('password类型不正确')
    ],
    function(req, res, next) {
        const err = validationResult(req);
        if(!err.isEmpty()) {
            const [{ msg }] = err.errors;
            next(boom.badRequest(msg))
        }
        else {
            const username = req.body.username;
            const password = md5(`${req.body.password}${PWD_SALT}`);

            login(username, password).then(user => {
                if (!user || user.length === 0) {
                    new Result('登录失败').fail(res)
                }
                else {
                    const token = jwt.sign(
                        { username },
                        PRIVATE_KEY,
                        { expiresIn: JWT_EXPIRED}
                    )
                    new Result({ token }, '登录成功').success(res)
                }
            })
        }
    })

router.get('/info', function(req, res){
    const decoded = decode(req);
    if(decoded && decoded.username) {
        findUser(decoded.username).then(user => {
            if(user) {
                user.roles = [user.role];
                new Result(user, '获取用户信息成功').success(res)
            }
            else {
                new Result('获取用户信息失败').fail(res)
            }
        })
    }
})


module.exports = router;