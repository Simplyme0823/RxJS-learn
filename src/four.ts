import { Observable, Subscriber, Subject } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { range } from 'rxjs/observable/range';
import { generate } from 'rxjs/observable/generate';
import { repeat } from 'rxjs/operators/repeat'
import { repeatWhen } from 'rxjs/operators/repeatWhen'
import 'rxjs/add/observable/empty';
//import 'rxjs/add/observable/throw'; //与js冲突
import { _throw } from 'rxjs/observable/throw';
import 'rxjs/add/observable/never';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/ajax';
import { ajax } from 'rxjs/ajax';
import 'rxjs/add/observable/defer';


//rxjs内置了很多创建数据流的函数

//create本质上就是new Observable
Observable.create = function (subscribe: any) {
    return new Observable(subscribe)
}

//of 产生的是cold observable对象
export const source$ = of(1, 2, 3)
//注意这里的123是同步吐出的
source$.subscribe({ next: value => { console.log(value) } })

//同步吐出从1开始递增1的数 共100个
const source1$ = range(1, 100)

//generate 类似下列的for循环
const result = []
for (let i = 2; i < 10; i += 2) {
    result.push(i * i)
}

const source2$ = generate(2, value => value < 10, value => value + 2, value => value * value)

//通过generate来实现range功能
const _range = (start: number, count: number) => {
    const max = start + count
    return generate(start, value => value < max, value => value + 1, value => value)
}

//----------------------------------------------以上为静态(方法)操作符


//----------------------------------------------以下为动态(方法)操作符
//repeat 重复的数据流 当一个stream结束后, 重新订阅该stream
//repeat$是全新的Observable对象
const repeat$ = source$.pipe(repeat(5))
//展示repeat的过程，利用可以打印开始定于额，结束订阅
const orign$: Observable<any> = Observable.create((observer: any) => {
    console.log('on subscribe')
    setTimeout(() => observer.next(1), 1000)
    setTimeout(() => observer.next(2), 1000)
    setTimeout(() => observer.next(3), 1000)
    setTimeout(() => observer.complete(), 4000)

    return {
        unsubscribe: () => {
            console.log('on unsubscribe')
        }
    }
})
const result$ = orign$.pipe(repeat(2))

result$.subscribe(
    console.log,
    null,
    () => console.log('complete')
)
//on subscribe
//1
//2
//3               //这里没有complete是因为这个动作被退订了 一定要有退订的动作才会repeat否则不会repeat
//on unsubscribe
//on subscribe
//1
//2
//3
//complete
//on unsubscribe


//repeatWhen repeat可以反复订阅上游的Observable,但是无法控制订阅的时间，repeat可以在
//上游事件结束后等待一段时间再重新订阅

const notifier = ()=>{
    return Observable.interval(1000)
}

const source3$ = of(1,2,3,4,5)
export const repeated$ = source3$.pipe(repeatWhen(notifier))

/**
 * 本例中的数据源是同步产生的，因此可以很好的控制时间间隔
 * 但是如果数据源是异步产生的，那么使用interval就无法精确控制
 * 这时候需要notifier
 */
const notifier_ = (notification$:any)=>{
    return notification$.delay(2000)
}
const repeated_$ = source3$.pipe(repeatWhen(notifier_))









//empty 直接完结的Observable对象
const empty$ = Observable.empty()

//throw 直接出错
const throw$ = _throw(new Error('oops'))

//never 永不终结 不吐出数据，不完结，不产生错误
const never$ = Observable.never()

//创建异步数据流------------------------------------------------------------------------
//interval从0开始每一秒中递增1， 可以和别的操作符结合
const interval$ = Observable.interval(100)

//timer  100毫秒后吐出0马上完结
const timer$ = Observable.timer(100)
//也可以传入一个date对象作为参数，这是一个明确的时间点
const now = new Date();
const later = new Date(now.getTime() + 1000);
Observable.timer(later)

//第二个参数为时间间隔
Observable.timer(2000, 1000)



//from 可以把一切转化为Observable
//⼀个对象即使不是数组对象，但只要表现得像是⼀个数组，⼀样可以被from转化  有length属性，支持下标访问
function toObservable() {
    return Observable.from(arguments);
}
const from$ = toObservable();

function* generateNumber(max: number) {
    for (let i = 1; i <= max; ++i) {
        yield i;
    }
}
export const generate$ = Observable.from(generateNumber(3));
export const str$ = Observable.from('abc');

//promise对象
const p = Promise.resolve('good')

//next会调用 resolved状态的promise的值作为value
//error会调用 reject状态的promise的值作为err
export const promise$ = Observable.from(p)

const event$ = Observable.fromEvent(document.querySelector('#btn'), 'click')
let str = 'str'
event$.subscribe(
    () => document.querySelector('#text').innerHTML = str
)

//也可以在nodejs中使用


//fromEventPattern 需要两个参数，一个是Observable对象被订阅和退出的时候的动作

const emitter: any = {}
const addHandler = (handler: any) => {
    emitter.addListener('msg', handler)
}

const removeHandler = (handler: any) => {
    emitter.removeListener('msg', handler)
}
const emmit$ = Observable.fromEventPattern(addHandler, removeHandler)

const subscription = event$.subscribe(
    console.log,
    null,
    () => console.log('complete')
)


emitter.emit('msg', 'hello');
emitter.emit('msg', 'world');
subscription.unsubscribe();
emitter.emit('msg', 'end');

//与ajax结合
Observable.fromEvent(document.querySelector('#btn'), 'click').subscribe(() => {
    ajax('http://www.baidu.com').subscribe(value=>{
        
    })
})


//defer的作用是在sourece被订阅的时候才创建一个observer对象
const observableFactory = ()=> of(1,2,3,4,5,6)
const source4$ = Observable.defer(observableFactory)
