import axios from 'axios';

// 创建axios实例
const service = axios.create({
    baseURL: '',
    timeout: 10 * 1000 // 请求超时时间
});

service.interceptors.request.use(
    config => {
        if (/^(post)|(put)|(delete)$/i.test(config.method)) {
            if (config.data && config.data.upload) {
                config.headers['Content-Type'] = 'multipart/form-data';
            }
        }
        return config;
    }, error => {
        Promise.reject(error);
    }
);

service.interceptors.response.use(res => {
    if (res.data.success) {
        return res.data;
    } else {
        console.log(res);
    }
    return Promise.reject(res.data);
}, error => Promise.reject(error));

export default service;