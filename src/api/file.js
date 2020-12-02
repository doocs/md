import fetch from "./fetch";
import { githubConfig, giteeConfig } from "./config";
import CryptoJS from "crypto-js";
import OSS from "ali-oss";
import COS from "cos-js-sdk-v5";
import Buffer from "buffer-from";
import { v4 as uuidv4 } from "uuid";
import * as qiniu from "qiniu-js";
import { utf16to8, base64encode, safe64 } from "../assets/scripts/tokenTools";

function getConfig(useDefault, platform) {
    const config = platform === "github" ? githubConfig : giteeConfig;
    if (useDefault) {
        const { username, repoList, branch, accessTokenList } = config;
        const tokenIndex = Math.floor(Math.random() * accessTokenList.length);
        const repoIndex = Math.floor(Math.random() * repoList.length);
        const accessToken = accessTokenList[tokenIndex].replace("doocsmd", "");
        const repo = repoList[repoIndex];
        return { username, repo, branch, accessToken };
    }
    const customConfig = JSON.parse(localStorage.getItem(`${platform}Config`));
    const repoUrl = customConfig.repo
        .replace(`https://${platform}.com/`, "")
        .replace(`http://${platform}.com/`, "")
        .replace(`${platform}.com/`, "")
        .split("/");
    return {
        username: repoUrl[0],
        repo: repoUrl[1],
        branch: customConfig.branch || "master",
        accessToken: customConfig.accessToken,
    };
}

function getDir() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}/${month}/${day}`;
}

function getDateFilename(filename) {
    const currentTimestamp = new Date().getTime();
    const fileSuffix = filename.split(".")[1];
    return `${currentTimestamp}-${uuidv4()}.${fileSuffix}`;
}

//-----------------------------------------------------------------------
// GitHub File Upload
//-----------------------------------------------------------------------

async function ghFileUpload(content, filename) {
    const useDefault = localStorage.getItem("imgHost") === "default";
    const { username, repo, branch, accessToken } = getConfig(
        useDefault,
        "github"
    );
    const dir = getDir();
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${dir}/`;
    const dateFilename = getDateFilename(filename);
    const res = await fetch({
        url: url + dateFilename,
        method: "put",
        headers: {
            Authorization: `token ${accessToken}`,
        },
        data: {
            content,
            branch,
            message: `Upload by ${window.location.href}`,
        },
    });

    const githubResourceUrl = `raw.githubusercontent.com/${username}/${repo}/${branch}/`;
    const cdnResourceUrl = `cdn.jsdelivr.net/gh/${username}/${repo}@${branch}/`;
    return useDefault
        ? res.content.download_url.replace(githubResourceUrl, cdnResourceUrl)
        : res.content.download_url;
}

//-----------------------------------------------------------------------
// Gitee File Upload
//-----------------------------------------------------------------------

async function giteeUpload(content, filename) {
    const useDefault = localStorage.getItem("imgHost") === "default";
    const { username, repo, branch, accessToken } = getConfig(
        useDefault,
        "gitee"
    );
    const dir = getDir();
    const dateFilename = getDateFilename(filename);
    const url = `https://gitee.com/api/v5/repos/${username}/${repo}/contents/${dir}/${dateFilename}`;
    const res = await fetch({
        url,
        method: "POST",
        data: {
            content,
            branch,
            access_token: accessToken,
            message: `Upload by ${window.location.href}`,
        },
    });
    return encodeURI(res.content.download_url);
}

//-----------------------------------------------------------------------
// Qiniu File Upload
//-----------------------------------------------------------------------

function getQiniuToken(accessKey, secretKey, putPolicy) {
    const policy = JSON.stringify(putPolicy);
    const encoded = base64encode(utf16to8(policy));
    const hash = CryptoJS.HmacSHA1(encoded, secretKey);
    const encodedSigned = hash.toString(CryptoJS.enc.Base64);
    return `${accessKey}:${safe64(encodedSigned)}:${encoded}`;
}

async function qiniuUpload(file) {
    const { accessKey, secretKey, bucket, region, path, domain } = JSON.parse(
        localStorage.getItem("qiniuConfig")
    );
    const token = getQiniuToken(accessKey, secretKey, {
        scope: bucket,
        deadline: Math.trunc(new Date().getTime() / 1000) + 3600,
    });
    const dir = path ? `${path}/` : "";
    const dateFilename = dir + getDateFilename(file.name);
    const config = {
        region,
    };
    const observable = qiniu.upload(file, dateFilename, token, {}, config);
    return new Promise((resolve, reject) => {
        observable.subscribe({
            next: (result) => {
                console.log(result);
            },
            error: (err) => {
                reject(err.message);
            },
            complete: (result) => {
                resolve(`${domain}/${result.key}`);
            },
        });
    });
}

//-----------------------------------------------------------------------
// AliOSS File Upload
//-----------------------------------------------------------------------

async function aliOSSFileUpload(content, filename) {
    const dateFilename = getDateFilename(filename);
    const {
        region,
        bucket,
        accessKeyId,
        accessKeySecret,
        cdnHost,
        path,
    } = JSON.parse(localStorage.getItem("aliOSSConfig"));
    const buffer = Buffer(content, "base64");
    const dir = `${path}/${dateFilename}`;
    const client = new OSS({
        region,
        bucket,
        accessKeyId,
        accessKeySecret,
    });
    try {
        const res = await client.put(dir, buffer);
        if (cdnHost == "") return res.url;
        return `${cdnHost}/${path == "" ? dateFilename : dir}`;
    } catch (e) {
        return Promise.reject(e);
    }
}

//-----------------------------------------------------------------------
// TxCOS File Upload
//-----------------------------------------------------------------------

async function txCOSFileUpload(file) {
    const dateFilename = getDateFilename(file.name);
    const { secretId, secretKey, bucket, region, path, cdnHost } = JSON.parse(
        localStorage.getItem("txCOSConfig")
    );
    const cos = new COS({
        SecretId: secretId,
        SecretKey: secretKey,
    });
    return new Promise((resolve, reject) => {
        cos.putObject(
            {
                Bucket: bucket,
                Region: region,
                Key: `${path}/${dateFilename}`,
                Body: file,
            },
            function (err, data) {
                if (err) {
                    reject(err);
                } else if (cdnHost) {
                    resolve(
                        path == ""
                            ? `${cdnHost}/${dateFilename}`
                            : `${cdnHost}/${path}/${dateFilename}`
                    );
                } else {
                    resolve(`https://${data.Location}`);
                }
            }
        );
    });
}

function fileUpload(content, file) {
    const imgHost = localStorage.getItem("imgHost");
    !imgHost && localStorage.setItem("imgHost", "default");
    switch (imgHost) {
        case "aliOSS":
            return aliOSSFileUpload(content, file.name);
        case "txCOS":
            return txCOSFileUpload(file);
        case "qiniu":
            return qiniuUpload(file);
        case "gitee":
            return giteeUpload(content, file.name);
        case "github":
            return ghFileUpload(content, file.name);
        default:
            // return file.size / 1024 < 1024
            //     ? giteeUpload(content, file.name)
            //     : ghFileUpload(content, file.name);
            return ghFileUpload(content, file.name);
    }
}

export default {
    fileUpload,
};
