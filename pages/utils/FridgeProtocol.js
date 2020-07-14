import {
  EMPTY_DEGREE, FridgeData,
} from './FridgeData.js';
// 帧头
const FrameHeader = [0xFE, 0xFE];

const RES_BIND = 0x0;
const RES_READ = 0x1;
const RES_SET_OTHERS = 0x2;
const RES_RESET = 0x4;
const RES_SET_LEFT = 0x5;
const RES_SET_RIGHT = 0x6;

function calcChecksum(buf) {
  let n = buf.length - 2;
  let m = 0;
  for (let i = 0; i < n; ++i) {
    m += buf[i];
  }
  buf[n] = (m >> 8) & 0xFF;
  buf[n+1] = m & 0xFF;
  return buf;
}

function byteArrayToBase64(buf) {
  return btoa(String.fromCharCode.apply(null, buf));
}

function base64ToByteArray(b64) {
  let s = atob(b64);
  let buf = new Int8Array(s.length);
  for (let i = 0, n = s.length; i < n; ++i) {
    buf[i] = s.charCodeAt(i);
  }
  return buf;
}

function byteToSInt(b) {
  b = b & 0xFF;
  return (b & 0x80) > 0 ? b - 0x100 : b;
}

function sintToByte(n) {
  return n < 0 ? 0x100 + n: n;
}

function copyItem(src, dst, pos) {
  for (let i = 0; i < src.length; ++i) {
    dst[pos+i] = src[i];
  }
}

// 返回可以直接发送给设备的指令数据
function makeCommand(payload) {
  let total = FrameHeader.length + 1 + payload.length + 2;
  //let buf = new Int8Array(total);
  let buf = new Array(total);
  let curr = 0;

  // copy frame header
  //buf.set(FrameHeader, curr);
  copyItem(FrameHeader, buf, curr); 
  curr += FrameHeader.length;

  // write content length
  buf[curr] = total - FrameHeader.length - 1;
  curr++; 
  // copy payload
  //buf.set(payload, curr);
  copyItem(payload, buf, curr);

  // calculate checksum 
  calcChecksum(buf);

  // convert to base64 string
  //return byteArrayToBase64(buf); // for react-native-ble-plt

  //return buf; // for react-native-ble-manager
  //
  //let ar = Array.prototype.slice.call(buf);
  //console.log('###', ar);
  //return ar;
  //
  console.log("buf::::"+buf)
  console.log('###', buf.map(item => item.toString(16)).join(' '));
  
  return buf;
}

// 从设备接收到的数据中提取实际的
function decode(buf) {
  //let buf = base64ToByteArray(rspStr);

  // verify total length
  if (buf.length <= FrameHeader.length) {
    throw new Error('buffer is too small');
  }
  
  // verify frame header
  for (let i = 0, c = FrameHeader.length; i < c; ++i) {
    if (buf[i] !== FrameHeader[i]) {
      console.log("buf[i]::"+buf[i])
      console.log("FrameHeader[i]::"+FrameHeader[i])
      throw new Error('frame header verification failed');
    }
  }
  
  // verify content length
  let contLen = buf[FrameHeader.length];
  if ((buf.length - FrameHeader.length - 1) !== contLen) {
    throw new Error('content length not match');
  }

  // verify checksum
  let cs1 = buf[buf.length - 2];
  let cs2 = buf[buf.length - 1];
  calcChecksum(buf);
  // TODO 读数据时计算结果不对
  //if (buf[buf.length - 2] !== cs1 || buf[buf.length - 1] !== cs2) {
    //throw new Error('checksum error');
  //}

  //return buf.subarray(FrameHeader.length, buf.length - 2);
  return buf.slice(FrameHeader.length + 1, buf.length - 2);
}

//绑定指令
function encodeBind() {
  let payload = [0x0];
  return makeCommand(payload);
}

//查询指令
function encodeQuery() {
  let payload = [0x1];
  return makeCommand(payload);
}

