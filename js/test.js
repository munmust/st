function Promise(executor){
    let self=this;
    self.status='pending';
    self.data=undefined;
    self.onResolvedCallback=[];
    self.onRejectedCallBack=[];
    executor(resolve,reject);
    function resolve(value) {
        if(self.status==='pending'){
            self.status='resolved';
            self.data=value;
            for(let i=0;i<self.onResolvedCallback.length;i++){
                self.onResolvedCallback[i](value);
            }
        }
    }
    function reject(reason){
        if(self.status='pending'){
            self.status='rejected';
            self.data=reason;
            for(let i=0;i<self.onRejectedCallBack.length;i++){
                self.onRejectedCallBack[i](reason);
            }
        }
    }


    try{
        executor(resolve,reject);
    }catch(e){
        reject(e)
    }
}
Promise.prototype.then=function(onResolved,onRejected) {
    let self=this;
    let tempPromise;
    onResolved=typeof onResolved==='function'?onResolved:function(v) {
        return v;
    }
    onRejected=typeof onRejected==='function'?onRejected:function(v){
        return v;
    }
    if(self.status==='resolved'){
        return tempPromise=new Promise(function(resolve,reject){
            
        })
    }
}




function MyPromise(cb) {
    let success = null;
    let error = null;
    console.log(cb.toString());
    const userRet = cb(
      (...params) => (success ? success(...params) : params[0]),
      (...params) => (error ? error(...params) : params[0])
    );
    console.log(userRet);
    console.log(success,error);
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
  MyPromise((success=()=>{console.log("GG")},error=()=>{console.log("TT")})=>{return new Promise((resolve,reject)=>{console.log("S");setTimeout(() => resolve('10'), 3000)}).then((res)=>{console.log(res)})})
  
  
  
  
  
  const sendRequest = (sender) => {
    console.log(sender);  
    return(url, params) =>{
      console.log(url,params);
    return MyPromise((success, failed) =>
    sender(url, params)
      .then((resp) => {
        if (resp.code === 200) {
            console.log("Success")
        //   return success(resp.data);
        }
        throw resp;
      })
      .catch((e) => failed(e))
  )}
};

