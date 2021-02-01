'use strict'
function HintInfo (opt) {
  if (typeof opt === 'string' || typeof opt === 'number') {
    this.msg = opt
    this.time = '' || 3000
    this.id = ''
    this.operation = ''
  } else if (typeof opt === 'undefined') {
    this.msg = ''
    this.time = 3000
    this.id = ''
    this.operation = ''
  } else {
    this.msg = opt.msg || ''
    this.time = opt.time || 3000
    this.id = opt.id || ''
    this.operation = opt.operation || ''
  }
  this.ele = null
  this.init()
  return this
}
HintInfo.prototype.init = function () {
  if (this.operation === 'end') {
    let dom = document.querySelector(`#${this.id}`)
    if (dom) {
      document.body.removeChild(dom)
    }
  } else {
    this.creatNode()
    this.removeNode()
  }
}
HintInfo.prototype.creatNode = function () {
  this.ele = document.createElement('div')
  this.ele.id = this.id
  this.ele.className = 'hint_info_custom'
  let p = document.createElement('p')
  if (!this.msg) {
    p.className = 'hint_info_msg'
    p.innerHTML = ''
  } else {
    p.className = ''
    p.innerHTML = this.msg
  }
  this.ele.appendChild(p)
  document.body.appendChild(this.ele)
}
HintInfo.prototype.removeNode = function () {
  var _this = this
  if (this.operation === 'start') {
    return
  }
  setTimeout(function () {
    if (!_this.ele) return
    document.body.removeChild(_this.ele)
  }, this.time)
}
function hintInfo (opt) {
  return new HintInfo(opt)
}
export default hintInfo
