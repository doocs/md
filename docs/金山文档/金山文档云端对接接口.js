/** 
云端 webhook 地址：https://www.kdocs.cn/api/v3/ide/file/csgbbXAoJgsU/script/V2-1pOgfYHUM3Jga7Fiaty27R/sync_task

注：使用前 ，请先到金山文档多维表格-脚本管理器，新建脚本并启用相关云服务，并且初始化运行一次授权云服务运行。

案例数据表的信息：view {"sheetId":8,"viewId":"E","name":"案例数据总台账","type":"Grid"}
**/

// ================== 以下是输入参数 =================

// 指令类型
let type = Context.argv.type
// 行ID
let recordID = Context.argv.recordID
// 表ID
let sheetID = Context.argv.sheetID
// 行所在的链接
let recordURL = Context.argv.recordURL
// 行号
let recordNum = Context.argv.recordNum

// 传入的字段数据内容
let data = Context.argv.data

// 临时测试参数
// let attachmentURL = Context.argv.attachmentURL || 'https://cdn.lawyerch.cn/public/screenshot_1745542949273.jpeg'
// let saveFieldName = Context.argv.saveFieldName || '附件'
// let fileName = Context.argv.fileName || '测试.jpg'
// ================== 以上是输入参数 =================




/**
 * 延迟函数
 * @param {Number} ms 延迟的毫秒数
 */
function sleep(ms) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    // 空循环等待
  }
}


/**
 * 更新函数
 * @param {Number} sheetID 表ID
 * @param {Array} data 更新的字段数据，包含了行ID
 * @returns {object} 返回值
 */
function updateRecords(sheetID, data) {

  const records = Application.Record.UpdateRecords({
    SheetId: sheetID,
    Records: data
  })
  console.log(records)

  return {
    code: 200,
    msg: "更新内容成功.如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: records
  }

}


/**
 * 新增函数
 * @param {Number} sheetID 表ID
 * @param {Array} data 更新的字段数据，包含了行ID
 * @returns {object} 返回值
 */
function createRecords(sheetID, data) {

  const records = Application.Record.CreateRecords({
    SheetId: sheetID,
    Records: data
  })
  console.log(records)
  return {
    code: 200,
    msg: "新增内容成功。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: records
  }
}



/**
 * 新增多条数据,并且支持上传附件
 * @param {Number} sheetID 表ID
 * @param {Array<{fields: object, attachmentData: Array<{saveFieldName: string, attachmentURL: string, fileName: string}>}>} data 需要新增的数据
 * @returns {object} 返回处理结果
 */
function oldcreateRecordsWithAttachment(sheetID, data) {
  console.log("开始执行 createRecordsWithAttachment");

  // 输入验证
  if (!Array.isArray(data) || data.length === 0) {
    console.error('输入数据必须是非空数组', data)
    return { code: 400, msg: "输入数据必须是非空数组", data: null };
  }

  const results = [];
  const sheet = Application.Sheets.ItemById(sheetID);

  for (const item of data) {
    // 数据格式验证
    if (!item.fields || !item.attachmentData) {
      return {
        code: 400,
        msg: `数据格式错误：缺少${!item.fields ? "fields" : "attachmentData"}字段`,
        data: null,
      };
    }
    console.log('item', item)

    try {
      // 创建新记录
      const addRecords = sheet.RecordRange.Add(1, undefined, 1);

      // 写入字段值
      Object.entries(item.fields).forEach(([fieldName, fieldValue]) => {
        try {

          console.log(`正在写入字段 ${fieldName} 的值: ${fieldValue}`);
          addRecords.Item(undefined, "@" + fieldName).Value = fieldValue;
        } catch (error) {
          console.error(`写入字段 ${fieldName} 失败:`, error);
        }
      });




      // 处理附件上传
      item.attachmentData.forEach(attachment => {
        try {
          const { saveFieldName, attachmentURL, fileName } = attachment;
          console.log(`正在上传附件: ${fileName} 到字段 ${saveFieldName}`);

          // 如果不存在参数的话，则跳过，不再上传
          if (!attachmentURL || !fileName || !saveFieldName) {
            console.log(`附件 ${fileName} 不存在，跳过上传`);
            return;
          }

          if (attachmentURL.startsWith('http')) {

            // 验证图片是否能请求成功
            // 发起网络请求
            const resp = HTTP.fetch(attachmentURL, {
              timeout: 2000
            })

            if (resp.status !== 200) {
              console.log(`附件 ${attachmentURL} 请求失败，跳过上传`);
              return {
                code: 400,
                msg: `附件 ${attachmentURL} 请求失败，跳过上传`,
                data: null
              }
            }
          }

          addRecords.Item(undefined, "@" + saveFieldName).Value = Application.DBCellValue([{
            fileData: attachmentURL,
            fileName: fileName
          }]);

          const recordID = addRecords.Item(undefined, "@" + saveFieldName).Id;
          results.push({
            sheetID,
            recordID,
            saveFieldName,
            attachmentURL,
            fileName,
          });
        } catch (error) {
          console.error(`附件上传失败: ${error.message}`);
          results.push({
            sheetID,
            saveFieldName: attachment.saveFieldName,
            attachmentURL: attachment.attachmentURL,
            fileName: attachment.fileName,
            msg: error.message
          });
        }
      });
    } catch (error) {
      console.error("处理记录时出错：", error);
      return {
        code: 500,
        msg: `处理记录时出错：${error.message}`,
        data: null,
      };
    }
  }

  return {
    code: 200,
    msg: "处理完成!",
    data: results,
  };
}




