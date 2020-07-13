import fileApi from '../../api/file';

export function uploadImgFile(file) {
    return new Promise((resolve, reject)=> {
        const checkImageResult = isImageIllegal(file);

        if (checkImageResult) {
            reject(checkImageResult);
        } else {
            let fd = new FormData();
    
            fd.append('file', file);
            fileApi.fileUpload(fd).then(res => {
                resolve(res);
            }).catch(err => {
                console.log(err.message)
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