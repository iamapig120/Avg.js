import * as con from '../const/const.js'
import { Layer } from './Layer.js'
import { isNum, switchInstanceof } from '../function/fun.js'

/** 图像图层类
 */
class ImageLayer extends Layer {
  /** 构造一个图像图层类
   * @param {Object} p 传入的参数
   * @param {number} p.layer 图层号
   * @param {string} [p.src] 图片地址
   * @param {HTMLImageElement | HTMLCanvasElement} [p.img] 图片对象
   * @param {number} [p.sx = 0] 裁剪开始于X
   * @param {number} [p.sy = 0] 裁剪开始于Y
   * @param {number} [p.swidth] 裁剪宽度
   * @param {number} [p.sheight] 裁剪高度
   * @param {number} [p.x = 0] 绘制于X
   * @param {number} [p.y = 0] 绘制于Y
   * @param {number} [p.width] 绘制宽度
   * @param {number} [p.height] 绘制高度
   * @param {number} [p.alpha = 1] 图层透明度
   * @param {number} [p.rotate = 0] 旋转角度
   * @param {number} [p.rotatePointX = 0] 旋转中心点X
   * @param {number} [p.rotatePointY = 0] 旋转中心点Y
   * @param {number} [p.sWidth] 裁剪宽度
   * @param {number} [p.sHeight] 裁剪高度
   * @param {number} [p.dWidth] 绘制宽度
   * @param {number} [p.dHeight] 绘制高度
   * @param {number} [p.dx = 0] 绘制于X
   * @param {number} [p.dy = 0] 绘制于Y
   * @param {number} [p.rotatePointx = 0] 旋转中心点X
   * @param {number} [p.rotatePointy = 0] 旋转中心点Y
   * @param {"shade" | "mask" | false} [p.mask = false] 图层叠加顺序
   */
  constructor ({
    layer,
    sx = 0,
    sy = 0,
    swidth,
    sheight,
    x = 0,
    y = 0,
    width,
    height,
    alpha = 1,
    rotate = 0,
    rotatePointX = 0,
    rotatePointY = 0,
    sWidth = swidth,
    sHeight = sheight,
    dWidth = width,
    dHeight = height,
    dx = x,
    dy = y,
    rotatePointx = rotatePointX,
    rotatePointy = rotatePointY,
    mask = false,
    src,
    img = new Image()
  } = {}) {
    super(arguments[0])
    this.type = con.LAYER_TYPE_IMAGE
    this.pixel = img
    this.sx = sx
    this.sy = sy

    if (isNum(dWidth)) {
      this.dWidth = dWidth
    }
    if (isNum(dHeight)) {
      this.dHeight = dHeight
    }
    if (isNum(sWidth)) {
      this.sWidth = sWidth
    }
    if (isNum(sHeight)) {
      this.sHeight = sHeight
    }

    switchInstanceof(this.pixel, [
      [
        HTMLImageElement,
        e => {
          const setProp = () => {
            if (!isNum(this.dWidth)) this.dWidth = e.naturalWidth
            if (!isNum(this.dHeight)) this.dHeight = e.naturalHeight
            if (!isNum(this.sWidth)) this.sWidth = e.naturalWidth
            if (!isNum(this.sHeight)) this.sHeight = e.naturalHeight
          }
          if (src) {
            this.pixel.src = src
          }
          if (this.pixel.complete) {
            setProp()
          } else {
            const autoSetProp = () => {
              setProp()
              this.pixel.removeEventListener('load', autoSetProp)
            }
            this.pixel.addEventListener('load', autoSetProp)
          }
        }
      ],
      [
        HTMLCanvasElement,
        e => {
          const setProp = () => {
            if (!isNum(this.dWidth)) this.dWidth = e.width
            if (!isNum(this.dHeight)) this.dHeight = e.height
            if (!isNum(this.sWidth)) this.sWidth = e.width
            if (!isNum(this.sHeight)) this.sHeight = e.height
          }
          setProp()
        }
      ]
    ])
  }
}
export { ImageLayer }
