/**
 * Observer 劫持对象，给属性添加get, set属性
 */
class Observer {
  constructor(data) {
    this.observe(data);
  }

  observe(data) {
    if (data && typeof data === "object") {
      Object.keys(data).forEach(key => {
        this.defineReactive(data, key, data[key]);
      });
    }
  }

  defineReactive(obj, key, value) {
    // 如果value是对象，递归观察
    this.observe(value);
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: false,
      get() {
        Dep.target && dep.addDep(Dep.target); // 订阅
        return value;
      },
      set: newVal => {
        if (newVal === value) return;
        value = newVal; // 1. 赋值
        this.observe(newVal); // 2. 修改后的值也要观察
        dep.notify(); // 3. 通知订阅者
      }
    });
  }
}
