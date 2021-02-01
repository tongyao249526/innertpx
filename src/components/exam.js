import { interactWithApp } from '@/utils/index.js'
import hintInfo from '@/utils/hintInfo.js'
import { getData } from '@/api/http.js'
import { JUMPENDTEST, JUMPENDPROD, JUMPBUTTONTEST, JUMPBUTTONPROD } from '@/api/config.js'
import '@/assets/css/reset.css'
import '@/main.scss'
import '@/assets/css/hintInfo.css'

class Exam {
  constructor(opt) {
    this.$myExam = document.getElementById('myExam');
    this.username = opt.username;
    this.staffNumber = opt.staffNumber;
    this.token = opt.token;
    this.comId = opt.comId;
    this.userId = opt.userId;
    this.channel = opt.channel;
    this.init(opt)
  }
  /**
   * [拼接按钮地址]
   * @param {Object} opt [最终跳转地址,当前时间戳,签名]
   */
  jumpEnd(opt) {
    const hos =
      ENV !== 'prod'
        ? JUMPBUTTONTEST //按钮测试地址
        : JUMPBUTTONPROD //按钮生产地址
    let newName = encodeURIComponent(this.username)
    let newRedirect = encodeURIComponent(opt.redirect)
    // 构建考试按钮地址
    let redirectUrl = `${hos}?openid=${this.staffNumber}&name=${newName}&t=${opt.newTime}&redirectUrl=${newRedirect}&sign=${opt.signTwo}`
    // window.replace(redirectUrl)
    this.$myExam.style.display = 'block'
    let _this = this
    this.$myExam.onclick = () => {
      window.TDAPP.onEvent(`培训专区_${ENV === 'prod' ? 'pro' : 'test'}_44`, '考试系统按钮_44_63', { //插码
        orgCode: _this.comId,
        staffNumber: _this.userId,
        channel: _this.channel
      })
      interactWithApp('jumpToNativePage', {
        page: '32',
        url: redirectUrl
      })
    }
  }

  /**
   * [获得第二次签名]
   * @param {Object} opt [最终跳转地址,当前时间戳]
   */
  getTxxsign(opt) {
    let _this = this
    let newTime = opt.newTime
    let redirect = opt.redirect
    interactWithApp('getSign', {
      params: {
        openid: _this.staffNumber,
        name: _this.username,
        t: newTime,
        redirectUrl: redirect
      },
      hasToken: 'n',
      'callBack': function (info) {
        let userInfo = JSON.parse(info)
        if (userInfo.code === '0') {
          let signTwo = userInfo.msg.txxSign //第二次签名
          _this.jumpEnd({ signTwo, redirect, newTime })
        }
        else {
          hintInfo('获取SDK失败')
        }
      }
    })
  }
  /**
    * [获得第二次签名]
    * @param {Object} opt [最终跳转地址,当前时间戳]
    */
  jumpButton(opt) {
    const host =
      ENV !== 'prod'
        ? JUMPENDTEST //最终跳转测试地址
        : JUMPENDPROD  //最终跳转生产地址
    let infoId = encodeURIComponent(JSON.stringify({ classIds: opt.classIdAry, campIds: opt.campIdAry }))
    let redirect = `${host}?status=0&source=tk&info=${infoId}&sign=${opt.signOne}`
    let newTime = new Date().getTime().toString()
    this.getTxxsign({ redirect, newTime })
  }
  /**
   * [获取第一个签名]
   * @param {Object} opt [培训班集合,新兵营集合]
   */
  withApp(opt) {
    let _this = this
    let classIdAry = opt.classIdAry
    let campIdAry = opt.campIdAry
    interactWithApp('getSign', {
      params: {
        status: '0',
        source: 'tk',
        info: JSON.stringify({
          classIds: classIdAry,
          campIds: campIdAry
        })
      },
      hasToken: 'n',
      'callBack': function (info) {
        let userInfo = JSON.parse(info)
        if (userInfo.code === '0') {
          let signOne = userInfo.msg.txxSign //第一次签名
          _this.jumpButton({ classIdAry, campIdAry, signOne })
        }
        else {
          hintInfo('获取SDK失败')
        }
      }
    })
  }
  /**
   * [获取培训班集合,新兵营集合]内勤版本没有新兵营集合为空数组
   * @param   
   */
  getdata(staffNumber, token) {
    let _this = this
    console.log(staffNumber, token);
    let data = {
      staffNumber,
      page: 1,
      rows: 999
    };
    getData({
      method: 'post',
      url: 'findTrainRecord',
      header: {
        txxsign: {
          staffNumber,
          page: '1',
          rows: '999'
        },
        token
      },
      data
    }).then((date) => {
      if (date.data.resultCode !== '1') return
      let arr = date.data.resultData.list[0]
      // 培训班集合
      let classIdAry
      if (!arr.trainClasses[0]) {
        classIdAry = []
      } else {
        classIdAry = arr.trainClasses[0].map(item => item.class_id)
      }
      // 新兵营集合
      let campIdAry
      if (!arr.trainClasses[1]) {
        campIdAry = []
      } else {
        campIdAry = arr.trainClasses[1].map(item => item.class_id)
      }
      _this.withApp({ classIdAry, campIdAry })
    })
  }
  init(opt) {
    let staffNumber = opt.staffNumber;
    let token = opt.token;
    this.getdata(staffNumber, token);
  }
}

export default Exam


