// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const LIB = window.MODULES;
const ThreeJS = LIB.get('three');
const { ColladaLoader } = LIB.exJsm('loaders/ColladaLoader.js');
const { PointerLockControls } = LIB.exJsm('controls/PointerLockControls.js');


const plumbing = {};

const EX = { // exports namespace

  config: {
    clipDistFar: 10e5,
    clipDistNear: 10e-5,
    fieldOfViewDeg: 70,
    playerEast: 0,
    playerEyeHeightOffset: 1.7,
    playerFeetHeight: 0,
    playerNorth: 0,
    sceneFile: '',
    renderer: 'gl',
  },


  getPlumbing() { return plumbing; },
  oneLineJson(x) { return JSON.stringify(x, null, 2).replace(/\n */g, ' '); },
  numRgx: /^(?:\+|\-|0x|)\d*(?:\.\d*|)(?:[Ee][\+\-]?\d+)$/,


  parseQueryString(qs, dest) {
    if (qs.href) { return EX.parseQueryString(qs.search + qs.hash, dest); }
    const q = (dest || {});
    String(qs).split(/\?|#|&/).forEach(function part(p) {
      const k = /^\w+(?==)/.exec(p)?.[0];
      if (!k) { return; }
      let v = decodeURIComponent(p.slice(k.length + 1));
      if (Number.isFinite(q[k])) { v = +v; }
      q[k] = v;
    });
    return q;
  },


  async startup() {
    const cfg = EX.config;
    EX.parseQueryString(window.location, cfg);
    if (!cfg.sceneFile) { throw new Error('No scene file selected.'); }

    plumbing.scene = new ThreeJS.Scene();
    EX.startDownloadingSceneFile(cfg.sceneFile);
    EX.installRenderer();
  },


  makeRenderer: Object.assign(function m(r) {
    return m[r]();
  }, {
    gl() { return new ThreeJS.WebGLRenderer({ antialias: true }); },
    // css() { return new ThreeJS.CSS3DRenderer({ antialias: true }); },
  }),


  installRenderer() {
    const { scene } = plumbing;
    const cfg = EX.config;
    const sceneW = window.innerWidth;
    const sceneH = window.innerHeight;
    const renderer = EX.makeRenderer(cfg.renderer);
    plumbing.renderer = renderer;
    renderer.setSize(sceneW, sceneH);
    const aspectRatio = sceneW / sceneH;
    const perspCamera = new ThreeJS.PerspectiveCamera(cfg.fieldOfViewDeg,
      aspectRatio, cfg.clipDistNear, cfg.clipDistFar);
    plumbing.perspCamera = perspCamera;
    perspCamera.position.set(0, 0, 0); // Will be moved by playerCamera later.

    document.body.innerHTML = ''; // Discard the "loading" message.
    document.body.appendChild(renderer.domElement);
    setTimeout(function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, perspCamera);
    }, 1);

    scene.background = new ThreeJS.Color(0x00AAFF);
    scene.add(new ThreeJS.HemisphereLight(0xFFFFFF, 0x444444, 2));

    const ctrl = new PointerLockControls(perspCamera, renderer.domElement);
    EX.controls = ctrl;
    EX.playerCamera = ctrl.object;
    // scene.add(EX.playerCamera);
    EX.playerCamera.position.set(0, 1.7, 0);
    // ctrl.lock();
  },


  startDownloadingSceneFile(srcUrl) {
    const ld = new ColladaLoader();
    ld.parsePlainXmlCollada = ld.parse;
    ld.parse = function upgradedParseCollada(origData, path) {
      const bufView = new Uint8Array(origData);
      let data = origData;
      const isGzipped = ((bufView[0] === 0x1F) && (bufView[1] === 0x8B));
      if (isGzipped) { data = window.pako.ungzip(bufView); }
      const xml = (new TextDecoder('utf-8')).decode(data);
      return ld.parsePlainXmlCollada(xml, path);
    };

    /* Unfortunately the ColladaLoader doesn't offer an easy way to configure
      the FileLoader it creates, so in order to get access to that loader,
      we'll monkey-patch one of the methods that ColladaLoader will call. */
    const pt = ThreeJS.FileLoader.prototype;
    const origSetPath = pt.setPath;
    pt.setPath = function setPathAndConfigure(path) {
      const fileLoader = this;
      origSetPath.call(fileLoader, path);
      fileLoader.setResponseType('arraybuffer');
    };
    console.debug('calling monkey-patched load:');
    ld.load(srcUrl, result => plumbing.scene.add(result.scene));
    pt.setPath = origSetPath;
  },

};


EX.startup().then(null, function onFail(err) {
  document.body.innerHTML = '<h2>Error:</h2><p></p>';
  document.body.lastChild.innerText = (String(err)
    + '\nwhile rendering ' + EX.oneLineJson(EX.config));
});


if (globalThis?.module?.exports) { globalThis.module.exports = EX; }
