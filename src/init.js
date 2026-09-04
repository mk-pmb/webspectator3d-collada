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
  how.modelFileUrl = query.model;
  if (!how.modelFileUrl) { throw new Error('No model file selected.'); }

}()).then(null, function onFail(err) {
  document.body.innerHTML = '<h2>Error:</h2><p></p>';
  document.body.lastChild.innerText = (String(err)
    + '\nwhile rendering ' + oneLineJson(how));
});
