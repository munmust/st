#### 在React中，state与props的改变，都会引发组件重新渲染。如果是父组件的变化，则父组件下所有子组件都会重新渲染。
而在函数式组件中，是整个函数重新执行。
1. 函数式组件接收props作为自己的参数
2. props的每次变动，组件都会重新渲染一次，函数重新执行。
3. 没有this。那么也就意味着，之前在class中由于this带来的困扰就自然消失了。

####  useState利用闭包，在函数内部创建一个当前函数组件的状态。并提供一个修改该状态的方法。
需要注意的是，setCounter接收的值可以是任意类型，无论是什么类型，每次赋值，counter得到的，都是新传入setCounter中的值。
const [counter, setCounter] = useState({ a: 1, b: 2 });

// 此时counter的值被改为了 { b: 4 }， 而不是 { a: 1, b: 4 }
setCounter({ b: 4 });

// 如果想要得到 { a: 1, b: 4 }的结果，就必须这样
```javascript
setCounter({ ...counter, b: 4 });
```
useState接收一个值作为当前定义的state的初始值。并且初始操作只有组件首次渲染才会执行。
无论是在class中，还是hooks中，state的改变，都是异步的。
当你想要在setCounter之后立即去使用它时，你无法拿到状态最新的值，而之后到下一个事件循环周期执行时，状态才是最新的值。
```javascript
const [counter, setCounter] = useState(10);
setCounter(20);
console.log(counter);  // 此时counter的值，并不是
export default function AsyncDemo() {
  const [param] = useState<Param>({});
  const [listData, setListData] = useState<ListItem[]>([]);

  function fetchListData() {
    // @ts-ignore
    listApi(param).then(res => {
      setListData(res.data);
    })
  }

  function searchByName(name: string) {
    param.name = name;
    fetchListData();
  }

  return [
    <div>data list</div>,
    <button onClick={() => searchByName('Jone')}>search by name</button>
  ]
}
```

在function组件中，每当DOM完成一次渲染，都会有对应的副作用执行，useEffect用于提供自定义的执行内容，它的第一个参数（作为函数传入）就是自定义的执行内容。为了避免反复执行，传入第二个参数（由监听值组成的数组）作为比较(浅比较)变化的依赖，比较之后值都保持不变时，副作用逻辑就不再执行
hooks的设计中，每一次DOM渲染完成，都会有当次渲染的副作用可以执行。而useEffect，是一种提供我们能够自定义副作用逻辑的方式


受控组件
从广义上来理解：组件外部能控制组件内部的状态，则表示该组件为受控组件。
外部想要控制内部的组件，就必须要往组件内部传入props。而通常情况下，受控组件内部又自己有维护自己的状态。
我们需要通过某种方式，要将外部进入的props与内部状态的state，转化为唯一数据源。这样才能没有冲突的控制状态变化
利用props，去修改内部的state

每次副作用执行，都会返回一个新的clear函数
•clear函数会在下一次副作用逻辑之前执行（DOM渲染完成之后）
•组件销毁也会执行一次
```javascript
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
      
//     </div>
//   );
// }

// export default App;
import React, { useState, useEffect } from 'react';
// import './style.scss';

export default function App() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCounter(counter + 1);
    }, 300);
    console.log('effect:', timer);

    return () => {
      console.log('clear:', timer);
      clearTimeout(timer);
    }
  });

  console.log('before render');

  return (
    <div className="container">
      <div className="el">{counter}</div>
    </div>
  )
}
before render
App.js:23 effect: 1
App.js:31 before render
App.js:26 clear: 1
App.js:23 effect: 7
App.js:31 before render
App.js:26 clear: 7
App.js:23 effect: 8
App.js:31 before render
App.js:26 clear: 8
App.js:23 effect: 9
App.js:31 before render
App.js:26 clear: 9
App.js:23 effect: 10
App.js:31 before render
App.js:26 clear: 10
App.js:23 effect: 11
App.js:31 before render
App.js:26 clear: 11
App.js:23 effect: 12
App.js:31 before render
```
```javascript
import {useState, useEffect} from 'react';

export default function useInitial<T, P>(
  api: (params: P) => Promise<T>,
  params: P,
  defaultData: T
) {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(defaultData);
  const [errMsg, setErrmsg] = useState('');

  useEffect(() => {
    if (!loading) { return };
    getData();
  }, [loading]);

  function getData() {
    api(params).then(res => {
      setResponse(res);
    }).catch(e => {
      setErrmsg(errMsg);
    }).finally(() => {
      setLoading(false);
    })
  }

  return {
    loading,
    setLoading,
    response,
    errMsg
  }
}

export default function FunctionDemo() {
    // 只需要传入api， 对应的参数与返回结果的初始默认值即可
    const {loading, setLoading, response, errMsg} = useInitial(api, {id: 10}, {});
}
setLoading(true);
```
逻辑片段复用
而和普通函数更强一点的是，自定义hooks还能够封装异步逻辑片段。

