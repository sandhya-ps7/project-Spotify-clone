// let signal = "green";
// if(signal === "red"){
//     console.log("Stop");
// }else if(signal === "yellow"){
//     console.log("GO slow down");
// }else if(signal === "green"){
//     console.log("You can go.");
// }

// let size = "S";
// if (size == "XL") {
//     console.log(`The price of the popcorn is Rs.${250}`);
// }else if(size == "L"){
//     console.log(`The price of your popcorn is Rs. ${200}`);
// }else if(size == "M"){
//     console.log(`The price of your popcorn is Rs.${100}`);
// }else if( size == "S"){
//     console.log(`The price of your popcorn is Rs. ${50}`);
// }
// let string = "sandhya";
// if(string[0] === 'a' && string.length >3){
//     console.log("It's a good string");
// }else {
//     console.log("It's not a good string");
// }

// let day = 1;
// switch (day) {
//     case 1:
//         console.log("Today is monday");
//         break;

//     case 2:
//         console.log("Today is tuesday");
//         break;
//     case 3:
//         console.log("Today is wednesday");
//         break;

//     case 4:
//         console.log("Today is thursday");
//         break;
    
//     case 5:
//         console.log("Today is Friday");
//         break;
//     case 6:
//         console.log("Today is saterday");
//         break;
//     default :
//         console.log("Today is Sunday");
//         break;
// }

// // praactice set 2
// let num = 59;
// if(num % 10 === 0){
//     console.log(`${num} is good number`);

// }else {
//     console.log(`${num} is bad number`);
// }

// //  let name = prompt("Enter your name");
// //  let age = prompt("Enter your age");
// // alert(`Your name is ${name} and your age is ${age}. thank-you ${name}`);
// // let Quarter = 1;
// // switch (Quarter) {
// //     case 1:
// //         console.log(`It's first Quarter and months it has january, fabruary, march.`);
// //         break;
// //     case 2:
// //         console.log(`It's second Quarter and months it has april, may , june.`);
// //         break;
// //     case 3:
// //         console.log(`It's third Quarter and months it has july, august, september.`);
// //         break;
// //     case 4:
// //         console.log(`It's forth Quarter and months it has october , november, december.`);
// //         break;
    
// //     default:
// //         console.log("It's not a valid Quarter");
// //         break;
// // }

// //golden string
// let str = "APPOO";
// if(str[0] === 'a' || str[0] === 'A' && (str.length) >'5'){
//     console.log("its a golden string");

// }else {
//     console.log("its not a golden string");
// }
// // 
// let a = 9;
// let b = 6; 
// let c = 5;
// if(a > b){
//     if(a > c){
//         console.log(`${a} is greater element`);
//     }else{
//         console.log(`${c} is greater element`);
//     }
// }else {
//     if(b>c){
//         console.log(`${b} is greater element`);
//     }
//     else{
//         console.log(`${c} is greater element`);
//     }
// }

// // last digit same
// let num1 = 32;
// let num2 = 47852;
// if(num1[num1.length-1] === num2[num2.length-1]){
//     console.log(`same digit is ${num[num.length-1]}.`)
// }

// let arr = [7, 9, 0 ,-2];
// let n = 3;
// for(let i = 0; i < arr.length; i++){
//     console.log(`${arr[i]}`);
// }
// // for(let i = arr.length-1; i >0; i++){
// //     console.log(`${arr[i]}`);
// // }
// let str2 = 'sandhya';
// if(str2.length >=0 )
// {
//     console.log(`string isn't empty`);
// }else{
//     console.log(`stirng is empty/blank`);
// }

// let srt = "sandhya";
// if(srt == srt.toLowerCase){
//     console.log("String is in lowercase");
// }else{
//     console.log("Not in lowercase");
// }
//  let str3 ='sand hya   ';
//   console.log(`${str3.trim()}`);
// let arr4 = [2,3,4,5,6,7];
// let s = 5;
// for(let i = 0; i <6; i++){
//     if( arr4[i] === s){
//         console.log("found");
//     }
    
// }
// Math.floor(Math.random() * 5) + 20;

// const maxN = prompt("Enter max num to start the game");

// const random = Math.floor(Math.random() * maxN);
// let guess = prompt("Guess the random number");
// while(true){
//     if(guess == "quite"){
//         console.log("You quite");
//         break;
//     }
//     if(guess == random){
//         // alert("You guessed wrong Number please try again");
//         console.log("You are right! congrats! random number was ", random);
//         break;
//     }else if( guess < random){
//         guess = prompt("hint: Your guess was too small, Guess the random number again.");

//     }else{
//         guess = prompt(" hint: Your guess was too large, Guess the random number again.");
//     }
//     // else {
//     //     guessN = prompt("Guess the random number again.");
//     // }
    
