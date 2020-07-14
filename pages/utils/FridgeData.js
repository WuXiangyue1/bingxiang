const UNIT_C = 0;
const UNIT_C_STR = '℃';
const UNIT_F = 1;
const UNIT_F_STR = '℉';

const EMPTY_DEGREE = -128;

let gInitData = {
  locked: 0, // 0-unlocked, 1-locked
  poweredOn: 1, // 0-powered off, 1-powered on
  runMode: 0, // 运行模式：0-全速运行，1-经济运行
  batSaver: 0, // 电池保护：0-H1，1-H2，2-H3
  batPercent: 50, // 电池电量百分比
  batVolInt: 0, // 电池电压整数位
  batVolDec: 0, // 电池电压小数位
  //returnDiff: 2, // 温度回差 (1℃, 10℃) /(2F, 18F) 默认2℃
  startDelay: 0, // 启动延时 (0M, 10M)  默认0M
  unit: 0, // 单位（0摄氏度 1华氏度）
  tempMin: -20, // 最小控制范围 (-40℃, 设定温度) /(-40F, 设定温度) 默认-20℃
  tempMax: 20, // 最大控制范围 (设定温度, 40℃) /(设定温度, 104F) 默认20℃
  leftCurrent: 0, // 左箱当前温度
  leftTarget: 0, // 左箱设定温度：(最小控制范围，最大控制范围)，默认0度。
  //leftMax: 20, // 左箱最大控制范围 (设定温度, 40℃) /(设定温度, 104F) 默认20℃
  //leftMin: -20, // 左箱最小控制范围 (-40℃, 设定温度) /(-40F, 设定温度) 默认20℃
  leftRetDiff: 2, // 左箱温度回差 (1℃, 10℃) /(2F, 18F) 默认2℃
  leftTCHot: 0, // 左箱T≥-6℃温度补偿 (-10℃, 10℃) /(-18F, 18F) 默认0℃
  leftTCMid: 0, // 左箱-12≤T<-6℃温度补偿 (-10℃, 10℃) /(-18F, 18F) 默认0℃
  leftTCCold: -4, // 左箱T<-12℃温度补偿 (-10℃, 10℃) /(-18F, 18F) 默认-4℃
  leftTCHalt: 0, // 左箱停机温度补偿(-10℃, 0℃) /(-18F, 0F) 默认0℃
  rightCurrent: -128, // 右箱当前温度
  rightTarget: 0, // 右箱设定温度：(最小控制范围，最大控制范围)，默认0度。
  //rightMax: 20, // 右箱最大控制范围 (设定温度, 40℃) /(设定温度, 104F) 默认20℃
  //rightMin: -20, // 右箱最小控制范围 (-40℃, 设定温度) /(-40F, 设定温度) 默认20℃
  rightRetDiff: 2, // 右箱温度回差 (1℃, 10℃) /(2F, 18F) 默认2℃
  rightTCHot: 0, // 右箱T≥-6℃温度补偿 (-10℃, 10℃) /(-18F, 18F) 默认0℃
  rightTCMid: 0, // 右箱-12≤T<-6℃温度补偿 (-10℃, 10℃) /(-18F, 18F) 默认0℃
  rightTCCold: -4, // 右箱T<-12℃温度补偿 (-10℃, 10℃) /(-18F, 18F) 默认-4℃
  rightTCHalt: 0, // 右箱停机温度补偿(-10℃, 0℃) /(-18F, 0F) 默认0℃
  runningStatus: 0, // 左右温箱运行状态（0停止制冷 1左箱制冷 2右箱制冷）
};
Object.freeze(gInitData);

// UNIT_C=0, UNIT_F=1
const ParamLimit = {
  // tempMin: [-40, -40],
  // tempMax: [40, 104],
  tempMin: [-20, -4],
  tempMax: [20, 68],
  startDelayMin: 0,
  startDelayMax: 10,
  leftRetDiffMin: [1, 2],
  leftRetDiffMax: [10, 18],
  leftTCHotMin: [-10, -18],
  leftTCHotMax: [10, 18],
  leftTCMidMin: [-10, -18],
  leftTCMidMax: [10, 18],
  leftTCColdMin: [-10, -18],
  leftTCColdMax: [10, 18],
  leftTCHaltMin: [-10, -18],
  leftTCHaltMax: [0, 0],
  rightRetDiffMin: [1, 2],
  rightRetDiffMax: [10, 18],
  rightTCHotMin: [-10, -18],
  rightTCHotMax: [10, 18],
  rightTCMidMin: [-10, -18],
  rightTCMidMax: [10, 18],
  rightTCColdMin: [-10, -18],
  rightTCColdMax: [10, 18],
  rightTCHaltMin: [-10, -18],
  rightTCHaltMax: [0, 0],
};

