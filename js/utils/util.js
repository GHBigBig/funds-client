/**
 * 发起 Ajax 请求
 * @param {String} url 请求的 url
 * @param {any} data 需要发送的数据
 * @param {String} method 请求方法的名称
 * @param {Boolean} urlencode 是否使用 application/x-www-form-urlencoded 格式发送数据
 * @returns Promise
 */
export function sendAjax(url, data, method = 'GET', urlencode = false) {
    return new Promise((resolve, reject) => {

        const handler = function () {
            if (this.readyState !== 4) {
                return;
            }
            if (this.status === 200) {
                resolve(this.response);
            } else {
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
        if(urlencode) {
            client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        client.send(data);
    });
}
