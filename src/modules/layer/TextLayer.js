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

        this.pixel = document.createElement("canvas");
        this._ctx = this.pixel.getContext("2d");

        this._ctx.textBaseline = "top";

        this.setText(text);
        this.setFont(font);
    }
    /**设置文本图层的字符串内容
     * @param {string} text 要设置为的字符串
     */
    setText(text) {
        if (text.toString) {
            return "" + text;
        } else {
            return false;
        }
    }
    /**设置文本图层的字体
     * @param {string} text 要设置为的字体
     */
    setFont(font = this.font) {
        if (font.toString) {
            this.font = font.toString();
            this._drawText();
            return font.toString();
        } else {
            return false;
        }
    }
    /**重新绘制文本到canvas
     * @param {string} text 要绘制的文本
     */
    _drawText(text = this.text) {
        const textArr = text.split("\n");
        let maxWidth = 0;
        let temp;
        textArr.forEach(t => {
            temp = this._ctx.measureText(t).width;
            if (temp > maxWidth) {
                maxWidth = Math.ceil(temp);
            }
        });
        this.pixel.width = maxWidth;
        this.dWidth = this.pixel.width;
    }
}

export { TextLayer };
