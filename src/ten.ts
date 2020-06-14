import { Observable, timer, range, Subject } from "rxjs";
import { EventEmitter } from "events";

import "rxjs/add/observable/range";
import "rxjs/add/observable/of";
import "rxjs/add/operator/take";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/map";
import "rxjs/add/operator/multicast";
import "rxjs/add/operator/publishLast";
import "rxjs/add/operator/publishReplay";
import "rxjs/add/operator/publishBehavior";

// 数据流的多播
// Observable是生产者 Observer是消费者 前者在播放内容 后者在接受内容
// 播放的内容可以有三种方式：
// unicast单播    私聊    之前的操作符们都是单播
// broadcast广播  大喇叭  EventEmitter 广播存在的问题是发布消息的人不知道听众是什么样的人，筛选消息的责任就到了接收方的身上，而且广播中容易造成频道冲突
// multicast多播  微信群  Rxjs通过一个Observable可以被多次subscribe的方式来实现多播

//  例子1
//  为什么不是 0 1 1 2 2

//  observer 1: 0
//  observer 1: 1
//  observer 2: 0
//  observer 1: 2
//  observer 2: 1
//  observer 2: 2
export const tick$ = Observable.interval(1000).take(3);
tick$.subscribe((value) => console.log(`observer 1: ${value}`));
setTimeout(() => {
  tick$.subscribe((value) => console.log(`observer 2: ${value}`));
}, 1500);

// 冷数据与热数据的差异
// 冷数据在subscribe的时候会产生一个全新的数据，即 observer都有各自的Observable对象，只不过Observable对象长得一样
// 热数据 所有的Observer共享一个Observable  操作符：fromPromise fromEvent fromEventPattern

// 冷数据是单播 热数据是多播

// FP中讲究的是 Immutable，因此要把冷数据变成热数据，并不是改变冷数据本身而是 产生一个新的数据

// Subject对象
// 对象职责： 1. 有subscribe方法可以让下游订阅自身数据； 2.  可以接受上游推送过来的数据 包括冷数据
// 与Observable不同的是 Subject知道哪个observer订阅了自己

const subject = new Subject();
subject
  .map((x: number) => x * 2)
  .subscribe(
    (value) => console.log(`on data: ${value}`),
    (error) => console.log(`on error: ${error.message}`),
    () => console.log("on complete")
  );

//   on data: 2
//   on data: 4
//   on data: 6
//   on complete

subject.next(1);
subject.next(2);
subject.next(3);
subject.complete();

const subject1 = new Subject();
const subscription1 = subject1.subscribe(
  (value) => console.log(`on observer 1 data: ${value}`),
  (error) => console.log(`on observer 1 error: ${error.message}`),
  () => console.log("on observer 1")
);

// 此时只有一个订阅者
subject1.next(1);

subject1.subscribe(
  (value) => console.log(`on observer 2 data: ${value}`),
  (error) => console.log(`on observer 2 error: ${error.message}`),
  () => console.log("on observer 2 compelete")
);

// on observer 1 data: 1
// on observer 1 data: 2
// on observer 2 data: 2
// on observer 2 compelete

// 此时加入了第二个订阅者，但是发射的数据已经成了 2
subject1.next(2);
subscription1.unsubscribe();
//这里只有第二个订阅者完成了compelete函数，因为上方的第一个订阅者已经退订了
subject1.complete();

// Subject实现多播

// ten.ts:98 哈哈哈: 0

// ten.ts:98 哈哈哈: 1
// ten.ts:100 哈哈哈delay: 1

// ten.ts:98 哈哈哈: 2
// ten.ts:100 哈哈哈delay: 2

// ten.ts:98 哈哈哈: 3
// ten.ts:100 哈哈哈delay: 3

// ten.ts:98 哈哈哈: 4
// ten.ts:100 哈哈哈delay: 4
const tick1 = Observable.interval(1000).take(5);
const subject2 = new Subject();
tick1.subscribe(subject2);
subject2.subscribe((value) => console.log(`哈哈哈: ${value}`));
setTimeout(() => {
  subject2.subscribe((value) => console.log(`哈哈哈delay: ${value}`));
}, 1500);

// 以上方法虽然可以使用Subject将冷数据变成热数据，但是缺点是 冷数据要订阅Subscribe，Subscribe又要订阅下游函数 无法形成链式调用
// 因此 可以封装一个操作符

// 封装v1版
// Observable.prototype.makeHot = function () {
//   const cold$ = this;
//   const subject = new Subject();
//   cold$.subscribe(subject);
//   return subject;
// };
// // v1版的缺点： 返回的subject对象 自身有next error complete函数等，这样一来下游函数接受到的数据可能并不纯净，因此要返回一个纯净的Observale对象
// Observable.prototype.makeHot = function () {
//   const cold$ = this;
//   const subject = new Subject();
//   cold$.subscribe(subject);
//   return Observable.create((observer: any) => subject.subscribe(observer));
// };

//  Subjcet函数不能重复使用
//  Subject对象也是一个Observable对象，因此它有自己的状态，不像cold Observable对象一样每次被subscribe都是一个新的开始
//  因此 Subject对象是不能重复使用的，即 一个Subject对象一旦被调用了error/compelete，那么声明周期就结束了

const subject3 = new Subject();
subject3.subscribe(
  (value) => console.log(`on observer 3 data: ${value}`),
  (error) => console.log(`on observer 3 error: ${error.message}`),
  () => console.log("on observer 3 compelete")
);

subject3.next(1);
subject3.next(2);
subject3.complete();

// 这里的 二号 observer对象可以获得 Subject对象的 complete信号
subject3.subscribe(
  (value) => console.log(`on observer 4 data: ${value}`),
  (error) => console.log(`on observer 4 error: ${error.message}`),
  () => console.log("on observer 4 compelete")
);

// on observer 3 data: 1
// on observer 3 data: 2
// on observer 3 compelete
// on observer 4 compelete

// 生命周期结束了没有 3 传入
subject3.next(3);
