import { Observable, timer, range } from "rxjs";
import { EventEmitter } from "events";
import "rxjs/add/observable/range";
import "rxjs/add/observable/of";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/take";
import "rxjs/add/operator/retry";
import "rxjs/add/operator/retryWhen";
import "rxjs/add/operator/delay";
import "rxjs/add/operator/finally";

const throwOnUnluckyNumber = (value: number) => {
  if (value === 4) {
    throw new Error("unlucky number 4");
  }
  return value;
};

const source$ = Observable.range(1, 5);
const error$ = source$.map(throwOnUnluckyNumber);

//这里 (err, caught$) => Observable.of(8) 返回的是一个Observale对象

export const catch$ = error$.catch((err, caught$) => Observable.of(8));
//1 2 3 8

//不停地repeart 吐出数据，死循环
export const catch$1 = error$.catch((err, caught$) => caught$);

/**
 * retry:在实际开发中，要在retry的结果是有可能返回正确结果的时候采用retry比如ajax访问
 */
const retry$ = error$.retry(2); //参数为retry的次数
export const catch$2 = retry$.catch((err, caught$) => Observable.of(999));
// code.ts:215 1
// code.ts:215 2
// code.ts:215 3
// code.ts:215 1
// code.ts:215 2
// code.ts:215 3
// code.ts:215 1
// code.ts:215 2
// code.ts:215 3
// code.ts:215 999

//retry When通过控制产生Observale对象的时机来
//这里的err$指的是 错误 组成的 Observale对象
export const retryWhen$ = error$.retryWhen((err$) => Observable.interval(1000));

//延时重试
export const retryWhenDelay$ = error$.retryWhen((err$) => err$.delay(1000));

//利用retryWhen实现retry

// Observable.prototype.retryCount = function (maxCount: number) {
//   return this.retryWhen((err$: any) => {
//     return err$.scan((errorCount: number, err: any) => {
//       if (errorCount > maxCount) {
//         throw err;
//       }
//       return errorCount + 1;
//     }, 0);
//   });
// };

//延时并有上线的重试
// Observable.prototype.retryWithDelay = function (
//   maxCount: number,
//   delayMilliseconds: number
// ) {
//   return this.retryWhen((err$: any) => {
//     return err$
//       .scan((errorCount: number, err: any) => {
//         if (errorCount > maxCount) {
//           throw err;
//         }
//         return errorCount + 1;
//       }, 0)
//       .delay(delayMilliseconds);
//   });
// };

//递增延时重试
// Observable.prototype.retryWithDelay = function (
//   maxCount: number,
//   initialDelay: number
// ) {
//   //error
//   return this.retryWhen((err$: any) => {
//     return err$
//       .scan((errorCount: number, err: any) => {
//         if (errorCount >= maxCount) {
//           //Observale会把这个错误继续抛给下游
//           throw err;
//         }
//         return errorCount + 1;
//       }, 0)
//       .delayWhen((errorCount: number) => {
//         const delayTime = Math.pow(2, errorCount - 1) * initialDelay;
//         return Observable.timer(delayTime);
//       });
//   });
// };

/**
 * finally 是没有传入参数的，一个数据流中finally只会发挥 一次作用
 * 传入的函数在对象终结 或者 抛出错误的时候会调用4
 */
export const final$ = error$
  .retry(3)
  .catch((err) => Observable.of(8))
  .finally(() => {
    console.log("finally");
  });

/**
 *
 */

const source$1 = Observable.interval(600);
const error$1 = source$1.map(throwOnUnluckyNumber);
export const retry$1 = error$1.retryWhen((err$) => Observable.interval(1000));
// code.ts:215 0
// code.ts:215 1
// code.ts:215 2
// code.ts:215 3
// code.ts:215 0  一直输出0
/**
 * 2.4s后输出4 然而4的时候会抛出错误，然后retryWhen会每隔1s重新订阅上游数据
 * 上游数据0.6s 吐出0 1.2s吐出1 但是1s的时候被退订了
 */

// 对于Hot数据流而言 retry/retryWhen 并不是简单的“重试”动作
const emitter = new EventEmitter();

// 600ms 触发事件
Observable.interval(600).subscribe((value) => {
  emitter.emit("tick", value);
});

const hotSource$ = Observable.create((observer: any) => {
  console.log("on subscribe");

  const listener = (value: any) => observer.next(value);
  emitter.on("tick", listener);

  return () => {
    console.log("on unsubscribe");
    emitter.removeListener("tick", listener);
  };
});

const error$2 = hotSource$.map(throwOnUnluckyNumber);
export const retry$2 = error$2.retry(2);
// 这里是重新订阅了上游的数据 跳过了 4
// code.ts:215 0
// code.ts:215 1
// code.ts:215 2
// code.ts:215 3
// nine.ts:149 on unsubscribe
// nine.ts:143 on subscribe
// code.ts:215 5
// code.ts:215 6
// code.ts:215 7
// code.ts:215 8
// code.ts:215 9
// code.ts:215 10
// code.ts:215 11
// code.ts:215 12
