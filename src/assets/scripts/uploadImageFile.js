import fileApi from "../../api/file";

export function uploadImgFile(file) {
    return new Promise((resolve, reject) => {
        const base64Reader = new FileReader();
        base64Reader.readAsDataURL(file);
        base64Reader.onload = function () {
            const base64Content = this.result.split(",").pop();
            fileApi
                .fileUpload(base64Content, file)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        };
    });
}