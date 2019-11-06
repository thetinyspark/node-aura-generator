import { Fireball } from "./Fireball.js";

// const & vars
const modes = [
    "source-over",
    "source-in",
    "source-out",
    "source-atop",
    "destination-over",
    "destination-in",
    "destination-out",
    "destination-atop",
    "lighter",
    "copy",
    "xor",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity"
];

const balls = [];
let currentBall = balls[0];
let currentMode = modes[8];
let playing = false;
let speed = 2;



// ui getters
function getSelectMode() { return document.querySelector("#mode"); }
function getSelectBall() { return document.querySelector("#ball"); }
function getBallEditor() { return document.querySelector("#ball-editor"); }
function getCanvas() { return document.querySelector("canvas"); }
function getContext() { return getCanvas().getContext("2d"); }
function getAddBtn() { return document.querySelector("#addbtn"); }
function getDelBtn() { return document.querySelector("#delbtn"); }
function getExportBtn() { return document.querySelector("#exportbtn"); }
function getImportBtn() { return document.querySelector("#importbtn"); }
function getSmartBtn() { return document.querySelector("#smartbtn"); }
function getPlayBtn() { return document.querySelector("#playbtn"); }
function getCloneBtn() { return document.querySelector("#clonebtn"); }


// ui 
function refreshBallSelect() {
    let select = getSelectBall();
    let html = "";
    let selected = "";
    for (let i = 0; i < balls.length; i++) {
        selected = (balls[i] === currentBall) ? 'selected="selected"' : "";

        html += `
        <option value="${i}" ${selected}>Fireball n°${i + 1}</option>
        `;
    }
    select.innerHTML = html;
}

function refreshModeSelect() {
    let select = getSelectMode();
    let html = "";
    let selected = "";
    for (let i = 0; i < modes.length; i++) {
        selected = (modes[i] === currentMode) ? 'selected="selected"' : "";

        html += `
        <option value="${modes[i]}" ${selected}>${modes[i]}</option>
        `;
    }

    select.innerHTML = html;
}

function refreshBallsTable() {
    let table = getBallEditor();
    let html = "";

    for (let prop in currentBall) {

        // skip offset
        if (prop == "offset")
            continue;

        html += `
            <tr>
                <th>${prop}</th>
                <td><input name="${prop}" value="${currentBall[prop]}" /></td>
            </tr>
            `;
    }

    table.innerHTML = html;
}

function refreshToggleBtn() {
    getPlayBtn().innerHTML = (playing) ? "Pause" : "Play";
}

function refreshUI() {
    refreshBallSelect();
    refreshModeSelect();
    refreshBallsTable();
    refreshToggleBtn();
}


// fireball crud
function addFireball() {
    let canvas = getCanvas();
    let ball = new Fireball();
    ball.x = (canvas.width - ball.width) >> 1;
    ball.y = (canvas.height - ball.height) >> 1;
    balls.push(ball);

    currentBall = ball;
    smartPivot();
    refreshUI();
}

function cloneFireball() {
    if (currentBall == null)
        return;

    let ball = Fireball.getInstanceFromData(currentBall);
    balls.push(ball);
    currentBall = ball;
    smartPivot();
    refreshUI();
}

function delFireball() {
    balls.splice(balls.indexOf(currentBall), 1);
    currentBall = (balls.length == 0) ? null : balls[0];
    refreshUI();
}

function edit(event) {
    let prop = event.target.name;

    if (currentBall.hasOwnProperty(prop)) {
        let val = event.target.value;
        val = (!isNaN(val)) ? parseFloat(val) : val;
        currentBall[prop] = val;
    }

    refreshUI();
}

function selectBall(event) {
    let index = parseInt(event.target.value);
    currentBall = balls[index];
    refreshUI();
}

function selectMode(event) {
    currentMode = event.target.value;
    refreshUI();
}

function smartPivot() {
    let pivot = currentBall.getSmartPivot();
    currentBall.pivotX = pivot.x;
    currentBall.pivotY = pivot.y;
}


//play / pause
function togglePlay() {
    playing = !playing;
    refreshUI();
}


// import / export
function export2JSON() {

    let raw = JSON.stringify(balls, null, 4);
    let data = new Blob([raw], { type: 'text/plain' });
    let url = window.URL.createObjectURL(data);

    const a = document.createElement('a');
    a.href = url;
    a.download = "export.json";
    a.click();

    window.URL.revokeObjectURL(url);
}

function importJSON() {

    const input = document.createElement("input");
    input.type = "file";

    input.addEventListener(
        "change",
        (event) => {

            let files = input.files;
            let reader = new FileReader();
            if (files.length == 0)
                return;

            reader.addEventListener(
                "load",
                (event) => {
                    let data = JSON.parse(reader.result);
                    while (balls.length > 0) {
                        balls.shift();
                    }

                    for (let i = 0; i < data.length; i++) {
                        balls.push(Fireball.getInstanceFromData(data[i]));
                    }

                    currentBall = (balls.length > 0) ? balls[0] : null;

                    refreshUI();
                }
            )

            reader.readAsText(files[0]);

        }
    );

    input.click();
}


// start & draw
function draw() {
    let canvas = getCanvas();
    let ctx = getContext();

    // draw white background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = currentMode;
    for (let i = 0; i < balls.length; i++) {
        balls[i].render(ctx);
        balls[i].offset = (playing) ? balls[i].offset + speed : 0;
    }
    ctx.restore();

    if (currentBall != null) {
        ctx.save();

        ctx.fillStyle = "green";
        ctx.translate(currentBall.x + currentBall.pivotX, currentBall.y + currentBall.pivotY);

        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }

    window.requestAnimationFrame(draw);
}

function start() {
    let canvas = getCanvas();
    canvas.width = 512;
    canvas.height = 512;

    getBallEditor().addEventListener("change", edit);
    getSelectBall().addEventListener("change", selectBall);
    getSelectMode().addEventListener("change", selectMode);
    getAddBtn().addEventListener("click", addFireball);
    getCloneBtn().addEventListener("click", cloneFireball);
    getDelBtn().addEventListener("click", delFireball);
    getExportBtn().addEventListener("click", export2JSON);
    getImportBtn().addEventListener("click", importJSON);
    getSmartBtn().addEventListener("click", smartPivot);
    getPlayBtn().addEventListener("click", togglePlay);

    refreshUI();
    draw();
}

// bootstraper
window.addEventListener("load", start);



