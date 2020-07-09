
class User {
    constructor (data) {
        this.createUserFromData(data)
    }

    createUserFromData(data) {
        console.log('data----', data);
        this.username = data.username;
        this.password = data.password;
        this.role = data.role;
        this.nickname = data.nickname;
        this.avatar = data.avatar;
    }

    toDb() {
        return {
            username: this.username,
            password: this.password,
            role: this.role,
            nickname: this.nickname,
            avatar: this.avatar
        }
    }
}

module.exports = User