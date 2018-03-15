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

/**判断类型是不是number
 * @param {any} test 要测试的对象
 */
const isNum = test => typeof test === "number";

export { switchInstanceof, isNum };
