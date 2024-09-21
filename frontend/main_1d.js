const N = 10;

// 1D array
const arr = new Array(N * N).fill(0);
console.log(arr.length);


setTimeout(() => console.log(123), 1000)
console.log("First")
setTimeout(() => console.log(123), 2000)
console.log("Second")
setTimeout(() => console.log(123), 3000)
console.log("Third")

console.log("" + 1 + 2 + "_");