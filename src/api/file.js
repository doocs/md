import fetch from './fetch';
import OSS from 'ali-oss';
import COS from 'cos-js-sdk-v5';
import Buffer from 'buffer-from';
import {
    v4 as uuidv4
} from 'uuid';

const defaultConfig = {
    username: 'filess',
    repo: 'images',
    branch: 'master',
    accessToken: [
        '7715d7ca67b5d3837cfdoocsmde8c38421815aa423510af',
        'c411415bf95dbe39625doocsmd5047ba9b7a2a6c9642abe',
        '2821cd8819fa345c053doocsmdca86ac653f8bc20db1f1b',
        '445f0dae46ef1f2a4d6doocsmdc797301e94797b4750a4c',
        'cc1d0c1426d0fd0902bdoocsmdd2d7184b14da61b86ec46',
        'b67e9d15cb6f910492fdoocsmdac6b44d379c953bb19eff',
        '618c4dc2244ccbbc088doocsmd125d17fd31b7d06a50cf3',
        'a4b581732e1c1507458doocsmdc5b223b27dae5e2e16a55'
    ]
}

function fileUpload(content, file) {
    const imgHost = localStorage.getItem('imgHost');
    !imgHost && localStorage.setItem('imgHost', 'default');
    switch (imgHost) {
        case 'aliOSS':
            return aliOSSFileUpload(content, file.name);
        case 'txCOS':
            return txCOSFileUpload(file);        
        case 'github':
        default:
            return ghFileUpload(content, file.name);
    }
}

function getGitHubCommonConfig(username, repo, branch, token) {
    const date = new Date();
    const dir = date.getFullYear() + '/' + (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getDate().toString().padStart(2, '0');
    return {
        method: 'put',
        headers: {
            'Authorization': 'token ' + token
        },
        branch: branch,
        url: `https://api.github.com/repos/${username}/${repo}/contents/${dir}/`
    };
}

function getDefaultConfig() {
    const token = defaultConfig.accessToken[Math.floor(Math.random() * defaultConfig.accessToken.length)].replace('doocsmd', '');
    return getGitHubCommonConfig(defaultConfig.username, defaultConfig.repo, defaultConfig.branch, token);
}

function getGitHubConfig() {
    const githubConfig = JSON.parse(localStorage.getItem("githubConfig"));
    const repoUrl = githubConfig.repo.replace("https://github.com/", "").replace("http://github.com/", "").replace("github.com/", "").split("/");
    const username = repoUrl[0];
    const repo = repoUrl[1];
    return getGitHubCommonConfig(username, repo, githubConfig.branch, githubConfig.accessToken);
}

async function ghFileUpload(content, filename) {
    const isDefault = localStorage.getItem('imgHost') !== 'github';
    const config = isDefault ? getDefaultConfig() : getGitHubConfig();
    const dateFilename = new Date().getTime() + '-' + uuidv4() + '.' + filename.split('.')[1];
    const res = await fetch({
        url: config.url + dateFilename,
        method: config.method,
        headers: config.headers,
        data: {
            branch: config.branch || 'master',
            message: `Upload by ${window.location.href}`,
            content: content
        }
    });
    const githubResourceUrl = 'raw.githubusercontent.com/filess/images/master/';
    const cdnResourceUrl = 'cdn.jsdelivr.net/gh/filess/images/';
    return isDefault ? res.content.download_url.replace(githubResourceUrl, cdnResourceUrl) : res.content.download_url;
    
}

async function aliOSSFileUpload(content, filename) {
    const dateFilename = new Date().getTime() + '-' + uuidv4() + '.' + filename.split('.')[1];
    const aliOSSConfig = JSON.parse(localStorage.getItem('aliOSSConfig'));
    const buffer = Buffer(content, 'base64');
    try {
        const dir = aliOSSConfig.path + '/' + dateFilename;
        const client = new OSS({
            region: aliOSSConfig.region,
            bucket: aliOSSConfig.bucket,
            accessKeyId: aliOSSConfig.accessKeyId,
            accessKeySecret: aliOSSConfig.accessKeySecret
        });
        const res = await client.put(dir, buffer);
        return res.url;
    } catch (e) {
        return Promise.reject(e);
    }
}

async function txCOSFileUpload(file) {
    const dateFilename = new Date().getTime() + '-' + uuidv4() + '.' + file.name.split('.')[1];
    const txCOSConfig = JSON.parse(localStorage.getItem('txCOSConfig'));
    const cos = new COS({
        SecretId: txCOSConfig.secretId,
        SecretKey: txCOSConfig.secretKey
    });
    return new Promise((resolve, reject) => {
        cos.putObject({
            Bucket: txCOSConfig.bucket,
            Region: txCOSConfig.region,
            Key: txCOSConfig.path + '/' + dateFilename,
            Body: file
        }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve("https://" + data.Location);
            }
        });
    })
}

export default {
    fileUpload
};