// }

// function getSum(n){
//     let sum = 0;
//  for(let i = 1; i<=n; i++){
//     sum += i;
//  }
//  return  sum;
// }

// function concat(ar6){
//     let s = "";
//     for(let i=0; i <ar6.length; i++){  
        
//         s += ar6[i];
//     }
//     return s;
// }
// ar6=["sandhya", "kushwaha", "miss"]; 
//  console.log(concat(ar6));


// function diceRoll(){
//     let rand = Math.floor((Math.random() * 6)+1);
//     console.log(rand);
// }


// /// practice page

// // const funct=(n) => {// 
// //   return n*n;
// // }
//  const funct= (n) => (n*n);
// console.log(funct(5));

// // practice 5

// function dice(){
//     let rand =  Math.floor((Math.random()*6)+1);
//     console.log(rand);
// }
// const car = {
//     name:"vanue",
//     model:15,
//     color:"white",
// };
// car.new="range";
// console.log(car);

// const person ={
//     name:"Sandhya",
//     city:"rewa",
//     age:20,
// }
// person.city = "NewYork";
// person.country= "UnitedStates";
// let array= [4,5,6, 6,2,34,22,65, 33,23];

// function largerThanN (arr, n){
//     for(let i = 0; i  = arr.length; i++){
//         if(arr[i] > n){
//             console.log(arr[i] );
//         }
//     }
// } 
// largerThanN(array, 10);


// // unique character
// let String = "abcdabcefgggh";
// function uniqueChar (st) {
//     let ans;
//     for(let i = 0; i <st.length; i++){
//         let char = st[i];
//         ans.forEach(ele => {
//             if(ele != char){
//                 ans += char;
//             }
//         }); 
//     }
//     return ans;
// }

//array is multiple of 10 or not
// let multi= [10,24,30,40,50];
// function multipleOfTen(mul) {
//     let ans =mul.every((resizeBy,ele) => (ele %10 == 0)); 
//     if(ans){
//         console.log("Array is multiple of 10.")
//     }else{
//         console.log("Array is not multiple of 10.")
//     }
// }
// multipleOfTen(multi);


// // min in array
// function getMin(multi){
//     let min = multi.reduce((min, ele) => {
//         if( min > ele){
//             return ele;
//         }else{
//             return min;
//         }
//     });
//     return min;
// };

 
// console.log(getMin(multi));
// let nums = [2, 3,4,5, 6, 6, 53, 445, 34,35, 53, 343];

// const arrayAverage = (nums) => {
//     let count = 0, 
//     sum = 0;
//     for(let i = 0; i <nums.length; i++){
//         sum += nums[i];
//         count++;
//     }
//     return sum/count;
// };
// console.log(arrayAverage(nums));

// const isEven = (n) => {
//     if(n%2 == 0){
//         return true;
//     }else{
//         return false;
//     }
// }
// const object = {
//     message: 'Hello, World!',
//     logMessage() {
//     console.log(this.message);
//     }
// };
// setTimeout(object.logMessage, 1000);


// let arr = [1, 2, 3, 4, 5, 6];
// const square = (arr) => {
//     let copyArray =[];
//     let sum = 0;
//     for(let i = 0; i < arr.length; i++){
//         copyArray.push(arr[i] * arr[i]);
//         sum += arr[i];
//     }
//     console.log(`The sum of the array elements is  ${sum}`);
//     return copyArray;
// }
// square(arr);

// let newArray = arr.map(function (el){
//     return el+5;
// });

// let aray = ['a', 'ab','Durga', 'Sandhya', 'yoddha'];
// // let newArr = [aray.map(function (el){
// //     if(el == el.toUpperCase()){
// //         newArr.push(el);
// //     }
// // })
// // ];
// //  console.log(newArr);
// let copyUpper =[];
// for(let i = 0; i < aray.length; i++){
//     for(let j = 0; j < aray[i].length; j++){
//             if(aray[i][j] == aray[i][j].toUpperCase()){
//                 copyUpper.push(aray[i][j]);
//             }
//     }

// }
// console.log(copyUpper);
let arr = [43,53,56,32,11,74,631,11];
function doubleAndReturnArgs  (array,...doubleVar) {
    let newN = [...array, ...(doubleVar)];
    return newN;
}

let newN = doubleAndReturnArgs(arr,  5,63311,23)
console.log(newN);

let first ={
    name:"sahil",
    age: 30,
    city:"kolkatta",
}
let second={
    name:"saina",
    age: 20,
    city:"rewa",
}
function mergeObject(...args){
       let newObj = {...args};
       return newObj;
}
console.log(mergeObject(first, second));
