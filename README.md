
<!--#echo json="package.json" key="name" underline="=" -->
webspectator3d-collada
======================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
A simple 3D viewer for browsers.
<!--/#echo -->



Installation
------------

* Copy, clone, or `npm install` this project onto dumb webspace.
  * In case you don't want to (or cannot) use `npm install`,
    you can instead run the GitHub Actions CI tests to generate a bundle
    that you can then download and extract onto your webspace.
* Upload your model file in Collada (`.dae`) format.
* Browse the webspace directory with your model file name in the URL:
  https://your-server.example.net/webspectator3d-collada/?model=mycoolmodel.dae
* Check if everything works (it should).



Known issues
------------

* Needs more/better tests and docs.





<!--#toc stop="scan" -->

&nbsp;


License
-------
<!--#echo json="package.json" key="license" -->
ISC
<!--/#echo -->
