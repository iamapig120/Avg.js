import { EventQueue } from "./EventQueue";

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
            throw "LoopFunction Param is not a function!";
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

export { LoopQueue };
