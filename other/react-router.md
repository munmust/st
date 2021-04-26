# React-Router

##	history的路由
当url改变时，触发history，调用事件监听popstate事件，触发回调函数handlePopState，触发history下的setState方法，产生新的location对象，然后通知Router组件更新location并通过context上下文传递，switch通过传递的更新流，匹配出符合的Route，最后route组件取出context的内容传递给渲染页面渲染更新
当我们调用history.push方法，首先调用history的push方法，通过history.pushState来改变当前url，接下来触发history下面的setState方法
通过history.pushState()进行URL的修改
history.pushState(state,title,path)
-	state：状态
-	title：新页面的标题
-	path：新的网址
***
history.replaceState(state,title,path)
会改变当前history对象记录
-	state：状态
-	title：新页面的标题
-	path：新的网址
***
通过window.addEventListener('popstate',callback)来监听前进后退事件
window.addEventListener('popstate',()=>{})
当history出现变化时，会触发popstate事件
***
> 用 history.pushState() 或者 history.replaceState() 不会触发 popstate 事件

>	popstate 事件只会在浏览器某些行为下触发, 比如点击后退、前进按钮或者调用 history.back()、history.forward()、history.go()方法
##	hash的路由
	通过window.location进行url修改
	通过window.addEventListener('hashChange',callback)来监听url变化

