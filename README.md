
<!--#echo json="package.json" key="name" underline="=" -->
webspectator3d-collada
======================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
A simple 3D viewer for browsers.
<!--/#echo -->


* [Try it live](https://mk-pmb.github.io/webspectator3d-collada/view.html?sceneFile=../webspectator3d-examples/scenes/simple01.dae.gz)



Installation
------------

* Copy, clone, or `npm install` this project onto dumb webspace.
* Run `./build/minibundle.sh` to download and bundle required dependencies.
* Upload your model file in Collada (`.dae`) format.
* Browse the webspace directory with your model file name in the URL:
  https://example.net/webspectator3d-collada/view.html?sceneFile=mythingy.dae
* Check if everything works (it should).



First steps
-----------

### Example files

If you need example scene files, have a look at the
[`webspectator3d-examples` repo][ws3d-examples-repo].
You could clone it into `docs/examples/`.



Known issues
------------

* Needs more/better tests and docs.





<!--#toc stop="scan" -->

&nbsp;


  [ws3d-examples-repo]: https://github.com/mk-pmb/webspectator3d-examples/


License
-------
<!--#echo json="package.json" key="license" -->
ISC
<!--/#echo -->
