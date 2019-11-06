

/**
 * *****************************************************************
 * *********************** MAIN PROGRAM ********************
 * *****************************************************************
 */

const {Fireball} = require('./Fireball');
const { createCanvas } = require('canvas');
const fs = require("fs");
const Param = require("./utils/params");
let canvas = null;
let ctx = null;

function init(config) {

    let offset = 0;
    let offsetStep = parseInt(config.offsetStep);
    let width = parseInt(config.width);
    let height = parseInt(config.height);
    let numFrames = parseInt(config.numFrames);
    let out = config.out;
    let fire = new Fireball(1,1);
    let ball = null;

    canvas = createCanvas(width, height);
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');

    for (let j = 0; j < numFrames; j ++) {

        out = config.out.replace("{{$index}}", j);

        ctx.clearRect(0, 0, width, height);
        ctx.save();

        for (let i = 0; i < config.balls.length; i++) {
            fire = Fireball.getInstanceFromData(config.balls[i]);
            fire.offset = offset;


            // draw fireball
            ctx.save();
            ctx.lineCap = config.lineCap;
            ctx.globalCompositeOperation = config.blend;
            fire.render(ctx);
            ctx.restore();
        }

        ctx.restore();

        // increment offset
        offset += offsetStep;

        // write image on disk
        fs.writeFileSync(out, canvas.toBuffer());
    }
}

init(Param.getConfig("--config", true));