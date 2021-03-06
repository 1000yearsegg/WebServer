const express = require('express')
const User = require('../models/User')
const Result = require('../models/Result.js')
const userService = require('../services/user')
const boom = require('boom')
const { login, findUser } = require('../services/user')
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const { md5, decode, PWD_SALT, millisecond2Date } = require('../utils')
const { PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
const multer = require('multer')
const { UPLOAD_PATH } = require('../utils/constant')

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
                try {
                    user.avatar = JSON.parse(user.avatar).url;
                } catch (error) {
                    console.log('获取当前用户头像失败', error);
                }
                
                new Result(user, '获取用户信息成功').success(res)
            }
            else {
                new Result('获取用户信息失败').fail(res)
            }
        })
    }
})

// 获取用户列表
router.get('/list', function(req, res, next) {
    userService.listUser(req.query).then(({list, count, page, pageSize}) => {
        new Result(
            list,
            '获取用户列表成功',
            {
                page: Number(page),
                pageSize: Number(pageSize),
                total: count || 0
            }).success(res)
    })
    .catch(err => {
        console.log('/user/list', err);
        next(boom.badImplementation(err));
    })
})

// 新增用户
router.post('/add', function(req, res, next) {
    req.body.password = md5(`${req.body.password}${PWD_SALT}`);
    const user = new User(req.body);
    userService.insertUser(user)
    .then(() => {
        new Result().success(res)
    })
    .catch(err => {
        console.log('/user/add', err);
        next(boom.badImplementation(err));
    })
})

// 编辑用户
router.put('/edit', function(req, res, next) {
    req.body.password = md5(`${req.body.password}${PWD_SALT}`);
    const user = new User(req.body);
    userService.updateUser(user)
    .then(() => {
        new Result().success(res)
    })
    .catch(err => {
        console.log('/user/edit', err);
        next(boom.badImplementation(err));
    })
})

// 获取用户
router.get('/get', function(req, res, next) {
    const { userName } = req.query;
    if(!userName) {
        next(boom.badRequest(new Error('参数userName不能为空')))
    }
    else {
        userService.getUser(userName).then(user => { new Result(user).success(res)
        }).catch(err => {
            console.log('/user/get', err);
            next(boom.badImplementation(err));
        })
    }
})

// 删除用户
router.get('/delete', function(req, res, next) {
    const { userName } = req.query;
    if(!userName) {
        next(boom.badRequest(new Error('参数userName不能为空')))
    }
    else {
        userService.deleteUser(userName).then(user => { new Result(null, '删除成功').success(res)
        }).catch(err => {
            console.log('/user/delete', err);
            next(boom.badImplementation(err));
        })
    }
})

// 上传头像
const storage = multer.diskStorage({
    destination: `${UPLOAD_PATH}/attachment/image/` + millisecond2Date(new Date().getTime(), 'YYYY_MM_DD'),
    filename(req,file,cb){
        var singfileArray = file.originalname.split('.'),
            fileExtension = singfileArray[singfileArray.length - 1];
        cb(null, singfileArray[0] + '_' + Date.now() + "." + fileExtension);
    }
  });

router.post(
    '/uploadAvatar',
    multer({
        storage
    }).single('file'),
    function(req, res, next) {
        if( !req.file || req.file.length === 0) {
            new Result(null, '上传头像失败').fail(res);
        }
        else {
            var imagePath = req.file.destination.substring(req.file.destination.indexOf('/image/') + 1) + '/' + req.file.filename;
            new Result({'path': req.file.destination + '/' + req.file.filename, 'url': 'http://10.100.44.29:8089/' + imagePath, 'name': req.file.filename }, '上传头像成功').success(res); 
            // new Result({'path': req.file.destination + '/' + req.file.filename, 'url': 'http://192.168.0.136:8089/' + imagePath, 'name': req.file.filename }, '上传头像成功').success(res);   
        }
    }
)

module.exports = router;