/**
 * Watcher 对数据变化进行监听
 */
class Watcher {
  constructor(expr, vm, cb) {
    this.expr = expr;
    this.vm = vm;
    this.cb = cb;
    this.oldVal = this.getOldVal();
  }

  getOldVal() {
    // 先拦截当前观察者
    Dep.target = this;
    const oldVal = compileUtil.getValue(this.expr, this.vm);
    // 挂载完毕需要注销，防止重复挂载（每次更新数据就会挂载）
    Dep.target = null;
    return oldVal;
  }

  update() {
    const newVal = compileUtil.getValue(this.expr, this.vm);
    if (newVal !== this.oldVal) {
      this.cb(newVal);
    }
  }
}

/**
 * Dep 类存储watcher对象，在数据变化时通知watcher
 */
class Dep {
  constructor() {
    this.watcherContainer = [];
  }
  // 追加watacher
  addDep(watcher) {
    console.log("观察者", this.watcherContainer);
    this.watcherContainer.push(watcher);
  }
  // 通知
  notify() {
    this.watcherContainer.forEach(w => w.update());
  }
}
