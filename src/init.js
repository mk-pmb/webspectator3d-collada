// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const query = {};
(function parseQuery(l) {
  String(l.search + l.hash).split(/\?|#|&/).forEach(function part(p) {
    const k = (/^\w+=/.exec(p) || false)[0];
    if (!k) { return; }
    query[k.slice(0, -1)] = decodeURIComponent(p.slice(k.length));
  });
  console.debug('Query:', query);
}(window.location));

function oneLineJson(x) {
  return JSON.stringify(x, null, 2).replace(/\n */g, ' ');
}

const how = {};

(async function fallible() {
  const LIB = window.MODULES;
  const ThreeJS = LIB.get('three', 'stage2');
  const { ColladaLoader } = LIB.exJsm('loaders/ColladaLoader.js');
  const { PointerLockControls } = LIB.exJsm('controls/PointerLockControls.js');

  how.modelFileUrl = query.model;
  if (!how.modelFileUrl) { throw new Error('No model file selected.'); }

  const scene = new ThreeJS.Scene();
  scene.background = new ThreeJS.Color(0x20252b);

  const { innerWidth: sceneW, innerHeight: sceneH } = window;
  const camera = new ThreeJS.PerspectiveCamera(
    70,
    sceneW / sceneH,
    0.01,
    1e5,
  );

  camera.position.set(0, 1.7, 0);

  const renderer = new ThreeJS.WebGLRenderer({ antialias: true });
  renderer.setSize(sceneW, sceneH);
  document.body.innerHTML = ''; // Discard the "loading" message.
  document.body.appendChild(renderer.domElement);

  scene.add(new ThreeJS.HemisphereLight(0xFFFFFF, 0x444444, 2));

  const controls = new PointerLockControls(camera, renderer.domElement);
  scene.add(controls.object);
  controls.lock();

  (new ColladaLoader()).load(how.modelFileUrl,
    result => scene.add(result.scene));

  (function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }());

}()).then(null, function onFail(err) {
  document.body.innerHTML = '<h2>Error:</h2><p></p>';
  document.body.lastChild.innerText = (String(err)
    + '\nwhile rendering ' + oneLineJson(how));
});
