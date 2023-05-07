
const WIDTH = 500;
const HEIGHT = 500;
const body = document.getElementsByTagName("body")[0]!;
const control = document.getElementById("control")!
const translate = document.getElementById("translate")!
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
            window.setTimeout( () => {
                dimPixel(i,x,y);
                },(i)*1000)
        }
    },1000))
    timeouts.push(window.setTimeout(() => selectPixel(x,y),2000))
}
function setTransform() {
    console.log(xoff,yoff)
    control.style.transform = "translate(" + xoff + "px, " + yoff + "px) scale(" + scale + ")";
  }


let canvas = <HTMLCanvasElement> document.getElementById("main");
const ctx = canvas.getContext("2d")!
let bytes = new Uint8ClampedArray(WIDTH*HEIGHT*4).map((x,i) => 
    {
        if((i+1)%4==0 || (i+1)%2==0 ) return 255
        else return x;
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
        mouseX = Math.floor((mouseX / box.width) * canvas.width);
        mouseY = Math.floor((mouseY / box.height) * canvas.height);
        timeouts.forEach(x => clearTimeout(x));
        timeouts = [];
        redrawPixel(lastRect.x,lastRect.y)
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
canvas.onwheel = function(e) {
    e.preventDefault();
    // take the scale into account with the offset
    var xs = (e.clientX - xoff) / scale,
        ys = (e.clientY - yoff) / scale,
        delta = -e.deltaY;

    // get scroll direction & set zoom level
    (delta > 0) ? (scale *= 1.2) : (scale /= 1.2);

    // reverse the offset amount with the new scale
    xoff = e.clientX - xs * scale;
    yoff = e.clientY - ys * scale;

     
    setTransform();   
       
}


