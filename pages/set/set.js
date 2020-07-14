const app = getApp()
var FridgeProtocol = require("../utils/FridgeProtocol.js")
var FridgeData = require("../utils/FridgeData")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    unit:['℃','℉'],
    unit_type: 0,
    tempMax:[],
    max_type: 0,
    tempMin:[],
    min_type: 0,
    language:['简体中文'],
    language_type: 0,
    timer:null,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var type = options.type
    console.log("type::"+type)
    var result = app.globalData.result
    if(result.data.unit == 0){
       this.setData({
        tempMax:[10,15,20],
        tempMin:[-10,-15,-20]
       })
    }else{
      this.setData({
        tempMax:[50,59,68],
        tempMin:[14,5,-4]
       })
    }

    console.log("result:::"+JSON.stringify(result))
    var max_type = this.getMaxType(result.data.tempMax)
    var min_type = this.getMinType(result.data.tempMin)
  
    this.setData({
        max_type:max_type,
        min_type:min_type,
        unit_type: result.data.unit,
      })

  var deviceId = app.globalData.deviceId
  console.log("deviceId:::"+deviceId)




  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow:function () {
    console.log("重新进来了")

    var that = this;

    console.log("blueToothConnected:::"+app.globalData.blueToothConnected)

    if(!app.globalData.blueToothConnected){
      var deviceId = app.globalData.deviceId;
      console.log("deviceId:::"+deviceId)
      app.againConnection(deviceId)
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {


  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {


  },






  bindPickerChangeUnit: function (e) {
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
   
    console.log('unit_type发送选择改变，携带值为', e.detail.value)
    this.setData({
      unit_type: e.detail.value
    })
    
    let result = app.globalData.result.data
    let UNIT_C = 0
    let UNIT_F = 1
    // 单位反转

    if(parseInt(e.detail.value) != result.unit){
      result.unit = parseInt(e.detail.value)
  
      // 温度转换
      // （设置unit的同时也要将其他配置信息一起传过去，
      // 所以必须保证unit切换后其他数值不变。）
      // ℉ = ℃*9/5 + 32
      // △℉ = △℃*9/5
      let T, TR;
      if (result.unit == UNIT_F) { // C -> F
        T = FridgeData.TTrans.C2F;
        TR = FridgeData.TTrans.C2FR;
      } else { // F -> C
        T = FridgeData.TTrans.F2C;
        TR = FridgeData.TTrans.F2CR;
      }
    
      result.tempMin = T(result.tempMin);
      result.tempMax = T(result.tempMax);
    
      result.leftTarget = T(result.leftTarget);
      result.leftRetDiff = TR(result.leftRetDiff);
      result.leftTCHot = TR(result.leftTCHot);
      result.leftTCMid = TR(result.leftTCMid);
      result.leftTCCold = TR(result.leftTCCold);
      result.leftTCHalt = TR(result.leftTCHalt);
    
      result.rightTarget = T(result.rightTarget);
      result.rightRetDiff = TR(result.rightRetDiff);
      result.rightTCHot = TR(result.rightTCHot);
      result.rightTCMid = TR(result.rightTCMid);
      result.rightTCCold = TR(result.rightTCCold);
      result.rightTCHalt = TR(result.rightTCHalt);
    
      app.writeSetOthers(result);
      var resulted = app.globalData.result
      console.log("华氏度:::"+JSON.stringify(resulted))
      
      var max_type = this.getMaxType(resulted.data.tempMax)
      var min_type = this.getMinType(resulted.data.tempMin)
      if(resulted.data.unit == 0){
        this.setData({
         tempMax:[10,15,20],
         tempMin:[-10,-15,-20]
        })
     }else{
       this.setData({
         tempMax:[50,59,68],
         tempMin:[14,5,-4]
        })
     }
      this.setData({
          max_type:max_type,
          min_type:min_type,
        })
  
    }
   

  },
  bindPickerChangeMax: function (e) {
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('max_type发送选择改变，携带值为', e.detail.value)
    this.setData({
      max_type: e.detail.value
    })

    var result = app.globalData.result
    result.data.tempMax = this.data.tempMax[e.detail.value]
   
  
    console.log("bindPickerChangeMax::",result.data)
     app.writeSetOthers(result.data)
  },

  bindPickerChangeMin: function (e) {
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('min_type发送选择改变，携带值为', e.detail.value)
    this.setData({
      min_type: e.detail.value
    })
    var result = app.globalData.result

    result.data.tempMin = this.data.tempMin[e.detail.value]
   
   
    console.log("bindPickerChangeMin::",result.data)
     app.writeSetOthers(result.data)
  },
  bindPickerChangeLanguage: function (e) {
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('language_type发送选择改变，携带值为', e.detail.value)
    this.setData({
      language_type: e.detail.value
    })
  },
  goHightSet:function(){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    wx.navigateTo({
      url: '../hightset/hightset',
    })
  },
  doReset:function(){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    wx.showModal({
      title: '确定要重置吗？',
      success(res){
        if (res.confirm) {
          console.log('用户点击确定')
          app.writeRest()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  getMaxType(value){
    var max_type=''
    switch(value){
      case 10:
        max_type = 0
        break
      case 15:
        max_type = 1
        break
      case 20:
        max_type = 2
        break
      case 50:
        max_type = 0
        break
      case 59:
        max_type = 1
        break
      case 68:
        max_type = 2
        break
    }
    return max_type
  },
  getMinType(value){
    var min_type=''
    switch(value){
      case 14:
        min_type = 0
        break
     case 5:
        min_type = 1
        break
      case -4:
        min_type = 2
        break
      case -10:
        min_type = 0
        break
      case -15:
        min_type = 1
        break
      case -20:
        min_type = 2
        break
    }
    return min_type
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
      
    }else{
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    }
  },

})