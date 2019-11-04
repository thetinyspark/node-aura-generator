/**
 * 
 * **********************************************************************
 * ************************ MATH FUNCTIONS **********************
 * **********************************************************************
 */

function straight(t, m, o = 0, p = 1, b = 12) {
    t = t % m;

    let r1 = doubleSawtooth(t, m, 0);

    return r1;
    // return Math.pow(r1, p);
}

function linear(t, m, r = 90) {

    return t / m;
}


function teeth(t, m, o = 0, p = 1, b = 12) {
    t = t % m;

    let num = 0;
    let percent = t / m;
    let offset = (percent < 0.5) ? -o : o;
    let r1 = doubleSawtooth(t, m, 0);
    let r2 = sawtooth(t * b, m, offset);
    let r3 = pseudorandom(t * m);

    if (t < m / 2) {
        r2 = 1 - r2;
    }

    num = 0.8 * r1;
    num += 0.1 * r2;
    num += 0.1 * r3;
    return Math.pow(num, p);
}

function round(t, m, r = 90) {
    t = t % m;
    let start = 270 - r;
    let angle = start + (r * 2 * t / m);
    let num = Math.cos((angle % 360) * Math.PI / 180);

    return num;
}

function pseudorandom(num, seed = 0) {

    let t = seed + ((num % 0xFFFF) * 0x6D2B79F5);

    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}


// fonction traçant une courbe de type "dent de scie" au cours du temps
// le paramètre "t" représente le "temps courant"
// le paramètre "m" représente le "temps maximum"
// le paramètre "o" représente un décalage dans le temps "offset"
function sawtooth(t, m, o = 0) {
    let x = (t + o) / m;
    return (1 - x - Math.floor(1 - x));
}

// fonction traçant une courbe de type "dent de scie" au cours du temps
// le paramètre "t" représente le "temps courant"
// le paramètre "m" représente le "temps maximum"
// le paramètre "o" représente un décalage dans le temps "offset"
function doubleSawtooth(t, m, o = 0) {
    let x = (t + o) / m * 2;
    return 1 - Math.abs(x % 2 - 1);
}




/**
 * *****************************************************************
 * *********************** MAIN PROGRAM ********************
 * *****************************************************************
 */


const { createCanvas } = require('canvas');
const fs = require("fs");
const Param = require("./utils/params");
let canvas = null;
let ctx = null;

function drawAura(context, spike, config, time, duration) {


    let i = 0;
    let x = 0;
    let y = 0;

    let peaks = parseInt(config.peaks);
    let power = parseInt(config.power);
    let lineCap = config.lineCap;
    let lineWidth = config.lineWidth;
    let shadowBlurX = parseFloat(config.shadowBlurX);
    let shadowBlurY = parseFloat(config.shadowBlurY);
    let isRound = config.round == true;
    let isStraight = config.straight == true;
    let lineColor = config.lineColor;
    let shadowColor = config.shadowColor;
    let innerColor = config.innerColor;
    let sx = parseInt(spike.x);
    let sy = parseInt(spike.y);
    let width = parseInt(spike.width) >> 1;
    let height = parseInt(spike.height);
    let rot = parseInt(spike.rot) * Math.PI / 180;
    let blend = spike.blend;

    let step = width * 2 / duration;

    context.save();

    context.translate(sx, sy);
    context.rotate(rot);
    context.globalCompositeOperation = blend;

    context.beginPath();

    context.shadowBlurX = shadowBlurX;
    context.shadowBlurY = shadowBlurY;
    context.shadowColor = shadowColor;
    context.lineWidth = lineWidth;
    context.lineCap = lineCap;
    context.strokeStyle = lineColor;
    context.fillStyle = innerColor;

    context.moveTo(-width, 0);


    for (i = 0; i < duration; i++) {

        if (isRound) {
            x = (round(i, duration) * width);
        }
        else {
            x = (i * step) - width;
        }

        if (isStraight) {
            y = -(straight(i, duration, time, power, peaks)) * height;
        }
        else {
            y = -(teeth(i, duration, time, power, peaks)) * height;
        }

        context.lineTo(x, y);
    }

    context.lineTo(width, 0);
    context.moveTo(0, 0);
    context.arc(0, 0, width, 0, Math.PI);


    context.stroke();
    context.fill();
    context.closePath();

    context.restore();

}

function init(config) {

    let width = parseInt(config.width);
    let height = parseInt(config.height);
    let i = 0;
    let duration = parseInt(config.duration);
    let step = parseInt(config.step);
    let time = parseInt(config.time);
    let out = config.out;

    canvas = createCanvas(width, height);
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');

    for (let j = time; j < duration; j += step) {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        out = config.out.replace("{{$index}}", j);

        for (i = 0; i < config.spikes.length; i++) {
            drawAura(ctx, config.spikes[i], config, j, duration);
        }

        ctx.restore();
        fs.writeFileSync(out, canvas.toBuffer());
    }
}

init(Param.getConfig("--config", true));