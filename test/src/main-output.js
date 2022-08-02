/* import-promotion-S */ import * as __dynamic_require2import__4__0 from './foo/foo.ts'; import * as __dynamic_require2import__4__1 from './foo/bar/bar.mjs'; import * as __dynamic_require2import__4__2 from './foo/baz/index.js'; import __dynamic_require2import__5__0 from './assets/electron.png'; import __dynamic_require2import__5__1 from './assets/react.svg'; import __dynamic_require2import__5__2 from './assets/vite.svg'; import __dynamic_require2import__5__3 from './assets/vue.png'; /* import-promotion-E */import * as foo_foo from './foo/foo'
import { msg as baz_msg } from '@/foo/baz'
import { msg as bar_bar_msg } from '@/foo/bar/bar'
const app = document.querySelector("#app");
app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
function loadFile(f) {
  return __matchRequireRuntime4__(`@/foo/${f}`);
}
function loadAssets(a) {
  return __matchRequireRuntime5__(`@/assets/${a}`);
}
console.log(foo_foo);
console.log(baz_msg);
console.log(bar_bar_msg);
console.log(loadFile("foo").msg);
console.log(loadAssets("vite.svg"));
// ---- dynamic require runtime functions --S--
function __matchRequireRuntime4__(path) {
  switch(path) {
    case '@/foo/foo':
    case '@/foo/foo.ts':
      return __dynamic_require2import__4__0;
    case '@/foo/bar/bar':
    case '@/foo/bar/bar.mjs':
      return __dynamic_require2import__4__1;
    case '@/foo/baz':
    case '@/foo/baz/index':
    case '@/foo/baz/index.js':
      return __dynamic_require2import__4__2;
    default: throw new Error("Cann't found module: " + path);
  }
}
function __matchRequireRuntime5__(path) {
  switch(path) {
    case '@/assets/electron':
    case '@/assets/electron.png':
      return __dynamic_require2import__5__0;
    case '@/assets/react':
    case '@/assets/react.svg':
      return __dynamic_require2import__5__1;
    case '@/assets/vite':
    case '@/assets/vite.svg':
      return __dynamic_require2import__5__2;
    case '@/assets/vue':
    case '@/assets/vue.png':
      return __dynamic_require2import__5__3;
    default: throw new Error("Cann't found module: " + path);
  }
}
// ---- dynamic require runtime functions --E--