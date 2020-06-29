const { querySql, queryOne } = require('../db')
const db = require('../db')

function login(username, password) {
    const sql = `select * from admin_user where username='${username}' and password='${password}'`
    return querySql(sql)
}

function findUser(username) {
    const sql = `select * from admin_user where username='${username}'`
    return queryOne(sql)
}

/**
 * 获取用户列表
 * @param {*} query 
 */
async function listUser(query) {
    const {
        username,
        role,
        nickname,
        avatar,
        page = 1,
        pageSize = 10
    } = query;
    const offset = (page - 1) * pageSize;
    let userSql = 'select * from admin_user';
    let where = 'where';
    username && (where = db.andLike(where, 'username', username));
    role && (where = db.andLike(where, 'role', role));
    nickname && (where = db.andLike(where, 'nickname', nickname));

    if(where !== 'where') {
        userSql = `${userSql} ${where}`
    }

    let countSql = 'select count(*) as count from admin_user';
    if(where !== 'where') {
        countSql = `${countSql} ${where}`
    }

    userSql = `${userSql} limit ${pageSize} offset ${offset}`
    const count = await db.querySql(countSql);
    const list = await db.querySql(userSql);

    return {list, count: count[0].count, page, pageSize};
}

module.exports = {
    login, findUser, listUser
}