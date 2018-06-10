import * as con from '../const/const.js'

import { ImageLayer } from '../layer/ImageLayer.js'
import { TextLayer } from '../layer/TextLayer.js'

class DrawingBoard {
  constructor ({
    target = null,
    width = con.DEFUALT_DRAWING_BOARD_WIDTH,
    height = con.DEFUALT_DRAWING_BOARD_HEIGHT
  }) {
    if (target === undefined) {
      /**
       * 设置高度和宽度
       */
      target = document.createElement('canvas')
      target.height = height
      target.width = width
    }

    /**
     * 主绘图板
     * @type {HTMLCanvasElement}
     */
    this._canvasMain = undefined
    Object.defineProperty(this, '_canvasMain', {
      value: target,
      writable: false
    })

    /**
     * 遮罩层绘图板
     * @type {HTMLCanvasElement}
     */
    this._canvasMask = undefined
    const _canvasMask = document.createElement('canvas')
    _canvasMask.width = this.target.width
    _canvasMask.height = this.target.height
    Object.defineProperty(this, '_canvasMask', {
      value: _canvasMask,
      writable: false
    })

    /**
     * 主绘图板画笔
     * @type {CanvasRenderingContext2D}
     */
    this._paintBrush = undefined
    Object.defineProperty(this, '_paintBrush', {
      value: this.getBrush(),
      writable: false
    })

    /**
     * 遮罩层画笔
     * @type {CanvasRenderingContext2D}
     */
    this._paintBrushForMask = undefined
    Object.defineProperty(this, '_paintBrushForMask', {
      value: this.getBrush(true),
      writable: false
    })

    /**
     * 图层记录
     * @type {Array<Layer>}
     */
    this._layers = undefined
    Object.defineProperty(this, '_layers', {
      value: [],
      writable: false
    })

    /**
     * 为首次绘图进行准备
     */
    this._paintBrush.globalCompositeOperation = 'destination-over'
    this._paintBrushActive = undefined
    this._paintBrushBackp = undefined
  }

  /**
   * 重新绘图
   */
  reDraw () {
    this._paintBrush.globalCompositeOperation = 'destination-over'
    // TODO
  }

  /**
   * 载入图像图层
   * @param {object} p 参数
   * @param {number} p.layer 图层号码
   */
  loadImage ({layer = undefined} = {}) {
    if (layer === undefined) {
      throw new Error('ImageLayer No. Undefined')
    }
    this._layers[layer] = new ImageLayer(...arguments)
  }

  /**
   * 载入文本图层
   * @param {object} p 参数
   * @param {number} p.layer 图层号码
   */
  loadText ({layer = undefined} = {}) {
    if (layer === undefined) {
      throw new Error('TextLayer No. Undefined')
    }
    this._layers[layer] = new TextLayer(...arguments)
  }

  /**
   * 移除一个图层
   * @param {object} p 参数
   * @param {number} p.layer 图层号码
   * @param {Function} p.fun 移除后要执行的事件
   */
  removeLayer ({layer = undefined, fun = () => {}} = {}) {
    if (layer === undefined) {
      throw new Error('RemoveLayer No. Not Found')
    }
    const removed = this._layers[layer]
    this._layers[layer] = undefined
    fun(removed)
    return removed
  }
}

export { DrawingBoard }
