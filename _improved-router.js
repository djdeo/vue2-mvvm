/**
 * handle router like
 * '#/foo/123' => foo with id:123
 */
// routers
const Foo = { props: ["id"], template: "<h2>Foo id:{{id}} </h2>" };
const Bar = { template: "<h2>Bar</h2>" };
const NotFound = { template: "<h2>NotFound</h2>" };

// router table
const routerTable = {
  "/foo/:id": Foo,
  "/bar": Bar
};

// 编译路由
const compiledRoutes = [];
Object.keys(routerTable).forEach(path => {
  const dynamicSegments = [];
  const regex = pathToRegexp(path, dynamicSegments);
  const component = routerTable[path];
  compiledRoutes.push({
    component,
    regex,
    dynamicSegments
  });
});

console.log("compiledRoutes=>", compiledRoutes);

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
    const path = "/" + this.url;

    let componentToRender;
    let props = {};

    compiledRoutes.some(route => {
      const match = route.regex.exec(path);
      console.log("math=>", match);
      componentToRender = NotFound;
      if (match) {
        componentToRender = route.component;
        route.dynamicSegments.forEach((segment, index) => {
          props[segment.name] = match[index + 1];
        });
        return true;
      }
    });

    return h("div", [
      h(componentToRender, { props }),
      h("a", { attrs: { href: "#foo/234" } }, "去Foo-234"),
      " | ",
      h("a", { attrs: { href: "#foo/123" } }, "去Foo-123"),
      " | ",
      h("a", { attrs: { href: "#bar" } }, "去Bar")
    ]);
  }
});
