const express = require('express')
const Result = require('../models/Result.js')
const bookService = require('../services/book')
const Book = require('../models/Book')
const boom = require('boom')
const { decode } = require('../utils')

const router = express.Router()

// 获取图书列表
router.get('/list', function (req, res, next) {
    bookService.listBook(req.query)
        .then(({ list, count, page, pageSize }) => {
            new Result(
                list,
                '获取图书列表成功',
                {
                    page: Number(page),
                    pageSize: Number(pageSize),
                    total: count || 0
                }
            ).success(res)
        })
        .catch(err => {
            console.log('/book/list', err)
            next(boom.badImplementation(err))
        })
})

// 获取图书分类
router.get('/category', function (req, res, next) {
    bookService.getCategory().then(category => {
        new Result(category).success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

// 新增图书
router.post(
    '/create',
    function (req, res, next) {
        const decoded = decode(req)
        if (decoded && decoded.username) {
            req.body.username = decoded.username
        }
        const book = new Book(null, req.body)
        bookService.insertBook(book)
            .then(() => {
                new Result().success(res)
            })
            .catch(err => {
                console.log('/book/create', err)
                next(boom.badImplementation(err))
            })
    }
)

// 获取一本图书
router.get('/get', function (req, res, next) {
    const { fileName } = req.query
    if (!fileName) {
        next(boom.badRequest(new Error('参数fileName不能为空')))
    } else {
        bookService.getBook(fileName)
            .then(book => {
                new Result(book).success(res)
            })
            .catch(err => {
                console.log('/book/get', err)
                next(boom.badImplementation(err))
            })
    }
})

// 更新图书信息
router.post(
    '/update',
    function (req, res, next) {
        const decoded = decode(req)
        if (decoded && decoded.username) {
            req.body.username = decoded.username
        }
        const book = new Book(null, req.body)
        bookService.updateBook(book)
            .then(() => {
                new Result(null, '更新成功').success(res)
            })
            .catch(err => {
                next(boom.badImplementation(err))
            })
    }
)

// 删除图书
router.get('/delete', function (req, res, next) {
    const { fileName } = req.query
    if (!fileName) {
        next(boom.badRequest(new Error('参数fileName不能为空')))
    } else {
        bookService.deleteBook(fileName)
            .then(() => {
                new Result(null, '删除成功').success(res)
            })
            .catch(err => {
                console.log('/book/delete', err)
                next(boom.badImplementation(err))
            })
    }
})



module.exports = router;