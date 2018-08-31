/**
 * Avg类的方法注册，
 * Key 为avgFunctions中的属性名，
 * Value 为一个数组，为Avg类的对应方法名
 */
const avgPrototypeKV = {
  setSize: ['setSize'],
  getCanvas: ['getCanvas'],
  getBrush: ['getBrush'],
  wait: ['wait', 'sleep'],
  runFunction: ['runFunction', 'run'],
  loopFunction: ['loopFunction', 'loop'],
  breakLoopFunction: ['breakLoopFunction', 'break']
}

export { avgPrototypeKV }
export default avgPrototypeKV
