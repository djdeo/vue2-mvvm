class MVue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    this.$options = options;

    if (this.$el) {
      // 1. 实现Observer
      new Observer(this.$data);
      // 2. 实现Compiler
      new Compile(this.$el, this);
      // 3. 数据代理
      this.proxyData(this.$data);
    }
  }

  // vm.$data => vm
  proxyData(data) {
    for (let key in data) {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(newVal) {
          data[key] = newVal;
        }
      });
    }
  }
}
