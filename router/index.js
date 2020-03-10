const express = require('express')
const boom = require('boom')
const userRouter = require('./user')
const {
    CODE_ERROR
} = require('../utils/constant')

// 注册路由
const router = express.Router()

router.get('/', function(req, res) {
    res.send('这是WebServer服务器')
})

// 通过userRouter来处理 /user 路由，对路由处理进行解耦
router.use('/user', userRouter)

// 集中处理404请求的中间件，放在正常处理流程之后否则会拦截正常请求
router.use((req, res, next) => {
    next(boom.notFound('接口不存在'))
})

// 自定义路由异常处理中间件，方法参数不能减少，方法必须放在路由最后
router.use((err, req, res, next) => {
    const msg = (err && err.message) || '系统错误'
    const statusCode = (err.output && err.output.statusCode) || 500
    const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message
    res.status(statusCode).json({
        code: CODE_ERROR,
        msg,
        error: statusCode,
        errorMsg
    })
})

module.exports = router