##	history	
###	createBrowserHistory
```javascript
/* popstate 和hashchange是监听路由变化底层方法 */
const PopStateEvent='popstate';
const HashChangeEvent='hashchange';
/* 简化了createBrowserHistory，列出了几个核心api及其作用 */
function createBrowserHistory(){
  /* 全局history  */
  const globalHistory=window.history;
  /
	
	/* 处理路由转换，记录了listens信息 */
  const transitionManager=createTransitionManager();

  /* 改变location对象，通知组件更新 */
  const setState=()=>{}
  /* 处理当path改变后，处理popstate变化的回调函数 */
  const handlePopState=()=>{}
  /* history.push方法，改变路由，通过全局对象history.pushState改变url, 通知router触发更新，替换组件 */
  const push=()=>{}
  /* 底层应用事件监听器，监听popstate事件 */
  const listen=()=>{};
  return {
    push,
    listen
  }
}
```
####	setState
统一每一个transitionManager管理的listener路由状态
```javascript
	const setState= (nextState) => {
		/* 合并信息 */
		Object.assign(history,nextState);
		history.length=globalHistory.length;
		/* 通知每一个listens 路由已经发生变化 */
    transitionManager.notifyListeners(
      history.location,
      history.action
    )
	}
```
####	listen
通过checkedDOMListener的参数1或-1来绑定或解绑popstate事件
```javascript
	let listen = (listener) => {
  /* 添加监听函数到队列 */
  const unlisten=transitionManager.appendListener(listener);
  /* 添加历史记录条目的监听 */
  checkDomListeners(1)
  /* 解除监听 */
  return () => {
    checkDOMListeners(-1)
    unlisten()
  }
};
let listenerCount = 0;
let checkDomListeners = (delta) => {
  listenerCount+=delta;

  if(listenerCount===1&&delta===1){
    /* 添加绑定，当历史记录条数目改变的时候 */
    window.addEventListener(PopStateEvent,handlePopState);
    if(needHashChangeListener){
      window.addEventListener(HashChangeEvent,handleHashChange);
    }
  }else if(listenerCount===0){
    /* 解除绑定 */
    window.removeEventListener(PopStateEvent,handleHashChange);
    if(needHashChangeListener){
      window.removeEventListener(HashChangeEvent,handleHashChange);
    }
  }
};
```
####	push
首先生成一个新的location对象，然后通过window.history.pushState方法修改浏览器当前路由（path），最后通过setState通知React-Router更新，并且传递当前location对象。由于url的变化是history.pushState参生，并不会出发popState方法，所以需要手动setState，触发组件更新。
```javascript
let push = (path, state) => {
  const action = "PUSH";
  /* 创建一个新的location */
  const location = createLocation(path, state, createKey, history.location);
  /* 确定是否能进行路由转换，还在确认的时候又开始了另一个转变 ,可能会造成异常 */
  transitionManager.confirmTransitionTo(
    location,
    action,
    getUserConfirmation,
    (ok) => {
      if (!ok) return;
      /* 获取当前路径名 */
      const href = createHref(location);
      const { key, state } = location;
      if (canUseHistory) {
        globalHistory.pushState({ key, state }, null, href);
        /* 强制刷新 */
        if (forceRefresh) {
          window.location.href = href;
        } else {
          const prevIndex = allKeys.indexOf(history.location.key);
          const nextKeys = allKeys.slice(
            0,
            prevIndex === -1 ? 0 : prevIndex + 1
          );

          nextKeys.push(location.key);
          allKeys = nextKeys;

          /* 改变 react-router location对象, 创建更新环境 */
          setState({ action, location });
        }
      }else {
        window.location.href=href;
      }
    }
  );
};
```
####	handlePopState
判断action为pop，之后执行setState，重新加载组件
```javascript

let handlePopState = (event) => {
  handlePopState(getDOMLocation(event.state));
};
let forceNextPop = false;
function handlePop(location){
  if (forceNextPop) {
    forceNextPop = false;
    setState();
  } else {
    const action = "POP";
    transitionManager.confirmTransitionTo(
      location,
      action,
      getUserConfirmation,
      ok => {
        if (ok) {
          setState({ action, location });
        } else {
          revertPop(location);
        }
      }
    );
  }
}

function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    return {};
  }
}
/**
 * 处理state参数和window.location
 * @param historyState
 * @returns {{hash, key, pathname, search, state}}
 */
function getDOMLocation(historyState) {
  const { key, state } = historyState || {};
  const { pathname, search, hash } = window.location;

  let path = pathname + search + hash;

  // 保证path是不包含basename的
  if (basename) path = stripBasename(path, basename);

  // 创建history.location对象
  return createLocation(path, state, key);
}

```
###	createHashHistory
####	listen
hashchange来监听hash路由的变化
```javascript
function listen(listener) {
  const unlisten = transitionManager.appendListener(listener);
  checkDOMListeners(1);

  return () => {
    checkDOMListeners(-1);
    unlisten();
  };
}

let listenerCount = 0;
function checkDOMListeners(delta) {
  listenerCount += delta;

  if (listenerCount === 1 && delta === 1) {
    window.addEventListener(HashChangeEvent, handleHashChange);
  } else if (listenerCount === 0) {
    window.removeEventListener(HashChangeEvent, handleHashChange);
  }
}
```
####	push
调用window.location.hash 
```javascript
function setState(nextState) {
  Object.assign(history, nextState);
  history.length = globalHistory.length;
  transitionManager.notifyListeners(history.location, history.action);
}

function push(path, state) {
  warning(state === undefined, "Hash history cannot push state; it is ignored");

  const action = "PUSH";
  const location = createLocation(path, undefined, undefined, history.location);

  transitionManager.confirmTransitionTo(
    location,
    action,
    getUserConfirmation,
    (ok) => {
      if (!ok) return;

      const path = createPath(location);
      const encodedPath = encodePath(basename + path);
      const hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        ignorePath = path;
        pushHashPath(encodedPath);
        const prevIndex = allPaths.lastIndexOf(createPath(history.location));
        const nextPaths = allPaths.slice(
          0,
          prevIndex === -1 ? 0 : prevIndex + 1
        );
        nextPaths.push(path);
        allPaths = nextPaths;
        setState({ action, location });
      } else {
        setState();
      }
    }
  );
}
function pushHashPath(path) {
  window.location.hash = path;
}
```
####	replace
调用window.location.replace
```javascript
	function replace(path, state) {
  const action = "REPLACE";
  const location = createLocation(
    path,
    undefined,
    undefined,
    history.location
  );
  transitionManager.confirmTransitionTo(
    location,
    action,
    getUserConfirmation,
    ok => {
      if (!ok) return;
      const path = createPath(location);
      const encodedPath = encodePath(basename + path);
      const hashChanged = getHashPath() !== encodedPath;
      if (hashChanged) {
        ignorePath = path;
        replaceHashPath(encodedPath);
      }
      const prevIndex = allPaths.indexOf(createPath(history.location));
      if (prevIndex !== -1) allPaths[prevIndex] = path;
      setState({ action, location });
    }
  );
}
function replaceHashPath(path) {
  const hashIndex = window.location.href.indexOf("#");
  window.location.replace(
    window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + "#" + path
  );
}
```

