import * as con from '../const/const.js'

const avgFunctions = {
  /**
     * 设置绘图板宽高
     * @param {Object} [p] 要传入的参数
     * @param {number} [p.height = con.DEFUALT_DRAWING_BOARD_HEIGHT] canvas高度
     * @param {number} [p.width = con.DEFUALT_DRAWING_BOARD_WIDTH] canvas宽度
     */
  setSize: function ({
    width = con.DEFUALT_DRAWING_BOARD_WIDTH,
    height = con.DEFUALT_DRAWING_BOARD_HEIGHT
  } = {}) {
    ;[this.getCanvas(), this.getCanvas(true)].forEach(e => {
      e.width = width
      e.height = height
    })
  },
  /**
     * 获取对象的绘图板
     * @param {boolean} [mask = false] 是否要获取遮罩层绘图板
     * @returns {HTMLCanvasElement} 获取到的Canvas对象
     */
  // getCanvas: function (mask = false) {
  //   return this._drawingBoard.getCanvas(mask)
  // },
  /**
     * 获取对象绘图板的2D画笔
     * @param {boolean} [mask = false] 是否要获取遮罩层绘图板画笔
     * @returns {CanvasRenderingContext2D} 获取到的画笔
     */
  // getBrush: function (mask = false) {
  //   return this._drawingBoard.getBrush(mask)
  // },
  /**
     * 等待
     * @param {number} t 要等待的毫秒数
     */
  wait: function (t) {
    this._eQ.add(r => {
      let startTime = performance.now()
      t -= 13.34
      if (t < 0) t = 0
      let goneTime
      let req = requestAnimationFrame(function waitCont () {
        goneTime = performance.now() - startTime
        if (goneTime >= t) {
          r()
        } else {
          req = requestAnimationFrame(waitCont)
        }
      })
      setTimeout(() => {
        cancelAnimationFrame(req)
        r()
      }, t)
    })
  },
  /**
     * 等待，wait别名
     * @param {number} t 要等待的毫秒数
     */
  // sleep: function (t) {
  //   this.wait(t)
  // },
  /**
     * 按队列执行一个函数
     * @param {function} f 要执行的函数
     */
  runFunction: function (f) {
    this._eQ.add(async r => {
      await f()
      r()
    })
  },
  /**
     * 按队列执行一个函数，runFunction别名
     * @param {function} f 要执行的函数
     */
  // run: function (f) {
  //   this.runFunction(f)
  // },
  /**
     * 按队列并循环一个函数
     * @param {function} f 要循环执行的函数
     */
  loopFunction: function (f) {
    this._eQ.add(async r => {
      this._loopPliesCount++
      this._eQ = this._nextEventQueue(
        'loopQueue',
        () => {
          this.runFunction(f)
        },
        r
      )
    })
  },
  /**
     * 按队列并循环一个函数，loopFunction别名
     * @param {function} f 要循环执行的函数
     */
  // loop: function (f) {
  //   this.loopFunction(f)
  // },
  /**
     * 中断事件的执行
     * @param {number} plies 中断层数
     */
  breakLoopFunction: function (plies = 1) {
    this._eQ.add(r => {
      if (plies <= this._loopPliesCount) {
        this._loopPliesCount -= plies
        for (let i = 0; i < plies; i++) {
          this._eQ.clearQueue()
          this._eQ = this._lastEventQueue()
        }
      }
      r()
    })
  }
  /**
     * 中断事件的执行，breakLoopFunction别名
     * @param {number} plies 中断层数
     */
  // break: function (plies = 1) {
  //   this.breakLoopFunction(plies)
  // }
}

export { avgFunctions }
export default avgFunctions
