"use strict";
var WIDTH = 500;
var HEIGHT = 500;
var body = document.getElementsByTagName("body")[0];
var control = document.getElementById("control");
var translate = document.getElementById("translate");
var mousedown = false;
var mousedownXY = [0, 0];
var mouseXY = [0, 0];
var scale = 1;
var xoff = 0;
var yoff = 0;
var mouseMovedHold = false;
var timeouts = [];
var lastRect = { x: 0, y: 0 };
function mapCords(x, y) {
    return WIDTH * y + x * 4;
}
function getPixelFillStyle(x, y) {
    var i = mapCords(x, y);
    return "rgba(".concat(bytes[i], ",").concat(bytes[i + 1], ",").concat(bytes[i + 2], ",").concat(i + 3, ")");
}
function redrawPixel(x, y) {
    var i = mapCords(x, y);
    ctx.clearRect(x, y, 1, 1);
    ctx.fillStyle = "rgba(".concat(bytes[i], ",").concat(bytes[i + 1], ",").concat(bytes[i + 2], ",1)");
    ctx.fillRect(x, y, 1, 1);
}
function dimPixel(opacity, x, y) {
    var i = mapCords(x, y);
    ctx.clearRect(x, y, 1, 1);
    ctx.fillStyle = "rgba(".concat(bytes[i], ",").concat(bytes[i + 1], ",").concat(bytes[i + 2], ",").concat(opacity, ")");
    ctx.fillRect(x, y, 1, 1);
}
function selectPixel(x, y) {
    var _loop_1 = function (i) {
        timeouts.push(window.setTimeout(function () {
            dimPixel(i, x, y);
        }, (1 - i) * 1000));
    };
    for (var i = 0.9; i >= 0; i -= 0.1) {
        _loop_1(i);
    }
    timeouts.push(window.setTimeout(function () {
        var _loop_2 = function (i) {
            window.setTimeout(function () {
                dimPixel(i, x, y);
            }, (i) * 1000);
        };
        for (var i = 0.1; i <= 0.9; i += 0.1) {
            _loop_2(i);
        }
    }, 1000));
    timeouts.push(window.setTimeout(function () { return selectPixel(x, y); }, 2000));
}
function setTransform() {
    console.log(xoff, yoff);
    control.style.transform = "translate(" + xoff + "px, " + yoff + "px) scale(" + scale + ")";
}
var canvas = document.getElementById("main");
var ctx = canvas.getContext("2d");
var bytes = new Uint8ClampedArray(WIDTH * HEIGHT * 4).map(function (x, i) {
    if ((i + 1) % 4 == 0 || (i + 1) % 2 == 0)
        return 255;
    else
        return x;
});
var pixels = new ImageData(bytes, WIDTH);
console.log(pixels.data);
ctx.putImageData(pixels, 0, 0);
ctx.imageSmoothingEnabled = false;
canvas.addEventListener("mousedown", function (e) {
    mousedown = true;
    mousedownXY = [e.clientX - xoff, e.clientY - yoff];
    console.log(mousedownXY);
});
canvas.addEventListener("mouseup", function (e) {
    mousedown = false;
    var box = canvas.getBoundingClientRect();
    if (!mouseMovedHold) {
        var mouseX = e.clientX - box.left;
        var mouseY = e.clientY - box.top;
        mouseX = Math.floor((mouseX / box.width) * canvas.width);
        mouseY = Math.floor((mouseY / box.height) * canvas.height);
        timeouts.forEach(function (x) { return clearTimeout(x); });
        timeouts = [];
        redrawPixel(lastRect.x, lastRect.y);
        lastRect.x = mouseX;
        lastRect.y = mouseY;
        selectPixel(mouseX, mouseY);
    }
    mouseMovedHold = false;
});
control.addEventListener("mousemove", function (e) {
    if (mousedown) {
        xoff = (e.clientX - mousedownXY[0]);
        yoff = (e.clientY - mousedownXY[1]);
        setTransform();
        mouseMovedHold = true;
    }
});
// thanks to fmacdee
canvas.onwheel = function (e) {
    e.preventDefault();
    // take the scale into account with the offset
    var xs = (e.clientX - xoff) / scale, ys = (e.clientY - yoff) / scale, delta = -e.deltaY;
    // get scroll direction & set zoom level
    (delta > 0) ? (scale *= 1.2) : (scale /= 1.2);
    // reverse the offset amount with the new scale
    xoff = e.clientX - xs * scale;
    yoff = e.clientY - ys * scale;
    setTransform();
};
