// Avg类的方法注册，K为avgFunctions中的属性名，v为一个数组，为Avg类的对应方法名
const avgPrototypeKV = {
  setSize: ['setSize'],
  // getCanvas: ['getCanvas'],
  // getBrush: ['getBrush'],
  wait: ['wait', 'sleep'],
  runFunction: ['runFunction', 'run'],
  loopFunction: ['loopFunction', 'loop'],
  breakLoopFunction: ['breakLoopFunction', 'break']
}

export { avgPrototypeKV }
export default avgPrototypeKV
