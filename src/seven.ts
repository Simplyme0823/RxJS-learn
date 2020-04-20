import { Observable,timer } from 'rxjs';
import 'rxjs/add/observable/range'
import 'rxjs/operator/max'
import 'rxjs/operator/findIndex'
import 'rxjs/operator/find'
import 'rxjs/operator/filter'

import 'rxjs/add/operator/isEmpty'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/first'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/takeWhile'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/skip'
import 'rxjs/add/operator/skipLast'
import 'rxjs/add/operator/skipUntil'
import 'rxjs/add/operator/skipWhile'
import 'rxjs/add/operator/last'
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/throttle';
import 'rxjs/add/operator/debounce';


//类似filter，只能做筛选
const source$ = Observable.range(1, 5)
source$.filter(x => x % 2 === 0)

//first
const source1$ = Observable.of(1, 2, 3, 4, 5)
//第一个参数做筛选，第二个是默认值 如果上游数据完结了，依然没有满足条件的数据，就抛出一个错误/默认值，
//find findIndex是会吐出undefined
//Unlike first, the predicate is required in find, and does not emit an error if a valid value is not found.
export const first$ = source1$.first((value, index) => value % 10 === 0, -1)

/**
 * 在书中还存在第二个参数，但是我上官网查看api后新版的rxjs的first操作符只有两个参数了
 * 
 */

//last  last一定要等到上游完结才可以吐出数据
source1$.last((value, index) => value % 2 === 0, -1)

//take，拿够了才停止，数据的传递是实时的
const source2$ = Observable.interval(1000)
source2$.take(3) //拿3个就停止

//衍生
//1. takeLast 只有上有完结才会把数据【一次性】传递给下游
//2. takeWhile
const source3$ = Observable.interval(1000)
source3$.takeWhile(x => x % 2 === 0) //一旦x =>x%2===0 是false就停止获取
// 利用takeWhild实现take
/*Observable.prototype.take = function (count) {
    return this.takeWhile((value, index) => index < count)
}*/

//3. 组合take和filter, 获取满足条件的前几个数据

/*Observable.prototype.takeCountWhile = function(count, predicate){
    return this.filter(predicate).take(count)
}*/
/*
//4. takeUntil 用一个Observable对象来控制另一个Observabel对象的数据产生
const source4$ = Observable.interval(1000)
const notifier$ = Observable.timer(2500)
//如果在吐出数据或者完结之前notifier$抛出错误，那么错误会传递给下游，
const takeUntil$ = source4$.takeUntil(notifier$)

//5. 例子
let clickCount = 0
const event$ = Observable.fromEvent(document.querySelector('#btn'), 'click')
const countDown$ = Observable.timer(5000)
const filtered$ = event$.takeUntil(countDown$)

const showEnd = () => document.querySelector('#end').innerHTML = '时间结束'
const updateCount = () => document.querySelector('#text').innerHTML = String(++clickCount)
countDown$.subscribe(showEnd)
filtered$.subscribe(updateCount)
*/
//skip 忽略上游的n个数
const source5$ = Observable.interval(1000)

//skipWhile
//只要value => value%2 === 0 返回的是false 那就从这个数开始全部转手上有数据
export const skipWhile = source5$.skipWhile(value => value%2 === 0)

//skipUntil,延迟启动上游函数
const skipNotify = timer(10000)
export const skipUntil = source5$.skipUntil(skipNotify)

//回压控制 Back Pressure 管道某一环节处理数据的速度跟不上数据涌入的速度
//例如zip操作符，当多个数据合并的时候，数据的节奏不一样 导致一定要等时间最长的数据产出

//因此，需要处理，比如舍弃一些涌入的数据 此操作称为 有损回压控制 Lossy Backpressure Control

// throttleTime 2000ms内的数据会被抛弃，注意刚计时器刚启动的时候吐出的数据不会被抛弃
source5$.throttleTime(2000)

// debounceTime 上一次吐出时间开始计时，如果与下一次吐出数据的时间间隔小于2000 那么重新计时，数据就不会传给下游
// 时间间隔大于小于2000ms 就
source5$.debounceTime(2000)


//节流是大量数据产生的时候 只处理少部分
//防抖是大量数据产生的时候 完全不处理

// throttle 用数据流控制数据流
// throttle的durationSelector参数为一个函数，可以根据上游数据做更灵活的操作，设定不同的节流时间
// 0 3 6 9 吐出之后节流时间为2s 其余为1s
source5$.throttle((value:any)=>Observable.timer(value % 3 === 0 ? 2000 : 1000))

// debounce  防抖函数根据上游值改变了防抖时间，改变值的时候 会打断计时器，
source5$.debounce((value:any)=>Observable.timer(value % 3 === 0 ? 2000 : 1000))