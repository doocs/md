import fileApi from '../../api/file';

export function uploadImgFile(file) {
    return new Promise((resolve, reject) => {
        const checkImageResult = isImageIllegal(file);

        if (checkImageResult) {
            reject(checkImageResult);
            return;
        }
        const base64Reader = new FileReader();

        base64Reader.readAsDataURL(file);
        base64Reader.onload = function () {
            const base64Content = this.result.split(',').pop();
            fileApi.fileUpload(base64Content, file).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        };
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
