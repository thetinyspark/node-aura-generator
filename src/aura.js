

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

            ball = config.balls[i];
            
            // geometry
            fire.x = parseInt(ball.x); 
            fire.y = parseInt(ball.y);
            fire.width = parseInt(ball.width);
            fire.height = parseInt(ball.height);
            fire.pivotX = parseInt(fire.width / 2);
            fire.pivotY = parseInt(fire.height);
            fire.rotation = parseInt(ball.rot);
            
            // other configuration
            fire.offset = offset;
            fire.power = parseFloat(config.power);
            fire.numPeaks = parseInt(config.peaks);
            fire.thickness = parseInt(config.lineWidth);
            fire.shadowBlur = parseInt(config.shadowBlur);
            fire.shadowColor = config.shadowColor;
            fire.edgeColor = config.edgeColor;
            fire.fillColor = config.fillColor;


            // draw fireball
            ctx.save();
            ctx.lineCap = config.lineCap;
            ctx.globalCompositeOperation = ball.blend;
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