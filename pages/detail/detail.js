const app = getApp()
var FridgeProtocol = require("../utils/FridgeProtocol.js")
var FridgeData = require("../utils/FridgeData")
var gReadBuf = null;




function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    unit:['℃','℉'],
    unit_type: 0,
    tempMin:'',
    tempMax:'',

    isHshow:false,
    isMshow:true,
    isLshow:false,
    isHotshow:false,
    isIceshow:true,

    deviceId:'', //设备id
    serviceId:'',
    writeId:'',//写入服务特征id
    readId:'',
    notifyId:'',
    FridgeProtocol:'',

  
    result:'',
    leftCurrent:'',  //左温度
    rightCurrent:"--", //右温度
    batSaver:'', //电压保护：0-H1，1-H2，2-H3
    runMode:'',  //运行模式：0-全速运行，1-经济运行
    poweredOn:'',// 0-powered off, 1-powered on
    locked:'',// 0-unlocked, 1-locked
    isconnect:true,//0-断开链接 1-打开链接

    rightEmpty:false, //true 为单仓，false为双仓

    ishot:false,//true 为有加热功能，false为双仓
    

    leftSet:0,
    rightSet:'',
    timer:null,
    

    
   
    
    
   


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    app.globalData.go = true

     //获取上一个页面传递过来的参数
    //并把字符串转化成JSON对象
    var result = JSON.parse(options.result)
    console.log("传过来的result:::",result)
    this.setData({
      result:result
    })
    
     var deviceId = options.deviceId;
    // var deviceId = '23:E5:AC:A9:F1:D6'
    console.log("detail deviceId:"+deviceId)
    this.setData({
      deviceId:deviceId
    })
   
    let fridgeData = result.data
    let rightCurrent = ''
    if(FridgeData.rightEmpty(result.data)){
      rightCurrent = "--"
      this.setData({
        rightEmpty:true,
        rightSet:"--"
      })
   }else{
     rightCurrent = result.data.rightCurrent
     this.setData({
      rightSet:fridgeData.rightTarget
    })
   }
  //  if(result.data.unit == 0){
  //    this.setData({
  //     tempMin:-20,
  //     tempMax:20,
  //    })
  //  }else{
  //   this.setData({
  //     tempMin:-4,
  //     tempMax:68,
  //    })
  //  }
    this.setData({
      leftCurrent:fridgeData.leftCurrent,
      rightCurrent:rightCurrent,
      batSaver:fridgeData.batSaver,
      runMode:fridgeData.runMode,
      locked:fridgeData.locked,
      poweredOn:fridgeData.poweredOn,
      leftSet:fridgeData.leftTarget,
      unit_type:result.data.unit,
      tempMin:fridgeData.tempMin,
      tempMax:fridgeData.tempMax
      })

      
       
     
      
  
      
  },

 



 
  


 




  onHide:function(){
    this.closePolling()
    console.log("detail onHide")
    
   
  },
  onUnload:function(){
    this.closePolling()
    
  },
  onShow:function () {
    console.log("重新进来了")
    console.log("rightSet::::",this.data.rightSet)
  
    var that = this;
    this.setData({
      isconnect : true
    })
    console.log("blueToothConnected:::"+app.globalData.blueToothConnected)

    let result = app.globalData.result
    let fridgeData = app.globalData.result.data
    let rightCurrent = ''
    if(FridgeData.rightEmpty(result.data)){
      rightCurrent = "--"
      this.setData({
        rightEmpty:true,
        rightSet:"--"
      })
   }else{
     rightCurrent = result.data.rightCurrent
     this.setData({
      rightSet:result.data.rightTarget
    })
   }
   
    this.setData({
      leftCurrent:fridgeData.leftCurrent,
      rightCurrent:rightCurrent,
      leftSet:fridgeData.leftTarget,
      unit_type:result.data.unit,
      tempMin:fridgeData.tempMin,
      tempMax:fridgeData.tempMax
      })
   
      console.log("leftSet::::"+ this.data.leftSet)
    if(!app.globalData.blueToothConnected){
      var deviceId = app.globalData.deviceId;
      console.log("deviceId:::"+deviceId)
      app.againConnection(deviceId)
    }
    this.monitorTP()
    
    
  },

 
  leftBindchanging(e){
    
    var that = this
    that.setData({
      leftSet:e.detail.value
    })
  },
  leftBindchange(e){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    var that = this
   
    that.setData({
      leftSet:e.detail.value
    })
    app.writeSetLeft(e.detail.value)
  },

  RightBindchanging(e){
    
    var that = this
    that.setData({

      rightSet:e.detail.value
    })
  },
  RightBindchange(e){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    var that = this
    that.setData({
      rightSet:e.detail.value
    })
    app.writeSetRight(e.detail.value)
  },

 
  HOnchange:function(){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
     var that = this
    var result = that.data.result
    result.data.batSaver = 2
    app.writeSetOthers(result.data)
    
    that.setData({
      batSaver:2,
    })
    
  },
  MOnchange:function(){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    var that = this
    that.setData({
      batSaver:1,
    })
    var result = that.data.result
    result.data.batSaver = 1
    app.writeSetOthers(result.data)
    
    
  },
  LOnchange:function(){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    var that = this
    that.setData({
      batSaver:0,
    })
    var result = that.data.result
    result.data.batSaver = 0
    app.writeSetOthers(result.data)
    
    
  },
  HotOnchange:function(){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    this.setData({
      isHotshow:true,
    isIceshow:false,

    })
  },
  IceOnchange:function(){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    this.setData({
      isHotshow:false,
    isIceshow:true,

    })
  },

  changeRunMode:function(){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    var that = this
    var runMode = that.data.runMode
    if(runMode == 0){
      that.setData({
        runMode:1
      })
      var result = that.data.result
      result.data.runMode = 1
      app.writeSetOthers(result.data)
    }
    if(runMode == 1){
      that.setData({
        runMode:0
      })
      var result = that.data.result
      result.data.runMode = 0
      app.writeSetOthers(result.data)
    }
  },
  changeLocked:function(){
    if(app.judgeStatus()){

    
    var that = this
    var locked = that.data.locked
    if(locked == 0){
      that.setData({
        locked:1
      })
      var result = that.data.result
      result.data.locked = 1
      app.writeSetOthers(result.data)
    }
    if(locked == 1){
      that.setData({
        locked:0
      })
      var result = that.data.result
      result.data.locked = 0
      app.writeSetOthers(result.data)
    }
  }
  },
  changeConnect:function(){

      wx.navigateBack({
        complete: (res) => {},
      })
    
  },
  changePoweredOn:function(){
    if(!app.globalData.blueToothConnected){
      if(!app.globalData.available){
        wx.showModal({
          content: '链接失败，请打开蓝牙~',
        }) 
      }else{
        wx.showModal({
          content: '链接失败，请下拉刷新重新链接~',
        }) 
      }
      
      return
     }
    var that = this
    var poweredOn = that.data.poweredOn
    if(poweredOn == 0){
      that.setData({
        poweredOn:1
      })
      var result = that.data.result
      result.data.poweredOn = 1
      app.writeSetOthers(result.data)
    }
    if(poweredOn == 1){
      that.setData({
        poweredOn:0
      })
      var result = that.data.result
      result.data.poweredOn = 0
      app.writeSetOthers(result.data)
    }
  },

  goLeftSet(){
    if(app.globalData.blueToothConnected == true){
      wx.navigateTo({
        url: '../set/set?type=left',
      })
    }else{
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      })
    }
    

  },
  goRightSet(){
    if(app.globalData.blueToothConnected == true){
      wx.navigateTo({
        url: '../set/set?type=right',
      })
    }else{
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      })
    }
   
  },
  monitorTP(){
   
    this.data.timer = setInterval(() => {
    var result = app.globalData.result
    let fridgeData = result.data
    let rightCurrent = ''
    if(FridgeData.rightEmpty(fridgeData)){
      rightCurrent = "--"
      this.setData({
        rightEmpty:true,
        rightSet:'--'
      })
   }else{
     rightCurrent = result.data.rightCurrent
     this.setData({
      rightSet:result.data.rightTarget
    })
   }
      this.setData({
        leftCurrent:fridgeData.leftCurrent,
        rightCurrent:rightCurrent,
        tempMin:fridgeData.tempMin,
        tempMax:fridgeData.tempMax
      })
    }, 2000);
  },
  closePolling(){
    this.data.timer&&clearInterval(this.data.timer);
    this.data.timer=null
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
   
    if(!app.globalData.blueToothConnected){
      wx.showNavigationBarLoading()
      wx.showLoading({
        title: '重新链接中~',
      })
      var deviceId = app.globalData.deviceId;
      //var deviceId = 'CA:1F:0D:A2:F8:C3'
      console.log("deviceId:::"+deviceId)
      app.againConnection(deviceId)
      this.setData({
        isconnect : true
      })
      
    }else{
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    }
  },


  
})
