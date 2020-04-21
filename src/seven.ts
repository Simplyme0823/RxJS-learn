import { Observable, timer } from 'rxjs';
import 'rxjs/add/observable/range'
import 'rxjs/operator/max'
import 'rxjs/operator/findIndex'
import 'rxjs/operator/find'
import 'rxjs/operator/filter'
import 'rxjs/add/observable/fromEvent'
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
import 'rxjs/add/operator/audit';
import 'rxjs/add/operator/auditTime';
import 'rxjs/add/operator/sample';
import 'rxjs/add/operator/sampleTime';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/distinct';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import 'rxjs/add/operator/elementAt';
import 'rxjs/add/operator/single';
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
export const skipWhile = source5$.skipWhile(value => value % 2 === 0)

//skipUntil,延迟启动上游函数
const skipNotify = timer(10000)
export const skipUntil = source5$.skipUntil(skipNotify)

//回压控制 Back Pressure 管道某一环节处理数据的速度跟不上数据涌入的速度
//例如zip操作符，当多个数据合并的时候，数据的节奏不一样 导致一定要等时间最长的数据产出

//因此，需要处理，比如舍弃一些涌入的数据 此操作称为 有损回压控制 Lossy Backpressure Control

// throttleTime 上游吐出数据的时候开始计时，2000ms的计时器中只有第一个吐出的数据会传递给下游，其他的都过滤掉了
//等计时器的时间到了之后，上游又有数据到达，才会重新计时
source5$.throttleTime(2000)

// debounceTime 上游吐出数据的时候开始计时，两个相邻数据产生的事件如果小于2000ms,那么第一个数据过滤掉，然后计时器
// 重置，再看第二个第三个数据的吐出时间差；当两个相邻数据 吐出时间大于2000ms时候，这两个数据才会传递到下游，
source5$.debounceTime(2000)


//节流是大量数据产生的时候 只处理第一个
//防抖是大量数据产生的时候 完全不处理

// throttle 用数据流控制数据流
// throttle的durationSelector参数为一个函数，可以根据上游数据做更灵活的操作，根据不同的上游数据设定不同的节流时间
// 0 3 6 9 吐出之后节流时间为2s 其余为1s
source5$.throttle((value: any) => Observable.timer(value % 3 === 0 ? 2000 : 1000))


// debounce  如果当前的计时周期内有新的值到达，那么会计时器会被打断，计时周期从新值到达的时间点开始算
// 本质上就是时间差
source5$.debounce((value: any) => Observable.timer(value % 3 === 0 ? 2000 : 1000))


//auditTime和audit
//与throttle类似，不同的是throttle是把周期内的第一个数据传递给下游，而audit是把周期内的最后一个数据传递给下游
//一定是周期结束后再吐出, 计算周期是上一轮周期结束后 新值到来再开启
export const auditTime$ = source5$.auditTime(2000) //1, 3, 5,....

const source6$ = Observable.interval(500).take(2).mapTo('A')
    .concat(Observable.interval(5000).take(3).mapTo('B'))
    .concat(Observable.interval(500).take(3).mapTo('C'))

const durationSelector = (value: any) => Observable.timer(800)

export const audit$ = source6$.audit(durationSelector)

//sampleTime和sample 采样操作，无论上游数据如何变化，定时器的周期都是固定的，会把周期内的【最后一个】数据传递给下游
//如果sampleTime发现一个时间块内上游没有产生数据，那么时间快结尾也不会传递数据给下游
//sample的计时周期开始时间与上游数据无关

export const sampleTime$ = source6$.sampleTime(500)

//实例，利用click时间来改变采样频率 从而实现在div中显示逝去的时间
/*
const notify$ = Observable.fromEvent(document.querySelector('#sample'), 'click')
const tick$ = Observable.timer(0, 10).map(x => x * 10) //上游数据，模拟订阅Observer以后逝去的时间
const sample_$ = tick$.sample(notify$)//通过click改变采样的评率，获取两次点击之间，最后一次点击的上游数据

var seconds = Observable.interval(1000);
var clicks = Observable.fromEvent(document, 'click')
export const result = seconds.sample(clicks);
*/

// 有这么一种状况，我们只想处理一次上游出现过的数据如0,0,0,1,1,2,2的上游数据，我们只想处理 0， 1 2

// distinct
const duplicate$ = Observable.of(0, 0, 0, 1, 1, 1, 2, 2, 2)
const distinct$ = duplicate$.distinct()
//对于基础对象，使用 === 比较，对于引用对象，提供一个keySelector函数，指定属性
const duplicateObj$ = Observable.of({ name: "rxjs", value: "rxjs" }, { name: "rxjs", value: "rxjs" })
const distinctObj$ = duplicateObj$.distinct(x => x.name, Observable.interval(500))

//注意点，distinct()会保留数据集合，那么就会造成内存泄漏,考虑到这个情况，
//会提供flush参数 如上所以，产生的值是什么不重要，重要的是时间就是每500ms清空一次集合
//因此传递给下游的值是【一段时间内】的唯一值


//2. distinctUntilChanged 与上述不同，这个函数是每次拿当前值和上一次的值比较，因此不会有内存泄漏问题
const source7$ = Observable.of(
    { name: 'RxJS', version: 'v4' },
    { name: 'React', version: 'v15' },
    { name: 'React', version: 'v16' },
    { name: 'RxJS', version: 'v5' })
const compare = (a:any, b:any) => a.name===b.name

//书中说会吐出所有的数据,是错误的， 只会吐出第1 2 4 个数据
export const distinctUntilChanged$ = source7$.distinctUntilChanged(compare)

///distinctUntilKeyChanged, 指定【一个】属性比较，不能指定多个
const distinctUntilKeyChanged$ = source7$.distinctUntilKeyChanged('name')

//剩下的其他过滤符
//1. ignoreElements 忽略所有元素，只关心error和competition事件

//2. elementAt 把上游元素当成数组， 第一个参数为找到index为第一个参数的元素，第二个参数为指定找不到元素时的返回值

//3. 检查上游是否只有一个满足对应条件的数据，是的话就传递这个数据，否就抛出异常

const source8$ = Observable.interval(1000)
export const single$ = source8$.single(x=>x%2===0)
//上述结果会报错，因为递增到2的时候 不是唯一了
//Uncaught Sequence contains more than one element