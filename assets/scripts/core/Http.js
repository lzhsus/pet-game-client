window.Http = {
    get: function (url) {
        return this.request('GET', url, null);
    },

    post: function (url, data) {
        return this.request('POST', url, data || {});
    },

    request: function (method, url, data) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            var apiConfig = window.ApiConfig || { baseUrl: '', token: '' };

            xhr.open(method, apiConfig.baseUrl + url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            if (apiConfig.token) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + apiConfig.token);
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var json = JSON.parse(xhr.responseText);
                        resolve(json);
                    } catch (error) {
                        reject(new Error('接口返回不是 JSON'));
                    }
                    return;
                }

                reject(new Error('HTTP 请求失败：' + xhr.status));
            };

            xhr.onerror = function () {
                reject(new Error('网络错误，请确认 PHP 服务已启动'));
            };

            xhr.send(data ? JSON.stringify(data) : null);
        });
    }
};
