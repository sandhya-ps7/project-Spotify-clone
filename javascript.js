//  let para1 = document.createElement('p');
// para1.innerText= (
//     "Hi I'm red!");
// let body = document.querySelector('body');
// body.append(para1);

//  let h3 = document.createElement('h3');

//  h3.innerText = ("I'm a blue h3");
// h3.color= 'blue';
// body.append(h3);
//  let div = document.createElement('div');
// div.border ="black";
// div.backgroundColor="pink";
// body.append(div);
//  let h1 = document.createElement('h1');
// h1.innerText = ("I'm in a div");
// div.insertAdjacentElement('afterend',h1)
// body.append(div);

// practice set 9

let body = document.querySelector('body');
let input = document.createElement("input");
let btn = document.createElement("button");
btn.innerText =("Click me");
btn.backgroungColor =("blue")
body.append(input);
body.append(btn);
input.placeholder = ("Username");
let h1 = document.createElement('h1');
h1.innerText =("DOM Practice");
body.append(h1);
h1.color = 'purple';
h1.getAttribute('underline');
h1.setAttribute('underline', '2px solid black');

let tag = document.createElement('tag');
tag.innerText=("Apna College <b>DeltaPratice</b>");


















