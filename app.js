const express = require('express')
const router = require('./router')
const cors = require('cors')
const bodyParser = require('body-parser')

// 创建 express 应用
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// 允许跨域请求，必须放在use router前
app.use(cors())

// 监听 / 路径的get请求
app.use('/', router)

// 使 express 监听 9000 端口号发起的http请求
const server = app.listen(9000, function () {
    const { address, port } = server.address()
    console.log('Http server is running on http://%s:%s', address, port)
})
// const server = app.listen(9999, function () {
//     const { address, port } = server.address()
//     console.log('Http server is running on http://%s:%s', address, port)
// })
