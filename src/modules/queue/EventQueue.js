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
                await new Promise(r => {
                    _this._queue[0](r);
                });
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

export { EventQueue };