在函数式组件中，useRef 是一个返回可变引用对象的函数。该对象.current属性的初始值为useRef传入的参数initialVale。

返回的对象将在组件整个生命周期中持续存在
useRef有两种用途，

•访问DOM节点，或者React元素
•保持可变变量

forwardRef方法能够传递ref引用，具体使用如下

// 官网的案例
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

// 你可以直接获取 DOM button 的 ref：
const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
返回其他额外的属性或者方法，我们可以使用useImperativeHandle。

useImperativeHandle可以让我们在使用ref时自定义暴露给父组件的实例值。

import React, {useRef, useImperativeHandle, forwardRef, Ref, useState, ChangeEvent} from 'react';

export interface InputProps {
  value?: string,
  onChange?: (value: string) => any
}

export interface XInput {
  focus: () => void;
  blur: () => void;
  sayHi: () => void
}

function Input({value, onChange}: InputProps, ref: Ref<XInput>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [_value, setValue] = useState(value || '');

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current && inputRef.current.focus()
    },
    blur: () => {
      inputRef.current && inputRef.current.blur()
    },
    sayHi: () => {
      console.log('hello, world!');
    }
  }));

  const _onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(value);
    setValue(value);
    onChange && onChange(value);
  }

  return (
    <div>
      自定义Input组件
      <input value={_value} onChange={_onChange} ref={inputRef} />
    </div>
  );
}

export default forwardRef(Input);
如果一个状态或者数据会影响DOM的渲染结果，一定要避免使用useRef来保持引用


记忆函数利用闭包，在确保返回结果一定正确的情况下，减少了重复冗余的计算过程。

// 初始化一个非正常数字，用于缓存上一次的计算结果
let preTarget = -1;
let memoSum = 0;

export function memoSummation(target: number) {
  // 如果传入的参数与上一次一样，直接换回缓存结果
  if (preTarget > 0 && preTarget === target) {
    return memoSum;
  }

  console.log('我出现，就表示重新计算了一次');
  // 缓存本次传入的参数
  preTarget = target;
  let sum = 0;
  for (let i = 1; i <= target; i++) {
    sum += i;
  }
  // 缓存本次的计算结果
  memoSum = sum;
  return sum;
}
useMemo

useMemo缓存计算结果。它接收两个参数，第一个参数为计算过程(回调函数，必须返回一个结果)，第二个参数是依赖项(数组)，当依赖项中某一个发生变化，结果将会重新计算。
function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T;

useCallback的使用几乎与useMemo一样，不过useCallback缓存的是一个函数体，当依赖项中的一项发现变化，函数体会重新创建。

function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T

记忆函数并非完全没有代价，我们需要创建闭包，占用更多的内存，用以解决计算上的冗余。
当我们使用useMemo/useCallback时，由于新增了对于闭包的使用，新增了对于依赖项的比较逻辑，因此，盲目使用它们，甚至可能会让你的组件变得更慢
当函数体或者结果的计算过程非常复杂时，我们才会考虑优先使用useCallback/useMemo
当依赖项会频繁变动时，我们也要考虑使用useMemo/useCallback是否划算


