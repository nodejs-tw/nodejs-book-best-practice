# Generators

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

## Generators 解決 Flow Control

Generators 他有一個可暫停 Scope 的特性，所以用他來解決 async 的問題會非常適合，不需要再給一個 callback 讓程式碼變得很多層，不易閱讀，像是這樣

```javascript
var content = readFile('./hello.txt', 'utf8');
```

而不是傳統的

```javascript
readFile('./hello.txt', 'utf8', function (err, content) {
  // ...
});
```

### 常見 Library，與他們的實現方法

既然這是一個棒的異步問題解決方案當然就有很多的 Library 了，一些有名的 Flow Control Library 都有包含這種新寫法。

[Q](https://github.com/kriskowal/q)

Q 的作法是利用他自己本身的特色 Promises 搭配 Generators 使用，我們想像一個巢狀 callback 然後每個 callback 都回傳 promise，最裡面那層直接回傳資料，錯誤的時候就直接丟給 Generator.throw()，這就是 Q 的整個實作概念。

```javascript
var errorCallback = generator.throw.bind(generator);
var promise = (function () {
  //...
  return Q(ret.value).then(function () {
    //...
    return Q(ret.value).then(function () {
      //...
      return value;
    }, errorCallback);
  }, errorCallback);
})();
```

這個作法充分利用了 Promises 的特性所以整段程式碼非常簡短，也讓包裝傳統 NodeJS 的 Callback 寫法也很方便。

Q 的使用方法

* Q.async(GeneratorFunction)
* Q.spawn(GeneratorFunction) — 只是把 async 包裝一下讓 async 立刻執行然後結束 Promise 鏈

```javascript
Q.async(function *() {
  return yield Q.nfcall(fs.readFile, './hello.txt', 'utf-8');
}).then(function (content) {
  console.log(content);
});
```

[co](https://github.com/visionmedia/co)

co 是一個專門用 Genertoars 處理 Flow Control 問題的 NodeJS module，用法上比較彈性，我們可以 yield Object, Array, Promise, [thunk](http://en.wikipedia.org/wiki/Thunk_%28functional_programming%29) 或 Generator, GeneratorFunction，還記得前面提到的 yield, yield* 嗎？這邊我們不需要使用 yiled* 就可以使用 Generator，co 內部判斷如果 yiled 是一個 Generator 的話他就會自己再呼叫一次 co 去執行這個 Generator。

整個 co 作的事情其實就是 EcmaScript Wiki 上面那段 yield 解釋 yield* 程式碼所要作的事情，只是包裝的更完整，更彈性，所以就不再作其他說明了。

co 的使用方法

```javascript
var readFile = function (path, encoding) {
  return function (fn) {
    fs.readFile(path, encoding, cb);
  };
};

co(function * () {
  // 傳統 callback 的方法改成給 co 使用
  var file1Content = yield readFile('./file1', 'utf8');
  // promise
  var file2Content = yield Q.nfcall(fs.readFile, './file2', 'utf8');
  // array
  var contentArray = yield [readFile('./file1', 'utf8'), readFile('./file2', 'utf8')];
})();
```

[suspend](https://github.com/jmar777/suspend)

在使用 Generators, Promises 之前我們一定都用過傳統的 Callback 方式，suspend 就是使用這種思考模式去使用 Generators，我們不再丟 callback 進去某個 async 方法，而改丟 suspend 的方法(resume) 進去，整個作法很直覺，但是這個作法有個 ”宿命”，他無法並行多個 async 的方法，一次只能作一件事情，所以 suspend 就又多了兩個方法 fork, join，用 fork 當作 async 的 callback，最後再用 join 來取得資料，就這個份來說我就不太喜歡他了。那 join, fork 是怎麼實作的？在 fork 的時候他可以知道有多少個異步動作開始執行，當動作完成時也可以透過 callback 知道有多少個動作已經完成，如果在 join 之前所有事情都做完了他就不用作任何其他處理，放心給 join 去取資料，但如果來不及，他就會忽略第一次的 join，等待所有事情處理完後再 join，所以 join 必須被 yield，這也是傳統上常見的異步處理手法。

```javascript
suspend(function*() {
  var fileNames = yield fs.readdir('test', suspend.resume());

  fileNames.forEach(function(fileName) {
    fs.readFile('test/' + fileName, 'utf8', suspend.fork());
  });

  var files = yield suspend.join();

  var numTests = files.reduce(function(cur, prev) {
    return cur + prev.match(/it\(/g).length;
  }, 0);

  console.log('There are %s tests', numTests);
})();
```
