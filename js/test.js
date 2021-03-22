const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
function Promise(executor) {
  let that = this;
  that.status = PENDING;
  that.onFulfilledCallback = [];
  that.onRejectedCallBack = [];
  executor(resolve, reject);
  function resolve(value) {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }
    setTimeout(() => {
      if (that.status === PENDING) {
        that.status = FULFILLED;
        that.value = value;
        that.onFulfilledCallback.map((fn) => fn(that.value));
      }
    });
  }
  function reject(reason) {
    setTimeout(() => {
      if ((that.status = PENDING)) {
        that.status = REJECTED;
        that.reason = reason;
        that.onResolvedCallback.map((fn) => fn(that.value));
      }
    });
  }
  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
Promise.prototype.then = function (onFulfilled, onRejected) {
  let that = this;
  onFulfilled =
    typeof onFulfilled === "function" ? onFulfilled : (value) => value;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : (reason) => {
          throw reason;
        };
  return new Promise((onFulfilled, onRejected) => {
    // let fulfulled=value=>{
    //   try{
    //   }
    // }
  });
  switch (that.status) {
    case FULFILLED:
      break;
    case REJECTED:
      break;
    case PENDING:
      that.onFulfilledCallback.push(onFulfilled);
      that.onRejectedCallBack.push(onRejected);
      break;
    default:
      break;
  }
  if (that.status === FULFILLED) {
    return new Promise((resolve, reject) => {
      try {
        let ret = onFulfilled(that.value);
        if (ret instanceof Promise) {
          ret.then(resolve, reject);
        } else {
          resolve(ret);
        }
      } catch (e) {
        reject(e);
      }
    });
  } else if (that.status === REJECTED) {
    return new Promise((resolve, reject) => {
      try {
        let ret = onRejected(that.value);
        if (ret instanceof Promise) {
          ret.then(resolve, reject);
        } else {
          reject(ret);
        }
      } catch (e) {
        reject(e);
      }
    });
  } else if (that.status === PENDING) {
    that.onFulfilledCallback.push((value) => {
      try {
        let ret = onFulfilled(that.value);
        if (ret instanceof Promise) {
          ret.then(resolve, reject);
        } else {
          resolve(ret);
        }
      } catch (e) {
        reject(e);
      }
    });
    that.onRejectedCallBack.push(() => {
      setTimeout(() => {
        try {
          let ret = onRejected(that.value);
          if (ret instanceof Promise) {
            ret.then(resolve, reject);
          } else {
            reject(ret);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
  }
};

Promise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

function MyPromise(cb) {
  let success = null;
  let error = null;
  console.log(cb.toString());
  const userRet = cb(
    (...params) => (success ? success(...params) : params[0]),
    (...params) => (error ? error(...params) : params[0])
  );
  console.log(userRet);
  console.log(success, error);
  const inst = Object.assign(userRet, {
    success: (onSuccess) => {
      success = onSuccess;
      return inst;
    },
    error: (onError) => {
      error = onError;
      console.log(error);
      return inst;
    },
  });
  console.log(inst.error.toString());
  return inst;
}
MyPromise(
  (
    success = () => {
      console.log("GG");
    },
    error = () => {
      console.log("TT");
    }
  ) => {
    return new Promise((resolve, reject) => {
      console.log("S");
      setTimeout(() => resolve("10"), 3000);
    }).then((res) => {
      console.log(res);
    });
  }
);

const sendRequest = (sender) => {
  console.log(sender);
  return (url, params) => {
    console.log(url, params);
    return MyPromise((success, failed) =>
      sender(url, params)
        .then((resp) => {
          if (resp.code === 200) {
            console.log("Success");
            //   return success(resp.data);
          }
          throw resp;
        })
        .catch((e) => failed(e))
    );
  };
};

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("FULFILLED");
  }, 1000);
});
//判断是否为函数
const isFunction = (variable) => typeof variable === "function";
//promise 的三种状态
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";
//Promise
class Promise {
  constructor(handle) {
    //判断变量是否为函数
    if (!isFunction(handle)) {
      throw new Error("Promise must accept a Function as a parameter");
    }
    //状态
    this._status = PENDING;
    //值
    this._value = undefined;
    /*
      由于 then 方法支持多次调用，我们可以维护两个数组，
      将每次 then 方法注册时的回调函数添加到数组中，等待执行
      */
    //成功的回调函数
    this._fulfilledQueues = [];
    //失败的回调函数
    this._rejectedQueues = [];
    //执行handle
    try {
      handle(this._resolve.bind(this), this._reject.bind(this));
    } catch (err) {
      this._reject(err);
    }
  }
  /*
  resolve : 将Promise对象的状态从 Pending(进行中) 变为 Fulfilled(已成功)
  reject : 将Promise对象的状态从 Pending(进行中) 变为 Rejected(已失败)
  resolve 和 reject 都可以传入任意类型的值作为实参，表示 Promise 对象成功（Fulfilled）和失败（Rejected）的值
  */
  //resolve执行时的函数
  _resolve(res) {
    //当状态之前就改变过之后，不会再去改变状态
    if (this._status !== PENDING) return;
    //我们依次提取成功或失败任务队列当中的函数开始执行，
    //并清空队列，从而实现 then 方法的多次调用
    const runFulfilled = (value) => {
      let now;
      while ((now = this._fulfilledQueues.shift())) {
        now(value);
      }
    };
    const runRejected = (value) => {
      let now;
      while ((now = this._rejectedQueues.shift())) {
        now(value);
      }
    };
    /* 当 resolve 方法传入的参数为一个 Promise 对象时，
      则该 Promise 对象状态决定当前 Promise 对象的状态
      */
    if (res instanceof Promise) {
      res.then(
        (res) => {
          //将状态改为fulfilled
          this._status === FULFILLED;
          //将值存储
          this._value === res;
          runFulfilled(res);
        },
        (error) => {
          this._value = error;
          this.status = REJECTED;
          runRejected(error);
        }
      );
    } else {
      this.value = res;
      this.status = REJECTED;
      runRejected(res);
    }
    // 为了支持同步的Promise，这里采用异步调用
    setTimeout(() => run(), 0);
  }

  //reject执行时的函数
  _reject(err) {
    //当状态之前就改变过之后，不会再去改变状态
    if (this._status !== PENDING) return;
    const run = () => {
      //将状态改为reject
      this._status === REJECTED;
      //将值存储
      this._value === err;
      let now;
      while ((now = this._rejectedQueues.shift())) {
        now(err);
      }
    };
    /* 当 resolve 方法传入的参数为一个 Promise 对象时，
      则该 Promise 对象状态决定当前 Promise 对象的状态
  */

    setTimeout(() => run(), 0);
  }
  //then方法
  /*
  如果onReject和onFulfilled不是函数，则被忽略
  onFulfilled:
      onFulfilled是一个函数：
          当promise状态改变为成功时必须被调用，第一个参数为promise成功状态传入的值（resolve执行时传入的值）
          在promise状态改变前不能被使用
          调用次数不能超过1次
  onRejected:
          当promise状态改变为失败时必须被调用，第一个参数为promise成功状态传入的值（resolve执行时传入的值）
          在promise状态改变前不能被使用
          调用次数不能超过1次
  多次调用
    then 方法可以被同一个 promise 对象调用多次
      当 promise 成功状态时，所有 onFulfilled 需按照其注册顺序依次回调
      当 promise 失败状态时，所有 onRejected 需按照其注册顺序依次回调
  返回
      promise必须返回一个新的Promise的对象
  
  promise支持链式调用
      1，当onFulfilled或onRejected返回一个值为x；则下一个的Promise的解决的过程
          (1)若x不为promise，则使x直接作为新返回的Promise对象的值，即新的onFulfilled或onRejected函数的参数
              let promise1=new Promise((resolve,reject)=>{
                  resolve(1);
              })
              promise2=promise1.then(res=>{
                  return res;
              })
              promise2.then(res=>{
                  console.log(res) //1
              })
          (2)若x为Promise，这时后一个回调函数会等待Promise 对象（x）的状态的变化，才会被调用。并且新的Promise的状态和x的状态相同
              let promise1=new Promise((resolve,reject)=>{
                  resolve(1);
              })
              promise2=promise1.then(res=>{
                  return new Promise((resolve,reject)=>{
                      resolve(2);
                  })
              })
              promise2.then(res=>{
                  console.log(res) //2
              })
      2,当onFulfilled或onRejected抛出异常e,则下一个Promise必须变为Rejected并返回失败的值e
              let promise1=new Promise((resolve,reject)=>{
                  resolve(1);
              })
              let promise2=promise1.then(res=>{
                  throw new Error(2);
              })
              promise2.then(res=>{
                  console,log(res)
              },error=>{
                  console.log(error) //2
              })
      3,如果onFulfilled不是函数且状态为Fulfilled，则下一个Promise变为Fulfilled并返回前一个的值
              let promise1=new Promise((resolve,reject)=>{
                  resolve(1);
              })
              let promise2=promise1.then();
              promise2.then(res=>{
                  console.log(res) //1
              })
      4，如果onRejected不是函数且状态为Rejected，则下一个Promise变为Rejected，并返回失败的值
              let promise1=new Promise((resolve,reject)=>{
                  reject(1);
              })
              let promise2=promise.then();
              promise2.then(res=>{
                  console.log(res)
              }，error=>{
                  console.log(error)//1
              })
 */
  then(onFulfilled, onRejected) {
    //确定值和状态
    const { _value, _status } = this;
    // 返回一个新的Promise对象
    return new Promise((onFulfilledNext, onRejectedNext) => {
      //封装一个成功时执行的函数
      let fulfilled = (value) => {
        try {
          //如果不是函数
          if (!isFunction(onFulfilled)) {
            onFulfilled(value);
          }
          //是函数
          else {
            let res = onFulfilledNext(value);
            if (res instanceof Promise) {
              //如果当前的回调函数是Promise对象，必须等待它的状态发生改变后执行下一个回调
              res.then(onFulfilledNext, onRejectedNext);
            }
            //如果不是，则返回的参数直接作为参数，传入下一个then函数，并且立即执行then的回调函数
            else {
              onFulfilled(res);
            }
          }
        } catch (error) {
          onRejectedNext(error);
        }
      };
      //封装一个失败时执行的函数
      let reject = (error) => {
        try {
          //如果不是函数
          if (!isFunction(onRejected)) {
            onRejectedNext(error);
          }
          //是函数
          else {
            let res = onRejected(error);
            // 如果当前回调函数返回Promise对象，必须等待其状态改变后在执行下一个回调
            if (res instanceof Promise) {
              res.then(onFulfilledNext, onRejectedNext);
            } else {
              //返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
              onFulfilledNext(res);
            }
          }
        } catch (error) {
          onRejected(error);
        }
      };
      switch (_status) {
        //当状态为pending时，将then方法回调函数加入执行队列等待执行
        case PENDING:
          this._fulfilledQueues.push(onFulfilled);
          this._rejectedQueues.push(onRejected);
          break;
        // 当状态已经改变时，立即执行对应的回调函数
        case FULFILLED:
          onFulfilled(_value);
          break;
        case REJECTED:
          onRejected(_value);
          break;
      }
    });
  }
  catch() {
    return this.then(undefined, onRejected);
  }
  static resolve(value) {
    // 如果参数是MyPromise实例，直接返回这个实例
    if (value instanceof Promise) return value;
    return new Promise((resolve) => resolve(value));
  }
  static reject(error) {
    return new Promise((resolve, reject) => reject(error));
  }
  static all(arr) {
    return new Promise((resolve, reject) => {
      //返回值的集合
      let values = [];
      //计数
      counts = 0;
      for (let [i, p] of arr.entries()) {
        // 数组参数如果不是Promise实例，先调用Promise.resolve
        this.resolve(p).then(
          (res) => {
            values[i] = res;
            count++;
            // 所有状态都变成fulfilled时返回的MyPromise状态就变成fulfilled
            if (counts === arr.length) resolve(values);
          },
          (error) => {
            //有一个被rejected时返回的MyPromise状态就变成rejected
            reject(error);
          }
        );
      }
    });
  }
  static race(arr) {
    return new Promise((resolve, reject) => {
      for (let p of arr) {
        this.resolve(p).then(
          (res) => {
            resolve(res);
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  }
}

function delLast(str, target) {
  const reg = new RegExp(`^(.*)(${target})(.*)$`);
  return str.replace(reg, "$1$3");
}
function del(str, target) {
  let index = str.lastIndexOf(keyword);
  return index === -1
    ? str
    : str.slice(0, index) + str.slice(index + keyword.length);
}
console.log(delLast("emamamur, your string", "ur"));

function toCamel(str) {
  if (str.split("_").length === 1) return;
  return str.split("_").reduce((a, b) => {
    console.log(a, b);
    return a + b.substr(0, 1).toUpperCase() + b.substr(1);
  });
}

function remoteSymbol(str) {
  return str.replace(/[\t\n]/g, "");
}
console.log(
  remoteSymbol(
    "\t1112 2233\n_aaaaaaa\r\n_bbb bbb\t_3333 333\r_444 4444\n_555555"
  )
);

// https://segmentfault.com/a/1190000020736966?utm_source=sf-related
// https://github.com/KieSun/learn-react-essence/blob/master/%E7%83%AD%E8%BA%AB%E7%AF%87.md
// https://github.com/jsonz1993/react-source-learn/issues
// https://slides.com/xuqinggang/title-text#/0/5

const PopStateEvent = "popstate";
const HashChangeEvent = "hashchange";
/* 简化了createBrowserHistory，列出了几个核心api及其作用 */
function createBrowserHistory() {
  /* 全局history  */
  const globalHistory = window.history;
  /* 处理basename */
  const basename = props.basename
    ? stripTrailingSlash(addLeadingSlash(props.basename))
    : "";

  /* 处理路由转换，记录了listens信息 */
  const transitionManager = createTransitionManager();
  /* 改变location对象，通知组件更新 */
  const setState = () => {};
  /* 处理当path改变后，处理popstate变化的回调函数 */
  const handlePopState = () => {};
  /* history.push方法，改变路由，通过全局对象history.pushState改变url, 通知router触发更新，替换组件 */
  const push = () => {};
  /* 底层应用事件监听器，监听popstate事件 */
  const listen = () => {};
  return {
    push,
    listen,
  };
}
let listen = (listener) => {
  /* 添加监听函数到队列 */
  const unlisten = transitionManager.appendListener(listener);
  /* 添加历史记录条目的监听 */
  checkDomListeners(1);
  /* 解除监听 */
  return () => {
    checkDOMListeners(-1);
    unlisten();
  };
};
let listenerCount = 0;
let checkDomListeners = (delta) => {
  listenerCount += delta;

  if (listenerCount === 1 && delta === 1) {
    /* 添加绑定，当历史记录条数目改变的时候 */
    window.addEventListener(PopStateEvent, handlePopState);
    if (needHashChangeListener) {
      window.addEventListener(HashChangeEvent, handleHashChange);
    }
  } else if (listenerCount === 0) {
    /* 解除绑定 */
    window.removeEventListener(PopStateEvent, handleHashChange);
    if (needHashChangeListener) {
      window.removeEventListener(HashChangeEvent, handleHashChange);
    }
  }
};

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
      } else {
        window.location.href = href;
      }
    }
  );
};

let handlePopState = (event) => {
  handlePopState(getDOMLocation(event.state));
};
let forceNextPop = false;
function handlePop(location) {
  if (forceNextPop) {
    forceNextPop = false;
    setState();
  } else {
    const action = "POP";
    transitionManager.confirmTransitionTo(
      location,
      action,
      getUserConfirmation,
      (ok) => {
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