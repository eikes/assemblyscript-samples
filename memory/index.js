const fs = require("fs");
const loader = require("@assemblyscript/loader");
const wasm = loader.instantiateSync(fs.readFileSync(__dirname + "/build/optimized.wasm"), {});

var { inc, hello, multiply, multiplyByTwo, Int32Array_ID,
  memory, 
  __getString, 
  __getArray,
  __newArray,
  __new,
  __retain,
  __release } = wasm.exports;

// ////////////////////////////////////////////////
// integers

console.log(inc(42));

// ////////////////////////////////////////////////
// strings

var input = "Tomas";
var length = input.length;

// allocate memory (usize, String (id=1))
var pt = __new(length << 1, 1);

// load bytes into memory
var bytes = new Uint16Array(memory.buffer);
for (var i = 0, p = pt >>> 1; i < length; ++i) 
  bytes[p + i] = input.charCodeAt(i);

// retain reference to object
var pti = __retain(pt);

// call wasm, pointer output
var pto = hello(pti);

__release(pti);

var str = __getString(pto);

__release(pto);

console.log(str);

// ////////////////////////////////////////////////
// arrays

console.log('Int32Array_ID', Int32Array_ID);

// input array
var arr = [1, 2, 3]
var arri = __retain(__newArray(Int32Array_ID, arr));

// call, output array
var arro1 = __getArray(multiply(arri, 2));
var arro2 = __getArray(multiplyByTwo(arri));

__release(arri);
__release(arro1);
__release(arro2);

console.log(arr);
console.log(arro1);
console.log(arro2);

// ////////////////////////////////////////////////
// testing

function sayHello(name) {
	var length = name.length;

	// allocate memory (usize, String (id=1))
	var pt = __new(length << 1, 1);

	// load bytes into memory
	var bytes = new Uint16Array(memory.buffer);
	for (var i = 0, p = pt >>> 1; i < length; ++i) 
	  bytes[p + i] = name.charCodeAt(i);

	// retain reference to object
	var pti = __retain(pt);

	// call wasm, pointer output
	var pto = hello(pti);

	__release(pti);

	var str = __getString(pto);

	__release(pto);

	return str;
}

module.exports = { inc, sayHello };
