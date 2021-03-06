import * as con from '../const/const.js'
import { Layer } from './Layer.js'

/**
 * 预先定义用于测量文本高度的DOM元素
 */
const body = document.getElementsByTagName('body')[0]
const tempDOM = document.createElement('div')
tempDOM.style.padding = 0
tempDOM.style.margin = 0
tempDOM.style.border = 0
tempDOM.style.boxSizing = 'border-box'
tempDOM.style.width = 'max-content'

// For Edge Firefox
tempDOM.style.whiteSpace = 'nowrap'

/**
 * 文本图层类，
 * 包含有实际1个实际的canvas
 */
class TextLayer extends Layer {
  /** 构造一个文本图层
   * @param {Object} p 传入的参数
   * @param {number} p.layer 图层号
   * @param {number} [p.x = 0] 绘制于X
   * @param {number} [p.y = 0] 绘制于Y
   * @param {number} [p.alpha = 1] 图层透明度
   * @param {number} [p.rotate = 0] 旋转角度
   * @param {number} [p.rotatePointX = 0] 旋转中心点X
   * @param {number} [p.rotatePointY = 0] 旋转中心点Y
   * @param {number} [p.dx = 0] 绘制于X
   * @param {number} [p.dy = 0] 绘制于Y
   * @param {number} [p.rotatePointx = 0] 旋转中心点X
   * @param {number} [p.rotatePointy = 0] 旋转中心点Y
   * @param {"shade" | "mask" | false} [p.mask = false] 图层叠加顺序
   * @param {string} [p.text = ""] 文本内容
   * @param {string} [p.font = DEFUALT_FONT] 字体设置
   */
  constructor ({
    layer,
    x = 0,
    y = 0,
    alpha = 1,
    rotate = 0,
    rotatePointX = 0,
    rotatePointY = 0,
    dx = x,
    dy = y,
    rotatePointx = rotatePointX,
    rotatePointy = rotatePointY,
    mask = false,
    text = '',
    font = con.DEFAULT_FONT
  } = {}) {
    super(arguments[0])

    this.type = con.LAYER_TYPE_TEXT

    this.pixel = document.createElement('canvas')
    this._ctx = this.pixel.getContext('2d')

    /**
     * 行高
     */
    this._lineHeight = 0

    /**
     * @type {SVGSVGElement} SVG对象，用于排版文字
     */
    this._svg = document.createAttributeNS('http://www.w3.org/2000/svg', 'svg')

    this._fontChanged = true

    this.setText(text, false)
    this.setFont(font, false)

    this._drawText()
  }
  /** 设置文本图层的字符串内容
   * @param {string} text 要设置为的字符串
   * @param {boolean} reDraw 是否重绘
   */
  setText (text, reDraw = true) {
    if (text.toString) {
      this.text = text.toString()
      if (reDraw) {
        this._drawText(this.text)
      }
      return this.text
    } else {
      return false
    }
  }
  /** 设置文本图层的字体
   * @param {string} font 要设置为的字体
   * @param {boolean} reDraw 是否重绘
   */
  setFont (font, reDraw = true) {
    if (font.toString) {
      this._fontChanged = !(this.font === font.toString())
      this.font = font.toString()
      if (reDraw) {
        this._drawText()
      }
      return this.font
    } else {
      return false
    }
  }
  /** 重新绘制文本到canvas
   * @param {string} text 要绘制的文本
   */
  _drawText (text = this.text) {
    const textArr = text.split('\n')
    let maxWidth = 0
    let temp

    this._ctx.font = this.font
    textArr.forEach(textEachline => {
      temp = this._ctx.measureText(textEachline)
      if (temp.width > maxWidth) {
        maxWidth = Math.ceil(temp.width)
      }
      // 仅当字体有变化或更改时才重新设置行高
      if (this._fontChanged) {
        this._fontChanged = false
        // 当存在符合标准的 emHeightAscent 属性时，使用该属性
        if (temp.emHeightAscent !== undefined) {
          this._lineHeight = Math.ceil(
            temp.emHeightAscent + temp.emHeightDescent
          )
          // 否则使用通过DOM测量的结果
        } else {
          this._lineHeight = Math.ceil(TextLayer.testHeightByDOM(this.font))
        }
      }
    })
    this.pixel.width = maxWidth
    this.pixel.height = this._lineHeight * textArr.length

    this._ctx.font = this.font
    this._ctx.textBaseline = 'top'
    for (let i = 0; i < textArr.length; i++) {
      this._ctx.fillText(textArr[i], 0, i * this._lineHeight)
    }

    this.dWidth = this.pixel.width
    this.dHeight = this.pixel.height
  }
  /**
   * 通过构建一个DOM测试文本高度
   * @param {string} str 测试用字符串
   * @param {*} font 使用的字体
   */
  static testHeightByDOM (font = con.DEFAULT_FONT, str = con.TEST_TEXT) {
    tempDOM.innerText = str
    tempDOM.style.font = font
    body.appendChild(tempDOM)
    const lineHeight = Math.ceil(tempDOM.offsetHeight)
    body.removeChild(tempDOM)
    return lineHeight
  }
}

export { TextLayer }
