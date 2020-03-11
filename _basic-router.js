// routers
const Foo = { template: "<h2>Foo</h2>" };
const Bar = { template: "<h2>Bar</h2>" };
const NotFound = { template: "<h2>NotFound</h2>" };

// router table
const routerTable = {
  foo: Foo,
  bar: Bar,
  notfound: NotFound
};

// basic router
window.addEventListener("hashchange", () => {
  app.url = window.location.hash.slice(1);
});

const app = new Vue({
  el: "#oapp",
  data: {
    url: window.location.hash.slice(1)
  },
  render(h) {
    return h("div", [
      h(routerTable[this.url] || NotFound),
      h("a", { attrs: { href: "#foo" } }, "去Foo"),
      " | ",
      h("a", { attrs: { href: "#bar" } }, "去Bar")
    ]);
  }
});