/**
 * 新增多条数据,并且支持上传附件
 * @param {Number} sheetID 表ID
 * @param {Array<{fields: object}>} data 需要新增的数据，fields中包含附件字段
 * @returns {object} 返回处理结果
 */
function createRecordsWithAttachment(sheetID, data) {
  console.log('开始执行 createRecordsWithAttachment')

  // 输入验证
  if (!Array.isArray(data) || data.length === 0) {
    console.error('输入数据必须是非空数组', data)
    return { code: 400, msg: '输入数据必须是非空数组', data: null }
  }

  const results = []
  const sheet = Application.Sheets.ItemById(sheetID)
  
  console.log(`\n======== 第一步：批量创建 ${data.length} 条空记录 ========`)
  
  // 一次性创建所有记录（根据官方文档示例）
  let recordRange
  try {
    console.log(`正在批量创建 ${data.length} 条记录...`)
    recordRange = sheet.RecordRange.Add(undefined, undefined, data.length)
    console.log(`✓ 成功创建 ${data.length} 条空记录`)
    
    // 等待创建完成
    sleep(1000)
  } catch (error) {
    console.error('批量创建记录失败:', error)
    return {
      code: 500,
      msg: `批量创建记录失败: ${error.message || JSON.stringify(error)}`,
      data: null
    }
  }
  
  console.log(`\n======== 第二步：逐条填充数据 ========`)
  
  // 逐条填充数据
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    
    console.log(`\n--- 处理第 ${i + 1}/${data.length} 条记录 ---`)
    
    // 数据格式验证
    if (!item.fields) {
      console.error(`第 ${i + 1} 条记录数据格式错误：缺少fields字段`)
      results.push({
        sheetID,
        success: false,
        error: '数据格式错误：缺少fields字段',
        recordIndex: i + 1
      })
      continue
    }

    try {

      // 1. 先写入普通字段值（注意：批量创建时，第一条记录索引是1，不是0）
      Object.entries(item.fields).forEach(([fieldName, fieldValue]) => {
        try {
          console.log(`写入普通字段 ${fieldName} 的值: ${fieldValue}`)
          // 使用行索引访问特定记录：recordRange 代表所有新建的记录，Item(行号, 字段) 访问具体单元格
          recordRange.Item(i + 1, '@' + fieldName).Value = fieldValue
        } catch (error) {
          console.error(`处理字段 ${fieldName} 失败:`, error)
          throw error // 字段写入失败应该抛出错误
        }
      })

      // 2. 处理附件数据（如果有）
      if (item.attachmentData && Array.isArray(item.attachmentData)) {
        console.log(`发现附件数据，共 ${item.attachmentData.length} 个附件`)

        // 按字段名分组附件
        const attachmentsByField = {}
        for (const attachment of item.attachmentData) {
          const { saveFieldName, attachmentURL, fileName } = attachment

          if (!saveFieldName || !attachmentURL || !fileName) {
            console.log(`附件数据不完整，跳过: ${JSON.stringify(attachment)}`)
            continue
          }

          if (!attachmentsByField[saveFieldName]) {
            attachmentsByField[saveFieldName] = []
          }

          // 验证图片URL是否有效
          if (attachmentURL.startsWith('http')) {
            try {
              const resp = HTTP.fetch(attachmentURL, { timeout: 2000 })
              if (resp.status !== 200) {
                console.log(`附件 ${attachmentURL} 请求失败，跳过上传`)
                continue
              }
            } catch (error) {
              console.log(`附件 ${attachmentURL} 网络请求失败，跳过上传: ${error.message}`)
              continue
            }
          }

          // 转换为金山文档期望的格式
          attachmentsByField[saveFieldName].push({
            fileData: attachmentURL,
            fileName: fileName
          })
        }

        // 上传附件到对应字段
        for (const [fieldName, attachments] of Object.entries(attachmentsByField)) {
          if (attachments.length === 0) continue

          try {
            console.log(`正在上传 ${attachments.length} 个附件到字段 ${fieldName}`)
            // 使用行索引访问特定记录的附件字段
            recordRange.Item(i + 1, '@' + fieldName).Value =
              Application.DBCellValue(attachments)

            console.log(`成功上传 ${attachments.length} 个附件到字段 ${fieldName}`)
            
            // 每个附件字段上传后稍微延迟
            sleep(300)
          } catch (error) {
            console.error(`附件上传失败: ${error.message}`)
            throw error // 抛出错误以便外层捕获
          }
        }
        
        // 所有附件上传完成后，额外等待一下
        console.log('所有附件上传完成，等待 500ms 后继续...')
        sleep(500)
      }

      // 3. 获取记录ID并记录结果
      try {
        const recordID = recordRange.Item(i + 1, '@订单编号').Id
        results.push({
          sheetID,
          recordID,
          success: true,
          recordIndex: i + 1,
          订单编号: item.fields['订单编号'],
          fields: Object.keys(item.fields),
          attachmentCount: item.attachmentData ? item.attachmentData.length : 0
        })
        console.log(`✓ 记录 ${i + 1} 处理成功，ID: ${recordID}，订单编号: ${item.fields['订单编号']}`)
      } catch (error) {
        console.log(`记录 ${i + 1} 处理成功，但无法获取ID: ${error.message}`)
        results.push({
          sheetID,
          success: true,
          recordIndex: i + 1,
          订单编号: item.fields['订单编号'],
          fields: Object.keys(item.fields),
          attachmentCount: item.attachmentData ? item.attachmentData.length : 0
        })
      }

    } catch (error) {
      console.error(`✗ 第 ${i + 1} 条记录处理失败：`, error)
      const errorMsg = error.message || JSON.stringify(error)
      console.error(`错误详情: ${errorMsg}`)
      
      results.push({
        sheetID,
        success: false,
        error: errorMsg,
        recordIndex: i + 1,
        fields: Object.keys(item.fields || {}),
        订单编号: item.fields ? item.fields['订单编号'] : 'unknown'
      })
      
      // 出错后也要延迟一下，避免连续错误
      console.log(`等待 300ms 后继续处理下一条...`)
      sleep(300)
      
      // 继续处理下一条记录，而不是返回错误
      continue
    }
    
    // 每条记录处理完成后，稍微延迟再处理下一条
    if (i < data.length - 1) {
      console.log(`等待 300ms 后处理下一条...`)
      sleep(300)
    }
  }
  
  console.log(`\n======== 所有记录处理完成 ========`)
  console.log(`成功: ${results.filter(r => r.success).length} 条`)
  console.log(`失败: ${results.filter(r => !r.success).length} 条`)

  return {
    code: 200,
    msg: '处理完成!',
    data: results
  }
}



