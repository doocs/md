import fetch from './fetch';
import store from '../store/index';
import {
    v4 as uuidv4
} from 'uuid';

function fileUpload(content, filename) {
    const fileUploadType = store.state.imgHost;
    const activeKey = fileUploadType !== 'default' && localStorage.getItem(`${fileUploadType}Config`)
        ? fileUploadType : 'default';

    switch (activeKey) {
        case 'aliOSS':
            return aliOSSUploadFile(content, filename);
        case 'default':
            return githubUploadFile(content, filename);
        case 'github':
            return githubUploadFile(content, filename);
        default:
            break;
    }
}

/**
 * github 图片上传
 * @param {*} content 
 * @param {*} filename 
 */
function githubUploadFile(content, filename) {
    const githubResourceUrl = 'raw.githubusercontent.com/filess/images/master/';
    const cdnResourceUrl = 'cdn.jsdelivr.net/gh/filess/images/';
    const {
        method,
        headers,
        url
    } = store.getters['imageApi/config'];
    const dateFilename = new Date().getTime() + '-' + uuidv4() + '.' + filename.split('.')[1];
    const uploadUrl = url + dateFilename;

    return fetch({
        url: uploadUrl,
        method,
        headers,
        data: {
            message: 'Upload image by https://doocs.github.io/md',
            content: content
        }
    }).then(res=> {
        const imageUrl = res.content.download_url.replace(githubResourceUrl, cdnResourceUrl);

        return imageUrl;
    });
}

function aliOSSUploadFile(content, filename) {
    debugger;
    const config = store.getters['imageApi/config'];
    const dateFilename = new Date().getTime() + '-' + uuidv4() + '.' + filename.split('.')[1];
    const dir = config.dir + '/' + dateFilename;
    const Buffer = require('buffer-from')
    const buffer = Buffer(content, 'base64');
    const OSS = require('ali-oss');
    try {
        const client = new OSS(config);

        return client.put(dir, buffer).then(res=> {
            console.log('aliOSSUoladFile', res);
            return res.url;
        })
    } catch (e) {
        return Promise.reject(e);
    }
}

export default {
    fileUpload
};
