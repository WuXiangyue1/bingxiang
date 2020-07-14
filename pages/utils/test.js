

// // 按rssi从大到小排序
// arr.sort((first, second) => {
//   if (isNaN(first.rssi) && isNaN(second.rssi)) {
//     return 0;
//   } else if (isNaN(first.rssi)) {
//     return 1;
//   } else if (isNaN(second.rssi)) {
//     return -1;
//   } else {
//     return first.rssi < second.rssi;
//   }
// }),



// // 开始冰箱的数据轮询
// startReadTimer() {
//   this.dbg('startReadTimer()');
//   if (gReadTimerID != null) {
//     return;
//   }

//   gReadTimerID = setInterval(() => {
//     if (this.props.hasInfo != null) {
//       this.deviceRead().then(() => {
//         // gFridgeActionsDispatcher.setIsConnected(true);
//       }).catch(() => {
//         this.dbg('read timer error, stop it.');
//         // gFridgeActionsDispatcher.setIsConnected(false);
//         this.stopReadTimer();

//         let tryConnect = () => {
//           this.dbg('try to reconnect...');

//           let nextTryTimer = setTimeout(() => {
//             clearTimeout(nextTryTimer);
//             tryConnect();
//           }, 8000);

//           this.deviceDisconnect().then(() => {
//             this.dbg('disconnect first, and it return.');
//             this.deviceConnect(gLastDevId).then(() => {
//               this.dbg('reconnect ok');

//               // 停止重连计时器
//               clearTimeout(nextTryTimer);
//               // 开始读计时器
//               this.startReadTimer();
//             }).catch(err => {
//               this.dbg('reconnect failed:', err);
//               //tryConnect();
//             });
//           }).catch(err => {
//             this.dbg('disconnect first, but failed:', err);
//           });
//         };
//         tryConnect();
//       });
//     }
//   }, 2000);
// }