const Book = require('../models/Book')
const db = require('../db')
const { debug } = require('../utils/constant')

/**
 * 获取图书列表
 * @param {[object]} query 请求参数
 */
async function listBook(query) {
    debug && console.log(query)
    const {
        category,
        author,
        title,
        sort,
        page = 1,
        pageSize = 20
    } = query
    const offset = (page - 1) * pageSize
    let bookSql = 'select * from book'
    let where = 'where'
    title && (where = db.andLike(where, 'title', title))
    author && (where = db.andLike(where, 'author', author))
    category && (where = db.and(where, 'categoryText', category))
    if (where !== 'where') {
        bookSql = `${bookSql} ${where}`
    }
    if (sort) {
        const symbol = sort[0]
        const column = sort.slice(1, sort.length)
        const order = symbol === '+' ? 'asc' : 'desc'
        bookSql = `${bookSql} order by \`${column}\` ${order}`
    }
    let countSql = `select count(*) as count from book`
    if (where !== 'where') {
        countSql = `${countSql} ${where}`
    }
    const count = await db.querySql(countSql)
    bookSql = `${bookSql} limit ${pageSize} offset ${offset}`
    const list = await db.querySql(bookSql)
    list.forEach(book => book.cover = Book.genCoverUrl(book))
    return { list, count: count[0].count, page, pageSize }
}

/**
 * 获取图书分类
 */
async function getCategory() {
    const sql = 'select * from category order by category asc'
    const result = await db.querySql(sql)
    const categoryList = []
    result.forEach(item => {
        categoryList.push({
            label: item.categoryText,
            value: item.category,
            num: item.num
        })
    })
    return categoryList
}

/**
 * 图书是否存在
 * @param {} book 
 */
function exists(book) {
    const { title, author, publisher } = book
    const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`
    return db.queryOne(sql)
}

/**
 * 新增图书
 * @param {*} book 
 */
function insertBook(book) {
    return new Promise(async (resolve, reject) => {
        try {
            if (book instanceof Book) {
                const result = await exists(book)
                if (result) {
                    await removeBook(book)
                    reject(new Error('电子书已存在'))
                } else {
                    await db.insert(book.toDb(), 'book')
                    await insertContents(book)
                    resolve()
                }
            } else {
                reject(new Error('添加的图书对象不合法'))
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * 新增图书内容
 * @param {*} book 
 */
async function insertContents(book) {
    let contents = book.getContents()
    if (!contents) {
        const newBook = await book.parse()
        contents = newBook.getContents()
    }
    if (contents && contents.length > 0) {
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i]
            const _content = _.pick(content, [
                'fileName',
                'id',
                'href',
                'order',
                'level',
                'text',
                'label',
                'pid',
                'navId'
            ])
            await db.insert(_content, 'contents')
        }
    }
}

/**
 * 移除图书
 * @param {{object}} book  
 */
async function removeBook(book) {
    if (book) {
        book.reset()
        if (book.fileName) {
            const removeBookSql = `delete from book where fileName='${book.fileName}'`
            const removeContentsSql = `delete from contents where fileName='${book.fileName}'`
            await db.querySql(removeBookSql)
            await db.querySql(removeContentsSql)
        }
    }
}

/**
 * 获得图书的信息
 * @param {[string]} fileName 文件名
 */
async function getBook(fileName) {
    const bookSql = `select * from book where fileName='${fileName}'`
    const contentsSql = `select * from contents where fileName='${fileName}' order by \`order\` asc`
    const book = await db.queryOne(bookSql)
    const contents = await db.querySql(contentsSql)
    if (book) {
        book.cover = Book.genCoverUrl(book)
        book.contents = contents
        book.contentsTree = []
        contents.forEach(_ => _.children = [])
        contents.forEach(c => {
            if (c.pid === '') {
                book.contentsTree.push(c)
            } else {
                const parent = contents.find(_ => _.navId === c.pid)
                parent.children.push(c)
            }
        }) // 将目录转化为树状结构
        return book
    } else {
        throw new Error('电子书不存在')
    }
}

/**
 * 更新图书信息
 * @param {{object}} book 图书对象
 */
function updateBook(book) {
    return new Promise(async (resolve, reject) => {
        try {
            if (book instanceof Book) {
                const result = await getBook(book.fileName)
                if (result) {
                    const model = book.toDb()
                    if (Number(result.updateType) === 0) {
                        reject(new Error('默认图书不能编辑'))
                    } else {
                        delete model.createDt // 创建时间不能更新
                        if (result.createUser !== book.createUser) {
                            reject(new Error('只有创建人才能编辑'))
                        } else {
                            await db.update(model, 'book', `where fileName='${book.fileName}'`)
                            resolve()
                        }
                    }
                } else {
                    reject(new Error('电子书不存在'))
                }
            } else {
                reject(new Error('添加的图书对象不合法'))
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * 删除图书
 * @param {{string}} fileName 书名
 */
function deleteBook(fileName) {
    return new Promise(async (resolve, reject) => {
        try {
            let book = await getBook(fileName)
            if (book) {
                if (Number(book.updateType) === 0) {
                    reject(new Error('默认电子书不能删除'))
                } else {
                    const bookObj = new Book(null, book)
                    const sql = `DELETE FROM book WHERE fileName='${fileName}'`
                    db.querySql(sql).then(() => {
                        bookObj.reset()
                        resolve()
                    })
                }
            } else {
                reject(new Error('电子书不存在'))
            }
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    listBook,
    getCategory,
    insertBook,
    getBook,
    updateBook,
    deleteBook
}