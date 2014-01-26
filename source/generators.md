title: Generators
description: NodeJS ES6 Generators
authors: ['Po-Ying Chen <poying.me@gmail.com>']
---

## 語法

### GeneratorFunction, Generator

GeneratorFunction 宣告方式跟 Function 幾乎一樣，也有立即、具名、匿名的寫法。

```javascript
function *{name} ({params}) {{body}}
```

```javascript
var gen = function *() {}; // 匿名
function *gen1() {}; // 具名
(function *())(); // 匿名立即
```

在 body 內可以用 yield, yield* 讓 Sopce 暫停，yield 右邊可以放要丟出去的資料，左邊接收外部傳入的資料。

__yield 範例__

```javascript
function *example() {
  var msg = yield 'hello';
  console.log(msg);
}

var gen = example();
var ret = gen.next();

console.log(ret);

ret = gen.next(ret.value + ' world');

console.log(ret);
```

__輸出__

```
{ value: 'hello', done: false }
hello world
{ value: undefined, done: true }
```

從範例中可以發現我們並不是直接使用 GeneratorFunction，而是用 GeneratorFunction 產生 Generator 後再作其他操作，Generator 有兩個 properties

* next - 讓 Generator 繼續執行，可以在這裡接收/傳入資料，next 的回傳值是一個 Object，包含兩個 properties，done, value，done 紀錄 Generator 是不是已經執行結束，value 則是在 Generator 內部 yield 右邊的資料。
* throw - 用法跟一般的 throw 是一樣的，我們可能習慣會寫 throw new Error() 直接拋出錯誤，但有時候我們希望在 Generator 裡拋出錯誤，這時候就可以用 Generator.throw(new Error())。

__yield* 範例__

```javascript
function *foo() {
  yield 'foo';
  yield 'foo';
}

function *bar() {
  yield* foo();
  yield 'bar';
}

var gen = bar();

console.log(gen.next());
console.log(gen.next());
console.log(gen.next());
```

__輸出__
```
{ value: 'foo', done: false }
{ value: 'foo', done: false }
{ value: 'bar', done: false }
```

yield* 跟 yield 只差在他們後面所帶的資料，yield* 後面可以帶一個 Generator，他會自動幫我們把兩個 Generator 串起來，在 EcmaScript 的 [Wiki](http://wiki.ecmascript.org/doku.php?id=harmony:generators) 上有段程式碼在說明如何用 yield 做到跟 yield* 一樣的事情。

```javascript
let (g = <<expr>>) {
  let received = void 0, send = true, result = void 0;
  try {
    while (true) {
      let next = send ? g.send(received) : g.throw(received);
      try {
        received = yield next;
        send = true;
      } catch (e) {
        received = e;
        send = false;
      }
    }
  } catch (e) {
    if (!isStopIteration(e))
      throw e;
    result = e.value;
  } finally {
    try { g.close(); } catch (ignored) { }
  }
  result
}
```
