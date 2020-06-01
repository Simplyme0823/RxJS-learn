//对数据的转化分为两类
//1. 对每个数据进行转化 类似js的map
//2. 重新组合数据

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/map";
import "rxjs/add/operator/pluck";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/take";
import "rxjs/add/operator/windowTime";
import "rxjs/add/operator/bufferTime";
import "rxjs/add/operator/windowCount";
import "rxjs/add/operator/bufferCount";
import "rxjs/add/operator/windowWhen";
import "rxjs/add/operator/bufferWhen";
import "rxjs/add/operator/windowToggle";
import "rxjs/add/operator/bufferToggle";
import "rxjs/add/operator/window";
import "rxjs/add/operator/buffer";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/concatMap";
import "rxjs/add/operator/exhaustMap";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/takeUntil";

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

// const click$ = Rx.Observable.fromEvent(document, "click");
// const clickedTagName$ = click$.pluck("target", "tagName"); //只能拔出event.target.tagNamem, 如果想要要event.type和event.target.tagName就要用map

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
export const source$2 = Observable.timer(0, 100);
export const result$2 = source$2.windowTime(400); //存储400ms内接受的所有数据 然后到了400ms周期结束将周期内的数据传入下游,每个周期都会产生一个新的Observale【对象】
//返回的是一个Observable对象，CountedSubject;
// closed: false
// hasError: false
// isStopped: true
// numberOfNextedValues: 4
// observers: []
// thrownError: null
// _isScalar: false
// _numberOfNextedValues: 4

export const result$3 = source$2.bufferTime(400); //普通的Observale对象，对象内持续缓存所有的上游数据，没有新的Observale对象
//[0, 1, 2, 3]
//[4, 5, 6, 7]

//他们还支持第二个参数，
export const result$4 = source$2.windowTime(400, 200); //每200ms就开始收集周期为400ms的上游数据

//如果第二个参数小于第一个参数就有可能数据重复，如果大于就数据丢失，如果等于就和只有第一个参数一样

//第三个参数，时间段内产生数据个数的上限

//windowCount bufferCount
export const source$3 = Observable.timer(0, 100);

export const result$5 = source$3.windowCount(4); //产生4个数就终结一个Observale对象，并传送给下游
// closed: false
// hasError: false
// isStopped: true
// observers: []
// thrownError: null
// _isScalar: false

export const result$6 = source$3.bufferCount(4, 2); //每5个参数就开一个新的区间
// [0, 1, 2, 3]
// [2, 3, 4, 5]

//windowWhen 和 bufferWhen都是返回一个Observable对象
//挺鸡肋的操作
export const source$4 = Observable.timer(0, 100);
const closingSelector = () => {
  return Observable.timer(400); //
};

// closingSlector被调用 每400ms返回一个Observable对象，当有对象产生的时候 缓冲区就终止并返回对象/数据
export const result$7 = source$4.windowWhen(closingSelector);
// closed: false
// hasError: false
// isStopped: true
// observers: []
// thrownError: null
// _isScalar: false

export const result$8 = source$4.bufferWhen(closingSelector);
//  [0, 1, 2, 3]
//  [4, 5, 6, 7]

//windowToggle bufferToggle 用来控制缓冲区的开关
//两个参数： 1. openning$ Observable对象 每次产生一个对象代表缓冲区的开启
//           2. closingSelector 缓冲区结束的通知 而此时这个函数是由参数的，参数是openning$产生的数据

const source$5 = Observable.timer(0, 100);

//每间隔400ms来开启缓冲区
const openning$ = Observable.timer(0, 1000);

const closingSelector$ = (value: number) => {
  //每当Openning$产生数据的时候 数据都会由Openning$产生的奇偶来控制缓冲区持续的时间，偶数200ms,奇数100
  console.log(value);
  return value % 2 === 0 ? Observable.timer(199) : Observable.timer(99);
};

export const result$9 = source$5.windowToggle(openning$, closingSelector$);

//buffer产生的是数组，仅此而已
export const result$10 = source$5.bufferToggle(openning$, closingSelector$);
// value==0, [0, 1]
// value==1, [10, 11]
// value==2, [20, 21, 22]  //边界条件？？？
// value==3, [30, 31]
// value==4, [40, 41, 42]

//window 和 buffer 相对比较简单，就是每隔400ms开始产生一个数，数据产生的时候是前一个缓存区的结束后一个缓存区的开始
const source$6 = Observable.timer(0, 100);
const notifer$ = Observable.timer(400, 400); //永不完结的数据流，如果数据流完结那么Observable对象也会完结
export const result$11 = source$6.window(notifer$);

export const result$12 = source$6.buffer(notifer$);
//[0, 1, 2, 3]
//[4, 5, 6, 7]

//map 操作

const project = (value: number, index: number) => {
  return Observable.interval(100).take(5); //周期500ms
};

const source$7 = Observable.interval(200);

//普通map的操作
export const result$13 = source$7.map(project);
//返回结果 每200ms
// operator: TakeOperator
// total: 5 !important
// __proto__: Object
// source: Observable
// _isScalar: false
// _subscribe: ƒ (subscriber)
// __proto__: Object
// _isScalar: false

//高阶map的操作演示：
//concatMap
//mergeMap
//switchMap
//exhaustMap

//每200ms 就有一组数据产生， 这样会导致数据重叠，concatMap就是按照数据产生事件，将project返回的数据按顺序拼接
export const result$14 = source$7.concatMap(project);

//实际应用：拖拽动作标记：mousedown的时候立flag 然后监听mousemove和mouseup 否则可能造成mouseup后仍然可以拖拽
// mousedown -> mousemove -> mouseup -> mousedown -> mousemove -> mouseup -> ... ->mousedown -> mousemove -> mouseup
// 抽象： 把整体动作看成一个高阶的Observable对象， 每次的mousedown -> mousemove -> mouseup 动作看成一个普通的Observale对象
// 这个普通的Observale对象由 mousedown发起， 由mouseup结束
// 这就和concatMap很像
export const box = document.createElement("div") as HTMLDivElement;
box.id = "box";
box.style.width = "100px";
box.style.position = "relative";
box.style.height = "200px";
box.style.border = "1px solid red";
document.body.appendChild(box);
//export const box = document.querySelector("#box") as HTMLDivElement;
const mouseDown$ = Observable.fromEvent(box, "mousedown");
const mouseUp$ = Observable.fromEvent(box, "mouseup");
const mouseOut$ = Observable.fromEvent(box, "mouseout");
const mouseMove$ = Observable.fromEvent(box, "mousemove");

export const drag$ = mouseDown$.concatMap((startEvent: MouseEvent) => {
  const initialLeft = box.offsetLeft;
  const initialTop = box.offsetTop;
  const stop$ = mouseUp$.merge(mouseOut$);
  return mouseMove$.takeUntil(stop$).map((moveEnvnt: MouseEvent) => {
    return {
      x: moveEnvnt.x - startEvent.x + initialLeft,
      y: moveEnvnt.y - startEvent.y + initialTop,
    };
  });
});