const TTrans = {
  C2F: c => Math.round(c * 1.8 + 32), // c * 9 / 5 + 32
  C2FR: c => Math.round(c * 1.8), // c * 9 / 5, R -> Relative
  F2C: f => Math.round((f - 32) * 5 / 9),
  F2CR: f => Math.round(f * 5 / 9),
};

class FridgeData {
  constructor(copyFrom) {
    Object.assign(this, copyFrom == null ? gInitData : copyFrom);
    Object.seal(this);
  }

  static isEqual(d1, d2) {
    if (d1 == null || d2 == null) {
      return d1 == d2;
    }

    //return 
    //d1.locked == d2.locked
    //&& d1.poweredOn == d2.poweredOn
    //&& d1.runMode == d2.runMode
    //&& d1.batSaver == d2.batSaver
    //&& d1.batPercent == d2.batPercent
    //&& d1.batVolInt == d2.batVolInt
    //&& d1.batVolDec == d2.batVolDec
    //&& d1.startDelay == d2.startDelay
    //&& d1.unit == d2.unit
    //&& d1.tempMin == d2.tempMin
    //&& d1.tempMax == d2.tempMax
    //&& d1.leftCurrent == d2.leftCurrent
    //&& d1.leftTarget == d2.leftTarget
    //&& d1.leftRetDiff == d2.leftRetDiff
    //&& d1.leftTCHot == d2.leftTCHot
    //&& d1.leftTCMid == d2.leftTCMid
    //&& d1.leftTCCold == d2.leftTCCold
    //&& d1.leftTCHalt == d2.leftTCHalt
    //&& d1.rightCurrent == d2.rightCurrent
    //&& d1.rightTarget == d2.rightTarget
    //&& d1.rightRetDiff == d2.rightRetDiff
    //&& d1.rightTCHot == d2.rightTCHot
    //&& d1.rightTCMid == d2.rightTCMid
    //&& d1.rightTCCold == d2.rightTCCold
    //&& d1.rightTCHalt == d2.rightTCHalt
    //&& d1.runningStatus == d2.runningStatus;
    // 像上面那样把许多&&表达式直接写在return中，返回的竟然一直都是undefined!!!
    // lfree 2019-04-27 08:23
    let b = d1.locked == d2.locked &&
      d1.poweredOn == d2.poweredOn &&
      d1.runMode == d2.runMode &&
      d1.batSaver == d2.batSaver &&
      d1.batVolInt == d2.batVolInt &&
      d1.batVolDec == d2.batVolDec &&
      d1.startDelay == d2.startDelay &&
      d1.unit == d2.unit &&
      d1.tempMin == d2.tempMin &&
      d1.tempMax == d2.tempMax &&
      d1.leftCurrent == d2.leftCurrent &&
      d1.leftTarget == d2.leftTarget &&
      d1.leftRetDiff == d2.leftRetDiff &&
      d1.leftTCHot == d2.leftTCHot &&
      d1.leftTCMid == d2.leftTCMid &&
      d1.leftTCCold == d2.leftTCCold &&
      d1.leftTCHalt == d2.leftTCHalt &&
      d1.rightCurrent == d2.rightCurrent &&
      d1.rightTarget == d2.rightTarget &&
      d1.rightRetDiff == d2.rightRetDiff &&
      d1.rightTCHot == d2.rightTCHot &&
      d1.rightTCMid == d2.rightTCMid &&
      d1.rightTCCold == d2.rightTCCold &&
      d1.rightTCHalt == d2.rightTCHalt &&
      d1.runningStatus == d2.runningStatus;
    return b;
  }

  isEqualTo(fd) {
    return FridgeData.isEqual(this, fd);
  }
}

function leftEmpty(fd) {
  return fd.leftCurrent == -128;
}

function rightEmpty(fd) {
  return fd.rightCurrent == -128;
}

export {
  EMPTY_DEGREE,
  UNIT_C,
  UNIT_C_STR,
  UNIT_F,
  UNIT_F_STR,
  FridgeData,
  ParamLimit,
  TTrans,
  leftEmpty,
  rightEmpty,
};
export default {
  leftEmpty,
  rightEmpty,
}
