const GAME_BG_RAND_LIST = new function () {
    const list = [
        "game_music.mp3"
    ];
    this.toString = function () {
        return `audio/${list[parseInt(list.length * Math.random())]}`;
    };
}();

let cheater = false;

const GAME_BG = new Audio(GAME_BG_RAND_LIST);
const GAME_SE = "audio/bullet.mp3";
const GAME_SPEED = 90;
const GAME_EASY = 180;

let hiScore = localStorage.getItem("FlappyBirdHiScore");
if (hiScore) {
    hiScore = parseInt(hiScore);
} else {
    hiScore = 0;
}

/**
 * a为鸟，b为管道
 * @param {*} a
 * @param {*} b
 */
function testImpact(a, b) {
    //console.log(a, b);
    a.bottom = a.y + a.height;
    a.right = a.x + a.width;

    b.bottom = b.y + b.height;
    b.right = b.x + b.width;

    if (a.right < b.x) return false;
    if (a.x > b.right) return false;

    if (a.bottom > b.y && a.bottom < b.bottom) return true;
    if (a.y < b.bottom && a.y > b.y) return true;
    return false;
}
avg.creaveWindow({
    width: 336,
    height: 600,
    volumeBGM: 0.5
});
avg.wait(2000);
avg.playBGM({
    audio: GAME_BG
});
avg.loadImage({ layer: 1, src: "image/sky.png" });
avg.loadImage({
    layer: 24,
    src: "image/ground.png",
    y: 600 - 112
});
avg.removeLayer({
    layer: 24,
    fun: obj => {
        avg.setLayer({
            layer: 12,
            from: obj
        });
    }
});
avg.loadImage({
    layer: 13,
    src: "image/ground.png",
    x: 336,
    y: 600 - 112
});

//预先载入管道
avg.loadImage({
    layer: 4,
    src: "image/pie_top.png",
    x: 336
});
avg.loadImage({
    layer: 5,
    src: "image/pie_down.png",
    x: 336
});
avg.loadImage({
    layer: 6,
    src: "image/pie_top.png",
    x: 336
});
avg.loadImage({
    layer: 7,
    src: "image/pie_down.png",
    x: 336
});

let bird = 0;
let birdx = 50;
let birdy = 200;
let speed = 6;
let speedy = 0;
let rotate = 0;
let frame = 0;

let scoreImgWidth = 40;

let score = 0;

let reFreshGround = false;

let canPlay = true;
let piping2 = false;

let randBirdImg;

function randBirdImgFun() {
    randBirdImg = `image/birds${parseInt(Math.random() * 3)}.png`;
}

const getRandPipingTop = new function () {
    this.toString = function () {
        return 20 + parseInt(Math.random() * (430 - GAME_EASY));
    };
}();

let randPipingTop = getRandPipingTop.toString(),
    randPipingTop2 = getRandPipingTop.toString();

