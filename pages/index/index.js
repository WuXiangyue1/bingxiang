//index.js
//获取应用实例
const app = getApp()


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
  data: {
    
    attentionAnim: '',
    attentionAnim2:'',
    circularIsShow:true,
    status:false,
    lanyaStatus:true,
    



    deviceId:'', //设备id
    serviceId:'',
    writeId:'',//写入服务特征id
    readId:'',
    notifyId:'',
    result:'',
    


    blueLength:3,
    bluetoothList:[],

    devices:[],
   
    chs: [],

    fridgeList:[
      {
        id:'1001',
        name:'CF-01',
        fridgeUrl:'/images/fridege.png'
      },
      {
        id:'1001',
        name:'A1-DFA8AF04E6C8',
        fridgeUrl:'/images/fridege.png'
      },
      {
        id:'1003',
        name:'CF-01',
        fridgeUrl:'/images/fridege.png'
      },
     
   
    ],
    locationEnabled:'',
    locationAuthorized:'',
    platform:'',

   
   
  },
  //初始化蓝牙模块
  // openBluetoothAdapter() {
  //   var that = this;
  //   //判断用户是否开启蓝牙
  //   wx.openBluetoothAdapter({
  //     success:function(res){
  //       console.log(res)
  //       that.setData({
  //         status:true,
  //         lanyaStatus:false,
  //         iconStatus:false,
  //         circularIsShow:false
  //       })
  //       wx.onBluetoothAdapterStateChange(function (res) {
  //         console.log('adapterState changed, now is', res)
  //       })
  //       //开始搜索蓝牙设备
  //       that.startBluetoothDevicesDiscovery()
  //     },
  //     fail:function(result){
        
  //       console.log(result)
  //       wx.showModal({
  //         content: '请开启蓝牙设备,并授予权限',
  //       }) 
  //       wx.onBluetoothAdapterStateChange(function (res) {
  //         console.log('adapterState changed, now is', res)
  //       })
  //     }
  //   })
    
  // },


   startBluetoothDevicesDiscovery(){
     var that = this
     //搜索设备
     this.getSystemInfo()
     if(app.globalData.available){
      


      if(this.data.platform == 'ios'){
         this.search()
      }else{
        if(!that.data.locationAuthorized){
          wx.showModal({
            content: '请在手机设置中授予微信定位权限',
          })

        }else if(!that.data.locationEnabled){
          wx.showModal({
            content: '请先开启手机定位，否则搜索不到设备',
          }) 
        }else{
          this.search()

        }
      }
     }else{
      wx.showModal({
        content: '请开启蓝牙设备',
      }) 
     }
    
    
   

  },
  //监听寻找到新设备的事件
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if ((device.name.indexOf("WT") < 0 ) && (device.name.indexOf("A1") < 0 )) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = []
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }

        console.log("data",typeof(data))
        // 按rssi从大到小排序
        data.sort((first, second) => {
  if (isNaN(first.RSSI) && isNaN(second.RSSI)) {
    return 0;
  } else if (isNaN(first.RSSI)) {
    return 1;
  } else if (isNaN(second.RSSI)) {
    return -1;
  } else {
    return first.rssi < second.rssi;
  }
          })
        this.setData(data)
       
        console.log(this.data.devices)
        this.setData({
          blueLength:this.data.devices.length
        })
      })
    })
  },


  //停止搜索
  stopSearch:function(){
    this.setData({
      status:false,
      lanyaStatus:true,
      circularIsShow:true
    })
    app.stopBluetoothDevicesDiscovery()
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },

  createBLEConnection(e){
    var deviceId = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name
    this.stopSearch()
   app.createBLEConnection(deviceId,name)
    
  },
 

 

  

  

  
  onReady:function(){
    var attentionAnim = wx.createAnimation({
      duration: 150,
      timingFunction: 'ease',
      delay: 0
     })
     //设置循环动画
     this.attentionAnim = attentionAnim
     var next = true;
     setInterval(function () {
      if (next) {
       //根据需求实现相应的动画
       this.attentionAnim.opacity(0).step()
       next = !next;
      } else {
       this.attentionAnim.opacity(0.4).step()
       next = !next;
      }
      this.setData({
       //导出动画到指定控件animation属性
       attentionAnim: attentionAnim.export()
      })
     }.bind(this), 300)

     var attentionAnim2 = wx.createAnimation({
      duration: 150,
      timingFunction: 'ease',
      delay: 0
     })
     //设置循环动画
     this.attentionAnim2 = attentionAnim2
     var next = true;
     setInterval(function () {
      if (next) {
       //根据需求实现相应的动画
       this.attentionAnim2.opacity(0).step()
       next = !next;
      } else {
       this.attentionAnim2.opacity(0.3).step()
       next = !next;
      }
      this.setData({
       //导出动画到指定控件animation属性
       attentionAnim2: attentionAnim2.export()
      })
     }.bind(this), 200)

  },
  onLoad:function(){


    console.log(wx)
  
    //app.removeStorageSync()
  
  
  //从本地缓存中取出user
  var fridgeList = app.getFridgeBinded();
 
  if(fridgeList != null && fridgeList != '' && fridgeList != undefined){
    //var foundDevices = this.data.devices
    //foundDevices.push(fridge)
    console.log("foundDevices::",fridgeList)
    this.setData({
      devices:fridgeList,
     
    })
  }
    
    
  },
  onShow:function(){
   
    console.log("进来了index,要断开链接")
    console.log("deviceId",app.globalData.deviceId)
    console.log("blueToothConnected:::"+app.globalData.blueToothConnected)
    if(app.globalData.blueToothConnected){
      new Promise(function(resolve,reject){
        app.closeBLEConnection(resolve)
      }).then(function(){
        app.globalData.go = false
      })
      // app.closeBLEConnection()
      // app.globalData.go = false
    }
    
  },
  onHide:function(){

    this.stopSearch()
    console.log("index onHide")
  },
 
  onUnload:function(){
   app.stopBluetoothDevicesDiscovery()
  },

  getSystemInfo:function(){
    var that = this
    //获取设备信息
   wx.getSystemInfo ({
    success:res =>{
      console.log("getSystemInfo",res)
      app.globalData.available = res.bluetoothEnabled
      that.setData({
        locationEnabled:res.locationEnabled,  //判断是否开定位
        locationAuthorized:res.locationAuthorized, //判断允许微信使用定位的权限
        platform : res.platform //判断ios/android
      })
      console.log("getSystemInfo",res.locationEnabled)
    }
  })
  },

  search:function(){
    var that = this

    //30秒停止搜索
    setTimeout(function(){
      that.stopSearch()
    },30000)


    var that = this
    this.setData({
      status:true,
      lanyaStatus:false,
      circularIsShow:false
   })
    wx.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: true,
    success:(res)=>{
      console.log('startBluetoothDevicesDiscovery success', JSON.stringify(res))
      that.onBluetoothDeviceFound()
     },
    fail:(err) =>{
      console.log("startBluetoothDevicesDiscovery fail:"+err)
     }
    })
  },
   /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
      if (res.from === 'button') {
        console.log(res.target)
      }
      
      return {
        title: '冰虎车载冰箱',
        path: "pages/index/index"
      }
    },
    longPress:function(e){
      var that = this
      let deviceId = e.currentTarget.dataset.id
      let name = e.currentTarget.dataset.name
      console.log("长按的deviceId:::",deviceId)
      let fridgeList = app.getFridgeBinded()
      console.log("从本地取出来的fridge:::",fridgeList)
      let isBind = false
      let fridgeIndex = null
      //判断之前是否绑定过该设备
      if(fridgeList != null && fridgeList != '' && fridgeList != undefined )
      {
        try{
          fridgeList.forEach( (item,index) =>{
            if(item.deviceId == deviceId){
              isBind = true  
              fridgeIndex = index
              throw Error()//跳出循环
            }
          })
        }catch(e){

        }
       
      }


      if(isBind){
        let newArray = []
        wx.showModal({
          title: '提示',
          content:'确定要删除 '+name+' 这台设备吗?',
          success(res){
            if(res.confirm){
               fridgeList.splice(fridgeIndex, 1)
              console.log("newArray",fridgeList)
              app.setFridgeBinded(fridgeList)
              that.setData({
                devices:fridgeList,

              })
            }
          }
        })
      }
     
    }


 
   
 
  

 
  

  
})
