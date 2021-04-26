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
```javascript
interface FUNType {
  <T extends LengthType>(list: T[], func: (item: T) => boolean): T | null
}
const FUN: FUNType = function (list, func) {
  return list.FUN(func)
}

// 使用时指定具体类型
FUN<number>([1,2,3], item => item > 2)

```