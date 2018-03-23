/** 事件队列
 */
class EventQueue {
  constructor () {
    /**
     * @type {Arrat<Function>} 存储事件的数组
     */
    this._queue = []
    this._timeout = undefined
  }
  /** 在队列中添加一个事件
   * @param {function(function)} f 要添加的事件
   */
  add (f) {
    this._queue.push(function (resolve) {
      f(resolve)
    })
    this.next()
  }
  /** 队列中是否还有事件
   */
  hasNext () {
    return this._queue.length > 0
  }
  /** 执行下一个事件
   */
  next () {
    if (!this._flag) {
      this._flag = true
      this._timeout = setTimeout(() => {
        this.nextSync()
      }, 0)
    }
  }
  nextSync () {
    const _this = this
    ;(async function () {
      while (_this.hasNext() && _this._flag) {
        await new Promise(resolve => {
          _this._queue[0](resolve)
        })
        _this._queue.splice(0, 1)
      }
      _this._flag = false
    })()
  }
  /** 清空队列
   */
  clearQueue () {
    this._queue = []
    this._flag = false
    clearTimeout(this._timeout)
  }
}

export { EventQueue }