/**
 * 删除函数
 * @param {Number} sheetID 表ID
 * @param {Array} data 需要删除的行ID，如 ['J', 'P', 'Q'] 
 * @returns {object} 返回值
 */
function deleteRecords(sheetID, data) {

  const records = Application.Record.DeleteRecords({
    SheetId: sheetID,
    RecordIds: data
  })
  console.log(records)
  return {
    code: 200,
    msg: "删除内容成功。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: records
  }
}

/**
 * 获取附件的 url
 * @param {object} data 文件附件的对象数据
 * @returns {object} 返回值
 */
function getAttachmentURL(data) {

  const uploadId = data.uploadId
  const source = data.source

  const resultURL = Application.Record.GetAttachmentURL({
    UploadId: uploadId,
    Source: source
  })

  console.log(resultURL)
  return {
    code: 200,
    msg: "获取附件 url 成功。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: resultURL
  }
}

/**
 * 上传附件到指定数据表的记录中
 * @param {object} data - 包含上传附件所需的数据
 * @param {string} data.sheetID - 数据表的ID
 * @param {string} data.recordID - 记录的ID
 * @param {string} data.saveFieldName - 保存附件的字段名称
 * @param {string} data.attachmentURL - 附件的URL
 * @param {string} data.fileName - 附件的文件名
 * @returns {object} 返回操作结果
 * @property {number} code - 状态码（200表示成功）
 * @property {string} msg - 操作结果消息
 * @property {string} data - 附加数据（当前为空）
 */