function encodeSetOthers(cfg) {
  let payload = [
    0x2,
    cfg.locked,
    cfg.poweredOn,
    cfg.runMode,
    cfg.batSaver,
    sintToByte(cfg.leftTarget),
    //sintToByte(cfg.leftMax),
    //sintToByte(cfg.leftMin),
    sintToByte(cfg.tempMax),
    sintToByte(cfg.tempMin),
    //sintToByte(cfg.returnDiff),
    sintToByte(cfg.leftRetDiff),
    cfg.startDelay,
    cfg.unit,
    sintToByte(cfg.leftTCHot),
    sintToByte(cfg.leftTCMid),
    sintToByte(cfg.leftTCCold),
    sintToByte(cfg.leftTCHalt),
  ];

  if (cfg.rightCurrent != EMPTY_DEGREE) {
    payload = payload.concat([
      sintToByte(cfg.rightTarget),
      0,
      0,
      //sintToByte(cfg.rightMax),
      //sintToByte(cfg.rightMin),
      sintToByte(cfg.rightRetDiff),
      sintToByte(cfg.rightTCHot),
      sintToByte(cfg.rightTCMid),
      sintToByte(cfg.rightTCCold),
      sintToByte(cfg.rightTCHalt),
      0,
      0,
      0,
    ]);
  }
  return makeCommand(payload);
}

function encodeReset() {
  let payload = [0x4];
  return makeCommand(payload);
}

function encodeSetLeft(c) {
  let payload = [0x5, sintToByte(c)];
  return makeCommand(payload);
}

function encodeSetRight(c) {
  let payload = [0x6, sintToByte(c)];
  return makeCommand(payload);
}

// 提取字节数组buf中的数据到FridgeData实例
function fetchData(fd, buf) {
  fd.locked = buf[0];
  fd.poweredOn = buf[1];
  fd.runMode = buf[2];
  fd.batSaver = buf[3];
  fd.leftTarget = byteToSInt(buf[4]);
  //fd.leftMax = byteToSInt(buf[5]);
  //fd.leftMin = byteToSInt(buf[6]);
  //fd.returnDiff = byteToSInt(buf[7]);
  fd.tempMax = byteToSInt(buf[5]);
  fd.tempMin = byteToSInt(buf[6]);
  fd.leftRetDiff = byteToSInt(buf[7]);
  fd.startDelay = buf[8];
  fd.unit = buf[9];
  fd.leftTCHot = byteToSInt(buf[10]);
  fd.leftTCMid = byteToSInt(buf[11]);
  fd.leftTCCold = byteToSInt(buf[12]);
  fd.leftTCHalt = byteToSInt(buf[13]);
  fd.leftCurrent = byteToSInt(buf[14]);
  fd.batPercent = buf[15];
  fd.batVolInt = buf[16];
  fd.batVolDec = buf[17];

  if (buf.length < 19) {
    fd.rightCurrent = EMPTY_DEGREE;
  } else {
    fd.rightTarget = byteToSInt(buf[18]);
    //fd.rightMax = byteToSInt(buf[19]);
    //fd.rightMin = byteToSInt(buf[20]);
    fd.rightRetDiff = byteToSInt(buf[21]);
    fd.rightTCHot = byteToSInt(buf[22]);
    fd.rightTCMid = byteToSInt(buf[23]);
    fd.rightTCCold = byteToSInt(buf[24]);
    fd.rightTCHalt = byteToSInt(buf[25]);
    fd.rightCurrent = byteToSInt(buf[26]);
    fd.runningStatus = buf[27];
  }
}

// return: 0-禁止绑定，1-允许绑定
function decodeBind(str) {
  let buf = decode(str);
  if (buf[0] !== 0x0) {
    throw new Error('not bind response');
  }
  return buf[1];
}

// return: FridgeData
function decodeQuery(str) {
  let buf = decode(str);
  if (buf[0] !== 0x1) {
    throw new Error('not query response');
  }

  let cfg = new FridgeData();
  //fetchData(cfg, buf.subarray(1, buf.length));
  fetchData(cfg, buf.slice(1, buf.length));
  return cfg;
}

