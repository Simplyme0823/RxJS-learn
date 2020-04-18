import { Observable, Subscriber, Subject, concat, merge, observable, combineLatest } from 'rxjs';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/race';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/zipAll';
import 'rxjs/add/observable/never';
//1. concat方法
const source1$ = Observable.of(1, 2, 3);
const source2$ = Observable.of(4, 5, 6);
//concat 也有静态方法 不过要从 rxjs/add/operator下导入
const concated$ = source1$.concat(source2$);
//需要注意的是如果一个Observable对象永远不会完结，那么排在后面的Observale对象永远没有上场机会
/*const source3$ = Observable.interval(1000)
const source4$ = Observable.of(1)
const concated1$ = source3$.concat(source4$)
*/
//2. merge方法 先到先得 也有静态和实例两种操作符
//代码间隔500ms 输出一行 0A 0B 1A 1B永不停止
const source5$ = Observable.timer(0, 1000).map(x => x + 'A')
const source6$ = Observable.timer(500, 1000).map(x => x + 'B')
export const merged$ = Observable.merge(source5$, source6$)

//2.1 同步限流
//merge的第二个参数为 concurrent可以同时合并的Observable对象的个数
//2.2 应用场景 同时获取dom元素上的两个事件 比如click和touchend

//const click$ = Observable.fromEvent(element, 'click')
//const touchend$ = Observable.fromEvent(element, 'touched')
//Observable.merge(click$, touchend$).subscribe(eventHandler)

//3. zip方法 静态/实例方法
const source7$ = Observable.of(1, 2, 3)
const source8$ = Observable.of('a', 'b', 'c')
/**
 * (2) [1, "a"]
 * (2) [2, "b"]
 * (2) [3, "c"]
 */
export const zipped$ = Observable.zip(source7$, source8$)

/**
 * (2) [0, 1]
 * (2) [1, 2]
 * (2) [2, 3]
 */
const source9$ = Observable.interval(1000)
export const zipped_$ = Observable.zip(source9$, source7$)

const source29$ = Observable.interval(2000)
export const zipnever$ = Observable.zip(source9$, source29$)

//问题，需要等待数据流，这样就会出产生数据积压的问题，消耗内存
//zip也可以用来组合多个上游Observable对象， 吐出数据最少的上游Observable决定了zip产生数据的个数

const source10$ = new Observable((observer: any) => {
    setTimeout(() => {
        observer.next(1)
    }, 2000);
    setTimeout(() => {
        observer.next(2)
    }, 4000);
    setTimeout(() => {
        observer.next(3)
    }, 6000);
})

const source11$ = new Observable((observer: any) => {
    setTimeout(() => {
        observer.next(1)
    }, 1000);
    setTimeout(() => {
        observer.next(2)
    }, 2000);
    setTimeout(() => {
        observer.next(3)
    }, 3000);
    setTimeout(() => {
        observer.next(4)
    }, 4000);
})
const source12$ = Observable.interval(1000) //永不终结

/**
 * (2) [1, 1, 0]
 * (2) [2, 2, 1]
 * (2) [3, 3, 2]
 * 丢弃了  source11第四秒钟产生的数据4
 */
export const ziptest$ = Observable.zip(source10$, source11$, source12$)


//4. combineLatest:合并最后一个数据
//zip的特点是上游数据只用一次， combineLatest是可以反复使用上游产生的最新数据
//zip的第二个特点是 上游数据一旦完结，那么所有的组合数据都完结，而combineLatest会记录最先完结对象的最后一个数据
//同样也有静态和实例操作符
const source13$ = Observable.timer(500, 1000)
const source14$ = Observable.timer(1000, 1000)
export const combinelatest$ = source13$.combineLatest(source14$)

/**
 * 每500ms吐出数据
 * 虽然source16$只产生一个数据，但是其最后产生的值会被一直保留
 * (2) [0, 'a']
 * (2) [1, 'a']
 * (2) [2, 'a']
 */
const source15$ = Observable.timer(500, 1000);
const source16$ = Observable.of('a');
const combinelatest1$ = source15$.combineLatest(source16$);

/**
 * 同步数据流的情况
 * 虽然两个数据流都是同步的，
 * 但是函数执行是有顺序的,先订阅source17，再订阅source18
 * (2) ['c', 1]
 * (2) ['c', 2]
 * (2) ['c', 3]
 */
const source17$ = Observable.of('a', 'b', 'c');
const source18$ = Observable.of(1, 2, 3);
const combinelatest2$ = source17$.combineLatest(source18$);

/**
 * 最后一个参数：project
 * 可以处理combinedLatest的上游数据，再传给下游
 */
const source19$ = Observable.timer(500, 1000);
const source20$ = Observable.timer(1000, 1000);
const project = (a: any, b: any) => `${a} and ${b}`;
const result$ = source19$.combineLatest(source20$, project);


//实现过程同下方
const result_$ = source19$.combineLatest(source20$).map(arr => project(...arr))

