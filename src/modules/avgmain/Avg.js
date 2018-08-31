import { EventQueue } from '../queue/EventQueue.js'
import { LoopQueue } from '../queue/LoopQueue.js'

import { DrawingBoard } from '../drawingBoard/DrawingBoard.js'

import { avgPrototypeKV } from './avgPrototypeKV.js'
import { avgFunctions } from './avgFunctions.js'

import * as con from '../const/const.js'

/**
 * Avg主类
 */
class Avg {
  /**
   * 构造一个对象
   * @param {Object} [p] 要传入的参数
   * @param {HTMLCanvasElement} [p.target] 绘图板
   * @param {number} [p.height = 720] canvas高度
   * @param {number} [p.width = 1280] canvas宽度
   * @param {string} [p.color = con.DEFUALT_COLOR] 文本颜色
   */
  constructor ({
    target = undefined, // 绘图板参数，目标canvas
    width = con.DEFUALT_DRAWING_BOARD_WIDTH, // 绘图板参数，绘图板宽度
    height = con.DEFUALT_DRAWING_BOARD_HEIGHT, // 绘图板参数，绘图板高度
    color = con.DEFUALT_COLOR // 默认文本颜色
  } = {}) {
    /**
     * 默认文本颜色
     * @type {string}
     */
    this.color = color

    /**
     * 当前队列
     * @type {EventQueue | LoopQueue}
     */
    this._eQ = this._nextEventQueue()

    /** 嵌套循环层数
     * @type {number}
     */
    this._loopPliesCount = 0

    /**
     * 绘图板
     * @type {DrawingBoard}
     */
    this._drawingBoard = undefined
    Object.defineProperty(this, '_drawingBoard', {
      value: new DrawingBoard(arguments[0]),
      writable: false
    })
  }
  /**
   * 从事件队列中请求下一个队列
   * @param {"eventQueue" | "loopQueue"} [type = "eventQueue"]  请求的队列类型
   * @param {function} [finishFun] 如果是一个循环队列，要循环执行的Function
   * @param {function} [resolveFunction] 如果是一个循环队列，resolve函数
   * @returns {EventQueue | LoopQueue} 返回的队列
   */
  _nextEventQueue (
    type = 'eventQueue',
    finishFun = () => {},
    resolveFunction = () => new Promise(resolve => resolve())
  ) {
    /**
     * @type {number} 当前队列的下标
     */
    this._eQPointer = undefined
    /**
     * @type {Array<EventQueue | LoopQueue>} 所有的事件队列
     */
    this._eQArray = undefined

    if (typeof this._eQPointer === 'undefined' || !this._eQArray) {
      this._eQPointer = -1
      this._eQArray = []
    }
    this._eQPointer++
    if (!this._eQArray[this._eQPointer]) {
      switch (type) {
        case 'eventQueue': {
          this._eQArray[this._eQPointer] = new EventQueue()
          break
        }
        case 'loopQueue': {
          this._eQArray[this._eQPointer] = new LoopQueue()
          break
        }
      }
    }
    if (Object.getPrototypeOf(this._eQArray[this._eQPointer]) === LoopQueue) {
      this._eQArray[this._eQPointer].setResolveFunction(resolveFunction)
      this._eQArray[this._eQPointer].setLoopFunction(finishFun)
      this._eQArray[this._eQPointer].next()
    }
    return this._eQArray[this._eQPointer]
  }
  /**
   * 从事件队列中请求上一个队列
   * @returns {EventQueue | LoopQueue} 返回的队列
   */
  _lastEventQueue () {
    if (typeof this._eQPointer === 'undefined' || !this._eQArray) {
      throw new Error('No Queque in Array!')
    }
    this._eQPointer--
    if (this._eQPointer < 0) {
      this._eQPointer = 0
    }
    return this._eQArray[this._eQPointer]
  }
}

Object.keys(avgPrototypeKV).forEach(key => {
  avgPrototypeKV[key].forEach(value => {
    Avg.prototype[value] = avgFunctions[key]
  })
})

export { Avg }
export default Avg
