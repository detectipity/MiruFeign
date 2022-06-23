let canvasBase;
let canvasIcon;
let canvasMove;
let layerBase;
let layerIcon;
let layerMove;

let images;

let movable = false;

const iconW = 32;
const iconH = 32;

const originW = 32;
const originH = 32;

const blockW = 32;
const blockH = 32;

let prevX = 0;
let prevY = 0;

const paletteStartX = 4;
const paletteStartY = 15;

const paletteW = 32;
const paletteH = 32;

const days = 6;

const canvasBlocksW = 8 + 5 * days;
const boardBlocksH = 15;
const paletteBlocksH = 4;

const canvasW = blockW * canvasBlocksW;
const canvasH = blockH * (boardBlocksH + paletteBlocksH);

const arrayPaletteIcon = [
    [ -1, -1, -1, -1, -1,  8,  9, -1, 11, 12, -1, 16, 17, 22, 23, 18, 19, 20],
    [ 24, -1, -1,  6,  7,  8,  9, 10, 11, 12, 13, -1, -1,-10,-11,-12,-13,-14],
    [ 25, -1, -1,  6,  7,  8,  9, 10, 11, 12, 13, -1, -1,-15,-16,-17,-18,-19],
    [ 26, -1, -1,  6,  7,  8,  9, 10, 11, 14, 15, -1, -1, -1, 21, 18, 19, 20]
];
const arrayPaletteColor = [
    [ -1, -1,  4, -1, -1,  4,  4, -1,  4,  4, -1,  0,  0,  5,  5,  5,  5,  5],
    [ -1, -1,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1, -1,  0,  0,  0,  0,  0],
    [ -1, -1,  1,  1,  1,  1,  1,  1,  1,  1,  1, -1, -1,  0,  0,  0,  0,  0],
    [ -1, -1,  2,  2,  2,  2,  2,  2,  2,  2,  2, -1, -1,  3,  3,  3,  3,  3]
];

let selectIcon;
let selectColor;

let arrayBoardIcon;
let arrayBoardColor;
let arrayBoardIconPocket;
let arrayBoardColorPocket;

const charasInfo = [
    ["white",       27, "rgb(255,255,255)",    true],
    ["orange",      34, "rgb(255,135,32)",     true],
    ["purple",      41, "rgb(113,52,139)",     false],
    ["green",       31, "rgb(42,123,12)",      false],
    ["blue",        37, "rgb(75,111,215)",     false],
    ["red",         28, "rgb(179,0,11)",       false],
    ["yellow",      33, "rgb(255,227,82)",     true],
    ["lime",        32, "rgb(131,255,70)",     true],
    ["cyan",        38, "rgb(49,215,199)",     true],
    ["pink",        39, "rgb(255,143,179)",    true],
    ["brown",       29, "rgb(101,67,33)",      false],
    ["magenta",     40, "rgb(255,0,223)",      false],
    ["darkorange",  35, "rgb(255,68,6)",       false],
//    ["darkgreen",   30, "rgb(42,91,43)",       false],
//    ["darkblue",    36, "rgb(56,22,227)",      false],
];

const reverseCharas = [0, 5, 10, 0, 3, 7, 6, 1, 12, 0, 4, 8, 9, 11, 2];

const defaultNames = ["ホワイト", "オレンジ", "パープル", "グリーン", "ブルー", "レッド", "イエロー", "ライム", "シアン", "ピンク", "ブラウン", "マゼンタ", ""];

let playerNames = [];
for(let i = 0; i < charasInfo.length; i += 1) {
    playerNames[i] = "";
}

let activePlayers;
let activePlayersNumber;
let activePlayersIcon;
let charasInitial;

onload = function() {
    makeCanvas();
    setEventListener();

    images = new Image();
    images.src = "FeignImages.png";
    
    images.onload = function(){
        makeCanvasPlayer();
        initArray();
        initCanvas();
    }
}

function makeCanvas() {
    canvasBase = document.getElementById("main");
    
    if ( ! canvasBase || ! canvasBase.getContext ) {
        return false;
    }
    layerBase = canvasBase.getContext("2d");
    
    canvasBase.width = canvasW;
    canvasBase.height = canvasH;
    
    const divCanvas = document.getElementById("canvas")
    const clientRect = divCanvas.getBoundingClientRect();
    const px = window.pageXOffset + clientRect.left;
    const py = window.pageYOffset + clientRect.top;
    
    canvasIcon = document.createElement("canvas");
    canvasIcon.width = canvasW;
    canvasIcon.height = canvasH;
    layerIcon = canvasIcon.getContext("2d");
    
    canvasIcon.style.zIndex = 1;
    canvasIcon.style.position = "absolute";
    canvasIcon.style.left = px + "px";
    canvasIcon.style.top = py + "px";
    document.getElementById("canvas").appendChild(canvasIcon);
    
    canvasMove = document.createElement("canvas");
    canvasMove.width = canvasW;
    canvasMove.height = canvasH;
    layerMove = canvasMove.getContext("2d");
    
    canvasMove.style.zIndex = 2;
    canvasMove.style.position = "absolute";
    canvasMove.style.left = px + "px";
    canvasMove.style.top = py + "px";
    document.getElementById("canvas").appendChild(canvasMove);
}

