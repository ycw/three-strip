# About three-strip

Generate strip geometry for three.js. Supports taper, twist, uvgen, morph and
animation.

## Examples

- [basic usage](//ycw.github.io/three-strip/examples/basic)
- [taper and twist](//ycw.github.io/three-strip/examples/taper-and-twist)
- [uv](//ycw.github.io/three-strip/examples/uv)
- [morph](//ycw.github.io/three-strip/examples/morph)
- [animate](//ycw.github.io/three-strip/examples/animate)
- [dispose](//ycw.github.io/three-strip/examples/dispose)

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
import * as THREE from "path/to/three.js";
import { Strip } from "path/to/three-strip.js";

Strip.THREE = THREE; // Dep injection; REQUIRED

const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(1, 0, 0),
]);
const strip = new Strip(curve, 10); // 10 segments

const mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
const mesh = new THREE.Mesh(strip.geometry, mat);
scene.add(mesh);

scene.add(new Strip.Helper(strip, 0.2)); // helper (axes length = 0.2)
```

See [basic example](//ycw.github.io/three-strip/examples/basic).

## Docs

Construct a `Strip` :

```js
const strip = new Strip(
  curve, // determine strip flow
  segment, // no. of divisions
  radius = 0.5, // determine strip breadth ( =2*radius ); accept fn.
  tilt = 0.0, // determine twist ( around tangnet ); accept fn.
  uv = null, // a fn to generate uv
);

strip.geometry; // indexed buffer geometry
strip.frames; // TBN frames

strip.frames[0]; // 1st frame
strip.frames[0][0]; // 1st frame's Tangent ( Vector3 )
strip.frames[0][1]; // 1st frame's Binormal ( Vector3 )
strip.frames[0][2]; // 1st frame's Normal ( Vector3 )
```

### Segment

`segment` controls strip smoothness.

```js
// ex. 10-segment strip
const strip = new Strip(curve, 10);
```

### Radius

`radius` controls strip breadth ( breadth = 2*radius )

```js
// constant breadth of 1 (radius= .5)
new Strip(curve, 10, 0.5);

// variant breadth from 0 to 1 (radius= 0 to .5)
new Strip(curve, 10, (i, I) => i / I * 0.5);

// i : index of sample point ( 0based )
// I : sample point total - 1
// i/I : in range [0..1] included
```

### Tilt

`tilt` controls twisting ( around tangent )

```js
// twist whole strip by 90d
new Strip(curve, 10, 0.5, Math.PI / 2);

// variant twisting
new Strip(curve, 10, 0.5, (i, I) => i / I * Math.PI);
```

### Uv

`uv` is a uv generator fn. It's required to return array of 4 numbers which
represents two uv pairs, `[u0,v0, u1,v1]`, of two binormal-handles at given
sample point #`i`.

```js
// ex.
const uv = (i, I) => [0, i / I, 1, i / I];
// i : sample point index
// I : sample point total - 1
```

Use preset `Strip.UvFns[]` ( see
[example - uv](//ycw.github.io/three-strip/examples/uv) ) :

```js
// ex.
new Strip(curve, 10, .5, 0, Strip.UvFns[0]);
// which is eq. to
new Strip(curve, 10, .5, 0, (i, I) => [0, i / I, 1, i / I]);
```

Set `null` to skip creation of attribute "uv" :

```js
// ex.
new Strip(curve, 10, .5, 0, /*uv*/ null);
// or just
new Strip(curve, 10, .5, 0); // `uv` defaults to `null`

// ex.
const strip = new Strip(curve, 10, .5, 0, Strip.UvFns[0]);
strip.uv = null;
strip.geometry.hasAttribute("uv"); // -> false
```

### Morph

`.setMorphs()` to set morphs:

```js
// set
strip.setMorphs([
   { curve: .., radius: .., tilt: .. },
   { curve: .., radius: .., tilt: .. },
   ..
]);

// delete
strip.setMorphs(null);
```

( see [example - morph](//ycw.github.io/three-strip/examples/morph) )

### Helper

Construct a helper showing RHanded TBN frames :

( Do not honor morphing )

```js
// basic usage
const helper = new Strip.Helper(strip);
scene.add(helper);

// ctor params
new Strip.Helper(
  strip, // Strip instance
  length, // length of axes; defualt is 1
  xColor, // x-axis color ( for binormal ); default is '#ff0000'
  yColor, // y-axis color ( for normal ); default is '#00ff00'
  zColor, // z-axis color ( for tangent ); default is '#0000ff
);

// get colors
const colors = helper.getColors();
colors[0]; // x-axis color ( clone )
colors[1]; // y-axis color ( clone )
colors[2]; // z-axis color ( clone )

// set colors
helper.setColors("cyan", "magenta", "yellow");

// get axes length
helper.getLength();

// set axes length
helper.setLength(0.5);

// update helper if strip properties changed
// ex.
strip.tilt += Math.PI / 4;
helper.update();
```

## Setting Properties

Use setters :

```js
strip.curve = .. 
strip.segment = ..
strip.radius = ..
strip.tilt = ..
strip.uv = ..
```

Use `.setProps()` :

```js
strip.setProps( 
   /*curve*/ ..,
   /*segment*/ ..,
   /*radius*/ ..,
   /*tilt*/ ..,
   /*uv*/ ..
);

// pass `undefined` to imply 'keep it unchanged'
// ex.
strip.setProps(undefined, 10, strip.radius * 2, 0);
```

## Optimization

Set multiple properties in one go by `.setProps()`, which computes `.geometry`
at most once :

( see [example - animate](//ycw.github.io/three-strip/examples/animate) )

```js
// slower ( will compute .geometry twice )
strip.radius *= 2;
strip.tilt += 0.01;

// faster ( will compute .geometry once )
strip.setProps(
  /*curve*/ undefined,
  /*segment*/ undefined,
  strip.radius * 2,
  strip.tilt + 0.01,
  /*uv*/ undefined,
);
```

## Proper Disposal

```js
// given

let strip = new Strip(curve);
let mesh = new THERE.Mesh(strip.geometry);
let helper = new Strip.Helper(strip);
scene.add(mesh);
scene.add(helper);

// then, dispose

scene.remove(mesh);
mesh = null;

strip.dispose(); // dispose `strip.geometry`; unref ALL passed object refs.
strip = null;

scene.remove(helper);
helper.dispose(); // dispose `helper.geometry` and `helper.material`
helper = null;
```

( see [example - dispose](//ycw.github.io/three-strip/examples/dispose) )

## Build

To build for different targets, config tsconfig.json :

( current build is targeting "ESNext" )

```json
{
  "compilerOptions": {
    "target": "ESNext"
  }
}
```

Then, run

```
$ npm run build
```
