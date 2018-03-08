const LAYER_TYPE_IMAGE = "image";
const LAYER_TYPE_TEXT = "text";

/**在原型链查找一个构造函数并对应情况执行
 * @param {any} obj 要测试的对象
 * @param {Array<Array<Function>>} switchs 对于所有可能的情况的键值对
 */
const switchInstanceof = (obj, switchs) => {
    switchs.forEach(e => {
        if (obj instanceof e[0]) {
            e[1](obj);
        }
    });
};
/**事件队列
 */
class EventQueue {
    constructor() {
        this._queue = new Array();
    }
    /**在队列中添加一个事件
     * @param {function(function)} f 要添加的事件
     */
    add(f) {
        this._queue.push(function(resolve) {
            f(resolve);
        });
        if (!this._flag) {
            this.next();
        }
    }
    /**队列中是否还有事件
     */
    hasNext() {
        return this._queue.length > 0;
    }
    /**执行下一个事件
     */
    next() {
        const _this = this;
        this._flag = true;
        (async function() {
            while (_this.hasNext()) {
                await (function() {
                    return new Promise(r => {
                        _this._queue[0](r);
                    });
                })();
                _this._queue.splice(0, 1);
            }
            _this._flag = false;
        })();
    }
    /**清空队列
     */
    clearQueue() {
        this._queue.splice(0, this._queue.length);
        this._flag = false;
    }
}
/**循环队列
 */
class LoopQueue extends EventQueue {
    /**构造一个循环队列
     * @param {function} finishFun 要循环执行的事件
     * @param {function} resloveFunction 中断循环时的reslove方法
     */
    constructor(
        finishFun = () => {},
        resloveFunction = () => new Promise(r => r())
    ) {
        super();
        this._loopFun = finishFun;
        this._resFun = resloveFunction;
    }
    /**执行下一个事件
     */
    next() {
        const _this = this;
        this._flag = true;
        (async function() {
            while (_this.hasNext()) {
                await (function() {
                    return new Promise(r => {
                        _this._queue[0](r);
                    });
                })();
                _this._queue.splice(0, 1);
            }
            _this._flag = false;
            _this._loopFun();
        })();
    }
    /**设置循环Function
     * @param {function} f 要循环的Function
     */
    setLoopFunction(f) {
        if (typeof f === "function") {
            this._loopFun = f;
        } else {
            throw "Param is not a function!";
        }
    }
    /**设置中断循环后的reslove函数
     * @param {function} f reslove函数
     */
    setResloveFunction(f) {
        this._resFun = f;
    }
    /**清空队列
     */
    clearQueue() {
        this._queue.splice(0, this._queue.length);
        this._flag = false;
        this._loopFun = () => {};
        this._resFun();
    }
}
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
    }
}
/**图像图层类
 */
