//app.js
var FridgeProtocol = require("pages/utils/FridgeProtocol.js")
var gReadBuf=null
App({

  onLaunch: function () {
    
    // 展示本地存储能力
    //var logs = wx.getStorageSync('logs') || []
    //logs.unshift(Date.now())
    //wx.setStorageSync('logs', logs)

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    //获取设备信息
    wx.getSystemInfo ({
      success:res =>{
        console.log("getSystemInfo",res)
        this.globalData.platform = res.platform //判断ios/android
        this.globalData.locationEnabled = res.locationEnabled  //判断是否开定位
        this.globalData.locationAuthorized = res.locationAuthorized //判断允许微信使用定位的权限
        this.openBluetoothAdapter()
      }
    })

    
  },
  onHide:function(){
     console.log("关闭小程序了！！！")
     this.closeBLEConnection()
     console.log("app onHide")
  },
  globalData: {
    userInfo: null,
    deviceId:'', //设备id
    serviceId:'',
    writeId:'',//写入服务特征id
    readId:'',
    notifyId:'',
    result:'',
    timer:'',
    blueToothConnected:false,
    go:false,
    platform:'',
    locationEnabled:'',
    available:false,
    isSet:false,

    
  },
  setFridgeBinded:function(fridgeList){
    wx.setStorageSync('fridgeList', fridgeList)
  },

  getFridgeBinded:function(){
    return wx.getStorageSync('fridgeList')
  },
  removeStorageSync:function(){
    wx.removeStorageSync("fridgeList");
  },
  


  //初始化蓝牙模块
  openBluetoothAdapter() {
    var that = this
    
    //判断用户是否开启蓝牙
    wx.openBluetoothAdapter({
      success:function(res){
        console.log("openBluetoothAdapter::",res)
        that.globalData.available = true
        that.onBluetoothAdapterStateChange()
        
      },
      fail:function(err){
        console.log(err)
        if(that.globalData.platform == "ios"){
          if(err.state == 3){
            wx.showModal({
              content: '请在手机设置中授予微信蓝牙权限',
            }) 
          }
          if(err.state == 4){
            wx.showModal({
              content: '请开启蓝牙设备',
            }) 
          }

        }else{
          wx.showModal({
            content: '请开启蓝牙设备',
          }) 
        }
        
        that.onBluetoothAdapterStateChange()
      }
    })
    
  },

  createBLEConnection(deviceId,name){
      var that = this
      //从本地缓存中取出fridgeList
      var fridgeList = this.getFridgeBinded()
      console.log("从本地取出来的fridge:::",fridgeList)
      var Bind = false
      if(fridgeList != null && fridgeList != '' && fridgeList != undefined )
      {
        fridgeList.forEach( (item) =>{
          if(item.deviceId == deviceId){
            Bind = true  
          }
        })
      }
    
      var msg='听到滴按设置键'
      if(Bind){
        msg = '正在链接~'
      
      }
    wx.showLoading({
      title: msg,
      mask:true
    })
    
   
   
    
    wx.createBLEConnection({
      deviceId: deviceId,
      success:(res) =>{
       
        this.globalData.deviceId = deviceId
        console.log("deviceId:"+deviceId)
        this.globalData.name = name
        console.log("name:"+name)
        this.onBLEConnectionStateChange()
        console.log("连接蓝牙设备成功")
        //this.globalData.blueToothConnected = true
        this.getBLEDeviceServices(deviceId)
      },
      fail:(err) =>{
        console.log("连接蓝牙设备失败 ----",err);
        wx.hideLoading()
        if(err.errCode == 10001){
          wx.showModal({
            content: '链接失败，请开启蓝牙~',
          }) 
        }else if(err.errCode == -1){
          this.closeBLEConnection()
          wx.showModal({
            content: '链接失败，该设备已被链接~',
          }) 
          // this.closeBLEConnection()
          // this.againConnection(deviceId)
         
        }
        else{
          wx.hideLoading()
          this.closeBLEConnection()
          wx.showModal({
            content: '链接失败，请重新链接~',
          }) 
        } 
      
      }
    })
  },

  againConnection(deviceId){
    if(!this.globalData.blueToothConnected){

    
    wx.showLoading({
      title: '正在链接',
      mask:true
    })
   
    
    console.log("deviceId:"+deviceId)
    
    wx.createBLEConnection({
      deviceId: deviceId,
      success:(res) =>{
        this.onBLEConnectionStateChange()
        wx.hideLoading()
        console.log("连接蓝牙设备成功")
        wx.showToast({
          title: '蓝牙链接成功',
        })
        //this.globalData.blueToothConnected = true
        
        this.getBLEDeviceServices(deviceId)
        
          // 刷新完成后关闭特效
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

      },
      fail:(err) =>{
        console.log("连接蓝牙设备失败 ----"+JSON.stringify(err));
        wx.hideLoading()
        if(err.errCode == 10001){
          wx.showModal({
            content: '链接失败，请开启蓝牙~',
          }) 
        }else if(err.errCode == -1){
          this.closeBLEConnection()
          wx.showModal({
            content: '链接失败，该设备已被链接~',
          }) 
          // this.closeBLEConnection()
          // this.againConnection(deviceId)
         
        }else{
          wx.showModal({
            content: '链接失败，请下拉刷新重新链接~',
          }) 
        }
       
         // 刷新完成后关闭特效
         wx.hideNavigationBarLoading();
         wx.stopPullDownRefresh();
      
      }
      
    })
  }
  },

  getBLEDeviceServices(deviceId) {
    
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        let services = res.services;
        services.forEach((elem) => {
          if ( (elem.isPrimary) && (elem.uuid.indexOf('00001234-0000-1000-8000-00805F9B34FB')) >= 0 ) {
            this.globalData.serviceId=elem.uuid
 
          }
        })
        this.getBLEDeviceCharacteristics(deviceId, this.globalData.serviceId)
      }
    })
  },

  getBLEDeviceCharacteristics(deviceId,serviceId){
    
    wx.getBLEDeviceCharacteristics({
      deviceId, 
      serviceId,
      success: (res) => {
        console.log("characteristics :::",res);
        for(let i = 0 ; i< res.characteristics.length ; i++){
          let charc = res.characteristics[i];
          if(charc.properties.read){
            
            this.globalData.readId=charc.uuid
    
           wx.readBLECharacteristicValue({
             deviceId,
             serviceId,
             characteristicId: charc.uuid,
             success:(res)=>{
              console.log("readBLECharacteristicValue success:::"+JSON.stringify(res))
            },
            fail:(err)=>{
              console.log("readBLECharacteristicValue fail:::"+JSON.stringify(err))
            }
           })
           console.log('readId:::',this.globalData.readId)
         }
          if((charc.properties.write) && (charc.uuid.indexOf("00001235-0000-1000-8000-00805F9B34FB") >= 0)){
            
            this.globalData.writeId=charc.uuid
          
            console.log('writeId:::',this.globalData.writeId)
            //从本地缓存中取出fridgeList
            var fridgeList = this.getFridgeBinded()
            console.log("从本地取出来的fridge:::",fridgeList)
            var isBind = false
            if(fridgeList != null && fridgeList != '' && fridgeList != undefined )
            {
              fridgeList.forEach( (item) =>{
                if(item.deviceId == this.globalData.deviceId){
                  isBind = true  
                }
              })
            }
          

            if(isBind){
              //如果isBind为true则已绑定，发查询命令
              this.openPolling()
            }else{
              //如果isBind为false则没绑定，执行绑定操作
              this.writeBindValue()
            }
            
            
           
            // //如果isBind为true则绑定过，执行查询操作
            // if(fridge.isBind && fridge.deviceId == this.globalData.deviceId){
            //   this.openPolling()
            // }else{
            //    //如果isBind为false则没绑定，执行绑定操作
            //    this.writeBindValue()
            // }
            
         }
          if( (charc.properties.notify) && (charc.uuid.indexOf("00001236-0000-1000-8000-00805F9B34FB") >= 0) ){
            
            this.globalData.notifyId=charc.uuid
          
            //启用低功耗蓝牙设备特征值变化时的 notify 功能
            this.notifyBLECharacteristicValueChange()
           
          console.log('notifyId:::',this.globalData.notifyId)
         }
        }
      },
      fail:err =>{
        console.log("getBLEDeviceCharacteristics err----"+err)
      }
    })

   
  },

  notifyBLECharacteristicValueChange(){
    wx.notifyBLECharacteristicValueChange({
      deviceId:this.globalData.deviceId,
      serviceId:this.globalData.serviceId,
      characteristicId: this.globalData.notifyId,
      state: true,
      success:(res) =>{
         this.onBLECharacteristicValueChange()
      }
    })
  },
  onBLECharacteristicValueChange(){
    var that = this
    //监听
    wx.onBLECharacteristicValueChange((res) => {
      //将返回的ArrayBuffer转换成Array
      let array = Array.prototype.slice.call(new Uint8Array(res.value ));
      var result = this.onCharacteristicValueUpdated(array)

      
      
      if(result != null){
        if(result.cmd === 0 && result.data === 1){
           //判断用户是否按下set
           that.globalData.isSet = true
          
          //若绑定成功，存入缓存
          var fridgeList = this.getFridgeBinded()
          if(fridgeList == '' || fridgeList ==undefined || fridgeList == null){
            fridgeList = []
         }
         var fridge = {}
         fridge = {
            "deviceId":this.globalData.deviceId,
            "name":this.globalData.name,
         } 
         fridgeList.push(fridge)
         
         console.log("存入缓存的fridgeList:::",fridgeList) 
         this.setFridgeBinded(fridgeList)
         this.openPolling()

          
        }
      }else{
        
      }
      console.log("设备返回的array:::"+array)
  
    })
  },

  onCharacteristicValueUpdated(data){
  
  gReadBuf = gReadBuf == null ? data: gReadBuf.concat(data);
  console.log(gReadBuf)


  // 将前面Header之外的内容清除——有时候前面会莫名其妙多出一个字节
  let headerIdx = FridgeProtocol.getHeaderIndex(gReadBuf)
  if(headerIdx < 0){
    //没有header,丢弃之！
    console.log('do not contain header, discard it!');
    gReadBuf = null;
    return;
  }else if(headerIdx > 0){
    console.log(headerIdx, 'jungle bytes discarded');
  gReadBuf.splice(0, headerIdx);
  }

  //判断消息是否完整
  let end = FridgeProtocol.isMessageComplete(gReadBuf)
  if (end <= 0){
    console.log('message not complete yet');
    return;
  }
  //close timer
  
  let result = null;
 
  try{
    result = FridgeProtocol.decodeResponse(gReadBuf.slice(0,end));
    //先清空原来的result
    this.globalData.result=""
    this.globalData.result=result


    console.log("是否跳转:::",this.globalData.go)
    
    if(result.cmd === 1 && !this.globalData.go){
      wx.hideLoading()
      wx.navigateTo({
        url: '../detail/detail?result='+JSON.stringify(result)+'&deviceId='+this.globalData.deviceId,//把对象转换成字符串传过去
      })
    }
    
  }catch(err){
    console.log(err);
  }

  if(gReadBuf.length == end){
    gReadBuf = null;
  }else{
    gReadBuf.splice(0,end);
  }
  if (result == null) {
    console.log('UNKNOWN RESPONSE !!!');
    return;
  }

  console.log('response:::', result);
  return result
  },

  //关闭蓝牙链接
  closeBLEConnection(resolve) {
    this.closePolling()
    wx.closeBLEConnection({
      deviceId: this.globalData.deviceId,
      success:(res)=> {
        console.log("已断开deviceId::"+this.globalData.deviceId+"链接::"+JSON.stringify(res))
        this.globalData.blueToothConnected=false
        if(resolve != null){
          resolve('ok')
        }
        
      },
      fail:(err)=> {
        console.log("断开deviceId::"+this.globalData.deviceId+"链接::err",err)
      }
    })
   
  },
   //绑定命令
   writeBindValue() {
     var that = this
    
     //绑定命令
     var write = FridgeProtocol.encodeBind();
     let arrayBuffer = new Uint8Array(write).buffer;
     gReadBuf = null;
    
    //发送绑定指令
    wx.writeBLECharacteristicValue({
      deviceId: this.globalData.deviceId,
      serviceId: this.globalData.serviceId,
      characteristicId: this.globalData.writeId,
      value: arrayBuffer,
      success:(res)=> {
        console.log("writeBLECharacteristicValue success::",res)

        setTimeout(function(){
          console.log("isSet :::",that.globalData.isSet)
         
          if(that.globalData.isSet){
            console.log("用户按下了set键")
            that.globalData.isSet = false

          }else{
            console.log("7s之后用户没有按下了set键，断开链接")
            wx.hideLoading()
            that.closeBLEConnection()
          }
          
          
        },9000)
        
         
      },
      fail:(err)=> {
        console.log("writeBLECharacteristicValue fail::"+JSON.stringify(err))
      }
    })
    
  },

  //重置命令
  writeRest(){
     
     var write = FridgeProtocol.encodeReset();
     let arrayBuffer = new Uint8Array(write).buffer;
     gReadBuf = null;
    
    wx.writeBLECharacteristicValue({
      deviceId: this.globalData.deviceId,
      serviceId: this.globalData.serviceId,
      characteristicId: this.globalData.writeId,
      value: arrayBuffer,
      success:(res)=> {
        console.log("writeBLECharacteristicValue success::"+JSON.stringify(res)) 
      },
      fail:(err)=> {
        console.log("writeBLECharacteristicValue fail::"+JSON.stringify(err))
        if(err.errCode == '10006'){
         wx.showModal({
           content: '链接失败，请下拉刷新重新链接~',
         }) 
        }
       }
    })

  },
  //查询命令
  writeSearch(){
      // 查询命令
      
      let search = FridgeProtocol.encodeQuery();
      let searchArrayBuffer = new Uint8Array(search).buffer;
      console.log('-----search',search);
     
      console.log("gReadBuf:::"+gReadBuf)
      wx.writeBLECharacteristicValue({
        deviceId: this.globalData.deviceId,
        serviceId: this.globalData.serviceId,
        characteristicId: this.globalData.writeId,
        value: searchArrayBuffer,
        success:(res)=> {
            console.log("writeBLECharacteristicValue success::"+JSON.stringify(res))
             
          },
        fail:(err)=> {
            console.log("writeBLECharacteristicValue fail::"+JSON.stringify(err))
            }
        })
             
  },
    //设置左仓温度命令
    writeSetLeft(t){
      
      let search = FridgeProtocol.encodeSetLeft(t)
      let searchArrayBuffer = new Uint8Array(search).buffer;
      console.log('-----writeSetLeft',search);
     
      gReadBuf = null;
      wx.writeBLECharacteristicValue({
        deviceId: this.globalData.deviceId,
        serviceId: this.globalData.serviceId,
        characteristicId: this.globalData.writeId,
        value: searchArrayBuffer,
        success:(res)=> {
          console.log("writeBLECharacteristicValue success::"+JSON.stringify(res))
  
             },
         fail:(err)=> {
             console.log("writeBLECharacteristicValue fail::"+JSON.stringify(err))
             if(err.errCode == '10006'){
              wx.showModal({
                content: '链接失败，请下拉刷新重新链接~',
              }) 
             }
            }
          })
         
      
  },
  
     //设置右仓温度命令
    writeSetRight(t){
     
      let search = FridgeProtocol.encodeSetRight(t)
      let searchArrayBuffer = new Uint8Array(search).buffer;
      console.log('-----writeSetRight',search);
      
      gReadBuf = null;
      wx.writeBLECharacteristicValue({
        deviceId: this.globalData.deviceId,
        serviceId: this.globalData.serviceId,
        characteristicId: this.globalData.writeId,
        value: searchArrayBuffer,
        success:(res)=> {
          console.log("writeBLECharacteristicValue success::"+JSON.stringify(res))
             },
         fail:(err)=> {
             console.log("writeBLECharacteristicValue fail::"+JSON.stringify(err))
             if(err.errCode == '10006'){
              wx.showModal({
                content: '链接失败，请下拉刷新重新链接~',
              }) 
             }
           
            }
          })
         
      
  },
     //设置其他命令
    writeSetOthers(cfg){
     
      let search = FridgeProtocol.encodeSetOthers(cfg)
      let searchArrayBuffer = new Uint8Array(search).buffer;
      console.log('-----writeSetOthers',search);
      console.log('-----searchArrayBuffer byteLength',searchArrayBuffer.byteLength);
      let pos = 0
      let bytes = searchArrayBuffer.byteLength;

      while(bytes > 0){
        var tmpBuffer;
        if(bytes > 0){
          tmpBuffer = searchArrayBuffer.slice(pos, pos + 20);
          pos += 20;
          bytes -= 20;
        }else{
          tmpBuffer = searchArrayBuffer.slice(pos, pos + bytes);
          pos += bytes;
          bytes -= bytes;
        }
        
        gReadBuf = null;
        wx.writeBLECharacteristicValue({
          deviceId: this.globalData.deviceId,
          serviceId: this.globalData.serviceId,
          characteristicId: this.globalData.writeId,
          value: tmpBuffer,
          success:(res)=> {
            console.log("writeBLECharacteristicValue success::",res)
               },
           fail:(err)=> {
               console.log("writeBLECharacteristicValue fail::",err)
               if(err.errCode == 10006){
                wx.showModal({
                  content: '链接失败，请下拉刷新重新链接~',
                }) 
                return
               }
               if(err.errCode == 10001){
                wx.showModal({
                  content: '链接失败，请打开蓝牙~',
                }) 
                return
               }
              }
             
            })
      }
      
      
  
  },

 

  stopBluetoothDevicesDiscovery(){
    wx.stopBluetoothDevicesDiscovery({
      success:(res)=> {
        console.log("停止搜索")
      }
    })
  },
  //轮询查询命令
  openPolling(){

    console.log("开始轮询查询命令")
    this.globalData.timer = setInterval(() => {
      this.writeSearch();
    }, 2000);
     
  },
  //关掉轮询
  closePolling(){
    console.log("关闭轮询查询命令")
    this.globalData.timer&&clearInterval(this.globalData.timer);
    this.globalData.timer=null
  },

  //监控链接状态
  onBLEConnectionStateChange(){
    var that = this
    wx.onBLEConnectionStateChange(function(res) {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
      that.globalData.blueToothConnected = res.connected
      if(!res.connected){
        that.closePolling()
      }
    })
  },

  //监听蓝牙适配器状态变化事件
  onBluetoothAdapterStateChange(){
    var that = this
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log('adapterState changed, now is', res)
      // that.globalData.available = res.available
      // if(res.available && !that.globalData.blueToothConnected){
      //   if(that.globalData.deviceId != '' && that.globalData.deviceId != undefined && that.globalData.deviceId != null ){
      //     that.againConnection(that.globalData.deviceId)
      //   }
        
      // }
    })
  },

  judgeStatus(){
    if(!this.globalData.blueToothConnected){
      if(!this.globalData.available){
        wx.showModal({
          content: '链接失败，请打开蓝牙~',
        }) 
      }else{
        wx.showModal({
          content: '链接失败，请下拉刷新重新链接~',
        }) 
      }
      
      return false
     }else{
       return true

     }
  }
  

  



 
})