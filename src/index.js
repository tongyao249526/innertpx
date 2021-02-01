import { getSize, isPlatform, interactWithApp } from '@/utils/index.js'
import { TESTHREF } from '@/api/config.js'
import { getData } from '@/api/http.js'
import hintInfo from '@/utils/hintInfo.js'
import Vcon from '@/utils/vcon.js'
import Exam from '@/components/exam.js'
import '@/assets/css/reset.css'
import './main.scss'
import '@/assets/css/hintInfo.css'
getSize()

class Home {
  constructor(opt) {
    console.log(opt)

    this.hrefOpt = opt
    this.$loading = document.getElementById('ajaxLoading')
    this.$headerDom = document.getElementById('header')
    this.$app = document.getElementById('app')
    this.$myClass = document.getElementById('myClass')
    this.$myCamp = document.getElementById('myCamp')
    this.$myTeachingRecord = document.getElementById('myTeachingRecord')
    this.$myTrainRecord = document.getElementById('myTrainRecord')
    this.$closeWindow = document.getElementById('closeWindow')

    this.init()
  }
  /**
   * [显示权限并绑定事件]
   * @param {Object} opt [权限的dom显示或隐藏]
   */
  bindHandle(opt) {
    Object.keys(opt).forEach(key => {
      if (opt[key] === 'yes') {
        this[`$${key}`].style.display = 'block'
        this[`$${key}`].onclick = () => { //点击跳转
          if(isPlatform('isales')) {
            window.location.href = this.hrefOpt[key]['isales']
            return
          }
          window.location.href = this.hrefOpt[key]['noIsales']
        }
      }
    })
  }
  /**
   * [请求权限]
   * @param {Object} userInfo [用户信息对象]
   */
  asyncGetData(userInfo) {
    let data = {
      userId: userInfo.userId,
      comId: userInfo.comId,
      staffNumber: userInfo.staffNumber
    }
    hintInfo({
      id: 'getMenu',
      operation: 'start'
    })
    getData({
      method: 'post',
      url: 'getMenuByUserId',
      header: {
        txxsign: data,
        token: this.token,
      },
      data
    }).then((data) => {
      hintInfo({
        id: 'getMenu',
        operation: 'end'
      })

      //返回权限信息
      if (data.data.resultCode === '1') {
        this.bindHandle({
          myClass: data.data.resultData.myClass,
          myCamp: data.data.resultData.myCamp,
          myTeachingRecord: data.data.resultData.myTeachingRecord,
          myTrainRecord: data.data.resultData.myTrainRecord
        })
        new Exam(userInfo)
      } else {
        hintInfo(data.data.resultMsg)
      }
    }).catch((error) => {
      hintInfo({
        id: 'getMenu',
        operation: 'end'
      })
      hintInfo(error.message)
    })
  }
  // 获取用户信息
  getUserInfoHandler() {
    console.log('进入了getUserInfoHandler函数')
    let _that = this
    if (isPlatform('isales')) { //泰行销环境
      interactWithApp('getUserInfoByNative', {
        'callBack': function (info) {
          let userInfo = JSON.parse(info)
          console.log(userInfo)
          if (userInfo.code === '0') {
            _that.staffNumber = userInfo.msg.staffNumber
            _that.token = userInfo.msg.token
            console.log(userInfo)
            let obj = {}
            // 用户信息存入session
            obj.userId = userInfo.msg.userCode
            obj.comId = userInfo.msg.companyCode
            obj.token = userInfo.msg.token
            obj.username = userInfo.msg.userName
            obj.staffNumber = userInfo.msg.staffNumber
            obj.channel = userInfo.msg.channel
            obj.imei = userInfo.msg.imei
            window.sessionStorage.setItem('TPX_HOME_USERINFO', JSON.stringify(userInfo.msg))

            _that.asyncGetData(obj) //请求权限
            window.TDAPP.onEvent(`培训专区_${ENV === 'prod' ? 'pro' : 'test'}_44`, '培训专区页面加载_44_1', { //插码
              orgCode: userInfo.msg.companyCode,
              staffNumber: userInfo.msg.userCode,
              channel: userInfo.msg.channel
            })   
            return
          }
          toastHandler('获取sdk出错，请稍后再试')
        }
      })
      return
    }
    // 本地环境
    let obj = {
      userId: 'zhangdan123', // 用户Id duanxh  zhangsaihua sysadmin
      comId: 'K', // 分公司Id
      isInner: '1', // 是否内勤
      deviceId: '', 
      // 设备Id
      staffNumber: '4_K_zhangdan123'
    }
    window.sessionStorage.setItem('TPX_HOME_USERINFO', obj)
    this.asyncGetData(obj)
  }

  // 初始化项目
  init() { 
    this.$closeWindow.onclick = () => {
      interactWithApp('closeByNative', {})
      console.log('点击了关闭当前页面')
    }

    /**
     * [适用于有按需加载的项目，动态引入vonsole，从而不会打包进prod模式]
     * @param {Object} opt
     * -- /@param {String} env [开发模式，分为test：测试环境，prod：生产模式，开发模式为空或者无该字段]
     * -- /@param {String} staffNumber [仅在生产模式时有效，若生产无针对个人进行console，不写该字段或空串都可以]
     * @param {Function} callBack [回调函数,主要用于newVue]
    */
    new Vcon({
      env: ENV
      // staffNumber: '2_1_01000368'
    }, () => {
      this.getUserInfoHandler()
    })
  }
}

/**
* [设置跳转页面地址]
* @param {String} noIsales [设置非泰行销环境的绝对路径跳转，适用于本地和微信、pc地址栏]
* @param {String} isales [设置泰行销环境的相对路径跳转]
*/
new Home({
  myClass: {
    noIsales: `${TESTHREF}/myClass/index.html#/`,
    isales: '../myClass/index.html#/', //我的培训班
  },
  myCamp: {
    noIsales: `${TESTHREF}/myCamp/index.html#/`,
    isales: '../myCamp/index.html#/', //我的新兵营
  },
  myTeachingRecord: {
    noIsales: `${TESTHREF}/schoolRecord/index.html#/`,
    isales: '../schoolRecord/index.html#/', //我的授课记录
  },
  myTrainRecord: {
    noIsales: `${TESTHREF}/trainRecord/index.html#/`,
    isales: '../trainRecord/index.html#/', //我的培训记录
  }
})