function setEventListener() {
    if (
        (navigator.userAgent.indexOf("iPhone") > 0
         || navigator.userAgent.indexOf("iPod") > 0
         || navigator.userAgent.indexOf("iPad") > 0
         || navigator.userAgent.indexOf("Android") > 0)
        ) {
            canvasMove.addEventListener("touchstart", touchstart);
            canvasMove.addEventListener("touchmove", touchmove);
            canvasMove.addEventListener("touchend", touchend);
            canvasMove.addEventListener("touchcancel",touchcancel);
            canvasMove.style.touchAction = "pinch-zoom";
        }
    else {
        canvasMove.addEventListener("mousedown", mousedown);
        canvasMove.addEventListener("mousemove", mousemove);
        canvasMove.addEventListener("mouseup", mouseup);
        canvasMove.addEventListener("mouseleave", mouseleave);
    }
}

function makeCanvasPlayer() {
    const formPlayers = document.getElementById("players");
    
    let canvasPlayer = document.createElement("canvas");
    canvasPlayer.width = originW * 30;
    canvasPlayer.height = originH * 5;
    let layerBasePlayer = canvasPlayer.getContext("2d");
    formPlayers.appendChild(canvasPlayer);
    
    for(let i = 0; i < charasInfo.length; i += 1) {
        let iconNumber = charasInfo[i][1];
        let posX = originW * ((i % 3) * 8);
        let posY = originH * Math.floor(i / 3);
        drawIcon(layerBasePlayer, posX, posY, iconNumber)
        
        let input = document.createElement("input");
        input.type = "text";
        input.id = "player" + i;
        input.style.position = "absolute";
        
        let clientRect = formPlayers.getBoundingClientRect();
        let px = window.pageXOffset + clientRect.left;
        let py = window.pageYOffset + clientRect.top;
        input.style.left = (px + originW + posX + 5) + "px";
        input.style.top = (py + posY + 5) + "px";
        input.placeholder = "未使用";
        formPlayers.appendChild(input);
    }
}

function initArray(){
    arrayBoardIcon = [];
    arrayBoardColor = [];

    arrayBoardIconPocket = [];
    arrayBoardColorPocket = [];

    for (let i = 0; i < boardBlocksH; i += 1) {
        arrayBoardIcon[i] = [];
        arrayBoardColor[i] = [];
        arrayBoardIconPocket[i] = [];
        arrayBoardColorPocket[i] = [];
        for (let j = 0; j < canvasBlocksW; j += 1) {
            arrayBoardIcon[i][j] = -1;
            arrayBoardColor[i][j] = -1;
            arrayBoardIconPocket[i][j] = -1;
            arrayBoardColorPocket[i][j] = -1;
        }
    }
}