function uploadAttachmentURL(data) {
  let { sheetID, recordID, saveFieldName, attachmentURL, fileName } = data;
  // 通过id去获取数据表，然后再按照官方的示例，将附件上传到指定记录中
  Application.Sheets.ItemById(sheetID).RecordRange(recordID, '@' + saveFieldName).Value = Application.DBCellValue([{
    fileData: attachmentURL,
    fileName: fileName,
  }]);
  console.log('附件上传完毕!');

  return {
    code: 200,
    msg: "附件上传完毕。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: ""
  };
}

/**
 * 查询单行的数据
 * @param {Number} sheetID 表ID
 * @param {Number} recordID 行ID
 * @returns {object} 返回值
 */
function getRecord(sheetID, recordID) {
  const record = Application.Record.GetRecord({ SheetId: sheetID, RecordId: recordID });

  return {
    code: 200,
    msg: "成功查询特定行的内容。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: record
  };
}

/**
 * 查询多条数据，支持输入筛选
 * 详见官方文档：https://365.kdocs.cn/l/ctzsgDlAGF0l
 * @param {Number} sheetID 表ID
 * @param {object} data 传入的数据
 * @returns {object} 返回值
 */
function getRecords(sheetID, data) {
  // 传入需要查询的内容
  const { viewId = '', maxRecords = null, filterObject = {}, fields = [] } = data

  let all = []
  let offset = null

  while (all.length === 0 || offset) {
    let records = Application.Record.GetRecords({
      // 表 ID
      SheetId: sheetID,
      ViewId: viewId,
      MaxRecords: maxRecords,
      Offset: offset,
      Fields: fields,
      Filter: filterObject,
    })
    offset = records.offset

    all = all.concat(records.records)
  }

  //   去除all中的null
  all = all.filter(item => item != null)
  console.log('符合条件的数据条数：', all.length)

  if (all.length === 0) {
    return {
      code: 200,
      msg: '按照现有条件，查询到数据内容为空.如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS',
      data: all,
    }
  }
  // 为了适应内容，对其中的附件，都转为附件url
  // 遍历所有记录，处理附件字段
  for (let i = 0; i < all.length; i++) {
    const record = all[i]



    if (record.fields) {
      const fieldNames = Object.keys(record.fields)
      for (let j = 0; j < fieldNames.length; j++) {
        const fieldName = fieldNames[j]
        const fieldValue = record.fields[fieldName]

        // 检查字段值是否为数组且包含附件对象
        if (Array.isArray(fieldValue) && fieldValue.length > 0) {
          // 检查第一个元素是否包含附件相关属性
          const firstItem = fieldValue[0]
          if (firstItem && firstItem.uploadId && firstItem.source) {
            // 这是一个附件字段，需要转换为URL
            const urlArray = []
            for (let k = 0; k < fieldValue.length; k++) {
              const attachment = fieldValue[k]
              const urlResult = getAttachmentURL(attachment)
              urlArray.push(urlResult.data)
            }
            record.fields[fieldName] = urlArray
          }
        }
      }
    }
  }

  // console.log("查询到数据：" , all)

  return {
    code: 200,
    msg: '成功查询特定行的内容.如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS',
    data: all,
  }
}





