import fetch from './fetch';
import store from '../store/index';
import {
    v4 as uuidv4
} from 'uuid';

function fileUpload(content, filename) {
    const {
        method,
        token,
        url
    } = store.getters['imageApi/config'];
    const uuid = uuidv4();
    const dateFilename = new Date().getTime() + '-' + uuid + '.' + filename.split('.')[1];
    const uploadUrl = url + dateFilename;

    return fetch({
        url: uploadUrl,
        method,
        headers: {
            'Authorization': 'token ' + token
        },
        data: {
            message: 'Upload image by https://doocs.github.io/md',
            content: content
        }
    })
}


export default {
    fileUpload
};
