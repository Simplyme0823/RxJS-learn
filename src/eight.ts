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
import "rxjs/add/operator/concatMapTo";
import "rxjs/add/operator/mergeMapTo";
import "rxjs/add/operator/switchMapTo";
import "rxjs/add/operator/groupBy";
import "rxjs/add/operator/partition";
import "rxjs/add/operator/partition";
import "rxjs/add/operator/mergeAll";
import "rxjs/add/operator/scan";
import "rxjs/add/operator/mergeScan";

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

//定位细节不够，但是功能完全实现
export const drag$ = mouseDown$.concatMap((startEvent: MouseEvent) => {
  console.log(startEvent.target);
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

// mergeMap 适合axjs请求，缺点是每一个上游的数据都会触发ajax并把结果传递给下游

//场景：连续发送请求 而第二次的请求晚于第一次的请求 会造成数据混乱
const source$8 = Observable.interval(200).take(2);

const project$ = (value: number) => {
  console.log(value, "value"); //0, 1 上流传入的数据
  return Observable.interval(100).take(5); //周期500ms
};

export const result$15 = source$8.mergeMap(project$);

/*const sendButton = document.querySelector("#send");
Observable.fromEvent(sendButton, "click")
  .mergeMap(() => {
    return Observable.ajax(apiUrl);
  })
  .subscribe((result) => {
    //处理结果
  });
*/

//switchMap  每次上游数据产生就会触发switchMap产生一个内部Observale对象
// 重要的是后一个产生的Observale对象的优先级更高

export const result$16 = source$8.switchMap(project$);
// (0) / (0) (1) (2) (3) (4) 第一个内部对象被打断
// 对于axjs是 第一个axjs没有返回 第二个发起了就会打断第一个

//exhaustMap 与swithMap相反，第一个产生的内部Observale对象优先级更高
//exhaustMap 在就的数据源订阅后产生的【内部对象终结之前】不会去订阅新的数据源

// MapTo系列操作符
// concatMapTo
const source$9 = Observable.interval(200);
export const result$17 = source$9.concatMapTo(Observable.interval(100).take(5));
// 0,1,2,3,4 repeat

export const result$18 = source$9.switchMapTo(Observable.interval(100).take(5));
// 0 repeat 每次内部产生的对象都会打断上一个对象 上游周期为200ms 返回一个100ms周期的Observale对象 在200ms周期的时候 吐出0，1而1的时候被打断了 只剩下0
//如果 source$9改成1000ms 那么就会是0,1,2,3,,4 repeat

export const result$19 = source$9.mergeMapTo(Observable.interval(100).take(5));
//“打平”数据 ”分组“   弹珠图演示即可
// code.ts:214 0  0

// code.ts:214 1  0

// code.ts:214 0  1
// code.ts:214 2  0

// code.ts:214 1  1
// code.ts:214 3  0

// code.ts:214 2  1
// code.ts:214 4  0
// code.ts:214 0  2

// code.ts:214 3  1
// code.ts:214 1  2

// code.ts:214 4  1
// code.ts:214 0  3
// code.ts:214 2  2

/** 数据分组
 *  groupby
 *  partition
 */

// groupBy 输出的是一个高阶Observale对象
const intervalStream$ = Observable.interval(1000);
export const groupByStream$ = intervalStream$.groupBy((x) => x % 2).mergeAll();

//根据传入的函数处理上游数据 根据处理的结果决定内部有几个Observale对象

//GroupedObservable key = 1 数据的集合
//GroupedObservable key = 0 数据的集合

//与window的区别 window的数据集合是连续地收集的
// groupBy的数据集合 可以是交叉收集 因为是根据key值来划分group

/** 使用mergeAll的时候报错了 要用pipe 管道操作符
 * groupByStream$.subscribe((x) => {
  if (x.key === 1) {
    // 根据key值选择group
    x.subscribe(
      (x) => console.log(x),
      null,
      () => console.log("complete")
    );
  }
});
 */

/*
//应用 dom事件的委托应用
const click$ = Observable.fromEvent(document, "click");

const groupByClass$ = click$.groupBy((event: MouseEvent) => {
  const target = event.target as Element;
  return target.className;
});

const fooEventHandler = () => {};
const barEventHandler = () => {};

groupByClass$
  .filter((value) => value.key === "foo")
  .mergeAll()
  .subscribe(fooEventHandler);

groupByClass$
  .filter((value) => value.key === "bar")
  //高阶对象编程低阶对象
  .mergeAll()
  .subscribe(barEventHandler);

// 用groupBy是杀鸡用牛刀，简单的分类其实并不用产生一个高阶的对象
// partition返回一个数组， 数组第一个元素是满足条件的Observale对象，第二个是不满足的
const source$10 = Observable.timer(0, 100);

//es6的解构语法
const [even$, odd$] = source$10.partition((x) => x % 2 === 0);
even$.subscribe();
odd$.subscribe();
*/

/**
 * 通常情况下 上游数据之间是没有联系的
 * 但是开发中肯定有上游之间相互依赖的情况
 * 因此rxjs提供了操作符 sacn和mergeScan
 */

//累加 : scan是rxjs中少数可以维持状态的操作符，一般的操作符都是数据处理后直接传给下游
// 而scan是会将数据保留在累计值中
const source$11 = Observable.interval(100);
export const result$20 = source$11.scan((accumulation, value) => {
  return accumulation + value;
});

// code.ts:214 0
// code.ts:214 1
// code.ts:214 3
// code.ts:214 6
// code.ts:214 10

/**
 * mergeScan返回的是一个Observale对象而非数据
 */

export const result$21 = source$11.mergeScan((accumulation, value) => {
  return Observable.of(accumulation + value);
}, 0); //merge Scan 必须要有seed参数

//当上游有数据传入的时候 会调用mergeScan的函数，并且订阅函数返回的Observale对象，
// 而Observale对象会将自身的数据全部传送给下游，传送给下游的数据中的最后一个数据
// 会作为accumulation

// 注意 在数据传输的时候 mergeScan返回的这个对象还没有终结 下一个上游函数就来了
// 那么merge操作会将 所有的Observale对象的【数据】传递给下游 造成了数据【交叉】的情况
// 导致分不清哪个是最后一个函数， 那么 accumulation的参数很难确定了
// 因此最好不要让mergeScan返回包含多个数据的Observale对象，不然很容易失控

/**
 * mergeScan应用：ajax请求的依赖关系：第一个ajax的请求结果决定第二个ajax请求的参数
 */
const result$22 = throttleScrolllToEnd$.mergeScan((allTweets, value) => {
  return getTweets(
    allTweets[allTweets.length - 1].map((newTeets) =>
      allTweets.concat(newTeets)
    )
  );
}, []);
