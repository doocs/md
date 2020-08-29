import fetch from './fetch';
import { v4 as uuidv4 } from 'uuid';
const fileUploadConfig = {
    username: 'filess',
    repo: 'images',
    access_tokens: [
        'cc16734fc2d92c5b6d90155f0da9b5c43701b386',
        'f5c1b69cac9e2d53213adb1adda927ae7b3ca762',
        '5533628a92d69d2271d6d1fdd5a9170c7de65bc8',
        '7dc129821137b52d9fb897ba4a96d16224b63845',
        '90669202e6277399ec0ea81649953b8f60793c6a',
        'a1900917f80c8c1b2ad73327e7c35b47106025dd'
    ]
}


function fileUpload(content, fileName) {
    const date = new Date();
    const dir = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    const uuid = uuidv4(); 
    const token = fileUploadConfig.access_tokens[Math.round(fileUploadConfig.access_tokens.length * Math.random())];
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