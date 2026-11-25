/**
 * @description: 零依赖 zip 写入器（deflate）
 *
 * 打包要在任何机器上跑，所以不引入 archiver 之类的依赖：只用 node:zlib 按 ZIP
 * 规范拼出本地文件头、中央目录与 EOCD。条目数远小于 65535、体积远小于 4 GB，
 * 因此不实现 ZIP64。
 */

import { Buffer } from 'node:buffer'
import { writeFile } from 'node:fs/promises'
import { deflateRawSync } from 'node:zlib'

/** CRC32 查表 */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)

  for (let index = 0; index < 256; index++) {
    let value = index

    for (let bit = 0; bit < 8; bit++) value = value & 1 ? (value >>> 1) ^ 0xEDB88320 : value >>> 1

    table[index] = value >>> 0
  }

  return table
})()

/**
 * 计算 CRC32
 * @param {Buffer} buffer 数据
 * @returns {number} 校验值
 */
function crc32(buffer) {
  let crc = 0xFFFFFFFF

  for (const byte of buffer) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xFF]

  return (crc ^ 0xFFFFFFFF) >>> 0
}

/**
 * DOS 日期与时间（ZIP 使用 1980 起的本地时间）
 * @param {Date} date 时间
 * @returns {{time: number, date: number}} 时间字段
 */
function dosDateTime(date) {
  return {
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
  }
}

/**
 * 写入 zip 文件
 * @param {string} zipPath 目标路径
 * @param {Array<{name: string, data: Buffer}>} entries 条目（name 为包内相对路径，使用 /）
 * @returns {Promise<{size: number}>} 写入的字节数
 */
export async function writeZip(zipPath, entries) {
  const { date, time } = dosDateTime(new Date())

  /** @type {Buffer[]} */
  const localParts = []
  /** @type {Buffer[]} */
  const centralParts = []
  let offset = 0

  for (const entry of entries) {
    const name = Buffer.from(entry.name, `utf8`)
    const compressed = deflateRawSync(entry.data, { level: 9 })
    const crc = crc32(entry.data)

    const local = Buffer.alloc(30)

    local.writeUInt32LE(0x04034B50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6) // 文件名按 UTF-8 解释
    local.writeUInt16LE(8, 8) // deflate
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(date, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(compressed.length, 18)
    local.writeUInt32LE(entry.data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)

    localParts.push(local, name, compressed)

    const central = Buffer.alloc(46)

    central.writeUInt32LE(0x02014B50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(8, 10)
    central.writeUInt16LE(time, 12)
    central.writeUInt16LE(date, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(compressed.length, 20)
    central.writeUInt32LE(entry.data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt32LE(0, 30)
    central.writeUInt32LE(0, 34)
    central.writeUInt32LE(0, 38)
    central.writeUInt32LE(offset, 42)

    centralParts.push(central, name)

    offset += local.length + name.length + compressed.length
  }

  const centralBuffer = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)

  end.writeUInt32LE(0x06054B50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralBuffer.length, 12)
  end.writeUInt32LE(offset, 16)

  const buffer = Buffer.concat([...localParts, centralBuffer, end])

  await writeFile(zipPath, buffer)

  return { size: buffer.length }
}
