import { Observable, Subscriber } from "rxjs";
import * as four from "./four";
import * as five from "./five";
import * as six from "./six";
import * as seven from "./seven";
import * as eight from "./eight";
const observable = new Observable((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});

/**
 * 内部有_isScalar:flase
 * _subscribe:为传递的函数
 */
console.log(observable);

console.log("just before subscribe");
const sub = observable.subscribe({
  next(x) {
    console.log("got value " + x);
  },
  error(err) {
    console.error("something wrong occurred: " + err);
  },
  complete() {
    console.log("done");
  },
});
console.log("just after subscribe");
console.log("This is sub: ", sub);

/**
 * 和promise很像,return的new Promise的时候必须要调用new Promise实例的resolve和reject方法
 * 在这里则是必须要调用observer的next, error, complete方法
 * @param fn
 */
function map(fn: Function) {
  return new Observable((observer) => {
    //这里的this是调用map方法的observer对象
    //就像水龙头一样，开关在上游，就连停止订阅也是调用上游的Subscribe实例的unsubscribe方法
    const sub = this.subscribe({
      next: (value: any) => observer.next(fn(value)),
      error: (err: any) => observer.error(err),
      complete: () => observer.complete(),
    });
    return {
      unsubscribe: () => sub.unsubscribe(),
    };
  });
}

console.log("深入简出RxJS第四章：创建数据流--------------------------------");
/*four.source$.subscribe({ next: value => { console.log(value) } })

four.generate$.subscribe({ next: value => { console.log(value, 'generate$') } })
four.str$.subscribe({ next: value => { console.log(value, 'str$') } })
four.promise$.subscribe(
  console.log,
  error => console.log('catch', error),
  () => console.log('complete')
)

four.repeated$.subscribe({ next: value => { console.log(value, 'repeated$') } })
*/
console.log(
  "深入简出RxJS第五章：合并数据流--------------------------------"
); /*
six.isEmpty$.subscribe(
  (value:any)=>console.log(value,'isEmpty$'),
  null,
  (value:any) => console.log(value)
)

seven.first$.subscribe(
  (value:any)=>console.log(value,'first$'),
  null,
  () => console.log('compelete')
)

seven.skipUntil.subscribe(
  (value:any)=>console.log(value,'skipWhile$'),
  null,
  () => console.log('compelete')
)
*/
/*five.merged$.subscribe(
  console.log,
  null,
  () => console.log('complete')
)*/

/**
 * (2) [1, "a"]
 * (2) [2, "b"]
 * (2) [3, "c"]
 */
/*
five.zipped$.subscribe(
  console.log,
  null,
  () => console.log('complete')
)
*/
/**
 * (2) [0, 1]
 * (2) [1, 2]
 * (2) [2, 3]
 */
/*
five.zipped_$.subscribe(
  console.log,
  null,
  () => console.log('complete')
)
*/
/**
 * (2) [1, 1, 0]
 * (2) [2, 2, 1]
 * (2) [3, 3, 2]
 */
/*
five.ziptest$.subscribe(
  console.log,
  null,
  () => console.log('complete')
)
*/
/**
 * 间隔500ms
 * (2) [5, 5]
 * (2) [6, 5]
 * (2) [6, 6]
 * (2) [7, 6]
 * (2) [7, 7]
 * (2) [8, 7]
 * (2) [8, 8]
 * (2) [9, 8]
 */
/*
five.combinelatest$.subscribe(
  console.log,
  null,
  () => console.log('complete')
)

five.withLatestFrom$.subscribe(
  value=>console.log(value,'with'),
  null,
  () => console.log('complete')
)

five.zipnever$.subscribe(
  value=>console.log(value,'zipnever$'),
  null,
  () => console.log('complete')
)
*/
/**
 * 因为上游的数据源没有终结，zipAll会一直等待
 */
/*
five.zipAll$.subscribe(
  value=>console.log(value,'zipAll$'),
  null,
  () => console.log('complete')
)

*/

/*seven.sampleTime$.subscribe(
  (value: any) => console.log(value, "sampleTime$"),
  null,
  () => console.log("compelete")
);

//seven.result.subscribe(x => console.log(x));

seven.distinctUntilChanged$.subscribe((x) =>
  console.log(x, "distinctUntilChanged$")
);

seven.single$.subscribe((x) => console.log(x, "single$"));
*/

// eight.result$14.subscribe(
//   (x) => console.log(x),
//   null,
//   () => console.log("complete")
// );

interface position {
  x: number;
  y: number;
}
eight.drag$.subscribe((event: position) => {
  eight.box.style.left = event.x + "px";
  eight.box.style.top = event.y + "px";
});
