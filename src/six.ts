import { Observable, Subscriber, Subject, concat, merge, observable, combineLatest } from 'rxjs';
import 'rxjs/operator/max'
import { max, find, findIndex,zip, isEmpty } from 'rxjs/operators';
import 'rxjs/operator/findIndex'
import 'rxjs/operator/find'
import 'rxjs/add/operator/isEmpty'
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/zip';
//数学类操作符 count max min reduce 全部都是【实例】操作符,这些操作符必须遍历完上游Observale对象中吐出的所有数据才传给下游数据，也就是说，只有在上游完结的时候，才会传递下游【唯一】数据
//max min因为判断的值可能有不同的类型，因此可以接受一个判断方法

const source$ = Observable.interval(1000).concat(Observable.of(1, 3, 4))
source$.pipe(max((a: number, b: number) => a - b))

//判定函数 predicate function 
//在rxjs中每一个判定的值都是从上游传递下来的，所有还有一个序号属性，也就是这个数在上有种是吐出的第几个，
//有时候判定的功能还有依赖于上游Observale本身的属性
//因此有三个参数：被判定的数据，序号参数，上游Observale参数

//对于every不要判定永不终结的数据流

//在rxjs中，要想获取目标元素的值和index要  1. 使用find，findIndex，zip; 2.或者使用first操作符

const find$ = source$.pipe(find(x => x / 2 === 0))
const findIndex$ = source$.pipe(findIndex(x => x / 2 === 0))
const final$ = Observable.zip(find$, findIndex$)

const source1$ = Observable.create((observer:any)=>{
    setTimeout(()=>{
        observer.complete(1)
    },1000)
})
export const isEmpty$ = source1$.pipe(isEmpty())

//defaultIfEmpty
//empty多一个参数，在上为空的时候就吐出该参数
//如果没有参数，那就吐出null
//缺点：只能生成含有一个数据的Observale对象y