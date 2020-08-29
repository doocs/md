import fetch from './fetch';
import { v4 as uuidv4 } from 'uuid';
const fileUploadConfig = {
    username: 'filess',
    repo: 'images',
    access_tokens: [
        'c849e371c79eb9f6d9ebcf28983227bed284d92d',
        'a447236ffceb656eaab4b0fb6367851f8e5e1e93',
        '12adcf31e54a8b3710a52de2ac46f3d42f57ce22',
        '8187af6fd468bdaa852972be1a864ce6e6a592e7',
        '6412beee93f641b709fcfc3d6b6b8b96a0a7a81c',
        '6fec856c7462b63a2a2148f7b25fe2c333a42225'
    ]
}


function fileUpload(content, fileName) {
    const date = new Date();
    const dir = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    const uuid = uuidv4(); 
    const token = fileUploadConfig.access_tokens[Math.round(6 * Math.random())];
    const dateFilename = new Date().getTime() + '-' + uuid + '.' + fileName.split('.')[1];
    const url = `https://api.github.com/repos/${fileUploadConfig.username}/${fileUploadConfig.repo}/contents/${dir}/${dateFilename}?access_token=${token}`;

    return fetch({
        url,
        method: 'put',
        headers: {
            'Authorization': 'token ' + token
        },
        data: {
            message: 'Upload image by https://github.com/doocs/md',
            content: content
        }
    })
}


export default {
    fileUpload
};