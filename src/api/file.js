import fetch from './fetch';


function fileUpload(data) {
    return fetch({
        url: 'https://imgkr.com/api/files/upload',
        method: 'post',
        data: data
    })
}


export default {
    fileUpload
};