/**
 * 查询特定字段的特定值的内容
 * 详见官方文档：https://365.kdocs.cn/l/ctzsgDlAGF0l
 * @param {Number} sheetID 表ID
 * @param {object} data 传入的数据
 * @returns {object} 返回值
 */
function searchRecords(sheetID, data) {

  // 传入需要查询的内容
  const { tagetFieldName, tagetValue = '', searchType = 'Contains' } = data

  if (!tagetFieldName || !tagetValue) {
    return {
      code: 400,
      msg: "必要参数 tagetFieldName || tagetValue 不能为空！如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
      data: ""
    }
  }

  let all = []
  let offset = null;

  while (all.length === 0 || offset) {
    let records = Application.Record.GetRecords({
      // 表 ID
      SheetId: sheetID,
      Offset: offset,
      Filter: {
        "mode": "AND",
        "criteria": [
          {
            "field": tagetFieldName,
            "op": searchType,
            "values": [
              tagetValue
            ]
          }
        ]
      }
    })
    offset = records.offset

    // 如果内容不为空的话，就加入
    if (records.records) {
      all = all.concat(records.records)
    }

  }
  console.log("查询特定字段的特定值的内容", all.length)

  // console.log("查询到相同订单号的数据：" , all)

  return {
    code: 200,
    msg: "成功查询特定字段的特定值的内容.如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: all
  };
}



/**
 * 创建字段
 * @param {Number} sheetID 表ID
 * @param {Number} data 字段的数据
 * @returns {object} 返回值
 */
function createFields(sheetID, data) {
  // 创建字段
  const field = Application.Field.CreateFields({
    SheetId: sheetID,
    Fields: data
  })

  console.log(field)

  return {
    code: 200,
    msg: "成功创建字段。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: field
  };
}



/**
 * 更新字段信息
 * @param {Number} sheetID 表ID
 * @param {Number} data 字段的数据
 * @returns {object} 返回值
 */
function updateFields(sheetID, data) {
  // 创建字段
  const field = Application.Field.UpdateFields({
    SheetId: sheetID,
    Fields: data
  })

  console.log(field)

  return {
    code: 200,
    msg: "成功更新字段。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: field
  };
}



/**
 * 查询特定表中所有字段信息
 * @param {Number} sheetID 表ID
 * @returns {object} 返回值
 */
function getFields(sheetID) {
  const resutlt = Application.Field.GetFields({
    SheetId: sheetID
  })
  console.log(resutlt)

  return {
    code: 200,
    msg: "成功查询特定数据表的字段信息.如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: resutlt
  };
}



/**
 * 删除数据表中的字段信息
 * @param {Number} sheetID 表ID
 * @param {Array} data 字段的数据
 * @returns {object} 返回值
 */
function deleteFields(sheetID, data) {
  const resutlt = Application.Field.DeleteFields({
    SheetId: sheetID,
    FieldIds: data
  })
  console.log(resutlt)

  return {
    code: 200,
    msg: "成功删除字段信息。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: resutlt
  };
}




/**
 * 创建一张新的数据表中
 * @param {object} data 字段的数据
 * @returns {object} 返回值
 */
function createSheet(data) {
  const sheet = Application.Sheet.CreateSheet(data)
  console.log(sheet)

  return {
    code: 200,
    msg: "成功创建了一张新的表。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: sheet
  };
}




/**
 * 获取所有数据表的信息
 * @returns {object} 返回值
 */
function getSheets() {
  const sheets = Application.Sheet.GetSheets()
  console.log(sheets)

  return {
    code: 200,
    msg: "成功获取了所有数据表的信息。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: sheets
  };
}