function initCanvas(){
    // 背景
    layerBase.fillStyle = "rgb(210, 240, 160)"
    layerBase.beginPath();
    layerBase.fillRect(0, 0, canvasW, paletteStartY * blockH);
    layerBase.fillStyle = "rgb(240, 180, 120)"
    layerBase.beginPath();
    layerBase.fillRect(0, paletteStartY * blockH, canvasW, canvasH - paletteStartY * blockH);
    
    layerBase.textBaseline = "middle";
    
    // プレイヤー名と色の確定
    let checkName = false;
    for(let i = 0; i < charasInfo.length; i += 1) {
        if(playerNames[i] != "") {
            checkName = true;
        }
    }
    if(checkName == false){
        for(let i = 0; i < charasInfo.length; i += 1) {
            playerNames[i] = defaultNames[i];
        }
    }
    
    activePlayers = [];
    activePlayersNumber = [];
    activePlayersIcon = [];
    for(let i = 0; i < charasInfo.length; i += 1) {
        if(playerNames[i] != "") {
            activePlayers.push(playerNames[i]);
            activePlayersNumber.push(i);
            activePlayersIcon.push(charasInfo[i][1]);
        }
    }
    
    // プレイヤー名
    charasInitial = [];
    
    for(let i = 0; i < 12; i += 1) {
        if(i == activePlayers.length) {
            break;
        }
        layerBase.beginPath();
        layerBase.rect(0, blockH * (i + 1), blockW * 4, blockH);
        layerBase.fillStyle = charasInfo[activePlayersNumber[i]][2];
        layerBase.fill();
        
        if(charasInfo[activePlayersNumber[i]][3] == true) {
            layerBase.fillStyle = "black";
        }
        else {
            layerBase.fillStyle = "white";
        }
        layerBase.textAlign = "end";
        layerBase.font = "14px sans-serif";
        layerBase.fillText(activePlayers[i], blockW * 3 - 2, blockH * (i + 2) - blockH / 2 + 2);
        
        // キャラアイコン
        let iconNumber = activePlayersIcon[i];
        let posX = blockW * 3;
        let posY = blockH * (i + 1);
        drawIcon(layerBase, posX, posY, iconNumber)
        
        let initial = activePlayers[i].charAt(0);
        layerBase.textAlign = "center";
        layerBase.font = "16px sans-serif";
        layerBase.fillText(initial, blockW * 4 - blockW / 2, blockH * (i + 2) - blockH / 2);
        
        charasInitial[iconNumber] = initial;
    }
    
    // アイコンパレット
    for(let j = 0; j < paletteBlocksH; j += 1) {
        for(let i = 0; i < 18; i += 1) {
            let posX = paletteW * (i + paletteStartX);
            let posY = paletteH * (j + paletteStartY);
            
            let colorNumber = arrayPaletteColor[j][i];
            drawIcon(layerBase, posX, posY, colorNumber)
            
            let iconNumber = arrayPaletteIcon[j][i];
            drawIcon(layerBase, posX, posY, iconNumber)
            
            drawInitial(layerBase, posX, posY, iconNumber)
        }
    }
    
    // 横線
    layerBase.beginPath();
    for(let i = 1; i < boardBlocksH; i += 1) {
        layerBase.moveTo(0, blockH * i);
        layerBase.lineTo(blockW * canvasBlocksW, blockH * i)
        layerBase.lineWidth = 1;
    }
    layerBase.stroke();
    
    // 縦線
    layerBase.fillStyle = "black";
    layerBase.font = "20px sans-serif";
    layerBase.textAlign = "center";
    
    layerBase.fillText("役職", blockW * 5, blockH / 2);
    layerBase.fillText("ＣＯ", blockW * 7, blockH / 2);
    
    layerBase.beginPath();
    layerBase.moveTo(blockW * 4, 0);
    layerBase.lineTo(blockW * 4, blockH * 13);
    layerBase.moveTo(blockW * 6, 0);
    layerBase.lineTo(blockW * 6, blockH * 13);
    layerBase.lineWidth = 1;
    layerBase.stroke();
    
    for(let i = 0; i < days; i += 1) {
        const d = i * 5 + 8;
        layerBase.beginPath();
        layerBase.moveTo(blockW * d, 0);
        layerBase.lineTo(blockW * d, blockH * 13);
        layerBase.moveTo(blockW * (d + 1), blockH);
        layerBase.lineTo(blockW * (d + 1), blockH * 13);
        layerBase.lineWidth = 1;
        layerBase.stroke();
        
        layerBase.fillText((i + 1) + "日目", blockW * (d + 2.5), blockH / 2);
    }
}

function resetBoard(){
    let check = confirm("盤面をリセットしちゃいます。よいですか？");
    if(check == true){
        for(let i = 0; i < charasInfo.length; i += 1) {
            let inputName = document.getElementById("player" + i);
            playerNames[i] = inputName.value;
        }
        
        initArray();
        initCanvas();
        layerIcon.clearRect(0, 0, canvasW, canvasH);
    }
}

function moveStart(mx, my){
    movable = false;
    
    if(my < paletteStartY * blockH){
        let ax = Math.floor(mx / blockW);
        let ay = Math.floor(my / blockH);
        
        if(ax == 3 && ay > 0 && ay < 13) {
            selectColor = -1
            selectIcon = activePlayersIcon[ay - 1]
        }
        else {
            selectColor = arrayBoardColor[ay][ax];
            selectIcon = arrayBoardIcon[ay][ax];
        }
        
        if(selectColor != -1 || selectIcon != -1) {
            arrayBoardColor[ay][ax] = arrayBoardColorPocket[ay][ax];
            arrayBoardIcon[ay][ax] = arrayBoardIconPocket[ay][ax];
            arrayBoardColorPocket[ay][ax] = -1;
            arrayBoardIconPocket[ay][ax] = -1;
            
            let posX = Math.floor(mx / blockW) * blockW;
            let posY = Math.floor(my / blockH) * blockH;
            layerIcon.clearRect(posX, posY, blockW, blockH);
            drawIcon(layerMove, posX, posY, selectColor)
            drawIcon(layerMove, posX, posY, selectIcon)
            drawInitial(layerMove, posX, posY, selectIcon)
            
            let pocketColor = arrayBoardColor[ay][ax];
            let pocketIcon = arrayBoardIcon[ay][ax];
            if(pocketColor != -1 || pocketIcon != -1) {
                drawIcon(layerIcon, posX, posY, pocketColor)
                drawIcon(layerIcon, posX, posY, pocketIcon)
                drawInitial(layerIcon, posX, posY, pocketIcon)
            }
            
            movable = true;
            prevX = ax;
            prevY = ay;
        }
    }
    else {
        let ax = Math.floor(mx / blockW) - paletteStartX;
        let ay = Math.floor(my / blockH) - paletteStartY;
        
        if(ay < arrayPaletteIcon.length && ax < arrayPaletteIcon[ay].length){
            selectColor = arrayPaletteColor[ay][ax];
            selectIcon = arrayPaletteIcon[ay][ax];
            
            if(selectColor != -1 || selectIcon != -1) {
                movable = true;
                prevX = ax;
                prevY = ay;
            }
        }
    }
}

