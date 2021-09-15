# About three-strip

Generate strip geometry for three.js. Supports taper, twist and uvgen.

[Testbed](//ycw.github.io/three-strip/examples/testbed)

## Installation

via cdn

https://cdn.jsdelivr.net/gh/ycw/three-strip@{VERSION}/build/three-strip.js

or npm

```
$ npm i ycw/three-strip
$ npm i ycw/three-strip#{VERSION_TAG}
```

## Usage

```js
import * as THREE from "three";
import { Strip, StripGeometry, StripHelper } from "three-strip";

const curve = new THREE.LineCurve3(..);
const radius = (i, I) => 1 - i / I; // taper
const tilt = (i, I) => i / I * Math.PI; // twist
const strip = new Strip(curve, radius, tilt);

const segments = 100; 
const geom = new StripGeometry(strip, segments);
const mesh = new THREE.Mesh(geom, mat);
scene.add(mesh);

scene.add(new StripHelper(strip, segments)); // helper
```

## Docs

`Strip`

```js
strip = new Strip(curve, radius, tilt);
strip.computeFrames(nSegments); // [B,N,T,O][] (rhanded)
```

`StripGeometry` ( extends `BufferGeometry` )

```js
new StripGeometry(strip, nSegments, uvFn);
new StripGeometry(strip, [nSegments, nSubsegments, offset], uvFn);
```

`StripHelper` ( extends `LineSegments` )

```js
helper = new StripHelper(strip, nSegments, length, xColor, yColor, zColor);
helper.update();
```