对于class组件，我们只需要实例化一次，实例中保存了组件的state等状态。对于每一次更新只需要调用render方法就可以。但是在function组件中，每一次更新都是一次新的函数执行,为了保存一些状态,执行一些副作用钩子,react-hooks应运而生，去帮助记录组件的状态，处理一些额外的副作用

hook加入方式
```javascript
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    /**
     * useState中保存的state信息
     * useEffect中保存的effect对象
     * useMemo中保存的缓存值和deps
     * useRef中保存的ref对象
     * ...
    */
    memoizedState: null,
    //  useState和useReducer中保存最新的state值
    baseState: null,
    //  useState和useReducer中保存最新的更新队列
    baseQueue: null,
    //  保存待更新队列 pendingQueue ，更新函数 dispatch 等信息
    queue: null,
    //  指向下一个hooks对象
    next: null,
  };
  /**
   *  添加数值
   *  每次执行一个hooks函数，都产生一个hook对象，里面保存了当前hook
   *  第一次直接放入
   *  后续放入将会以链表形式串联起来
   *  并赋值给workInProgress的memoizedState
  */ 
  if (workInProgressHook === null) {
    // This is the first hook in the list
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the end of the list
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}

```
为什么不要在判断和循环中使用
```javascript
 let curRef  = null
 if(isFisrt){
  curRef = useRef(null)
 }
```
一旦在条件语句中声明hooks，在下一次函数组件更新，hooks链表结构，将会被破坏，current树的memoizedState缓存hooks信息，和当前workInProgress不一致，如果涉及到读取state等操作，就会发生异常。

