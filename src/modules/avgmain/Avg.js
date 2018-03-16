import { switchInstanceof } from "../function/fun.js";

import { EventQueue } from "../queue/EventQueue.js";
import { LoopQueue } from "../queue/LoopQueue.js";

import { ImageLayer } from "../layer/ImageLayer.js";
import { TextLayer } from "../layer/TextLayer.js";

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
            //try {
            await f();
            // } catch (e) {
            //     if (e.info && e.info === "BREAK_BY_AVG") {
            //         if (e.plies <= this._loopPliesCount) {
            //             this._loopPliesCount -= e.plies;
            //             for (let i = 0; i < e.plies; i++) {
            //                 this._eQ.clearQueue();
            //                 this._eQ = this._lastEventQueue();
            //             }
            //         } else {
            //             throw "break loops' param too large";
            //         }
            //     } else {
            //         console.log("runFunction runError");
            //         throw e;
            //     }
            // } finally {
            r();
            //}
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
                () => {
                    console.log("resolve");
                    r();
                }
            );
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
        this._eQ.add(r => {
            if (plies <= this._loopPliesCount) {
                this._loopPliesCount -= e.plies;
                for (let i = 0; i < plies; i++) {
                    this._eQ.clearQueue();
                    this._eQ = this._lastEventQueue;
                }
            }
            r();
        });
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

export { Avg };
export default Avg;