function moving(mx, my){
    if(movable == false) {
        return;
    }
    
    let ax = Math.floor(mx / blockW);
    let ay = Math.floor(my / blockH);
    
    if(ax != prevX || ay != prevY) {
        let posX = Math.floor(mx / blockW) * blockW;
        let posY = Math.floor(my / blockH) * blockH;
        layerMove.clearRect(0, 0, canvasW, canvasH);
        drawIcon(layerMove, posX, posY, selectColor)
        drawIcon(layerMove, posX, posY, selectIcon)
        drawInitial(layerMove, posX, posY, selectIcon)
    }
    
    prevX = ax;
    prevY = ay;
}

function moveEnd(){
    if(movable == false) {
        return;
    }
    
    movable = false;
    
    layerMove.clearRect(0, 0, canvasW, canvasH);
    
    let ax = prevX;
    let ay = prevY;
    
    if(ay >= paletteStartY){
        return
    }
    
    if(ax == 3 && ay > 0 && ay < 13) {
        return
    }
    
    let posX = Math.floor(mx / blockW) * blockW;
    let posY = Math.floor(my / blockH) * blockH;
    
    if(selectColor != -1) {
        drawIcon(layerIcon, posX, posY, selectColor)
    }
    
    if(selectIcon != -1) {
        drawIcon(layerIcon, posX, posY, selectIcon)
        drawInitial(layerIcon, posX, posY, selectIcon)
    }
    
    arrayBoardColorPocket[ay][ax] = arrayBoardColor[ay][ax];
    arrayBoardIconPocket[ay][ax] = arrayBoardIcon[ay][ax];
    
    arrayBoardColor[ay][ax] = selectColor;
    arrayBoardIcon[ay][ax] = selectIcon;
}

function moveCancel(){
    if(movable == false) {
        return;
    }
    
    movable = false;
    
    layerMove.clearRect(0, 0, canvasW, canvasH);
}

function mousedown(event) {
    let rect = event.target.getBoundingClientRect();
    mx = event.clientX - rect.left;
    my = event.clientY - rect.top;
    
    moveStart(mx, my);
}
function mousemove(event) {
    let rect = event.target.getBoundingClientRect();
    mx = event.clientX - rect.left;
    my = event.clientY - rect.top;
    
    moving(mx, my);
}
function mouseup(event) {
    moveEnd();
}
function mouseleave(event) {
    moveCancel();
}

function touchstart(event) {
    let rect = event.target.getBoundingClientRect();
    let fing = event.touches[0];
    mx = fing.clientX - rect.left;
    my = fing.clientY - rect.top;
    
    moveStart(mx, my);
}
function touchmove(event) {
    let rect = event.target.getBoundingClientRect();
    let fing = event.touches[0];
    mx = fing.clientX - rect.left;
    my = fing.clientY - rect.top;
    
    moving(mx, my);
}
function touchend(event) {
    moveEnd();
}
function touchcancel(event) {
    moveCancel();
}

function drawIcon(layer, posX, posY, iconNumber) {
    const copyX = originW * (iconNumber % 6);
    const copyY = originH * Math.floor(iconNumber / 6);
    layer.drawImage(images, copyX ,copyY, originW, originH, posX, posY, iconW, iconH);
}

function drawInitial(layer, posX, posY, iconNumber) {
    let word;
    if(iconNumber >= 27) {
        word = charasInitial[iconNumber];
        
        const colorNumber = reverseCharas[iconNumber - 27];
        
        if(charasInfo[colorNumber][3] == true) {
            layer.fillStyle = "black";
        }
        else {
            layer.fillStyle = "white";
        }
    }
    else if(iconNumber <= -10) {
        word = "" + (-iconNumber - 10);
        layer.fillStyle = "black";
    }
    else {
        return
    }
    
    layer.font = "16px sans-serif";
    layer.textAlign = "center";
    layer.textBaseline = "middle";
    layer.fillText(word, posX + blockW / 2, posY + blockH / 2);
}
