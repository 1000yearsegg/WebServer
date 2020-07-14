const { env } = require('./env')
const UPLOAD_PATH = env === 'dev' ? 
    '/Users/apple/upload' :
    '/root/upload/admin-upload-ebook';

const UPLOAD_URL = env === 'dev' ? 
    'http://www.vueadmin.com:8089/admin-upload-ebook' :
    'https://www.vueadmin.com/admin-upload-ebook';

const OLD_UPLOAD_URL = env === 'dev' ? 
    'http://www.vueadmin.com:8089/book/res/img' :
    'https://www.vueadmin.com/book/res/img';

module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS: 0,
    debug: true,
    PWD_SALT: 'web_server',
    PRIVATE_KEY: 'web_server',
    JWT_EXPIRED: 60 * 60,
    CODE_TOKEN_EXPIRED: -2,
    UPLOAD_PATH, // 上传文件路径
    UPLOAD_URL, // 上传文件URL前缀
    MIME_TYPE_EPUB: 'application/epub+zip',
    UPDATE_TYPE_FROM_WEB: 1,
    OLD_UPLOAD_URL
}