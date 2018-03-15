import * as con from "../const/const";
import { Layer } from "./Layer";

/**文本图层类
 */
class TextLayer extends Layer {
    /**构造一个文本图层
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
    constructor({
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
        text = "",
        font = con.DEFUALT_FONT
    } = {}) {
        super(arguments[0]);
        this.type = con.LAYER_TYPE_TEXT;
        this.text = text;
        this.font = font;
    }
    /**设置文本图层的字符串内容
     * @param {string} text 要设置为的字符串
     */
    setText(text) {
        if (typeof text === "string" || text.toString) {
            return "" + text;
        } else {
            return false;
        }
    }
    /**设置文本图层的字体
     * @param {string} text 要设置为的字体
     */
    setFont(font) {
        if (typeof font === "string" || font.toString) {
            return "" + font;
        } else {
            return false;
        }
    }
}

export { TextLayer };
