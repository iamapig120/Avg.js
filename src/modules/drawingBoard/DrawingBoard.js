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
  }
}

export { DrawingBoard }
