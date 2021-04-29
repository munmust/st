## useRequest

## useRef
-   引用的值在组件重新渲染之间保持不变
-   更新ref不会触发组件重新渲染

```javascript
import {useRef} from 'react';
function LogButtonClick(){
    const countRef=useRef(0);
    const handle=()=>{
        countRef.current++;
        console.log(`countRef is ${countRef.current}`)
    }
    console.log(render);
    //点击按钮的时候控制台会输出countRef is，但不会输出render
    return <button onClick={handle}>click</button>
}
```
```javascript
import {useState} from 'react';
function LogButtonClick(){
    const [count, setCount] = useState(0);
    const handle=()=>{
        const updatedCount = count + 1;
        console.log(`countRef is ${updatedCount}`)
        setCount(updatedCount);
    }
    console.log(render);
    //点击按钮的时候控制台会输出countRef is，输出render
    return <button onClick={handle}>click</button>
}
```
对比state
-   state更新状态会触发组件的重新渲染，更新ref不会
-   state更新是异步的，状态的值在重新渲染之后更新使用，ref的更新是同步的，更新后值可以立即使用
ps：页面定时器可以使useRef来做，ref.current永远是当前值