const state = {
    imgHost: localStorage.getItem("ImgHost") || 'default', // 默认github
    default: {
        username: 'filess',
        repo: 'images',
        method: 'put',
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
    },
    aliOSS: {
        bucket: '<Your BucketName>',
        // region以杭州为例（oss-cn-hangzhou），其他region按实际情况填写。
        region: '<Your Region>',
        // 阿里云主账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM账号进行API访问或日常运维，请登录RAM控制台创建RAM账号。
        accessKeyId: '<Your AccessKeyId>',
        accessKeySecret: '<Your AccessKeySecret>',
    },
    qiniuCloud: {}
};
const getters = {
    config(state) {
        const date = new Date();
        const dir = date.getFullYear() + '/' + (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getDate().toString().padStart(2, '0');
        const activeKey = state.imgHost !== 'default' && localStorage.getItem(`${state.imgHost}Config`) ? state.imgHost : 'default';

        switch (activeKey) {
            case 'aliOSS':
                return {
                    ...state.aliOSS,
                    dir
                };
            case 'qiniuCloud':
                return {
                };
            case 'github':
                const githubConfig = JSON.parse(localStorage.getItem("githubConfig"));
                const repoUrl = githubConfig.repo.replace("https://github.com/", "").replace("http://github.com/", "").replace("github.com/", "").split("/");
                const username = repoUrl[0];
                const repo = repoUrl[1];

                return {
                    method: 'put',
                    headers: {
                        'Authorization': 'token ' + githubConfig.accessToken
                    },
                    url: `https://api.github.com/repos/${username}/${repo}/contents/${dir}/`
                };
            default:
                const token = state.default.accessToken[Math.floor(Math.random() * state.default.accessToken.length)].replace('doocsmd', '');

                return {
                    method: state.default.method,
                    headers: {
                        'Authorization': 'token ' + token
                    },
                    url: `https://api.github.com/repos/${state.default.username}/${state.default.repo}/contents/${dir}/`
                };
        }
    }
};

export default {
    namespaced: true,
    state,
    getters
}