!["history"]("../assets/history.PNG","history");
##	Router接收location变化，派发更新流
把history location等路由信息传递下去
初始化绑定listen，路由变化，通知该百年location，改变组件。react的history路由状态是保存在React.Content上下文之间, 
一个项目应该有一个根Router ， 来产生切换路由组件之前的更新作用。 如果存在多个Router会造成，会造成切换路由，页面不更新的情况
```javascript
import React from "react";

import RouterContext from "./RouterContext";

//获取history、location、match...
function getContext(props, state) {
  return {
    history: props.history,
    location: state.location,
    match: Router.computeRootMatch(state.location.pathname),
    staticContext: props.staticContext
  };
}

class Router extends React.Component {
  //定义Router组件的match属性字段
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
    /*
     * path: "/", // 用来匹配的 path
     * url: "/", // 当前的 URL
     * params: {}, // 路径中的参数
     * isExact: pathname === "/" // 是否为严格匹配
     */
  }
  
  constructor(props) {
    super(props);

    this.state = {
      location: props.history.location
    };
    //监听路由的变化并执行回调事件，回调内setState
    this.unlisten = props.history.listen(location => {
      this.setState({ location });
        /*
         *hash: "" // hash
         *key: "nyi4ea" // 一个 uuid
         *pathname: "/explore" // URL 中路径部分
         *search: "" // URL 参数
         *state: undefined // 路由跳转时传递的 state
        */
    });
  }

  componentWillUnmount() {
    //组件卸载时停止监听
    this.unlisten();
  }

  render() {
    const context = getContext(this.props, this.state);

    return (
      <RouterContext.Provider
        children={this.props.children || null}
        value={context}<!--借助 context 向 Route 传递组件-->
      />
    );
  }
}
export default Router;
```
## Switch
根据router更新六，来渲染当前组件
找到与当前path匹配的组件进行渲染，通过pathname和组件的path进行匹配，找到符合path的router组件
```javascript
	class Switch extends React.Component {
  render() {
    return (
      <RouterContext.Consumer>
        {/* 含有 history location 对象的 context */}
        {context => {
          invariant(context, 'You should not use <Switch> outside a <Router>');
          const location = this.props.location || context.location;
          let element, match;
          //我们使用React.Children.forEach而不是React.Children.toArray（）.find（）
          //这里是因为toArray向所有子元素添加了键，我们不希望
          //为呈现相同的两个<Route>s触发卸载/重新装载
          //组件位于不同的URL。
          //这里只需然第一个 含有 match === null 的组件
          React.Children.forEach(this.props.children, child => {
            if (match == null && React.isValidElement(child)) {
              element = child;
              // 子组件 也就是 获取 Route中的 path 或者 rediect 的 from
              const path = child.props.path || child.props.from;
              match = path
                ? matchPath(location.pathname, { ...child.props, path })
                : context.match;
            }
          });
          return match
            ? React.cloneElement(element, { location, computedMatch: match })
            : null;
        }}
      </RouterContext.Consumer>
    );
  }
}
/* 匹配路由 */
function matchPath(pathname, options = {}) {
  if (typeof options === "string" || Array.isArray(options)) {
    options = { path: options };
  }

  const { path, exact = false, strict = false, sensitive = false } = options;

  const paths = [].concat(path);

  return paths.reduce((matched, path) => {
    if (!path && path !== "") return null;
    if (matched) return matched;

    const { regexp, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });
    const match = regexp.exec(pathname);
    /* 匹配不成功，返回null */
    if (!match) return null;

    const [url, ...values] = match;
    const isExact = pathname === url;

    if (exact && !isExact) return null;

    return {
      path, // the path used to match
      url: path === "/" && url === "" ? "/" : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}
```


##	Route
匹配path渲染组件
作为路由组件的容器,可以根据将实际的组件渲染出来。
通过RouterContext.Consume 取出当前上一级的location,match等信息。作为prop传递给页面组件。使得我们可以在页面组件中的props中获取location ,match等信息
```javascript
class Route extends React.Component {
  render() {
    return (
      <RouterContext.Consumer>
        {context => {
          /* router / route 会给予警告警告 */
          invariant(context, "You should not use <Route> outside a <Router>");
          // computedMatch 为 经过 swich处理后的 path
          const location = this.props.location || context.location;
          const match = this.props.computedMatch 
            ? this.props.computedMatch // <Switch> already computed the match for us
            : this.props.path
            ? matchPath(location.pathname, this.props)
            : context.match;
          const props = { ...context, location, match };
          let { children, component, render } = this.props;

          if (Array.isArray(children) && children.length === 0) {
            children = null;
          }

          return (
            <RouterContext.Provider value={props}>
              {props.match
                ? children
                  ? typeof children === "function"
                    ? __DEV__
                      ? evalChildrenDev(children, props, this.props.path)
                      : children(props)
                    : children
                  : component
                  ? React.createElement(component, props)
                  : render
                  ? render(props)
                  : null
                : typeof children === "function"
                ? __DEV__
                  ? evalChildrenDev(children, props, this.props.path)
                  : children(props)
                : null}
            </RouterContext.Provider>
          );
        }}
      </RouterContext.Consumer>
    );
  }
}
```




!["history"]("../assets/history.PNG","history");

参考：https://juejin.cn/post/6886290490640039943


## Hooks
### useHistory
可以使用history
```javascript
import { useHistory } from "react-router-dom";

function HomeButton() {
  let history = useHistory();

  function handleClick() {
    history.push("/home");
  }

  return (
    <button type="button" onClick={handleClick}>
      Go home
    </button>
  );
}
```
### useLocation
可以返回一个url的location对象，url修改就会返回一个新的location对象
```javascript
import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  useLocation
} from "react-router-dom";

function usePageViews() {
  let location = useLocation();
  React.useEffect(() => {
    ga.send(["pageview", location.pathname]);
  }, [location]);
}

function App() {
  usePageViews();
  return <Switch>...</Switch>;
}

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  node
);
```
###












