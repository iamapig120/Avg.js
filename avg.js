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
    //事件队列
    class EventQueue {
        constructor() {
            this._queue = new Array();
            this.next();
        }
        add(f) {
            this._queue.push(function() {
                return new Promise(resolve => {
                    f(resolve);
                });
            });
        }
        hasNext() {
            return this._queue.length > 0;
        }
        next() {
            const _this = this;
            this._raf = requestAnimationFrame(async function autoRun() {
                while (_this.hasNext()) {
                    await _this._queue[0]();
                    _this._queue.splice(0, 1);
                }
                _this.raf = requestAnimationFrame(autoRun);
            });
        }
        stopQueue() {
            cancelAnimationFrame(this._raf);
        }
    }
    let eQ;
    //图层对象
    //图像图层
    function imgLayerObj(p, resolve) {
        //if (p.src == null) return null;
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
        this.img.onload = function() {
            obj.width = p.width == null ? obj.img.width : p.width; //可选。要使用的图像的宽度。（伸展或缩小图像）
            obj.height = p.height == null ? obj.img.height : p.height; //可选。要使用的图像的宽度。（伸展或缩小图像）
            obj.swidth = p.swidth == null ? obj.img.width : p.swidth; //swidth	可选。被剪切图像的宽度。
            obj.sheight = p.sheight == null ? obj.img.height : p.sheight; //sheight	可选。被剪切图像的高度。
            if (state == 0) resolve();
        };
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

        eQ = new EventQueue(); //创建一个事件队列对象

        let dom = canvasMain;
        let bbox; // = dom.getBoundingClientRect();
        function mouseMoveFun(e) {
            bbox = dom.getBoundingClientRect();
            mouseX = (e.clientX - bbox.left) * (p.width / bbox.width);
            mouseY = (e.clientY - bbox.top) * (p.height / bbox.height);
        }
        dom.addEventListener("mousemove", mouseMoveFun);

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
                            //paintBrush.save();
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
                            //paintBrush.restore();
                            paintBrush.rotate(-rotateRate);
                            paintBrush.translate(-_rX, -_rY);
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
                            //paintBrush.save();
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
                            //paintBrush.restore();
                            paintBrush.rotate(-rotateRate);
                            paintBrush.translate(-_rX, -_rY);
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
                //resolve();
            } else {
                audioBGM.oncanplay = function() {
                    audioBGM.play();
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
                //resolve();
            } else {
                target.oncanplay = function() {
                    target.play();
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
        var resFlag = true;
        //const EQ_BACKUP = eQ;
        //eQ = new EventQueue();
        var error;
        try {
            f();
        } catch (e) {
            //console.log("catch Error");
            error = e;
            if (e.info && e.info === "BREAK_BY_AVG") {
                e.plies--;
                if (e.plies <= 0) {
                    resFlag = true;
                    console.log("runFunction Broke");
                }
            } else {
                console.log(e);
                console.log("runFunction runError");
            }
        } finally {
            //eQ.stopQueue(); //No Use

            //eQ = EQ_BACKUP;
            if (resFlag) {
                resolve();
            } else if (error) {
                throw error;
            }
        }
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
    window["avg"] = {};
    let avgJs = window["avg"];
    avgJs["creaveWindow"] = creaveWindow;

    avgJs["loadImage"] = function(p) {
        eQ.add(function(resolve) {
            loadImage(p, resolve);
        });
    };
    avgJs["loadText"] = function(p) {
        eQ.add(function(resolve) {
            loadText(p, resolve);
        });
    };
    avgJs["playBGM"] = function(p) {
        eQ.add(function(resolve) {
            playBGM(p, resolve);
        });
    };
    avgJs["stopBGM"] = function(p) {
        eQ.add(function(resolve) {
            stopBGM(p, resolve);
        });
    };
    avgJs["playSE"] = function(p) {
        eQ.add(function(resolve) {
            playSE(p, resolve);
        });
    };

    //avgJs["drawImageLayer"] = drawImageLayer;
    avgJs["setLayer"] = function(p) {
        eQ.add(function(resolve) {
            setLayer(p, resolve);
        });
    };
    avgJs["removeLayer"] = function(p) {
        eQ.add(function(resolve) {
            removeLayer(p, resolve);
        });
    };
    avgJs["removeAllLayer"] = function() {
        eQ.add(function(resolve) {
            removeAllLayer(resolve);
        });
    };
    avgJs["move"] = function(p, t) {
        eQ.add(function(resolve) {
            move(p, t, resolve);
        });
    };
    avgJs["wait"] = function(t) {
        eQ.add(function(resolve) {
            wait(t, resolve);
        });
    };
    avgJs["waitByFrame"] = function(f) {
        eQ.add(function(resolve) {
            waitByFrame(f, resolve);
        });
    };
    avgJs["setColor"] = function(i, c) {
        eQ.add(function(resolve) {
            theLayer[i].color = c;
            resolve();
        });
    };
    avgJs["runFunction"] = function(f) {
        eQ.add(function(resolve) {
            runFunction(f, resolve);
        });
    };
    avgJs["break"] = function(plies) {
        breakFunction(plies);
    };
    avgJs["getLayerClientRect"] = function(index) {
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
    avgJs["run"] = avgJs["runFunction"];
    avgJs["getDOM"] = function() {
        return canvasMain;
    };
    avgJs["mouse"] = {
        x: new function() {
            this.toString = function() {
                return mouseX;
            };
        }(),
        y: new function() {
            this.toString = function() {
                return mouseY;
            };
        }()
    };
    //avgJs["loadImgObjFromSrc"] = loadImgObjFromSrc;
})(window);