//多重依赖问题，combineLatest上游数据来源于同一个上游
const original$ = Observable.timer(0, 1000);
const source21$ = original$.map(x => x + 'a');
const source22$ = original$.map(x => x + 'b');
const result__$ = source21$.combineLatest(source22$);
result__$.subscribe(
    console.log,
    null,
    () => console.log('complete')
);



/**
 * 订阅动作其实是以后微小的时间差，在该时间差中 source21$被订阅
 * 而source22$没有被订阅，因此有['1a, '0b']产生['2a, '1b']
 * 这种现象称为glitch，多个上游Observable“同时”吐出一个数据
 * ['0a, '0b']
 * ['1a, '0b']
 * ['1a, '1b']
 * ['2a, '1b']
 * ['2a, '2b']
 */

/**
 * 上述问题的解决方法：withLatestFrom
 * withLatestFrom的功能类似于combineLatest，但是给下游推送数据只能
 * 由【一个】上游Observable对象驱动 并且只有一个实例操作符的形式
 * 调用withLatestFrom的那个Observable对象主导数据产生的节奏
 * 
 */
const source23$ = Observable.timer(0, 2000).map(x => 100 * x)//马上开始间隔2s吐出数据
const source24$ = Observable.timer(500, 1000) //延迟500ms 每隔1s开始吐出数据
const result___$ = source23$.withLatestFrom(source24$, (a: any, b: any) => [a + 'a', b + 'b', 'c'])
/**
 * 101
 * 303
 * 305
 * 407
 */
result___$.subscribe(
    console.log,
    null,
    () => console.log('complete')
)

/**
 * 举例：获取鼠标为的时候 pageX和pageY都依赖于event 因此会产生glitch
 */

/**
 * 利用withLatestFrom来解决上例中的glitch
 * source21$掌控吐出节奏， source22$提供数据
 */

export const withLatestFrom$ = source21$.withLatestFrom(source22$)

//5. race 胜者通吃
//多个Observable对象在一起，看谁最先产生数据，race会【完全】采用胜者对象
const source25$ = Observable.timer(0, 2000).map(x => x + 'a')
const source26$ = Observable.timer(500, 1000).map(x => x + 'b')
const winner$ = source25$.race(source26$)

//6. startWith 只有实例操作符，在一个Observabe对象在被订阅的时候，
//总是先吐出指定的若干个数据
const original_$ = Observable.timer(0, 1000)
const result____$ = original_$.startWith('start')
/**
 * 产生的结果
 * start //立刻输出这些数据是同时产生的,要是异步吐出就用【concat】
 * 0
 * 1
 */

/**
 * startWith功能完全可以通过concat来实现
 * 但是不能使用 original__$通过链式调用来实现startWith的效果，因此要封装一个startWith函数
 */
const original__$ = Observable.timer(1000, 1000)
const result_____$ = Observable.of('start').concat(original__$)

//7. forkJoin 只有静态操作符 等待所有输入的Observable对象【完结】后合并成唯一的数据
//传递给下游 类似Prmise.all
const source27$ = Observable.interval(1000).map(x => x + 'a').take(1);
const source28$ = Observable.interval(1000).map(x => x + 'b').take(3);

/**
 * 等待3s
 * forkJoin抛弃了source28$的其他数据，只留了完结前的数据
 * ['0a', '2b']
 */

/**
 * 8 高阶Observable函数
 */
const ho$ = Observable.interval(1000)
    .take(2)
    .map(x => Observable.interval(1500).map(y => x + ':' + y).take(2))//产生分支

/**
 * 操作高阶Observable的合并类操作符，全部都只有实例操作符
 * 
 * 8.1 concatAll首先会订阅上游产生的第一个内部Observable对象，等到定义内部对象完结之后
 * 才会订阅第二个
 * 
 * 但是这样就会产生数据积压的问题，导致内存泄漏
 */
const concatAll$ = ho$.concatAll() //0:0 -> 0:1 -> 1:0 -> 1:1

//8.2 mergeAll会在只要上游产生一个内部Observable那么就立刻订阅并收取数据
const mergeAll$ = ho$.mergeAll()//0:0 -> 1:0 -> 0:1 -> 1:1

//8.3 zipAll的上游是一个永不完结的Observable那么zipAll会一直等待
// 没有take(2)的时候永不终结，加上就可以了
const hoNever$ = Observable.interval(1000)//.take(2)//.concat(Observable.never())
.map(x => Observable.interval(1500).map(y => x+':'+y)/*.take(2)*/);

export const zipAll$ = hoNever$.zipAll()

//8.4 combineAll combineLatestAll的简称，与zipAll一样，如果上游高阶Observable不终结，那么永远不会调用

//并没有withLatestFromAll 因为withLatest的上游Observable 只有一个负责控制输出，其余都是提供数据，这与
//高阶Observable的平等理念不符

//8.5 switch 与race不同 race是谁第一个吐出数据那就一直使用那个Observable
// switch是有新的内部Observable对象产生就切换到那个对象上
// switch产生的Observable对象何时完结取决于两个条件：1.上游高阶Observable已完结；2.内部Observable已完结

//8.6 exhaust 耗尽当前内部的Observale数据才会切换新的内部Observable对象