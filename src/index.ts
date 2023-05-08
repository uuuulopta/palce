
const WIDTH = 500;
const HEIGHT = 500;
const body = document.getElementsByTagName("body")[0]!;
const control = document.getElementById("control")!
const translate = document.getElementById("translate")!
const scaleSpan = document.getElementById("scale")!
const zoomin = document.getElementById("zoomin")!
const zoomout = document.getElementById("zoomout")!
const colors = document.getElementsByName("input")!
let selectedColor: HTMLInputElement;
let mousedown = false;
let mousedownXY: number[] = [0,0]
let mouseXY: number[] = [0,0];
let scale = 1;
let xoff = 0;
let yoff = 0
let mouseMovedHold = false;
let timeouts:number[] = [];
let lastRect = {x:0,y:0}
function mapCords(x:number,y:number){
    return WIDTH * y + x*4
}
function getPixelFillStyle(x:number,y:number){
    var i = mapCords(x,y);       
    return `rgba(${bytes[i]},${bytes[i+1]},${bytes[i+2]},${i+3})`
}
function redrawPixel(x:number,y:number){
    var i = mapCords(x,y);       
    ctx.clearRect(x,y,1,1)
    ctx.fillStyle = `rgba(${bytes[i]},${bytes[i+1]},${bytes[i+2]},1)`
    ctx.fillRect(x,y,1,1)
}
function dimPixel(opacity: number,x: number,y: number){
    var i = mapCords(x,y);       
    ctx.clearRect(x,y,1,1)
    ctx.fillStyle = `rgba(${bytes[i]},${bytes[i+1]},${bytes[i+2]},${opacity})`
    if(bytes[i] == 255 && bytes[i+1] == 255 && bytes[i+2] == 255) ctx.fillStyle = ctx.fillStyle=`rgba(${0},${0},${0},${opacity})`
    ctx.fillRect(x,y,1,1)
}
function selectPixel(x : number, y : number): void{
    for(let i = 0.9; i>=0; i-=0.1){
        timeouts.push(window.setTimeout( () => {
            dimPixel(i,x,y);
            },(1-i)*1000))
    }
    timeouts.push(window.setTimeout(() => {
        for(let i = 0.1; i<=0.9; i+=0.1){
            timeouts.push(window.setTimeout( () => {
                dimPixel(i,x,y);
                },(i)*1000))
        }
    },1000))
    timeouts.push(window.setTimeout(() => selectPixel(x,y),2000))
}
function setTransform() {
    control.style.transform = "translate(" + xoff + "px, " + yoff + "px) scale(" + scale + ")";
    scaleSpan.innerHTML = scale.toString();
}


let canvas = <HTMLCanvasElement> document.getElementById("main");
const ctx = canvas.getContext("2d")!
let bytes = new Uint8ClampedArray(WIDTH*HEIGHT*4).map((x,i) => 
    {
        if((i+1)%4==0 || (i+1)%4==0) return 255
        else return x;
        // return 255
    });
let pixels : ImageData =  new ImageData(bytes,WIDTH);
console.log(pixels.data)
ctx.putImageData(pixels,0,0);
ctx.imageSmoothingEnabled = false;



canvas.addEventListener("mousedown", (e) => {
    mousedown = true;   
    mousedownXY = [e.clientX - xoff,e.clientY -yoff]
    console.log(mousedownXY)
} )
canvas.addEventListener("mouseup", (e) => {
    mousedown = false;
    let box = canvas.getBoundingClientRect();
    if(!mouseMovedHold){
        let mouseX = e.clientX - box.left ;
        let mouseY = e.clientY - box.top ;
        //TODO add check if its clicked already
        mouseX = Math.floor((mouseX / box.width) * canvas.width);
        mouseY = Math.floor((mouseY / box.height) * canvas.height);
        if ((mouseX == lastRect.x ) && (mouseY == lastRect.y )) return;
        timeouts.forEach(x => clearTimeout(x));
        timeouts = [];
        redrawPixel(lastRect.x,lastRect.y)
        // window.setTimeout(() => redrawPixel(lastRect.x,lastRect.y),2000);
        lastRect.x = mouseX
        lastRect.y = mouseY
        selectPixel(mouseX,mouseY)
        
    }
    mouseMovedHold = false;
} )
control.addEventListener("mousemove", (e) => {
    if(mousedown){
        xoff = (e.clientX - mousedownXY[0]);
        yoff = (e.clientY - mousedownXY[1]);
        setTransform();
        mouseMovedHold = true;
    }
})

// thanks to fmacdee
body.onwheel = function(e) {
    e.preventDefault();
    // take the scale into account with the offset
    console.log(e.clientX,e.clientY);
    var xs = (e.clientX - xoff) / scale,
        ys = (e.clientY - yoff) / scale,
        delta = -e.deltaY;

    // get scroll direction & set zoom level
    (delta > 0) ? (scale *= 1.2) : (scale /= 1.2);
    if(scale < 1) scale = 1 
    // reverse the offset amount with the new scale
    xoff = e.clientX - xs * scale;
    yoff = e.clientY - ys * scale;

    console.log(e.clientX,e.clientY)
    
    setTransform();   
       
}

zoomin.onclick = function (e){
    var box = canvas.getBoundingClientRect()
    for(var i = 0; i < 3; i++){
        body.dispatchEvent(
            new WheelEvent("wheel",{
                clientX: (box.x + 1/2*box.width ),
                clientY: (box.y + 1/2*box.height),
                deltaY: -1,
                
            })
        )
    }
}
zoomout.onclick = function (e){
    var box = canvas.getBoundingClientRect()
    for(var i = 0; i < 3; i++){
        body.dispatchEvent(
            new WheelEvent("wheel",{
                clientX: (box.x + 1/2*box.width ),
                clientY: (box.y + 1/2*box.height),
                deltaY: 1,
                
            })
        )
    }
}

