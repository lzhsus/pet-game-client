window.UserManager = {
    user: null,

    login: function () {
        var self = this;

        return window.Http.post('/api/login', {}).then(function (res) {
            if (!res || res.code !== 0) {
                throw new Error((res && res.message) || '登录失败');
            }

            window.ApiConfig.token = res.data.token || '';
            self.user = res.data.user;

            return self.user;
        });
    },

    getInfo: function () {
        var self = this;

        return window.Http.get('/api/user/info').then(function (res) {
            if (!res || res.code !== 0) {
                throw new Error((res && res.message) || '获取用户信息失败');
            }

            self.user = res.data.user;
            return self.user;
        });
    },

    updateUser: function (user) {
        this.user = user;
    }
};
