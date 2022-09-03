export const hostName = 'http://101.42.249.107:5000';

/**
 * 发起 Ajax 请求
 * @param {String} url 请求的 url
 * @param {any} data 需要发送的数据
 * @param {String} method 请求方法的名称
 * @param {Map} headers 需要设置的请求头
 * @returns Promise 如果服务器可达，但是请求失败（其他的状态码）就返回状态码
 */
export function sendAjax(url, data, method = 'GET', headers) {
    return new Promise((resolve, reject) => {

        const handler = function () {
            if (this.readyState !== 4) {
                return;
            }
            if (this.status === 200) {
                resolve(this.response);
            } else if(this.status === 401){ //认证失败，清除之前的认证信息
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('token');
                reject(401);
            }else {
                console.log(`statusText: ${this.statusText}`);
                reject(new Error(this.statusText));
            }
        }
    
        const client = new XMLHttpRequest();
        client.open(method, url);
        client.onreadystatechange = handler;
        client.onerror = e => console.log(`onerror: ${JSON.stringify(e)}`);
        client.responseType = "json";
        client.setRequestHeader("Accept", "applicatioin/json");
        
        headers?.forEach((v, k) => {
            client.setRequestHeader(k, v);
        });

        client.send(data);
    });
}


/**
 * 
 * @param {Function} func 进行防抖处理的函数
 * @param {Number} wait 等待的事件单位未毫秒
 * @returns 进行防抖处理的函数的闭包
 */
export function debounce(func, wait) {
    let timeout;
  
    return function () {
      let context = this; //保存 this 指向
      let args = arguments; //拿到 event 对象
  
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    }
}
  

/**
 * 
 * @param {String} pathname 路径名称
 */
export function changeUrl(pathname) {
    window.history.pushState(null, null, pathname);
}

/**
 * 根据 sessionStorage 中的 user 键是否存在，判断受否登录
 * /login 和 /register 排除在外
 * @returns true 代表已经登录，false代表未登录
 */
export function checkLoginStatus() {
    if(['/login','/register'].includes(location.pathname)) {
        return true;
    }
    return !!sessionStorage.getItem('user');
}

/**
 * yyyy-mm-dd hh:mm
 * @param {Date} data 
 */
export function dateTimeToString(date) {
    return date.toISOString().slice(0, 23).replace('T', ' ');
}