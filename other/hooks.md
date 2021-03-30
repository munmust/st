在React中，state与props的改变，都会引发组件重新渲染。如果是父组件的变化，则父组件下所有子组件都会重新渲染。
而在函数式组件中，是整个函数重新执行。
1. 函数式组件接收props作为自己的参数
2. props的每次变动，组件都会重新渲染一次，函数重新执行。
3. 没有this。那么也就意味着，之前在class中由于this带来的困扰就自然消失了。

useState利用闭包，在函数内部创建一个当前函数组件的状态。并提供一个修改该状态的方法。
需要注意的是，setCounter接收的值可以是任意类型，无论是什么类型，每次赋值，counter得到的，都是新传入setCounter中的值。
const [counter, setCounter] = useState({ a: 1, b: 2 });

// 此时counter的值被改为了 { b: 4 }， 而不是 { a: 1, b: 4 }
setCounter({ b: 4 });

// 如果想要得到 { a: 1, b: 4 }的结果，就必须这样
setCounter({ ...counter, b: 4 });
useState接收一个值作为当前定义的state的初始值。并且初始操作只有组件首次渲染才会执行。
无论是在class中，还是hooks中，state的改变，都是异步的。
当你想要在setCounter之后立即去使用它时，你无法拿到状态最新的值，而之后到下一个事件循环周期执行时，状态才是最新的值。

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