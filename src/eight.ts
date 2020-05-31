//对数据的转化分为两类
//1. 对每个数据进行转化 类似js的map
//2. 重新组合数据

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/map";
import "rxjs/add/operator/pluck";
import "rxjs/add/operator/timer";
import "rxjs/add/operator/windowTime";

const source$ = Observable.of(3, 1, 4);

const mapFunc = function (value: any, index: any) {
  // this就是context，{ separator: ":" }
  return `${value} ${this.separator} ${index}`;
};

const context = { separator: ":" };
const result$ = source$.map(mapFunc, context);

//为了保证纯函数可以这样写，表达式返回的是一个匿名函数， 利用“显示”context指定this
const mapFunc_ = (function (separator) {
  return function (value: any, index: any) {
    `${value} ${separator} ${index}`;
  };
})(context.separator);

result$.subscribe(console.log, null, () => console.log("compelete"));

//mapTo 无论上游传递什么数据 都返回一样的时候
//source$.map(()=> 'A')  等价于 source$.mapTo('A')

//pluck 拔的意思，可以自动处理字段不存在的情况，直接传递给下游一个undefined
const source$1 = Observable.of(
  { name: "RxJS", version: "v4" },
  { name: "React", version: "v15" },
  { name: "React", version: "v16" },
  { name: "RxJS", version: "v5" }
);

const result$1 = source$.pluck("name");

//RxJS
//React
//React
//RxJS
//complete
result$1.subscribe(console.log, null, () => console.log("compelete"));

const click$ = Rx.Observable.fromEvent(document, "click");
const clickedTagName$ = click$.pluck("target", "tagName"); //只能拔出event.target.tagNamem, 如果想要要event.type和event.target.tagName就要用map

//缓存窗口：无损回压控制 就是把数据塞进一个集合， 集合可以是一个数组也可以是一个Observable对象

//bufferTime
//bufferCount
//bufferWhen
//bufferToggle
//buffer

//windowTime
//windowCount
//windowWhen
//windowToggle
//window

//windowTime 和 bufferTime
