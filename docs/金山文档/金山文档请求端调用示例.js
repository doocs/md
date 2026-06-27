var myHeaders = new Headers();
myHeaders.append("AirScript-Token", "{{token}}");
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
   "Context": {
      "argv": {
         "type": "createRecords",
         "sheetID": 1,
         "data": [
            {
               "fields": {
                  "订单编号": "22"
               }
            }
         ]
      }
   }
});

var requestOptions = {
   method: 'POST',
   headers: myHeaders,
   body: raw,
   redirect: 'follow'
};


// 接口需要换成你自己的云端 webhook 地址，地址在上面注释中有说明
fetch("https://www.kdocs.cn/api/v3/ide/file/ckrt2HRWXqsC/script/V2-MBxn0VXsIrsbaP47VJGXo/sync_task", requestOptions)
   .then(response => response.text())
   .then(result => console.log(result))
   .catch(error => console.log('error', error));