class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    // 1.获取文档碎片
    const fragments = this.node2Fragment(this.el);

    // 2. 编译模板
    this.compile(fragments);

    // 3. 追加到根元素
    this.el.appendChild(fragments);
  }

  compile(fragments) {
    const childNodes = fragments.childNodes;
    [...childNodes].forEach(child => {
      if (this.isElementNode(child)) {
        // 元素节点 html 标签
        this.compileElement(child);
      } else if (this.isTextNode(child)) {
        // 文本节点
        this.compileText(child);
      }

      // 递归遍历
      if (child.childNodes && child.childNodes.length) {
        this.compile(child);
      }
    });
  }

  compileElement(node) {
    const { attributes } = node;
    [...attributes].forEach(attr => {
      const { name, value } = attr;
      if (this.isDirector(name)) {
        // 处理v-
        const [, directive] = name.split("-"); // html, text, model, for
        let [compileKey, detailStr] = directive.split(":");
        // 更新数据, 驱动视图
        compileUtil[compileKey](node, value, this.vm, detailStr);
        // 删除有指令的属性
        node.removeAttribute("v-" + directive);
      } else if (this.isEventName(name)) {
        // 处理事件  v-on, @
        const [, detailStr] = name.split("@");
        compileUtil["on"](node, value, this.vm, detailStr);
        node.removeAttribute("@" + detailStr);
      }
    });
  }

  compileText(node) {
    // 编译{{}} v-text
    console.log(".....node", node.textContent);
    const { textContent } = node;
    if (/\{\{(.+?)\}\}/.test(textContent)) {
      compileUtil["text"](node, textContent, this.vm);
    }
  }

  isEventName(name) {
    return name.indexOf("@") === 0;
  }

  isDirector(attr) {
    return attr.indexOf("v-") === 0;
  }

  node2Fragment(el) {
    // 创建文档碎片
    const f = document.createDocumentFragment();
    let firstChild;
    while ((firstChild = el.firstChild)) {
      f.appendChild(firstChild);
    }
    return f;
  }

  isElementNode(node) {
    return node.nodeType == 1;
  }

  isTextNode(node) {
    return node.nodeType == 3;
  }
}

const compileUtil = {
  getContent(expr, vm) {
    return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getValue(args[1], vm);
    });
  },

  // 处理嵌套对象里面的值, person.name
  getValue(expr, vm) {
    return expr.split(".").reduce((data, currentVal) => {
      return data[currentVal];
    }, vm.$data);
  },

  setVal(expr, vm, inputVal) {
    return expr.split(".").reduce((data, currentVal) => {
      data[currentVal] = inputVal;
    }, vm.$data);
  },

  text(node, expr, vm) {
    let value;
    if (expr.indexOf("{{") !== -1) {
      value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
        // 对 {{}} 进行双向绑定
        new Watcher(args[1], vm, () => {
          this.updater.textUpdater(node, this.getContent(expr, vm));
        });
        return this.getValue(args[1], vm);
      });
    } else {
      value = this.getValue(expr, vm);
    }
    this.updater.textUpdater(node, value);
  },

  html(node, expr, vm) {
    const value = this.getValue(expr, vm);
    new Watcher(expr, vm, newVal => {
      this.updater.htmlUpdater(node, newVal);
    });
    this.updater.htmlUpdater(node, value);
  },

  model(node, expr, vm) {
    const value = this.getValue(expr, vm);
    // 数据 => 视图
    new Watcher(expr, vm, newVal => {
      this.updater.modelUpdater(node, newVal);
    });

    node.addEventListener("input", e => {
      this.setVal(expr, vm, e.target.value);
    });
    this.updater.modelUpdater(node, value);
  },

  on(node, expr, vm, eventType) {
    let fn = vm.$options.methods && vm.$options.methods[expr];
    if (eventType && fn) node.addEventListener(eventType, fn.bind(vm), false);
  },

  bind(node, expr, vm, attr) {
    // 设置属性
  },

  //视图更新函数
  updater: {
    textUpdater(node, value) {
      node.textContent = value;
    },
    htmlUpdater(node, value) {
      node.innerHTML = value;
    },
    modelUpdater(node, value) {
      node.value = value;
    }
  }
};
