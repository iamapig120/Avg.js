import { EventQueue } from './EventQueue.js'

/**
 * 循环队列
 */
class LoopQueue extends EventQueue {
  /**
   * 构造一个循环队列
   * @param {function} functionToLoop 要循环执行的事件
   * @param {function} resolveFunction 中断循环时的reslove方法
   */
  constructor (
    functionToLoop = () => {},
    resolveFunction = () => new Promise(resolve => resolve())
  ) {
    super()
    this._loopFun = functionToLoop
    this._resFun = resolveFunction
    this._flag = false
  }
  /**
   * 执行下一个事件
   */
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
      _this._loopFun()
    })()
  }
  /** 设置循环Function
   * @param {function} f 要循环的Function
   */
  setLoopFunction (f) {
    if (typeof f === 'function') {
      this._loopFun = f
    } else {
      throw new Error('LoopFunction Param is not a function!')
    }
  }
  /**
   * 设置中断循环后的reslove函数
   * @param {function} f reslove函数
   */
  setResolveFunction (f) {
    this._resFun = f
  }
  /**
   * 清空队列
   */
  clearQueue () {
    /**
     * @type {Array<Function>} 存储事件的数组
     */
    this._queue = []
    this._flag = false
    clearTimeout(this._timeout)
    this._loopFun = () => {}
    this._resFun()
  }
}

export { LoopQueue }
