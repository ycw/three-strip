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

`uv` is a uv gen fn.

```js
// fact: Each sample point has 2 handles which span across +-binormal

// Uv fn must return arr of 4 numbers which represents
// two uv pairs [u0,v0, u1,v1]

// u0,v0 : texcoords of +ve handle at sample point #i
// v1,v1 : texcoords of -ve handle at sample point #i

// ex.
new Strip(curve, 10, .5, 0, (i, I) => [0, i / I, 1, i / I]);
```

Strip has 4 pre-defined uv fns hosted at `Strip.UvFns` :

( [browse](//ycw.github.io/three-strip/examples/uv) )

```js
// ex. use pre defined uv fn
new Strip(curve, 10, .5, 0, Strip.UvFns[0]);
```

Set `uv` to `null` if you don't need it:

```js
new Strip(curve, 10, .5, 0, /*uv*/ null); // defualt is null
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

Construct a helper show RHand TBN frames :

( do not honor morphing )

```js
// basic usage:
scene.add(new Strip.Helper(strip));

// optional params:
const helper = new Strip.Helper(
  strip,
  1, // axes length
  "#ff0000", // x-axis ( binormal )
  "#00ff00", // y-axis ( normal )
  "#0000ff", // z-axis ( tangent )
);

// set colors
helper.setColors("cyan", "magenta", "yellow");

// set axes length
helper.setLength(0.5);

// update helper if strip props ( curve, segment and tilt ) changed
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

// Pass `undefined` to imply 'keep it unchanged';
// ex: just update radius and tilt. 
strip.setProps(undefined, undefined, strip.radius*2, 0, undefined);
```

( `.setProps()` re-calc `.geometry` at most once, see Optimization )

## Optimization

Set multiple props in one go by `setProps()` :

( see example - [animate](//ycw.github.io/three-strip/examples/animate) )

```js
const strip = new Strip( .. )

// slower ( will update .geometry twice ) 
strip.radius *= 2
strip.tilt += 0.01

// faster ( will update .geometry once )
strip.setProps(
   /*curve*/ undefined,
   /*segment*/ undefined,
   strip.radius * 2,
   strip.tilt + 0.01,
   /*uv*/ undefined
)
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

( see [example - dispose](examples/dispose) )

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
