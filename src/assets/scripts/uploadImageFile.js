import fileApi from '../../api/file';
const githubResourceUrl = 'raw.githubusercontent.com/filess/images/master/';
const cdnResourceUrl = 'cdn.jsdelivr.net/gh/filess/images/';

export function uploadImgFile(file) {

    return new Promise((resolve, reject) => {
        const checkImageResult = isImageIllegal(file);
        if (checkImageResult) {
            reject(checkImageResult);
            return;
        }
        const imgFile = new FileReader();
        imgFile.readAsDataURL(file);

        imgFile.onload = function () {
            const base64Content = this.result.split(',').pop();

            fileApi.fileUpload(base64Content, file.name).then(res => {
                const imageUrl = res.content.download_url.replace(githubResourceUrl, cdnResourceUrl);
                resolve(imageUrl);
            }).catch(err => {
                reject(err.message)
            })
        }
    });
}

export function isImageIllegal(file) {
    if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name)) {
        return '请上传 JPG/PNG/GIF 格式的图片';
    }
    if (file.size > 5 * 1024 * 1024) {
        return '由于公众号限制，图片大小不能超过 5.0M';
    }
    return false;
}
