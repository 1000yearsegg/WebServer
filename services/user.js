const User = require('../models/User')
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

/**
 * 用户是否存在
 * @param {*} user 
 */
function exists(user) {
    const { username } = user;
    const sql = `select * from admin_user where username='${username}'`;
    return db.queryOne(sql);
}

/**
 * 新增用户
 * @param {*} user
 */
function insertUser(user) {
    return new Promise(async (resolve, reject) => {
        try {
            if(user instanceof User) {
                const result = await exists(user);
                console.log("insertUser -> result", result)
                if (result) {
                    // await removeUser(user);
                    reject(new Error('用户已存在'));
                }
                else {
                    console.log("insertUser -> user.toDb()", user.toDb())
                    await db.insert(user.toDb(), 'admin_user')
                    resolve();
                }
            }
        } catch (error) {
            console.log('error----', error);
            reject(new Error('添加的用户对象不合法'))
        }
    })
}

/**
 * 编辑用户
 * @param {[object]} user 
 */
function updateUser(user) {
    return new Promise(async (resolve, reject) => {
        try {
            if(user instanceof User) {
                const result = await getUser(user.username);
                if(result) {
                    const model = user.toDb();

                    await db.update(model, 'admin_user', `where username='${user.username}'`);
                    resolve();
                }
                else {
                    reject(new Error('用户不存在'))
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

/**
 * 根据用户名获得用户
 * @param {{string}} userName 
 */
async function getUser(userName) {
    const userSql = `select * from admin_user where username='${userName}'`;
    const user = await db.queryOne(userSql);

    if(user) {
        user.password = '';
        return user;
    }
    else {
        throw new Error('用户不存在')
    }
}

/**
 * 移除用户
 * @param {[object]} user 
 */
async function removeUser(user) {
    if(user) {
        if(user.username) {
            const removeUserSql = `delete from admin_user where username='${user.username}'`;
            await db.querySql(removeUserSql);
        }
    }
}

/**
 * 删除用户
 * @param {[string]} userName 
 */
function deleteUser(userName) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await getUser(userName);
            if(user) {
                const userObj = new User(user);
                const sql = `DELETE FROM admin_user where username='${userName}'`;
                db.querySql(sql).then(() => {
                    userObj,
                    resolve()
                })
            }
            else {
                reject(new Error('用户不存在'))
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    login, findUser, listUser, insertUser, removeUser, getUser, updateUser, deleteUser
}