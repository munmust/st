原始类型：boolean、number、string、void、any、null、undefined、symbol
引用类型：Object、Function、Array
``` typescript
//字符串
type isString = String;  
const str:isString='str';
//数字
type isNumber = Number;     
const num:isNumber=1;
//布尔
type isBoolean = Boolean;   
const bool:isBoolean=true;
//任意值
type isAny = any;
const isAny:any='1223'
const isAny2:any=12;
const isAny3:any=true;
const isAny4:any={a:"B"};
const isAny5:any=()=>"A";
const isAny6:any=[1,"s",true,{a:"b"},()=>"B"]
//对象
type isObject = {
  isString: String,
  isName: Number
};
const obj={
  isString:"A",
  isNumber:1
}
//数组
type isArray = Array<isString | isNumber | any>;
const arr=[1,2,3,"S",true];
//函数
type isFuntion = (isParam: isObject) => Number;
const fun:isFuntion=(isParam)=>1;
```
联合类型
```typescript
type key=String|Number;
const str:key="S";
const num:key=1;

```
交叉类型
```typescript
type key1={
  name:String
}
type key2={
  age:Number
}
const keys:key1&key2={
  name:"key",
  age:1
}
```
接口声明类型

```typescript
/**
 * 声明对象
 * 等同于：
 * type Object = { name: string; age: number }
 */
 interface Object {
  name: string;
  age: number
}

/**
 * 声明数组
 * 等同于：
 * type ARR = User[]
 */
interface ARR {
  [index: number]: Object
}

/**
 * 声明函数
 * 等同于：
 * type FUN = (list: List, name: string) => User
 */
interface FUN {
  (list: ARR, name: string): Object
}
// 继承
interface keyN {
  name: string;
  
};
// 声明了接口 extKey，继承自接口 keyN，它需要包含 keyN 的类型声明
interface extKey extends keyN {
  age: number
}

const userq: extKey = {
  name: 'hankle',
  age:1
};
```
泛型
```typescript
interface FUNType {
  <T extends LengthType>(list: T[], func: (item: T) => boolean): T | null
}
const FUN: FUNType = function (list, func) {
  return list.FUN(func)
}

// 使用时指定具体类型
FUN<number>([1,2,3], item => item > 2)

```
### 其他基本类型
- Tuple 元组：允许表示一个已知元素数量和类型的数组
```typescript
let x:[string,number];
x=['hello',10]// ok
x=[10,'hello']//false
```
- Enum 枚举 
```typescript
enum Color {red=1,blue=2,green=3};
ley c:Color=Color.green;
```
- Unknown 还未知道类型的变量、这些值可以来自动态内容。
```typescript
let notSure: unknown = 4;
notSure = "maybe a string instead";

// OK, definitely a boolean
notSure = false;
```
- Void 没有任何类型，常用在没有返回值的函数
```typescript
function warnUser(): void {
    console.log("This is my warning message");
}
```
### 方法
- Partial 构造Type，将他的所有属性设置为可选的。他的返回类型为输入类型的全部子类型
```typescript
interface Todo{
  title:string;
  description:string;
}
function updateTodo(todo:Todo,toUpdate:Partial<Todo>){
  return {...Todo,...toUpdate}
}
const todo1={
  title:'title1',
  description:'description1'
}
const todo2=updateTodo(todo1,{
  description:'description2'
})
```
- Readonly 将所有属性值设置为readonly，构造出来的类型的属性不能被再次赋值
```typescript
interface Todo {
    title: string;
}
const todo: Readonly<Todo> = {
    title: 'Delete inactive users',
};
todo.title = 'Hello'; // Error: cannot reassign a readonly property
```
- Record 将一个类型映射到另一个类型上
```typescript
interface PageInfo {
    title: string;
}

type Page = 'home' | 'about' | 'contact';

const x: Record<Page, PageInfo> = {
    about: { title: 'about' },
    contact: { title: 'contact' },
    home: { title: 'home' },
};
```
- Pick 挑选部分类型构造类型
```typescript
interface Todo {
    title: string;
    description: string;
    completed: boolean;
}

type TodoPreview = Pick<Todo, 'title' | 'completed'>;

const todo: TodoPreview = {
    title: 'Clean room',
    completed: false,
};
```
- Omit 从类型中剔除部分类型生成新的类型
```typescript
interface Todo {
    title: string;
    description: string;
    completed: boolean;
}

type TodoPreview = Omit<Todo, 'description'>;

const todo: TodoPreview = {
    title: 'Clean room',
    completed: false,
};
```
### react

