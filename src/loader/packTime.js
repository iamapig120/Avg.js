// const loaderUtils = require('loader-utils')

/**
 *
 * @param {string} src 输入的源码
 */
module.exports = function (src) {
  var result = src.replace('{{PackTime}}', new Date().toUTCString())
  // this.callback(null, `module.exports = '${result}'`)
  this.callback(null, result)
}
