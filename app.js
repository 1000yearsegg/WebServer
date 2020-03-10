const express = require('express')

// 创建 express 应用
const app = express()

// 监听 / 路径的get请求
app.get('/', function(req, res){
    res.send('hello node')
})

// 使 express 监听 5000 端口号发起的http请求
const server = app.listen(5000, function () {
    const { address, port } = server.address()
    console.log('Http server is running on http://%s:%s', address, port)
})
