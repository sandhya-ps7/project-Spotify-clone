let btn = document.querySelector("button");
let h3 = document.querySelector("h3");

btn.addEventListener("click", function(){
    console.log("generate color");
    let randomColor = generateColor();
    h3.innerText = (randomColor);
    let div = document.querySelector("div");
    div.style.background = randomColor;

});

function generateColor() {
    let red = Math.floor(Math.random() * 255);
    let green = Math.floor(Math.random() * 255);
    let blue = Math.floor(Math.random() * 255);
    let color =`rgb(${red},${green},${blue})`;
    return color;
}