/**
 * 根据字段名提取对应的 id
 * @param {Interger} sheetID - 表id
 * @param {string} fieldName - 要查找的字段名
 * @returns {Array} - 返回匹配的 id 数组
 */
function extractIdByFieldName(sheetID, fieldName) {

  const arr = Application.Field.GetFields({
    SheetId: sheetID
  })
  console.log(arr)


  const ids = [];
  // 使用 for 循环遍历数组
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].name === fieldName) {
      ids.push(arr[i].id);
    }
  }

  console.log(ids)
  return {
    code: 200,
    msg: "成功根据字段名提取对应的 id。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: ids
  };
}



/**
 * 根据表名称提取对应的 表id
 * @param {string} sheetName - 要查找的表名称
 * @returns {Array} - 返回匹配的 id 数组
 */
function extractIdBySheetName(sheetName) {

  const arr = Application.Sheet.GetSheets()
  console.log(arr)


  const ids = [];
  // 使用 for 循环遍历数组
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].name === sheetName) {
      ids.push(arr[i].id);
    }
  }

  console.log(ids)
  return {
    code: 200,
    msg: "成功根据表名称提取对应的表id。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: ids
  };
}



/**
 * 给指定的单元格文字添加颜色
 * @param {Integer} sheetID - 表ID
 * @param {string} recordID - 行ID
 * @param {Object} data - 传入数据，包含字段名称和需要设置的颜色
 * @returns {Array} - 返回匹配的 id 数组
 */
function fontColor(sheetID, recordID, data) {

  const { fieldName, color } = data

  if (!fieldName || !color) {
    return {
      code: 400,
      msg: "没有传入必要参数 fieldName 或者 color ，请检查数据！",
      data: data
    }
  }

  let range = Application.Sheets.ItemById(sheetID).RecordRange(recordID);
  range.Item(1, "@" + fieldName).Font.Color = color;
  return {
    code: 200,
    msg: "成功修改指定单元格内的文字颜色。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: {
      sheetID,
      recordID,
      fieldName,
      color
    }
  };
}



/**
 * 给指定的单元格添加背景颜色
 * @param {Integer} sheetID - 表ID
 * @param {string} recordID - 行ID
 * @param {Object} data - 传入数据，包含字段名称和需要设置的颜色
 * @returns {Array} - 返回匹配的 id 数组
 */
function interiorColor(sheetID, recordID, data) {

  const { fieldName, color } = data

  if (!fieldName || !color) {
    return {
      code: 400,
      msg: "没有传入必要参数 fieldName 或者 color ，请检查数据！",
      data: data
    }
  }

  let range = Application.Sheets.ItemById(sheetID).RecordRange(recordID);
  range.Item(1, "@" + fieldName).Interior.Color = color;
  return {
    code: 200,
    msg: "成功修改指定单元格的背景颜色。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: {
      sheetID,
      recordID,
      fieldName,
      color
    }
  };
}


/**
 * 创建云文档
 * @param {Object} data - 传入数据，包含文件名称和保存位置
 * @returns {Array} - 返回匹配的 id 数组
 */
function createFile(data) {

  if (!data.fileName || !data.fileType) {
    return {
      code: 400,
      msg: "缺少必要参数。请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
      data: data
    };
  }

  // 构建创建的对象
  let createOptions = {
    name: data.fileName,
  }

  // 如果有指定保存文件夹
  if (data.dirUrl) {
    createOptions.dirUrl = data.dirUrl
  }

  // 如果是将目标文件另存为新文件
  if (data.source) {
    createOptions.source = data.source
  }

  let fileURL = KSDrive.createFile(KSDrive.FileType[data.fileType], createOptions)
  console.log("创建了一个新文档：", fileURL)

  return {
    code: 200,
    msg: "成功新增云文档。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: {
      fileName: data.fileName,
      fileURL
    }
  };
}


/**
 * 将数据写入金山文档表格
 * @param {Object}  data
 * @param {Object Array} dataArray - 要写入的数据数组，每个对象可以包含任意数量的属性
 * @param {Object string} fileUrl - 金山文档的文件URL
 * @param {Object string} direction - 写入方向，'horizontal' 或 'vertical'，默认为 'horizontal'
 * @param {Object number} startRow - 起始行号，默认为1
 */
