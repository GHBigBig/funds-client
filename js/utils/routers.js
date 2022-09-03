class Router {
    _routers = new Map();

    /**
     * 给路径设置组件
     * @param {String} path 路径
     * @param {Object} component 组件实例
     * @param {Boolean} first 是否为首位
     */
    setRouterComponent(path, component, first) {
        if(path && component) {
            console.log(this.getRouterComponent(path), Array.isArray(this.getRouterComponent(path)))
            if(this.getRouterComponent(path) && Array.isArray(this.getRouterComponent(path))) {
                if(first) {
                    this.getRouterComponent[999] = component;
                }else {
                    this.getRouterComponent.push(component);
                }
            }else {
                if(first) {
                    let tmp = [];
                    tmp[999] = component;
                    this._routers.set(path, tmp);
                }else {
                    this._routers.set(path, new Array(component));
                }
                
            }
        }else {
            throw new Error('参数不可以为空~');
        }
    }

    /**
     * 
     * @param {String} path 路径
     * @param {Boolean} first 是否为首位
     * @returns 路径上的组件
     */
    getRouterComponent(path, first) {
        if(first) {
            if(this._routers.get(path)) {
                return this._routers.get(path)[999];
            }else {
                return undefined;
            }
        }else {
            return this._routers.get(path);
        }
    }


}
