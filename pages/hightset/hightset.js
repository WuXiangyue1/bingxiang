const app = getApp()
var FridgeData = require("../utils/FridgeData")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    unit:['℃','℉'],
    unit_type:0,
    startDelay:[],
    startDelay_type: 0,
    leftRetDiff:[],
    leftRetDiff_type: 0,
    leftTCHalt:[],
    leftTCHalt_type: 0,
    leftTCHot:[],
    leftTCHot_type:0,
    leftTCMid:[],
    leftTCMid_type:0,
    leftTCCold:[],
    leftTCCold_type:0,



    rightRetDiff:[],
    rightRetDiff_type: 0,
    rightTCHalt:[],
    rightTCHalt_type: 0,
    rightTCHot:[],
    rightTCHot_type:0,
    rightTCMid:[],
    rightTCMid_type:0,
    rightTCCold:[],
    rightTCCold_type:0,

    rightEmpty:false,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   let startDelayMin = FridgeData.ParamLimit.startDelayMin
   let startDelayMax = FridgeData.ParamLimit.startDelayMax
   let leftRetDiffMin = FridgeData.ParamLimit.leftRetDiffMin[0]
   let leftRetDiffMax = FridgeData.ParamLimit.leftRetDiffMax[0]
   let leftTCHaltMin = FridgeData.ParamLimit.leftTCHaltMin[0]
   let leftTCHaltMax = FridgeData.ParamLimit.leftTCHaltMax[0]
   let leftTCHotMin = FridgeData.ParamLimit.leftTCHotMin[0]
   let leftTCHotMax = FridgeData.ParamLimit.leftTCHotMax[0]
   let leftTCMidMin = FridgeData.ParamLimit.leftTCMidMin[0]
   let leftTCMidMax = FridgeData.ParamLimit.leftTCMidMax[0]
   let leftTCColdMin = FridgeData.ParamLimit.leftTCColdMin[0]
   let leftTCColdMax = FridgeData.ParamLimit.leftTCColdMax[0]



   
   
    var result = app.globalData.result

     if(FridgeData.rightEmpty(result.data)){
      this.setData({
        rightEmpty:true
      })
   }
    
    
   
    var startDelay = this.createArray(startDelayMin,startDelayMax,0)

    var leftRetDiff = this.createArray(leftRetDiffMin,leftRetDiffMax,result.data.unit)
    var leftTCHalt = this.createArray(leftTCHaltMin,leftTCHaltMax,result.data.unit)
    var leftTCHot = this.createArray(leftTCHotMin,leftTCHotMax,result.data.unit)
    var leftTCMid = this.createArray(leftTCMidMin,leftTCMidMax,result.data.unit)
    var leftTCCold = this.createArray(leftTCColdMin,leftTCColdMax,result.data.unit)

    this.setData({
      startDelay:startDelay,

      leftRetDiff:leftRetDiff,
      leftTCHalt:leftTCHalt,
      leftTCHot:leftTCHot,
      leftTCMid:leftTCMid,
      leftTCCold:leftTCCold,

      rightRetDiff:leftRetDiff,
      rightTCHalt:leftTCHalt,
      rightTCHot:leftTCHot,
      rightTCMid:leftTCMid,
      rightTCCold:leftTCCold
    })

    
    var leftRetDiff_type = this.getIndex(result.data.leftRetDiff,leftRetDiff)
    var leftTCHot_type = this.getIndex(result.data.leftTCHot,leftTCHot)
    var leftTCMid_type = this.getIndex(result.data.leftTCMid,leftTCMid)
    var leftTCCold_type = this.getIndex(result.data.leftTCCold,leftTCCold)
    var leftTCHalt_type = this.getIndex(result.data.leftTCHalt,leftTCHalt)
    
    var rightRetDiff_type = this.getIndex(result.data.rightRetDiff,leftRetDiff)
    var rightTCHot_type = this.getIndex(result.data.rightTCHot,leftTCHot)
    var rightTCMid_type = this.getIndex(result.data.rightTCMid,leftTCMid)
    var rightTCCold_type = this.getIndex(result.data.rightTCCold,leftTCCold)
    var rightTCHalt_type = this. getIndex(result.data.rightTCHalt,leftTCHalt)

   

    this.setData({
      unit_type:result.data.unit,

      startDelay_type:result.data.startDelay,

      leftRetDiff_type:leftRetDiff_type,
      leftTCHalt_type:leftTCHalt_type,
      leftTCHot_type:leftTCHot_type,
      leftTCMid_type:leftTCMid_type,
      leftTCCold_type:leftTCCold_type,

      rightRetDiff_type:rightRetDiff_type,
      rightTCHalt_type:rightTCHalt_type,
      rightTCHot_type:rightTCHot_type,
      rightTCMid_type:rightTCMid_type,
      rightTCCold_type:rightTCCold_type,



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

  ChangeStartDelay: function (e) {
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeStartDelay发送选择改变，携带值为', e.detail.value)
    this.setData({
      startDelay_type: e.detail.value
    })
    
    var result = app.globalData.result

    //String转int
    // result.data.startDelay = parseInt(e.detail.value)

    result.data.startDelay = this.data.startDelay[e.detail.value]
    
    console.log("ChangeStartDelay::",result.data)
     app.writeSetOthers(result.data)
  },
  
  ChangeLeftRetDiff: function (e) {
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeLeftRetDiff发送选择改变，携带值为', e.detail.value)
    this.setData({
      leftRetDiff_type: e.detail.value
    })
   
    var result = app.globalData.result

    result.data.leftRetDiff = this.data.leftRetDiff[e.detail.value]
    // if(result.data.unit == 0){
    //   console.log("+++::"+(parseInt(e.detail.value)+1))
    //   result.data.leftRetDiff = (parseInt(e.detail.value)+1)
    // }else{
     
    //   result.data.leftRetDiff = Math.round((parseInt(e.detail.value)+1) * 1.8)
    // }
    
    app.writeSetOthers(result.data)
  },
  ChangeLeftTCHalt: function (e) {
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeleftTCHalt发送选择改变，携带值为', e.detail.value)
    this.setData({
      leftTCHalt_type: e.detail.value
    })
    var result = app.globalData.result

    result.data.leftTCHalt = this.data.leftTCHalt[e.detail.value]
    // for(let i=0;i<=10;i++){
    //   if(i == e.detail.value){
    //     if(result.data.unit == 0){
    //       result.data.leftTCHalt = i-10
    //     }else{
    //       result.data.leftTCHalt = Math.round(parseInt(i-10)*1.8)
    //     }
    //     break
    //   }
    // }
    app.writeSetOthers(result.data)
    
  },
  ChangeLeftTCHot:function(e){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeleftTCHalt发送选择改变，携带值为', e.detail.value)
    this.setData({
      leftTCHot_type: e.detail.value
    })


    console.log("ChangeLeftTCHot::",this.data.leftTCHot[e.detail.value])

    
    var result = app.globalData.result

    result.data.leftTCHot = this.data.leftTCHot[e.detail.value]
    // for(let i=0;i<=20;i++){
    //   if(i == e.detail.value){
    //     if(result.data.unit == 0){
    //       result.data.leftTCHot = i-10
    //     }else{
    //       result.data.leftTCHot = Math.round(parseInt(i-10)*1.8)
    //     }
        
    //     break
    //   }
    // }
    app.writeSetOthers(result.data)
  },
  ChangeLeftTCMid:function(e){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeLeftTCMid发送选择改变，携带值为', e.detail.value)
    this.setData({
      leftTCMid_type: e.detail.value
    })
    var result = app.globalData.result

    result.data.leftTCMid = this.data.leftTCMid[e.detail.value]
    // for(let i=0;i<20;i++){
    //   if(e.detail.value == i){
    //     if(result.data.unit == 0){
    //       result.data.leftTCMid = i-10
    //     }else{
    //       result.data.leftTCMid = Math.round(parseInt(i-10)*1.8)
    //     }
       
    //    break;
    //   }
    // }
    app.writeSetOthers(result.data)
  },
  ChangeLeftTCCold:function(e){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeLeftTCCold发送选择改变，携带值为', e.detail.value)
    this.setData({
      leftTCCold_type: e.detail.value
    })
    var result = app.globalData.result
    

    result.data.leftTCCold = this.data.leftTCCold[e.detail.value]
  //  for(let i=0;i<20;i++){
  //    if(e.detail.value == i){
  //     if(result.data.unit == 0){
  //       result.data.leftTCCold = i-10
  //     }else{
  //       result.data.leftTCCold = Math.round(parseInt(i-10)*1.8)
  //     }
  //     break;
  //    }
  //  }

    console.log("result.data.leftTCMid:::"+result.data.leftTCCold)
    app.writeSetOthers(result.data)
  },


  ChangeRightRetDiff: function (e) {
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeRightRetDiff发送选择改变，携带值为', e.detail.value)
    this.setData({
      rightRetDiff_type: e.detail.value
    })
   
    var result = app.globalData.result

    result.data.rightRetDiff = this.data.rightRetDiff[e.detail.value]
    // if(result.data.unit == 0){
    //   console.log("+++::"+(parseInt(e.detail.value)+1))
    //   result.data.rightRetDiff = (parseInt(e.detail.value)+1)
    // }else{
     
    //   result.data.rightRetDiff = Math.round((parseInt(e.detail.value)+1) * 1.8)
    // }
    
    app.writeSetOthers(result.data)
  },

  ChangeRightTCHalt: function (e) {
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeleftTCHalt发送选择改变，携带值为', e.detail.value)
    this.setData({
      rightTCHalt_type: e.detail.value
    })
    var result = app.globalData.result

    result.data.rightTCHalt = this.data.rightTCHalt[e.detail.value]
    // for(let i=0;i<=10;i++){
    //   if(i == e.detail.value){
    //     if(result.data.unit == 0){
    //       result.data.rightTCHalt = i-10
    //     }else{
    //       result.data.rightTCHalt = Math.round(parseInt(i-10)*1.8)
    //     }
    //     break
    //   }
    // }
    app.writeSetOthers(result.data)
    
  },
  ChangeRightTCHot:function(e){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeleftTCHalt发送选择改变，携带值为', e.detail.value)
    this.setData({
      rightTCHot_type: e.detail.value
    })
    var result = app.globalData.result

    result.data.rightTCHot = this.data.rightTCHot[e.detail.value]
    // for(let i=0;i<=20;i++){
    //   if(i == e.detail.value){
    //     if(result.data.unit == 0){
    //       result.data.rightTCHot = i-10
    //     }else{
    //       result.data.rightTCHot = Math.round(parseInt(i-10)*1.8)
    //     }
        
    //     break
    //   }
    // }
    app.writeSetOthers(result.data)
  },
  ChangeRightTCMid:function(e){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeLeftTCMid发送选择改变，携带值为', e.detail.value)
    this.setData({
      rightTCMid_type: e.detail.value
    })
    var result = app.globalData.result

    result.data.rightTCMid = this.data.rightTCMid[e.detail.value]
    // for(let i=0;i<20;i++){
    //   if(e.detail.value == i){
    //     if(result.data.unit == 0){
    //       result.data.rightTCMid = i-10
    //     }else{
    //       result.data.rightTCMid = Math.round(parseInt(i-10)*1.8)
    //     }
       
    //    break;
    //   }
    // }
    app.writeSetOthers(result.data)
  },
  ChangeRightTCCold:function(e){
    if(!app.globalData.blueToothConnected){
      wx.showModal({
        content: '链接失败，请下拉刷新重新链接~',
      }) 
      return
     }
    console.log('ChangeLeftTCCold发送选择改变，携带值为', e.detail.value)
    this.setData({
      rightTCCold_type: e.detail.value
    })
    var result = app.globalData.result
    
    result.data.rightTCCold = this.data.rightTCCold[e.detail.value]
  //  for(let i=0;i<20;i++){
  //    if(e.detail.value == i){
  //     if(result.data.unit == 0){
  //       result.data.rightTCCold = i-10
  //     }else{
  //       result.data.rightTCCold = Math.round(parseInt(i-10)*1.8)
  //     }
  //     break;
  //    }
  //  }

    app.writeSetOthers(result.data)
  },

  createArray:function(start,end,unit_type){
    var data = []
    if(unit_type === 0){
      for(let i=start;i<=end;i++){
        data.push(i)
      }
    }else{
      for(let i=start;i<=end;i++){
        data.push(Math.round(i * 1.8))
      }
    }
   
    return data
  },
   
  // getIndex:function(value){
  //   var index = ''
  //   var result = app.globalData.result
  //   for(let i=-18;i<=100;i++){
  //      if(i == value){
  //        if(result.data.unit == 0){
  //         index = i+10
  //        }else{
  //         index = Math.round(value/1.8)+10
  //        }
  //         break
  //      }
  //   }
  //   console.log("index:::"+index)
  //   return index
  // },

  getIndex:function(value,arr){
    var index = 0
    for(var i=0;i<=arr.length;i++){
      if(arr[i] == value){
        index = i
        break
      }
    }
    return index
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
      // var deviceId = 'CA:1F:0D:A2:F8:C3'
      console.log("deviceId:::"+deviceId)
      app.againConnection(deviceId)
      
    }else{
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    }
  },

  






  

})