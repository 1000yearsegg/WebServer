const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('./constant')

function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]'
  }

function decode(req) {
    const authorization = req.get('Authorization')
    let token = '';
    if (authorization.indexOf('Bearer') >= 0) {
        token = authorization.replace('Bearer ', '');
    }
    else {
        token = authorization;
    }
    return jwt.verify(token, PRIVATE_KEY);
}

function md5(s) {
    return crypto.createHash('md5').update(String(s)).digest('hex');
}

function millisecond2Date(millisecond, format) {
    var millisecondInt = parseInt(millisecond);
    if (!isNaN(millisecondInt)) {
        var millisecondLen = millisecondInt.toString().length;
        if (millisecondLen === 10) {
            millisecondInt = millisecondInt * 1000;
        }
        if (millisecondLen !== 10 && millisecondLen !== 13) {
            return millisecond;
        }
        var date = new Date(millisecondInt);
        var map = {
            'M': date.getMonth() + 1, // 月份
            'D': date.getDate(), // 日
            'W': date.getDay(), // 星期几
            'h': date.getHours(), // 小时
            'm': date.getMinutes(), // 分
            's': date.getSeconds(), // 秒
            'q': Math.floor((date.getMonth() + 3) / 3), // 季度
            'S': date.getMilliseconds() // 毫秒
        };
        format = format.replace(/([YMDhmsqSW])+/g, function(all, t) {
            var v = map[t];
            if (v !== undefined) {
                if (all.length > 1) {
                    v = '0' + v;
                    v = v.substr(v.length - 2);
                }
                // 如果是星期格式
                if (t === 'W') {
                    var weekArray = new Array("日", "一", "二", "三", "四", "五", "六"),
                        week = weekArray[date.getDay()];
                    v = week;
                }
                return v;
            } else if (t === 'Y') {
                return (date.getFullYear() + '').substr(4 - all.length);
            }

            return all;
        });
        return format;
    } else {
        return millisecond;
    }
};

module.exports = {
    md5,decode,isObject,millisecond2Date
}