```javascript

function dispatchAction<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A,
) {
  if (__DEV__) {
    if (typeof arguments[3] === 'function') {
      console.error(
        "State updates from the useState() and useReducer() Hooks don't support the " +
          'second callback argument. To execute a side effect after ' +
          'rendering, declare it in the component body with useEffect().',
      );
    }
  }
  //事件时间
  const eventTime = requestEventTime();
  const lane = requestUpdateLane(fiber);
  //创建一个update对象，记录更新信息
  const update: Update<S, A> = {
    lane,
    action,
    eagerReducer: null,
    eagerState: null,
    next: (null: any),
  };

  const alternate = fiber.alternate;
  //判断当前是否在渲染阶段
  if (
    fiber === currentlyRenderingFiber ||
    (alternate !== null && alternate === currentlyRenderingFiber)
  ) {
    // This is a render phase update. Stash it in a lazily-created map of
    // queue -> linked list of updates. After this render pass, we'll restart
    // and apply the stashed updates on top of the work-in-progress hook.
    didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
    //得到待更新
    const pending = queue.pending;

    if (pending === null) {
      // This is the first update. Create a circular list.
      // 这是第一次更新。创建一个循环列表
      update.next = update;
    } else {

      update.next = pending.next;
      //放入待更新队列
      pending.next = update;
    }
    queue.pending = update;
  } else {
    if (isInterleavedUpdate(fiber, lane)) {
      const interleaved = queue.interleaved;
      if (interleaved === null) {
        // This is the first update. Create a circular list.
        update.next = update;
        // At the end of the current render, this queue's interleaved updates will
        // be transfered to the pending queue.
        pushInterleavedQueue(queue);
      } else {
        update.next = interleaved.next;
        interleaved.next = update;
      }
      queue.interleaved = update;
    } else {
      const pending = queue.pending;
      if (pending === null) {
        // This is the first update. Create a circular list.
        update.next = update;
      } else {
        update.next = pending.next;
        pending.next = update;
      }
       //放入待更新队列
       pending.next = update;
      queue.pending = update;
    }
    //当前函数组件对应的fiber没有处于调和渲染阶段，获取最新的state，执行更新
    if (
      fiber.lanes === NoLanes &&
      (alternate === null || alternate.lanes === NoLanes)
    ) {
      // The queue is currently empty, which means we can eagerly compute the
      // next state before entering the render phase. If the new state is the
      // same as the current state, we may be able to bail out entirely.
      // 得到最新的state
      const lastRenderedReducer = queue.lastRenderedReducer;
      if (lastRenderedReducer !== null) {
        let prevDispatcher;
        if (__DEV__) {
          prevDispatcher = ReactCurrentDispatcher.current;
          ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
        }
        try {
          // 得到上一次的currentState
          const currentState: S = (queue.lastRenderedState: any);
          const eagerState = lastRenderedReducer(currentState, action);
          // Stash the eagerly computed state, and the reducer used to compute
          // it, on the update object. If the reducer hasn't changed by the
          // time we enter the render phase, then the eager state can be used
          // without calling the reducer again.
          update.eagerReducer = lastRenderedReducer;
          update.eagerState = eagerState;
          //进行比较是否相等，相等直接退出不需要更新
          if (is(eagerState, currentState)) {
            // Fast path. We can bail out without scheduling React to re-render.
            // It's still possible that we'll need to rebase this update later,
            // if the component re-renders for a different reason and by that
            // time the reducer has changed.
            return;
          }
        } catch (error) {
          // Suppress the error. It will throw again in the render phase.
        } finally {
          if (__DEV__) {
            ReactCurrentDispatcher.current = prevDispatcher;
          }
        }
      }
    }
    if (__DEV__) {
      // $FlowExpectedError - jest isn't a global, and isn't recognized outside of tests
      if ('undefined' !== typeof jest) {
        warnIfNotScopedWithMatchingAct(fiber);
        warnIfNotCurrentlyActingUpdatesInDev(fiber);
      }
    }
    //不相等就会执行scheduleUpdateFiber喧嚷当前fiber
    const root = scheduleUpdateOnFiber(fiber, lane, eventTime);

    if (isTransitionLane(lane) && root !== null) {
      let queueLanes = queue.lanes;

      // If any entangled lanes are no longer pending on the root, then they
      // must have finished. We can remove them from the shared queue, which
      // represents a superset of the actually pending lanes. In some cases we
      // may entangle more than we need to, but that's OK. In fact it's worse if
      // we *don't* entangle when we should.
      queueLanes = intersectLanes(queueLanes, root.pendingLanes);

      // Entangle the new transition lane with the other transition lanes.
      const newQueueLanes = mergeLanes(queueLanes, lane);
      queue.lanes = newQueueLanes;
      // Even if queue.lanes already include lane, we don't know for certain if
      // the lane finished since the last time we entangled it. So we need to
      // entangle it again, just to be sure.
      markRootEntangled(root, newQueueLanes);
    }
  }

  if (__DEV__) {
    if (enableDebugTracing) {
      if (fiber.mode & DebugTracingMode) {
        const name = getComponentNameFromFiber(fiber) || 'Unknown';
        logStateUpdateScheduled(name, lane, action);
      }
    }
  }

  if (enableSchedulingProfiler) {
    markStateUpdateScheduled(fiber, lane);
  }
}
```

函数组件的dispatchAction ，都会产生一个 update对象，里面记录了此次更新的信息，然后将此update放入待更新的pending队列中，dispatchAction第二步就是判断当前函数组件的fiber对象是否处于渲染阶段，如果处于渲染阶段，那么不需要我们在更新当前函数组件，只需要更新一下当前update的expirationTime即可。
如果当前fiber没有处于更新阶段。那么通过调用lastRenderedReducer获取最新的state,和上一次的currentState，进行浅比较，如果相等，那么就退出，这就证实了为什么useState，两次值相等的时候，组件不渲染的原因了，这个机制和Component模式下的setState有一定的区别。
如果两次state不相等，那么调用scheduleUpdateOnFiber调度渲染当前fiber，scheduleUpdateOnFiber是react渲染更新的主要函数。
