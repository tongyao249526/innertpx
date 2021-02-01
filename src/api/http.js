import flyio from 'flyio'
import { PRODHOST, TESTHOST } from './config.js'
import { interactWithApp, isPlatform } from '@/utils/index.js'
import hintInfo from '@/utils/hintInfo.js'

// fly请求拦截器
flyio.interceptors.request.use(function (request) {
  if (window.navigator.onLine) {
    return request
  } else {
    let obj = { message: '网络中断' }
    throw obj
  }
})

const hosts = ENV === 'dev' ? '' : ENV === 'test' ? TESTHOST : PRODHOST

// 获取请求地址
function getUrl (urlKey) {
  let url = {
    getMenuByUserId: '/train/inner/trainingCourse/getMenuByUserId',
    findTrainRecord: '/train/inner/ntms/subjectStudent/findTrainRecord'
  }[urlKey]
  return `${hosts}${url}`
}

/**
* [通过原生的方法获取sign]
* @param {Object} txxsign [需要加密的参数]
* @return {Object} Promise [返回promise]
*/
function getSign(txxsign) {
  return new Promise((resolve, reject) => {
    interactWithApp("getSign", {
      params: txxsign,
      "callBack": function (info) {
        console.log('执行了callback', info)
        let i = JSON.parse(info)

        if(i.code === '0') {
          resolve(i.msg.txxSign)
        } else {
          hintInfo('sign获取失败，请稍后再试')
        }
      }
    })
  })
}

/**
* [提交请求]
* @param {Object} options [请求配置]
*   @param {String} options.url [请求地址]
*   @param {Object} options.header [请求头]
*   @param {Object} options.data [请求数据]
*   @param {String} options.method [请求方法]
* @return {Object} Promise [返回promise]
*/
export async function getData (options) {
  if(options.header) {
    let sign = 'b36678df35b94b42838b2ef8c415c7ea' //用于万能数据加签
    if (isPlatform('isales')) sign = await getSign(options.header.txxsign)
    console.log('sign2143234234', sign)
      
    let obj = {}
    Object.keys(options.header).forEach(key => {
      if (key === 'txxsign') {
        obj[key] = sign
      } else {
        obj[key] = options.header[key]
      }
    })
    flyio.config.headers = obj
  }

  let data = await flyio[options.method](getUrl(options.url), options.data)
  console.log(data);
  return data 
}