class ImageLayer extends Layer {
    /**构造一个图像图层类
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
    constructor({
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
        super(arguments[0]);
        this.type = LAYER_TYPE_IMAGE;
        this.img = img;
        this.sx = sx;
        this.sy = sy;

        const isNum = test => typeof test === "number";

        if (isNum(dWidth)) this.dWidth = dWidth;
        if (isNum(dHeight)) this.dHeight = dHeight;
        if (isNum(sWidth)) this.sWidth = sWidth;
        if (isNum(sHeight)) this.sHeight = sHeight;

        switchInstanceof(this.img, [
            [
                HTMLImageElement,
                e => {
                    const setProp = () => {
                        if (!isNum(this.dWidth)) this.dWidth = e.naturalWidth;
                        if (!isNum(this.dHeight))
                            this.dHeight = e.naturalHeight;
                        if (!isNum(this.sWidth)) this.sWidth = e.naturalWidth;
                        if (!isNum(this.sHeight))
                            this.sHeight = e.naturalHeight;
                    };
                    if (src) {
                        this.img.src = src;
                    }
                    if (this.img.complete) {
                        setProp();
                    } else {
                        const autoSetProp = () => {
                            setProp();
                            this.img.removeEventListener("load", autoSetProp);
                        };
                        this.img.addEventListener("load", autoSetProp);
                    }
                }
            ],
            [
                HTMLCanvasElement,
                e => {
                    const setProp = () => {
                        if (!isNum(this.dWidth)) this.dWidth = e.width;
                        if (!isNum(this.dHeight)) this.dHeight = e.height;
                        if (!isNum(this.sWidth)) this.sWidth = e.width;
                        if (!isNum(this.sHeight)) this.sHeight = e.height;
                    };
                    setProp();
                }
            ]
        ]);
    }
}
/**Avg主类
 */
class Avg {
    /**构造一个对象
     * @param {Object} [p] 要传入的参数
     * @param {HTMLCanvasElement} [p.target] 绘图板
     * @param {number} [p.height = 720] canvas高度
     * @param {number} [p.width = 1280] canvas宽度
     */
    constructor({
        target = document.createElement("canvas"),
        height = 720,
        width = 1280
    } = {}) {
        /**主绘图板
         * @type {HTMLCanvasElement}
         */
        this._canvasMain;
        Object.defineProperty(this, "_canvasMain", {
            value: target,
            writable: false
        });
        /**遮罩层绘图板
         * @type {HTMLCanvasElement}
         */
        this._canvasMask;
        Object.defineProperty(this, "_canvasMask", {
            value: document.createElement("canvas"),
            writable: false
        });
        /**当前队列
         * @type {EventQueue | LoopQueue}
         */
        this._eQ = this._nextEventQueue();

        /**主绘图板画笔
         * @type {CanvasRenderingContext2D}
         */
        this._paintBrush;
        Object.defineProperty(this, "_paintBrush", {
            value: this.getBrush(),
            writable: false
        });

        /**遮罩层画笔
         * @type {CanvasRenderingContext2D}
         */
        this._paintBrushForMask;
        Object.defineProperty(this, "_paintBrushForMask", {
            value: this.getBrush(true),
            writable: false
        });

        /**图层记录
         * @type {Array<Layer>}
         */
        this._layers;
        Object.defineProperty(this, "_layers", {
            value: new Array(),
            writable: false
        });
        /**嵌套循环层数
         * @type {number}
         */
        this._loopPliesCount = 0;
    }
    /**设置绘图板宽高
     * @param {Object} [p] 要传入的参数
     * @param {number} [p.height = 720] canvas高度
     * @param {number} [p.width = 1280] canvas宽度
     */
    setSize({ width = 1280, height = 720 } = {}) {
        [this.getCanvas(), this.getCanvas(true)].forEach(e => {
            e.width = width;
            e.height = height;
        });
    }
    /**获取对象的绘图板
     * @param {boolean} [mask = false] 是否要获取遮罩层绘图板
     * @returns {HTMLCanvasElement} 获取到的Canvas对象
     */
    getCanvas(mask = false) {
        return mask ? this._canvasMain : this._canvasMask;
    }
    /**获取对象绘图板的2D画笔
     * @param {boolean} [mask = false] 是否要获取遮罩层绘图板画笔
     * @returns {CanvasRenderingContext2D} 获取到的画笔
     */
    getBrush(mask = false) {
        return (mask ? this._canvasMain : this._canvasMask).getContext("2d");
    }
    /**等待
     * @param {numbet} t 要等待的毫秒数
     */
    wait(t) {
        this._eQ.add(r => {
            let startTime = performance.now();
            t -= 13.34;
            if (t < 0) t = 0;
            let goneTime;
            let raf = requestAnimationFrame(function waitCont() {
                //console.log("inLoop");
                goneTime = performance.now() - startTime;
                if (goneTime >= t) {
                    r();
                } else {
                    raf = requestAnimationFrame(waitCont);
                }
            });
        });
    }
    /**等待，wait别名
     * @param {numbet} t 要等待的毫秒数
     */
    sleep(t) {
        this.wait(t);
    }
    /**按队列执行一个函数
     * @param {function} f 要执行的函数
     */
    runFunction(f) {
        this._eQ.add(async r => {
            try {
                await f();
            } catch (e) {
                if (e.info && e.info === "BREAK_BY_AVG") {
                    if (e.plies <= this._loopPliesCount) {
                        this._loopPliesCount -= e.plies;
                        for (let i = 0; i < e.plies; i++) {
                            this._eQ.clearQueue();
                            this._eQ = this._lastEventQueue();
                        }
                    } else {
                        throw "break loops' param too large";
                    }
                } else {
                    console.log("runFunction runError");
                    throw e;
                }
            } finally {
                r();
            }
        });
    }
    /**按队列执行一个函数，runFunction别名
     * @param {function} f 要执行的函数
     */
    run(f) {
        this.runFunction(f);
    }
    /**按队列并循环一个函数
     * @param {function} f 要循环执行的函数
     */
    loopFunction(f) {
        this._eQ.add(async r => {
            this._loopPliesCount++;
            this._eQ = this._nextEventQueue(
                "loopQueue",
                () => {
                    this.runFunction(f);
                },
                r
            );
            this.runFunction(f);
        });
    }
    /**按队列并循环一个函数，loopFunction别名
     * @param {function} f 要循环执行的函数
     */
    loop(f) {
        this.loopFunction(f);
    }
    /**中断事件的执行
     * @param {number} plies 中断层数
     */
    breakLoopFunction(plies = 1) {
        if (typeof plies !== "number") {
            throw "can not break function by a wrong plies";
        }
        throw { plies: plies, info: "BREAK_BY_AVG" };
    }
    /**中断事件的执行，breakLoopFunction别名
     * @param {number} plies 中断层数
     */
    break(plies = 1) {
        this.breakLoopFunction(plies);
    }
    /**从事件队列中请求下一个队列
     * @param {"eventQueue" | "loopQueue"} [type = "eventQueue"]  请求的队列类型
     * @param {function} [finishFun] 如果是一个循环队列，要循环执行的Function
     * @param {function} [resloveFunction] 如果是一个循环队列，reslove函数
     * @returns {EventQueue | LoopQueue} 返回的队列
     */
    _nextEventQueue(
        type = "eventQueue",
        finishFun = () => {},
        resloveFunction = () => new Promise(r => r())
    ) {
        /**
         * @type {number} 当前队列的下标
         */
        this._eQPointer;
        /**
         * @type {Array<EventQueue | LoopQueue>} 所有的事件队列
         */
        this._eQArray;

        if (typeof this._eQPointer === "undefined" || !this._eQArray) {
            this._eQPointer = -1;
            this._eQArray = new Array();
        }
        this._eQPointer++;
        if (!this._eQArray[this._eQPointer]) {
            switch (type) {
                case "eventQueue": {
                    this._eQArray[this._eQPointer] = new EventQueue();
                    break;
                }
                case "loopQueue": {
                    this._eQArray[this._eQPointer] = new LoopQueue();
                    break;
                }
            }
        }
        //this._eQArray[this._eQPointer].clearQueue();
        if (
            this._eQArray[this._eQPointer].__proto__.constructor === LoopQueue
        ) {
            this._eQArray[this._eQPointer].setLoopFunction(finishFun);
            this._eQArray[this._eQPointer].setResloveFunction(resloveFunction);
        }
        return this._eQArray[this._eQPointer];
    }
    /**从事件队列中请求上一个队列
     * @returns {EventQueue | LoopQueue} 返回的队列
     */
    _lastEventQueue() {
        if (typeof this._eQPointer === "undefined" || !this._eQArray) {
            throw "No Queque in Array!";
        }
        this._eQPointer--;
        if (this._eQPointer < 0) {
            this._eQPointer = 0;
        }
        return this._eQArray[this._eQPointer];
    }
}

(function(window, undefined) {
    // 构造对象
    // 部分抄袭来自jQuery
    /**
     * @type {HTMLCanvasElement}
     */
    let canvasMain; //主绘图板
    /**
     * @type {HTMLCanvasElement}
     */
    let canvasMask; //遮罩层绘图板

    let document = window.document,
        navigator = window.navigator,
        location = window.location;
    /**
     * @type {CanvasRenderingContext2D}
     */
    let paintBrush; //2D画笔
    /**
     * @type {CanvasRenderingContext2D}
     */
    let paintBrushForMask; //遮罩层话必

    let theLayer = new Array(); //图层记录
    /**
     * @type {HTMLAudioElement}
     */
    let audioBGM; //BGM
    let audioBGSE = new Array(),
        audioVoice;
    let volumeBGM, volumeSE, volumeVoice;
    let windowWidth, windowHeight;
    let backgroundColor;
    let defaultFont, defaultFontColor;
    let defaultChatX, defaultChatY;

    let mouseX = 0; //对外暴露的鼠标坐标
    let mouseY = 0;

    //TODO 由audio API接管audio
    //https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext
    /**
     * @type {AudioContext}
     */
    const AUDIO_CONTEXT_SE = new (window.AudioContext ||
        window.webkitAudioContext)();

    //为SE提供一个移除方法
    audioBGSE.remove = e => {
        for (const key in audioBGSE) {
            if (audioBGSE.hasOwnProperty(key)) {
                const element = audioBGSE[key];
                if (element === e) {
                    audioBGSE.splice(key, 1);
                    return;
                }
            }
        }
    };
    //let layerCount = 0;//图层计数
    function loadImgObjFromSrc(src) {
        if (src == null) return null;
        try {
            let imgObj = new Image();
            imgObj.src = src;
            return imgObj;
        } catch (e) {
            return null;
        }
    }
    /**
     * 事件队列
     */
    class EventQueue {
        constructor() {
            this._queue = new Array();
        }
        add(f) {
            this._queue.push(function(resolve) {
                f(resolve);
            });
            if (!this._flag) {
                this.next();
            }
        }
        hasNext() {
            return this._queue.length > 0;
        }
        next() {
            const _this = this;
            this._flag = true;
            (async function() {
                while (_this.hasNext()) {
                    await (function() {
                        return new Promise(r => {
                            _this._queue[0](r);
                        });
                    })();
                    _this._queue.splice(0, 1);
                }
                _this._flag = false;
            })();
        }
        clearQueue() {
            this._queue.splice(0, this._queue.length);
        }
    }
    /**
     * 循环队列
     */
    class LoopQueue {
        constructor(finishFun = () => {}) {
            this._queue = new Array();
            this._loopFun = finishFun;
        }
        add(f) {
            this._queue.push(function(resolve) {
                f(resolve);
            });
            if (!this._flag) {
                this.next();
            }
        }
        hasNext() {
            return this._queue.length > 0;
        }
        next() {
            const _this = this;
            this._flag = true;
            (async function() {
                while (_this.hasNext()) {
                    await (function() {
                        return new Promise(r => {
                            _this._queue[0](r);
                        });
                    })();
                    _this._queue.splice(0, 1);
                }
                _this._flag = false;
                avg.run(() => _this._loopFun());
            })();
        }
        clearQueue() {
            this._queue.splice(0, this._queue.length);
            _this._loopFun = () => {};
        }
    }
    /**
     * 所有事件队列
     * @type {EventQueue}
     */
    let eQ;
    /**
     * 所有事件队列
     * @type {Array<EventQueue|LoopQueue>}
     */
    const eQArray = new Array();
    /**
     * 事件队列当前下标
     * @type {number}
     */
    let eQPointer = -1;

    function nextEventQueue(type = "eventQueue", finishFun) {
        eQPointer++;
        if (!eQArray[eQPointer]) {
            switch (type) {
                case "eventQueue": {
                    eQArray[eQPointer] = new EventQueue();
                    break;
                }
                case "loopQueue": {
                    eQArray[eQPointer] = new LoopQueue();
                    break;
                }
            }
        }
        if (
            finishFun &&
            eQArray[eQPointer].__proto__.constructor === LoopQueue
        ) {
            eQArray[eQPointer]._loopFun = finishFun;
        }
        return eQArray[eQPointer];
    }

    function lastEventQueue() {
        eQPointer--;
        if (eQPointer < 0) {
            eQPointer = 0;
        }
        return eQArray[eQPointer];
    }

    //图层对象
    //图像图层
    function imgLayerObj(p, resolve) {
        //if (p.src == null) return null;
        /**
         * @type {HTMLImageElement}
         */
        this.img = p.img;
        this.layer = 0;
        this.x,
            this.y,
            this.width,
            this.height,
            this.sx,
            this.sy,
            this.swidth,
            this.swidth,
            this.alpha,
            (this.type = "image");
        this.rotate, this.rotatePointX, this.rotatePointY;
        //遮罩 "shade", 蒙版 "mask"
        this.mask = p.mask ? p.mask : false;
        const obj = this;
        if (p.rotate != null) {
            //旋转相关
            this.rotate = p.rotate;
            this.rotatePointX = p.rotatePointX != null ? p.rotatePointX : null;
            this.rotatePointY = p.rotatePointY != null ? p.rotatePointY : null;
        } else {
            this.rotate = 0;
            this.rotatePointX = 0;
            this.rotatePointY = 0;
        }
        this.alpha = p.alpha == null ? 1 : p.alpha;
        obj.x = p.x == null ? 0 : p.x; //在画布上放置图像的 x 坐标位置。
        obj.y = p.y == null ? 0 : p.y; //在画布上放置图像的 y 坐标位置。
        obj.sx = p.sx == null ? 0 : p.sx; //sx 可选。开始剪切的 x 坐标位置。
        obj.sy = p.sx == null ? 0 : p.sy; //sy 可选。开始剪切的 y 坐标位置。
        obj.width =
            p.width == null ? (p.img.width != null ? p.img.width : 0) : p.width; //可选。要使用的图像的宽度。（伸展或缩小图像）
        obj.height =
            p.height == null
                ? p.img.height != null ? p.img.height : 0
                : p.height; //可选。要使用的图像的宽度。（伸展或缩小图像）
        obj.swidth =
            p.swidth == null
                ? p.img.width != null ? p.img.width : 0
                : p.swidth; //swidth	可选。被剪切图像的宽度。
        obj.sheight =
            p.sheight == null
                ? p.img.height != null ? p.img.height : 0
                : p.sheight; //sheight	可选。被剪切图像的高度。
        let state = 0;
        if (p.img.width > 0 && p.img.height > 0) {
            state = 1;
            resolve();
        }
        this.img.addEventListener("load", e => {
            obj.width = p.width == null ? obj.img.width : p.width; //可选。要使用的图像的宽度。（伸展或缩小图像）
            obj.height = p.height == null ? obj.img.height : p.height; //可选。要使用的图像的宽度。（伸展或缩小图像）
            obj.swidth = p.swidth == null ? obj.img.width : p.swidth; //swidth	可选。被剪切图像的宽度。
            obj.sheight = p.sheight == null ? obj.img.height : p.sheight; //sheight	可选。被剪切图像的高度。
            if (state == 0) resolve();
        });
        //this.img.src = p.src;
    }
    //文字图层
    function textLayerObj(p, resolve) {
        this.type = "text";
        this.text = p.text;
        this.font = p.font == null ? defaultFont : p.font;
        this.color = p.color == null ? defaultFontColor : p.color;
        this.x = p.x;
        this.y = p.y;
        if (p.rotate != null) {
            //旋转相关
            this.rotate = p.rotate;
            this.rotatePointX = p.rotatePointX != null ? p.rotatePointX : null;
            this.rotatePointY = p.rotatePointY != null ? p.rotatePointY : null;
        } else {
            this.rotate = 0;
            this.rotatePointX = 0;
            this.rotatePointY = 0;
        }
        //遮罩 "shade", 蒙版 "mask"
        this.mask = p.mask ? p.mask : false;
        this.alpha = p.alpha == null ? 1 : p.alpha;
        resolve();
    }
    //从图片加载图层
    function loadImage(parameter, resolve) {
        //参数 layer
        try {
            // function imgReady() {
            //     drawImageLayer();
            // }
            //parameter.ready = imgReady;
            //console.log(parameter.layer);
            if (parameter.src) {
                parameter.img = loadImgObjFromSrc(parameter.src);
            }
            //parameter.type = "image";
            //parameter.img =
            theLayer[parameter.layer] = new imgLayerObj(parameter, resolve);
            //console.log(imageLayer);
        } catch (e) {
            console.log(e);
        }
    }
    //从文本加载图层
    function loadText(parameter, resolve) {
        //参数 layer
        try {
            // function imgReady() {
            //     drawImageLayer();
            // }
            //parameter.ready = imgReady;
            //console.log(parameter.layer);
            // if (parameter.src) {
            //     parameter.img = loadImgObjFromSrc(parameter.src);
            // }
            //parameter.type = "image";
            //parameter.img =
            theLayer[parameter.layer] = new textLayerObj(parameter, resolve);
            //console.log(imageLayer);
        } catch (e) {
            console.log(e);
        }
    }
    //移动图层
    function move(parameter, time = 0, resolve) {
        //参数 layer
        //参数 time
        try {
            if (theLayer[parameter.layer]) {
                let p = {}; //差值
                let startTime = performance.now();
                let nowTime;
                let animeTime = time;
                let pBackup = {}; //原值
                for (let i in parameter) {
                    pBackup[i] = theLayer[parameter.layer][i];
                    p[i] = theLayer[parameter.layer][i];
                    p[i] -= parameter[i];
                    p[i] *= -1;
                }
                if (time == 0) {
                    for (let i in parameter) {
                        theLayer[parameter.layer][i] = parameter[i];
                    }
                    resolve();
                    return;
                }
                p.layer = 0;
                let layer = parameter.layer;
                let timeCount;
                let percent;
                let raf = requestAnimationFrame(function refreshImage() {
                    if (timeCount <= 0) {
                        for (let i in p) {
                            theLayer[layer][i] = p[i] + pBackup[i];
                        }
                        cancelAnimationFrame(raf);
                        return true;
                    }
                    nowTime = performance.now();
                    if (animeTime == 0) {
                        percent = 1;
                    } else {
                        percent = (nowTime - startTime) / animeTime;
                    }
                    if (percent > 1) {
                        percent = 1;
                    }
                    for (let i in p) {
                        theLayer[layer][i] = percent * p[i] + pBackup[i];
                    }
                    timeCount = animeTime - (nowTime - startTime);
                    if (percent < 1) {
                        raf = requestAnimationFrame(refreshImage);
                    }
                });
                resolve();
                //refreshImage(time);
            }
        } catch (e) {
            console.log(e);
        }
    }
    // function creaveWindow(width, height) {
    //     creaveWindow(width, height, "avgMain", "", "avgMain");
    // }
    //绘制一个canvas (宽度,高度,id,cladd,name)
    //let refreshSet;
    //let refreshRate;
    //绘制主窗口并初始化
    function creaveWindow(p) {
        let newCanvasObject = document.createElement("canvas");
        p.idName = p.idName != null ? p.idName : "avgMain";
        p.className = p.className != null ? p.className : "avgMain";
        p.realName = p.realName != null ? p.realName : "avgMain";
        newCanvasObject.setAttribute(
            "id",
            p.idName != null ? p.idName : "avgMain"
        );
        newCanvasObject.setAttribute(
            "class",
            p.className != null ? p.className : "avgCanvas"
        );
        backgroundColor =
            p.backgroundColor != null ? p.backgroundColor : "#000";
        defaultFont =
            p.defaultFont != null
                ? p.defaultFont
                : '40px Arial,"Microsoft Yahei"';
        defaultFontColor =
            p.defaultFontColor != null ? p.defaultFontColor : "#FFF";
        newCanvasObject.setAttribute(
            "name",
            p.realName ? p.realName : "avgMain"
        );
        newCanvasObject.width = p.width;
        newCanvasObject.height = p.height;
        newCanvasObject.style.touchAction = "none";

        document.body.insertBefore(newCanvasObject, document.body.lastChild);

        canvasMain = newCanvasObject;
        paintBrush = newCanvasObject.getContext("2d");

        canvasMask = document.createElement("canvas");
        canvasMask.width = p.width;
        canvasMask.height = p.height;
        paintBrushForMask = canvasMask.getContext("2d");

        //音量
        volumeBGM = p.volumeBGM != null ? p.volumeBGM : 0.7;
        volumeSE = p.volumeSE != null ? p.volumeSE : 0.7;
        volumeVoice = p.volumeVoice != null ? p.volumeVoice : 0.7;
        windowWidth = p.width;
        windowHeight = p.height;

        eQ = nextEventQueue(); //创建一个事件队列对象

        let dom = canvasMain;
        let bbox; // = dom.getBoundingClientRect();
        function mouseMoveFun(e) {
            bbox = dom.getBoundingClientRect();
            mouseX = (e.clientX - bbox.left) * (p.width / bbox.width);
            mouseY = (e.clientY - bbox.top) * (p.height / bbox.height);
        }
        dom.addEventListener("mousemove", mouseMoveFun);
        if ("ontouchstart" in window) {
            function touchFun(e) {
                e.preventDefault();
                e = e.touches[0];
                bbox = dom.getBoundingClientRect();
                mouseX = (e.clientX - bbox.left) * (p.width / bbox.width);
                mouseY = (e.clientY - bbox.top) * (p.height / bbox.height);
            }
            dom.addEventListener("touchmove", touchFun);
            dom.addEventListener("touchstart", touchFun);
        }

        drawImageLayer();

        console.log("avg.Js 已完成初始化");
    }
    //从图层对象添加一个图层
    function setLayer(p, resolve) {
        if (!p.layer || !p.from) {
            resolve();
            return;
        }
        theLayer[p.layer] = p.from;
        p.from.layer = p.layer;
        resolve();
    }
    //移除图层
    function removeLayer(p, resolve) {
        //console.log(imageLayer);
        if (!p.layer) {
            resolve();
            return;
        }
        const re = theLayer[p.layer];
        theLayer[p.layer] = null;
        if (p.fun) {
            p.fun(re);
        }
        resolve();
    }
    //移除全部图层
    function removeAllLayer(resolve) {
        //console.log(imageLayer);
        for (i in theLayer) {
            theLayer[i] = null;
        }
        resolve();
    }
    //等待
    function wait(t, resolve) {
        //console.log("wait:" + t + " ms At " + performance.now());
        // setTimeout(function() {
        //     resolve();
        // }, t);
        let startTime = performance.now();
        t -= 13.34;
        if (t < 0) t = 0;
        let goneTime;
        let raf = requestAnimationFrame(function waitCont() {
            //console.log("inLoop");
            goneTime = performance.now() - startTime;
            if (goneTime >= t) {
                //console.log("ready:" + t + " ms At " + performance.now());
                resolve();
            } else {
                raf = requestAnimationFrame(waitCont);
            }
        });
    }
    //帧等待
    function waitByFrame(f, resolve) {
        //console.log("wait:" + f + " frames At " + performance.now());
        // setTimeout(function() {
        //     resolve();
        // }, t);
        let leftFrame = f;
        let raf = requestAnimationFrame(function waitCont() {
            //console.log("inLoop");
            leftFrame--;
            if (leftFrame <= 0) {
                //console.log("ready:" + f + " frames At " + performance.now());
                resolve();
            } else {
                raf = requestAnimationFrame(waitCont);
            }
        });
    }
    //依次重新绘制图层
    function drawImageLayer() {
        paintBrush.globalCompositeOperation = "destination-over";
        //paintBrushForMask.globalCompositeOperation = "source-in";
        let paintBrushBackup;
        let maskFlag = false;
        requestAnimationFrame(function autoRun() {
            paintBrush.beginPath();
            paintBrush.clearRect(0, 0, windowWidth, windowHeight);
            for (var i = theLayer.length - 1; i >= 0; i--) {
                if (theLayer[i]) {
                    const e = theLayer[i];
                    //遮罩层逻辑
                    if (e.mask && !maskFlag) {
                        maskFlag = e.mask;
                        paintBrushForMask.globalCompositeOperation =
                            "destination-over";
                        // paintBrushForMask.globalAlpha = 1;
                        // paintBrushForMask.fillStyle = backgroundColor;
                        // paintBrushForMask.fillRect(
                        //     0,
                        //     0,
                        //     windowWidth,
                        //     windowHeight
                        // );
                        paintBrushBackup = paintBrush;
                        paintBrush = paintBrushForMask;
                    } else if (maskFlag == "shade") {
                        paintBrushForMask.globalCompositeOperation =
                            "source-in";
                    } else if (maskFlag == "mask" && !e.mask) {
                        paintBrushForMask.globalCompositeOperation =
                            "destination-atop";
                    }
                    //图像绘制逻辑
                    if (e.type == "image") {
                        paintBrush.globalAlpha = e.alpha;
                        if (e.rotate != 0) {
                            paintBrush.save();
                            let _rX = 0;
                            let _rY = 0;
                            if (
                                e.rotatePointX == null &&
                                e.rotatePointY == null
                            ) {
                                _rX = e.x;
                                _rY = e.y;
                            } else if (
                                e.rotatePointX != null ||
                                e.rotatePointY != null
                            ) {
                                _rX = e.rotatePointX;
                                _rY = e.rotatePointY;
                            }
                            paintBrush.translate(_rX, _rY);
                            let rotateRate = e.rotate * Math.PI / 180;
                            paintBrush.rotate(rotateRate);
                            paintBrush.drawImage(
                                e.img,
                                e.sx,
                                e.sy,
                                e.swidth,
                                e.sheight,
                                e.x - _rX,
                                e.y - _rY,
                                e.width,
                                e.height
                            );
                            paintBrush.restore();
                            //paintBrush.rotate(-rotateRate);
                            //paintBrush.translate(-_rX, -_rY);
                            continue;
                        }
                        paintBrush.drawImage(
                            e.img,
                            e.sx,
                            e.sy,
                            e.swidth,
                            e.sheight,
                            e.x,
                            e.y,
                            e.width,
                            e.height
                        );
                    } else if (e.type == "text") {
                        paintBrush.globalAlpha = e.alpha;
                        paintBrush.fillStyle = e.color;
                        paintBrush.font = e.font;
                        if (e.rotate != 0) {
                            paintBrush.save();
                            let _rX = 0;
                            let _rY = 0;
                            if (
                                e.rotatePointX == null &&
                                e.rotatePointY == null
                            ) {
                                _rX = e.x;
                                _rY = e.y;
                            } else if (
                                e.rotatePointX != null ||
                                e.rotatePointY != null
                            ) {
                                _rX = e.rotatePointX;
                                _rY = e.rotatePointY;
                            }
                            paintBrush.translate(_rX, _rY);
                            let rotateRate = e.rotate * Math.PI / 180;
                            paintBrush.rotate(rotateRate);
                            paintBrush.fillText(e.text, e.x - _rX, e.y - _rY);
                            paintBrush.restore();
                            //paintBrush.rotate(-rotateRate);
                            //paintBrush.translate(-_rX, -_rY);
                            continue;
                        }
                        paintBrush.fillText(e.text, e.x, e.y);
                    }
                    //遮罩层逻辑
                    if (maskFlag && !e.mask) {
                        maskFlag = false;
                        paintBrush = paintBrushBackup;
                        paintBrush.drawImage(canvasMask, 0, 0);
                        paintBrushForMask.clearRect(
                            0,
                            0,
                            windowWidth,
                            windowHeight
                        );
                    }
                }
            }
            paintBrush.globalAlpha = 1;
            paintBrush.fillStyle = backgroundColor;
            paintBrush.fillRect(0, 0, windowWidth, windowHeight);
            paintBrush.closePath();
            requestAnimationFrame(autoRun);
        });
    }
    //播放BGM
    function playBGM(p, resolve) {
        //p.src 从src加载曲目
        //p.audio 从audio加载曲目
        try {
            if (p.src) {
                if (!audioBGM) {
                    audioBGM = new Audio(p.src);
                } else {
                    audioBGM.src = p.src;
                }
            } else {
                if (audioBGM) {
                    audioBGM.pause();
                }
                audioBGM = p.audio;
            }
            audioBGM.autoplay = true;
            audioBGM.loop = true;
            audioBGM.volume = volumeBGM * (p.volume == null ? 1 : p.volume);
            resolve();
            if (audioBGM.readyState == 4) {
                audioBGM.play();
                if (audioBGM.currentTime > 0) {
                    audioBGM.currentTime = 0;
                }
                //resolve();
            } else {
                audioBGM.oncanplay = function() {
                    audioBGM.play();
                    if (audioBGM.currentTime > 0) {
                        audioBGM.currentTime = 0;
                    }
                    //resolve();
                };
            }
        } catch (e) {
            console.log(e);
            resolve(); //如果加载失败继续执行
        }
    }
    //淡出BGM
    function stopBGM(p = { time: 0 }, resolve) {
        if (!audioBGM) {
            resolve();
            return;
        }
        let timeSet;
        let volumeBackup = audioBGM.volume;
        let persent;
        resolve();
        requestAnimationFrame(function raf(t) {
            if (!timeSet) {
                timeSet = t;
            }
            if (p.time == 0) {
                p.time = 1;
            }
            persent = 1 - (t - timeSet) / p.time;
            if (persent < 0) {
                persent = 0;
            }
            audioBGM.volume = volumeBackup * persent;
            if (persent > 0) {
                requestAnimationFrame(raf);
            }
        });
    }
    //播放SE
    function playSE(p, resolve) {
        //p.src 从src加载曲目
        //p.audio 从audio加载曲目
        //p.loop 是否循环
        try {
            let target;
            if (p.src) {
                target = audioBGSE.push(new Audio(p.src)) - 1;
            } else {
                target = audioBGSE.push(p.audio) - 1;
            }
            target = audioBGSE[target];
            target.autoplay = true;
            target.loop = p.loop ? true : false;
            target.volume = volumeSE * (p.volume == null ? 1 : p.volume);
            target.onended = function() {
                audioBGSE.remove(target);
            };
            resolve();
            if (target.readyState == 4) {
                target.play();
                if (target.currentTime > 0) {
                    target.currentTime = 0;
                }
                //resolve();
            } else {
                target.oncanplay = function() {
                    target.play();
                    if (target.currentTime > 0) {
                        target.currentTime = 0;
                    }
                    //resolve();
                };
            }
        } catch (e) {
            console.log(e);
            resolve(); //如果加载失败继续执行
        }
    }
    //执行事件
    function runFunction(f, resolve) {
        var resFlag = false;
        //const EQ_BACKUP = eQ;
        //eQ = nextEventQueue();
        var error;
        try {
            f();
        } catch (e) {
            //console.log(e);
            //console.log("catch Error");
            error = e;
            if (e.info && e.info === "BREAK_BY_AVG") {
                e.plies -= 1;
                if (e.plies <= 0) {
                    resFlag = true;
                    eQ = lastEventQueue();
                    console.log("runFunction Broke");
                }
            } else {
                //console.log(e);
                console.log("runFunction runError");
            }
        } finally {
            //eQ.stopQueue(); //No Use

            //eQ = lastEventQueue();
            //eQ = EQ_BACKUP;
            //console.log(error ? true + (!resFlag ? true : false) : false);
            resolve();
            if (!resFlag && error) {
                //console.log("throwE");

                throw error;
            }
        }
    }
    //循环事件
    function loopFunction(f, resolve) {
        var resFlag = false;
        var _this = this;
        //const EQ_BACKUP = eQ;
        var error;
        // try {
        eQ = nextEventQueue("loopQueue", () => {
            f.call(_this);
        });
        f.call(_this);
        // } catch (e) {
        //     console.log(e);
        //     error = e;
        //     if (e.info && e.info === "BREAK_BY_AVG") {
        //         e.plies--;
        //         if (e.plies <= 0) {
        //             resFlag = true;
        //             console.log("loopFunction Broke");
        //         }
        //         eQ.clearQueue();
        //         eQ = lastEventQueue();
        //         //eQ = EQ_BACKUP;
        //         resolve();
        //         if (!resFlag && error) {
        //             throw error;
        //         }
        //     } else {
        //         console.log(e);
        //         console.log("runFunction runError");
        //     }
        //     resolve();
        // }
    }
    function breakFunction(plies = 1) {
        throw { plies: plies, info: "BREAK_BY_AVG" };
    }
    //坐标获取
    //入参 e.clientX , e.clientY
    // function getLocation() {
    //   return {
    //     x: canvasMain.left * (canvas.width / canvasMain.width),
    //     y: canvasMain.top * (canvas.height / canvasMain.height)
    //     /*
    //      * 此处不用下面两行是为了防止使用CSS和JS改变了canvas的高宽之后是表面积拉大而实际
    //      * 显示像素不变而造成的坐标获取不准的情况
    //      * x: (x - bbox.left),
    //      * y: (y - bbox.top)
    //     */
    //   };
    // }

    //    basetool = drawwindow;
    //    window.jsAvg = window.$ = jsAvg;
    //    window.jsAvg.basetool = drawwindow;
    window.avg = {};
    let avgJs = window.avg;
    avgJs.creaveWindow = creaveWindow;

    avgJs.loadImage = function(p) {
        eQ.add(function(resolve) {
            loadImage(p, resolve);
        });
    };
    avgJs.loadText = function(p) {
        eQ.add(function(resolve) {
            loadText(p, resolve);
        });
    };
    avgJs.playBGM = function(p) {
        eQ.add(function(resolve) {
            playBGM(p, resolve);
        });
    };
    avgJs.stopBGM = function(p) {
        eQ.add(function(resolve) {
            stopBGM(p, resolve);
        });
    };
    avgJs.playSE = function(p) {
        eQ.add(function(resolve) {
            playSE(p, resolve);
        });
    };

    //avgJs.drawImageLayer = drawImageLayer;
    avgJs.setLayer = function(p) {
        eQ.add(function(resolve) {
            setLayer(p, resolve);
        });
    };
    avgJs.removeLayer = function(p) {
        eQ.add(function(resolve) {
            removeLayer(p, resolve);
        });
    };
    avgJs.removeAllLayer = function() {
        eQ.add(function(resolve) {
            removeAllLayer(resolve);
        });
    };
    avgJs.move = function(p, t) {
        eQ.add(function(resolve) {
            move(p, t, resolve);
        });
    };
    avgJs.wait = function(t) {
        eQ.add(function(resolve) {
            wait(t, resolve);
        });
    };
    avgJs.waitByFrame = function(f) {
        eQ.add(function(resolve) {
            waitByFrame(f, resolve);
        });
    };
    avgJs.setColor = function(i, c) {
        eQ.add(function(resolve) {
            theLayer[i].color = c;
            resolve();
        });
    };
    avgJs.runFunction = function(f) {
        eQ.add(function(resolve) {
            runFunction(f, resolve);
        });
    };
    avgJs.loopFunction = function(f) {
        eQ.add(function(resolve) {
            loopFunction(f, resolve);
        });
    };
    avgJs.break = function(plies) {
        breakFunction(plies);
    };
    avgJs.getLayerClientRect = function(index) {
        const re = theLayer[index];
        if (re) {
            return {
                x: re.x,
                y: re.y,
                width: re.width,
                height: re.height
            };
        } else {
            return null;
        }
    };
    avgJs.run = avgJs.runFunction;
    avgJs.loop = avgJs.loopFunction;
    avgJs.getDOM = function() {
        return canvasMain;
    };
    avgJs.mouse = {
        get x() {
            return mouseX;
        },
        get y() {
            return mouseY;
        }
    };

    window.theLayer = theLayer;
    //avgJs.loadImgObjFromSrc = loadImgObjFromSrc;
})(window);