// return: FridgeData
function decodeSetOthers(str) {
  let buf = decode(str);
  if (buf[0] !== 0x2) {
    throw new Error('not set response');
  }

  let cfg = new FridgeData();
  //fetchData(cfg, buf.subarray(1, buf.length));
  fetchData(cfg, buf.slice(1, buf.length));
  return cfg;
}

// return: FridgeData
function decodeReset(str) {
  let buf = decode(str);
  if (buf[0] !== 0x4) {
    throw new Error('not reset response');
  }

  let cfg = new FridgeData();
  //fetchData(cfg, buf.subarray(1, buf.length));
  fetchData(cfg, buf.slice(1, buf.length));
  return cfg;
}

// return: 左箱设定的温度值
function decodeSetLeft(str) {
  let buf = decode(str);
  if (buf[0] !== 0x5) {
    throw new Error('not setLeft response');
  }
  return byteToSInt(buf[1]);
}

// return: 右箱设定的温度
function decodeSetRight(str) {
  let buf = decode(str);
  if (buf[0] !== 0x6) {
    throw new Error('not setRight response');
  }
  return byteToSInt(buf[1]);
}

function decodeResponse(buf) {
  let data = null;
  switch (buf[3]) {
    case RES_BIND:
      data = decodeBind(buf);
      break;
    case RES_READ:
      data = decodeQuery(buf);
      break;
    case RES_SET_OTHERS:
      data = decodeSetOthers(buf);
      break;
    case RES_RESET:
      data = decodeReset(buf);
      break;
    case RES_SET_LEFT:
      data = decodeSetLeft(buf);
      break;
    case RES_SET_RIGHT:
      data = decodeSetRight(buf);
      break;
    default:
      return null;
  }
  return {
    cmd: buf[3],
    data: data,
  };
}

// 判断指定的内容是不是一个完整消息，
// 返回0表示还不是一个完整的消息，
// 大于0表是一个完整的消息示，并且只需buf[0, ret)区间中的内容。
function isMessageComplete(buf) {
  console.log('isMessageComplete:', buf);
  if (buf == null || buf.length < 3) {
    return 0;
  }
  return buf.length < (buf[2]+3) ? 0 : (buf[2] + 3);
}

function getHeaderIndex(buf) {
  if (buf == null || buf.length < FrameHeader.length) {
    return 0;
  }

  let end = buf.length - FrameHeader.length;
  for (let i = 0; i < end; ++i) {
    let j = 0;
    for (; j < FrameHeader.length; ++j) {
      if (buf[i+j] != FrameHeader[j]) {
        break;
      }
    }
    if (j >= FrameHeader.length) {
      return i;
    }
  }

  return -1; // 没有Header
}

export default {
  RES_BIND: RES_BIND,
  RES_READ: RES_READ,
  RES_SET_OTHERS: RES_SET_OTHERS,
  RES_RESET: RES_RESET,
  RES_SET_LEFT: RES_SET_LEFT,
  RES_SET_RIGHT: RES_SET_RIGHT,

  encodeBind: encodeBind,
  encodeQuery: encodeQuery,
  encodeSetOthers: encodeSetOthers,
  encodeReset: encodeReset,
  encodeSetLeft: encodeSetLeft,
  encodeSetRight: encodeSetRight,
  getHeaderIndex: getHeaderIndex,
  isMessageComplete: isMessageComplete,
  decodeResponse: decodeResponse,
};

// for unit test
export { byteToSInt, sintToByte };

module.exports = {
  RES_BIND: RES_BIND,
  RES_READ: RES_READ,
  RES_SET_OTHERS: RES_SET_OTHERS,
  RES_RESET: RES_RESET,
  RES_SET_LEFT: RES_SET_LEFT,
  RES_SET_RIGHT: RES_SET_RIGHT,
  
  decodeBind: decodeBind,
  encodeBind: encodeBind,
  encodeQuery: encodeQuery,
  encodeSetOthers: encodeSetOthers,
  encodeReset: encodeReset,
  encodeSetLeft: encodeSetLeft,
  encodeSetRight: encodeSetRight,
  getHeaderIndex: getHeaderIndex,
  isMessageComplete: isMessageComplete,
  decodeResponse: decodeResponse,
}