#### Function Component
```typescript
type props={
  message:string
}
const App=({message}:props):JSX.Element=><div>{message}</div>
const App2=({message}:{message:string})=><div>{message}</div>
```
ps:不采用React.FC\React.FunctionComponent
> 提供从子项的隐含定义  
> React.FC定义组件会导致其隐式的接受子代（ReactNode类型）。导致所有组件都可以接受子级，即使他们不允许接受
```typescript
const App:React.FC=()=>{/* */};
const Example=()=>{
  return <App><div>Unwanted children</div></App>
}
// 这是一个错误，当使用typescript时不是在React.FC的时候会进行报错
```
> 不支持泛型
```javascript
// yes
type GenericComponentProps<T>={
  props:T,
  callback:(t:T)=>void
}
const GenericComponent=<T>(props:GenericComponent<T>)=>{/* */}
//error 无法将未解析的泛型T保留为React.FC返回的类型
const GenericComponent:React.FC</* */>=<T>(props:GenericComponent)=>{/* */}
```
> 无法和defaultProps一起使用
```javascript
type ComponentProps={name:string}
const Component=({name}:ComponentProps)=>(<div>{name}</div>)
Component.defaultProps={name:"A"};
const Example=()=>(<Component />);/* 名称有默认值,不会报错 */
// 当设置为React.FC的时候会出现：props为必选的或name的类型报错等问题
```

#### Hooks
> useState
```typescript
// 基本用法
const [value,setValue]=React.useState<Value|null>(null);
setValue(newValue);
// 在设置后立即初始化并且在之后始终具有值 类型断言
const [detail,setDetail]=React.useState<Detail>({}as Detail)
```
> useReducer 
```typescript
const defaultValue={count:0};
type actionType =
  | { type: "increment"; payload: number }
  | { type: "decrement"; payload: string };
function reducer(state: typeof initialState, action: actionType) {
  switch (action.type) {
    case "increment":
      return { count: state.count + action.payload };
    case "decrement":
      return { count: state.count - Number(action.payload) };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: "decrement", payload: "5" })}>
        -
      </button>
      <button onClick={() => dispatch({ type: "increment", payload: 5 })}>
        +
      </button>
    </>
  );
}
```
redux:
```typescript
import { Reducer } from 'redux';
export function reducer: Reducer<AppState, Action>() {}
```
>useRef
```typescript
// !一个非空的断言运算符,断言在它之前的任何表达式都不为null或undefined,ref1,意味着正在使用当前值为null的实例，但是ts认为它不为null
const ref1 = useRef<HTMLElement>(null!);
const ref2 = useRef<HTMLElement>(null);
const ref3 = useRef<HTMLElement | null>(null);
```











#### Class Component
```typescript
type MyProps = {
  message: string;
};
type MyState = {
  count: number;
};
// React.Component<PropType, StateType>
class App extends React.Component<MyProps, MyState> {
  state: MyState = {
    count: 0,
  };
  // 定义属性，直接定义不用去给他赋值
  pointer：string
  render() {
    return (
      <div>
        {this.props.message} {this.state.count}
      </div>
    );
  }
}
```
> getDerivedStateFromProps
```typescript
// 明确派生状态并且结果保持一致
class Comp extends React.Component<Props, State> {
  static getDerivedStateFromProps(
    props: Props,
    state: State
  ): Partial<State> | null {
  }
}
// function的返回结果决定state
class Comp extends React.Component<
  Props,
  ReturnType<typeof Comp["getDerivedStateFromProps"]>
> {
  static getDerivedStateFromProps(props: Props) {}
}
// 添加其他属性来决定state
type CustomValue = any;
interface Props {
  propA: CustomValue;
}
interface DefinedState {
  otherStateField: string;
}
type State = DefinedState & ReturnType<typeof transformPropsToState>;
function transformPropsToState(props: Props) {
  return {
    savedPropA: props.propA, // save for memoization
    derivedState: props.propA,
  };
}
class Comp extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      otherStateField: "123",
      ...transformPropsToState(props),
    };
  }
  static getDerivedStateFromProps(props: Props, state: State) {
    if (isEqual(props.propA, state.savedPropA)) return null;
    return transformPropsToState(props);
  }
}
```
ps：注意使用React.ReactNode中适用空对象，会照成错误
```typescript
type Props = {
  children: React.ReactNode;
};

function Comp({ children }: Props) {
  return <div>{children}</div>;
}
function App() {
  return <Comp>{{}}</Comp>; // Runtime Error: Objects not valid as React Child!
}
```
ps：JSX.Element 和React.ReactNode
React.createElement总会返回一个对象，就是JSX.Element,但是React.ReactNode是组件所有可能返回值的集合
- JSX.Element ->  React.createElement的返回值
- React.ReactNode -> component的返回值