function writeDataToSheet(data) {
  // 将数字转换为Excel列标识（A, B, C, ..., Z, AA, AB, ...）
  function getColumnLetter(num) {
    let result = '';
    while (num >= 0) {
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26) - 1;
    }
    return result;
  }

  // 设置单元格样式
  function setCellStyle(cell, value, color = null, alignment = null) {
    cell.Value = value;
    if (color) cell.Interior.Color = color;
    if (alignment) cell.HorizontalAlignment = alignment;
    // 设置单元格边框
    cell.Borders.LineStyle = file.Application.Enum.XlLineStyle.xlContinuous;
    // 设置单元格边框宽度
    cell.Borders.Weight = file.Application.Enum.XlBorderWeight.xlThin;
    // 设置单元格自动换行
    cell.WrapText = true;
  }

  // 判断是否为字符串，如果是则左对齐，否则居中
  // 修改为默认 两端对齐
  function getAlignment(value) {

    return file.Application.Enum.XlHAlign.xlHAlignJustify

    // return typeof value === 'string' && !value.includes('%')
    //   ? file.Application.Enum.XlHAlign.xlHAlignJustify
    //   : file.Application.Enum.XlHAlign.xlHAlignCenter;
  }

  if (!data.dataArray || !data.fileUrl) {
    return {
      code: 400,
      msg: "缺少必要参数。请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
      data: data
    };
  }

  const { dataArray, fileUrl, direction = "horizontal", startRow = 1 } = data;

  // 打开文件
  let file = KSDrive.openFile(fileUrl);
  console.log(Application.Sheets.Count); // 1

  // 获取活动工作表
  const sheet = file.Application.ActiveSheet;

  // 获取所有可能的属性名（合并所有对象的属性）
  const headers = [...new Set(dataArray.reduce((acc, obj) => {
    return [...acc, ...Object.keys(obj)];
  }, []))];

  if (direction === "horizontal") {
    // 横向写入：先写入标题行
    headers.forEach((header, colIndex) => {
      const col = getColumnLetter(colIndex);
      const cell = sheet.Range(`${col}${startRow}`);
      setCellStyle(cell, header, "#FFC000", file.Application.Enum.XlHAlign.xlHAlignCenter);
    });

    // 写入数据
    dataArray.forEach((item, rowIndex) => {
      const row = rowIndex + startRow + 1; // 从startRow+1行开始写入数据
      headers.forEach((header, colIndex) => {
        const col = getColumnLetter(colIndex);
        const cell = sheet.Range(`${col}${row}`);
        const value = item[header] || "";
        setCellStyle(cell, value, null, getAlignment(value));
      });
    });

    // 自动调整列宽和行高
    const lastCol = getColumnLetter(headers.length - 1);
    const lastRow = dataArray.length + startRow;
    const dataRange = sheet.Range(`A${startRow}:${lastCol}${lastRow}`);
    dataRange.Columns.AutoFit();
    dataRange.Rows.AutoFit();
  } else {
    // 竖向写入
    // 计算每个对象需要的行数（属性数量 + 1个空行）
    const rowsPerItem = headers.length + 1;

    dataArray.forEach((item, index) => {
      const startItemRow = startRow + (index * rowsPerItem);
      // 动态获取每个商品对象的第一个属性作为id
      const firstKey = Object.keys(item)[0];
      const productId = item[firstKey] || "1.商品ID";

      // 写入标题、值和复制商品id
      headers.forEach((header, headerIndex) => {
        const currentRow = startItemRow + headerIndex;
        const titleCell = sheet.Range(`A${currentRow}`);
        const valueCell = sheet.Range(`B${currentRow}`);
        const copyCell = sheet.Range(`C${currentRow}`);

        // 写入标题
        setCellStyle(titleCell, header, "#FFC000", file.Application.Enum.XlHAlign.xlHAlignCenter);

        // 写入值
        const value = item[header] || "";
        setCellStyle(valueCell, value, null, getAlignment(value));

        // 仅在商品ID对应的行复制ID
        if (header === firstKey) {
          // 根据客户要求，ID后面要加逗号
          const newProductId = productId + ','
          setCellStyle(copyCell, newProductId, null, getAlignment(newProductId));
        } else {
          setCellStyle(copyCell, "", null, getAlignment(""));
        }
      });

      // 添加一个空行作为分隔
      sheet.Range(`A${startItemRow + headers.length}`).Value = "";
      sheet.Range(`B${startItemRow + headers.length}`).Value = "";
      sheet.Range(`C${startItemRow + headers.length}`).Value = "";
    });

    // 自动调整列宽和行高
    const lastRow = startRow + (dataArray.length * rowsPerItem) - 1;
    const dataRange = sheet.Range(`A${startRow}:C${lastRow}`);
    dataRange.Columns.AutoFit();
    dataRange.Rows.AutoFit();

    // 设置B列（内容列）和C列（复制列）的最小宽度为80
    const columnB = sheet.Range("B:B");
    if (columnB.ColumnWidth < 80) {
      columnB.ColumnWidth = 80;
    }
    const columnC = sheet.Range("C:C");
    if (columnC.ColumnWidth < 50) {
      columnC.ColumnWidth = 50;
    }
  }

  file.close();
  console.log("数据写入成功");

  return {
    code: 200,
    msg: "成功写入数据到表格。如有问题，请查看说明文档或者联系作者。https://www.kdocs.cn/l/cbz0wt1t5moS",
    data: {
      fileURL: data.fileUrl
    }
  };
}



