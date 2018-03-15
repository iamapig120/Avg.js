/**图层类
 */
class Layer {
    /**构造一个图层
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
        mask = false
    } = {}) {
        if (typeof layer !== "number") {
            throw "params must have 'layer:<number>'";
        }
        /**
         * @type {number} 图层号
         */
        this.layer = layer;
        /**
         * @type {number} 在x坐标绘制
         */
        this.dx = dx;
        /**
         * @type {number} 在y坐标绘制
         */
        this.dy = dy;
        /**
         * @type {number} 透明度0~1
         */
        this.alpha = alpha;
        /**
         * @type {number} 旋转角度
         */
        this.rotate = rotate;
        /**
         * @type {number} 旋转中心点x
         */
        this.rotatePointx = rotatePointx;
        /**
         * @type {number} 旋转中心点y
         */
        this.rotatePointy = rotatePointy;
        /**
         * @type {"shade" | "mask" | false} 叠加模式
         */
        this.mask = mask;
        /**
         * @type {number} 图层类型
         */
        this.type;
        /**
         * @type {HTMLImageElement | HTMLCanvasElement} 图层像素图
         */
        this.pixel;
        /**
         * @type {number} 图层宽度
         */
        this.dWidth;
        /**
         * @type {number} 图层高度
         */
        this.dHeight;
    }
}

export { Layer };
