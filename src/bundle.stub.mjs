const MODULES = globalThis.MODULES || {};
Object.assign(MODULES, (!!MODULES.get) || {
  register(id, factory) {
    if (!MODULES[id]) { MODULES[id] = {}; }
    // console.debug('[modules] Registering:', id);
    factory(MODULES[id]);
    // const nBindings = Object.keys(MODULES[id]).length;
    // console.debug('[modules] Registered.', { nBindings });
  },
  get(id, trace) {
    const m = MODULES[id];
    if (m) { return m; }
    const e = ('Unknown module id ' + id
      + ' @ ' + (trace || '?unknown?'));
    throw new Error(e);
  },
  exJsm(sub, tr) { return MODULES.get('three/examples/jsm/' + sub, tr); },
  partial(names, trace, from) {
    const p = {};
    const f = MODULES.get(from, trace);
    const u = [];
    String(names).replace(/\w+/g, (k) => {
      const x = f[k];
      if (x === undefined) { return u.push(k); }
      p[k] = x;
    });
    if (!u.length) { return p; }
    const e = ('Some bindings imported from ' + from + ' are undefined (n='
      + u.length + '): ' + u.join(', ') + ' @ ' + (trace || '?unknown?'));
    throw new TypeError(e);
  },
});
globalThis.MODULES = MODULES;