// ================================== 以下是主函数执行逻辑  =============================


switch (type) {
  // 如果指令是更新数据
  case 'updateRecords':
    return updateRecords(sheetID, data);
  case 'createRecords':
    // 创建行记录
    return createRecords(sheetID, data);
  case 'deleteRecords':
    // 删除
    return deleteRecords(sheetID, data);
  case 'getRecord':
    // 查询单挑数据
    return getRecord(sheetID, data);
  case 'getRecords':
    // 查询特定表的数据，支持筛选、返回指定字段
    // 如果传入空对象，返回所有的数据，1000条限制
    return getRecords(sheetID, data);
  case 'getAttachmentURL':
    // 获取附件url
    return getAttachmentURL(data);
  case 'uploadAttachmentURL':
    // 上传附件
    return uploadAttachmentURL(data);
  case 'createFields':
    // 创建新的字段
    return createFields(sheetID, data);
  case 'updateFields':
    // 更新字段
    return updateFields(sheetID, data);
  case 'getFields':
    // 获取所有字段信息
    return getFields(sheetID);
  case 'deleteFields':
    // 删除字段
    return deleteFields(sheetID, data);
  case 'createSheet':
    // 创建新的数据表
    return createSheet(data);
  case 'getSheets':
    // 获取所有的表数据
    return getSheets();
  case 'extractIdByFieldName':
    // 根据字段名称查询字段id
    return extractIdByFieldName(sheetID, data);
  case 'extractIdBySheetName':
    // 根据数据表的名称去查询数据表的ID
    return extractIdBySheetName(data);
  case 'interiorColor':
    // 给指定多维表单元格添加颜色
    return interiorColor(sheetID, recordID, data);
  case 'fontColor':
    // 给指定多维表单元格添加颜色
    return fontColor(sheetID, recordID, data);
  case 'createFile':
    // 创建新的数据表
    return createFile(data);
  case 'writeDataToSheet':
    // 创建新的数据表
    return writeDataToSheet(data);
  case 'createRecordsWithAttachment':
    //创建新行，支持上传附件
    return createRecordsWithAttachment(sheetID, data)
  case 'searchRecords':
    // 查询特定字段特定值
    return searchRecords(sheetID, data)
  default:
    console.log(KSDrive)

  

    console.log('未输入预设指令，跳过处理！')
    const view = Application.Selection.GetActiveView()
    console.log('view', view)
    return {
      code: 0,
      msg: "未输入预设指令，跳过处理！"
    };
}


// 同步延时函数
function sleep(ms) {
  const start = new Date().getTime();
  while (new Date().getTime() < start + ms);
}

