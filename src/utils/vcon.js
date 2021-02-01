/* eslint-disable no-new */
// 判断平台
function isPlatform (str) {
  // 判断安卓还是ios终端
  let u = navigator.userAgent
  let browser = {
    versions: (function () {
      // let app = navigator.appVersion
      return {
        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
        android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 // android终端
      }
    }())
  }
  str = str.toLowerCase()
  if (browser.versions.ios && str === 'ios') {
    return true
  }
  if (browser.versions.android && str === 'android') {
    return true
  }
  if ((u.match(/MicroMessenger/i) && u.match(/MicroMessenger/i)[0].toLowerCase()) === 'MicroMessenger'.toLowerCase() && str === 'micromessenger') {
    return true
  }
  if ((u.match(/isales/i) && u.match(/isales/i)[0].toLowerCase()) === 'isales'.toLowerCase() && str === 'isales') {
    return true
  }
  return false
}
// 与原生交互
function interactWithApp (name, data) {
  // alert(name+'___'+JSON.stringify(data))
  !data && (data = {})
  if (isPlatform('microMessenger')) return
  let resultFn = function (info) {
    try {
      info = JSON.parse(info)
      console.log('try')
      console.log(info)
    } catch (error) {
      console.log(error)
    }
    data.callBack && typeof data.callBack === 'function' ? data.callBack(info) : data.callBack = function (e) { console.log(e, 'this mean there is no callback function specified') }
  }
  if (!window.ISALES) {
    window.ISALES = {}
    window.ISALES.ready = function () {}
    let cbName = `${name}CallBack`
    window.ISALES[cbName] = resultFn
    data.callBackName = `ISALES.${cbName}`
  } else {
    let cbName = `${name}CallBack`
    window.ISALES[cbName] = resultFn
    data.callBackName = `ISALES.${cbName}`
  }
  if (isPlatform('ios')) {
    try { // ios
      window.webkit.messageHandlers[name].postMessage(name === 'closeByNative' ? '' : JSON.stringify(data))
    } catch (e) {
      // alert(JSON.stringify(e))
    }
  } else if (isPlatform('android')) {
    try { // android
      window.android[name](name === 'closeByNative' ? '' : JSON.stringify(data))
    } catch (e) {
      // console.log(e)
    }
  }
}

class Vcon {
  constructor (opt, callBack) {
    this.staffNumber = opt.staffNumber || '' // 记录工号
    this.env = opt.env || '' // 记录代码环境
    this.callBack = callBack // 记录回掉函数
    // 如果是生产环境 并且 无工号
    if (this.env === 'prod' && !this.staffNumber.length) {
      typeof this.callBack === 'function' && this.callBack()
      return
    }
    // 如果是生产环境 并且 有工号
    if (this.env === 'prod' && this.staffNumber.length) {
      this.prodInit()
      return
    }
    // 如果是测试环境
    if (this.env === 'test') {
      this.testInit()
      return
    }
    callBack()
  }
  testInit () {
    import('vconsole').then(({ default: VConsole }) => {
      new VConsole()
      console.log('console加载完成')

      typeof this.callBack === 'function' && this.callBack()
    })
  }
  prodInit () {
    let _that = this
    interactWithApp('getUserInfoByNative', {
      callBack: function (userInfo) {
        if (userInfo.code === '0') {
          _that.betterStaffNUmber = userInfo.msg.staffNumber
          _that.betterHandler()
          return
        }
        alert('获取sdk出错，请稍后再试')
      }
    })
  }
  // 对工号进行比对
  betterHandler () {
    if (this.betterStaffNUmber === this.staffNumber) {
      import('vconsole').then(({ default: VConsole }) => {
        new VConsole()
        console.log(`${this.staffNumber}的console加载完成`)
        typeof this.callBack === 'function' && this.callBack()
      })
      return
    }
    this.callBack()
  }
}

export default Vcon