#### Form and Event
```typescript
type State = {
  text: string;
};
class App extends React.Component<Props, State> {
  state = {
    text: "",
  };
  // code1 将类型应用于事件处理程序本身
onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.setState({text: e.currentTarget.value})
  }
  // code2
  onChange = (e: React.FormEvent<HTMLInputElement>): void => {
    this.setState({ text: e.currentTarget.value });
  };
  render() {
    return (
      <div>
        <input type="text" value={this.state.text} onChange={this.onChange} />
      </div>
    );
  }
}
```
| 事件类型        | 描述                                                       |
| :-------------- | :--------------------------------------------------------- |
| AnimationEvent  | css动画                                                    |
| ClipboardEvent  | 粘贴板事件（改变input、select、textarea的值）              |
| DragEvent       | 拖放事件                                                   |
| FocusEvent      | 焦点事件                                                   |
| Form            | 元素获得事件/失去焦点时，表单元素值被改变或表单提交        |
| InvalidEvent    | 有效性失效事件，例如输入框数量现在为10，输入11个数字会触发 |
| KeyboardEvent   | 键盘输入事件                                               |
| MouseEvent      | 鼠标事件                                                   |
| TransitionEvent | Transition事件                                             |
| UIEvent         | 基本的鼠标、触碰事件                                       |
| WheelEvent      | 页面滚动事件                                               |
| SyntheticEvent  | 全部事件的基本事件（合）                                   |

#### Context
```typescript
// 编写一个名为createCtx的辅助函数，以防止访问未提供其值的Context。通过使用API​​，我们不必提供默认值，也不必检查未定义的内容
function createCtx<A extends {} | null>() {
  const ctx = React.createContext<A | undefined>(undefined);
  function useCtx() {
    const c = React.useContext(ctx);
    if (c === undefined)
      throw new Error("useCtx must be inside a Provider with a value");
    return c;
  }
  return [useCtx, ctx.Provider] as const; 
}
interface ProviderState {
  themeColor: string;
}

interface UpdateStateArg {
  key: keyof ProviderState;
  value: string;
}

interface ProviderStore {
  state: ProviderState;
  update: (arg: UpdateStateArg) => void;
}

const Context = React.createContext({} as ProviderStore); 

class Provider extends React.Component<{}, ProviderState> {
  public readonly state = {
    themeColor: "red",
  };

  private update = ({ key, value }: UpdateStateArg) => {
    this.setState({ [key]: value });
  };

  public render() {
    const store: ProviderStore = {
      state: this.state,
      update: this.update,
    };

    return (
      <Context.Provider value={store}>{this.props.children}</Context.Provider>
    );
  }
}

const Consumer = Context.Consumer;
```
#### forwardRef/createRef
```typescript
// 从“ forwardRef”获得的“ ref”是可变的，根据需要分配给它
type Props = { children: React.ReactNode; type: "submit" | "button" };
export type Ref = HTMLButtonElement;
export const FancyButton = React.forwardRef((
  props: Props,
  ref: React.Ref<Ref>
) => (
  <button ref={ref} className="MyClassName" type={props.type}>
    {props.children}
  </button>
));
```