function gameOver() {
    if (canPlay) {
        canPlay = false;
        if (hiScore < score) {
            hiScore = score;
        }
        localStorage.setItem("FlappyBirdHiScore", hiScore);
        console.log("HI SCORE : " + hiScore);
        avg.playSE({
            src: "audio/game_over.mp3"
        });
        avg.stopBGM({
            time: 500
        });
    }
}
function jump() {
    if (canPlay) {
        avg.playSE({
            src: GAME_SE
        });
        speedy = -12;
    }
}
avg.getDOM().addEventListener("click", function () {
    jump();
});
document.documentElement.addEventListener("keydown", function (e) {
    jump();
});
document.documentElement.addEventListener("keyup", function (e) {
    //console.log(window.event.keyCode);
    //console.log(e.keyCode);
    // if (e.keyCode == 32 && canPlay) {
    //   avg.playSE({
    //     src: GAME_SE
    //   });
    //   speedy = -14;
    // }
    if (e.keyCode == 67 && canPlay) {
        cheater = !cheater;
    }
});
avg.run(randBirdImgFun);
avg.run(function fun(p) {
    frame++;
    speedy += 0.75;
    birdy += speedy;
    if (birdy < 0) {
        birdy = 0;
    }
    if (birdy > 464) {
        birdy = 464;
        gameOver();
    }
    if (speedy > 15) {
        speedy = 15;
    }
    rotate = GAME_SPEED / Math.PI * Math.atan(speedy / speed);
    if (frame == GAME_SPEED) {
        randPipingTop2 = getRandPipingTop.toString();
        if (canPlay) {
            score++;
        }
        piping2 = true;
        reFreshGround = true;
    } else if (frame == GAME_SPEED * 2) {
        randPipingTop = getRandPipingTop.toString();
        if (canPlay) {
            score++;
        }
        reFreshGround = true;
        frame = 0;
    }
    if (canPlay) {
        if (reFreshGround) {
            reFreshGround = false;
            avg.move({ layer: 12, x: 0 });
            avg.move({ layer: 13, x: 336 });
            //console.log(avg.getLayerClientRect(14));
        }
        avg.move(
            { layer: 12, x: 0 - 336 * (frame % GAME_SPEED) / GAME_SPEED },
            0
        );
        avg.move(
            { layer: 13, x: 336 - 336 * (frame % GAME_SPEED) / GAME_SPEED },
            0
        );
    }

    if (canPlay) {
        if (frame % 4 == 0) {
            bird++;
            if (bird == 3) {
                bird = 0;
            }
        }
        avg.move({
            layer: 4,
            x: 336 - frame / GAME_SPEED * 336,
            y: randPipingTop - 420
        });
        avg.move({
            layer: 5,
            x: 336 - frame / GAME_SPEED * 336,
            y: randPipingTop + GAME_EASY
        });
        if (piping2) {
            let fTemp = frame;
            if (fTemp >= GAME_SPEED) {
                fTemp -= GAME_SPEED;
            } else {
                fTemp += GAME_SPEED;
            }
            avg.move({
                layer: 6,
                x: 336 - fTemp / GAME_SPEED * 336,
                y: randPipingTop2 - 420
            });
            avg.move({
                layer: 7,
                x: 336 - fTemp / GAME_SPEED * 336,
                y: randPipingTop2 + GAME_EASY
            });
        }
    }

    avg.loadImage({
        layer: 14,
        src: randBirdImg,
        x: birdx,
        y: birdy,
        width: 34,
        height: 24,
        sx: bird * 34,
        sy: 0,
        swidth: 34,
        sheight: 24,
        rotate: rotate,
        rotatePointX: birdx + 17,
        rotatePointY: birdy + 12
    });

    avg.run(() => {
        if (cheater && canPlay) {
            const bottom1 = avg.getLayerClientRect(5);
            const bottom2 = avg.getLayerClientRect(7);
            const bird = avg.getLayerClientRect(14);
            const birdBottom = bird.y + bird.height;
            let clickFlag = false;
            if (birdBottom < 20) {
                clickFlag = true;
            }
            if (bottom1.x < 336 && bottom1.x + bottom1.width > -1) {
                if (bottom1.y - 16 < birdBottom) {
                    clickFlag = true;
                }
            }
            if (bottom2.x < 336 && bottom2.x + bottom2.width > -1) {
                if (bottom2.y - 16 < birdBottom) {
                    clickFlag = true;
                }
            }
            if (clickFlag) {
                avg.getDOM().click();
            }
        }
        if (canPlay) {
            let scoreLength = (score + "").length;
            let scoreTemp = score;
            let layerFrom = 16;
            let xFrom = parseInt(
                336 - (336 - scoreLength * scoreImgWidth) / 2 - scoreImgWidth
            );
            for (let i = 0; i < scoreLength; i++) {
                avg.loadImage({
                    layer: layerFrom + i,
                    src: "image/scoreBig.png",
                    x: parseInt(xFrom - i * scoreImgWidth),
                    y: 48,
                    width: 40,
                    height: 60,
                    sx: parseInt(scoreTemp % 10) * scoreImgWidth,
                    sy: 0,
                    swidth: 40,
                    sheight: 60
                });
                scoreTemp /= 10;
                //console.log(layerFrom + i, score);
            }
            if (
                testImpact(
                    avg.getLayerClientRect(14),
                    avg.getLayerClientRect(4)
                ) ||
                testImpact(
                    avg.getLayerClientRect(14),
                    avg.getLayerClientRect(5)
                ) ||
                testImpact(
                    avg.getLayerClientRect(14),
                    avg.getLayerClientRect(6)
                ) ||
                testImpact(
                    avg.getLayerClientRect(14),
                    avg.getLayerClientRect(7)
                )
            ) {
                gameOver();
            }
        }
    });
    avg.waitByFrame(1);
    avg.run(fun);
});
