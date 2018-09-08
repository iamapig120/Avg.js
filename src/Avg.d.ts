interface AvgParams {
  /**
   * 目标 Canvas 元素
   */
  target?: HTMLCanvasElement
  /**
   * 绘图板宽度
   * @default 1280
   */
  width?: Number
  /**
   * 绘图板高度
   * @default 720
   */
  height?: Number
  /**
   * 文本颜色
   * @default '#ffffff'
   */
  color?: String
}

interface AvgSize {
  /**
   * Canvas 宽度
   */
  width?: Number
  /**
   * Canvas 高度
   */
  height?: Number
}

declare class AvgInstance {
  constructor (avg: AvgParams)

  /**
   * 设置绘图板宽高
   */
  setSize (size: AvgSize)

  /**
   * 获取绘图板
   * @param mask 是否要获取遮罩层绘图板
   * @default false
   * @return 获取到的 Canvas 对象
   */
  getCanvas (mask?: Boolean): HTMLCanvasElement

  /**
   * 获取对象绘图板的 2D 画笔
   * @param mask 是否要获取遮罩层绘图板画笔
   * @default false
   * @return 获取到的画笔
   */
  getBrush (mask?: Boolean): CanvasRenderingContext2D

  /**
   * 等待
   * @param time 等待的毫秒数
   */
  wait (time: Number)

  /**
   * 等待
   * @param time 等待的毫秒数
   */
  sleep (time: Number)

  /**
   * 按队列执行一个函数
   * @param f 要执行的函数
   */
  run (f: Function)

  /**
   * 按队列执行一个函数
   * @param f 要执行的函数
   */
  runFunction (f: Function)

  /**
   * 按队列并循环一个函数
   * @param f 要执行的函数
   */
  loop (f: Function)

  /**
   * 按队列并循环一个函数
   * @param f 要执行的函数
   */
  loopFunction (f: Function)

  /**
   * 中断事件的执行
   * @param plies 中断层数
   * @default 1
   */
  break (plies?: Number)

  /**
   * 中断事件的执行
   * @param plies 中断层数
   * @default 1
   */
  breakLoopFunction (plies?: Number)
}

declare const Avg: AvgInstance

export { AvgInstance }
export default AvgInstance
