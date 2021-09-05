# About three-strip

Generate strip geometry for three.js. Supports taper, twist, uvgen, morph and animation.

## Examples

- [basic usage](//ycw.github.io/three-strip/examples/basic)
- [taper and twist](//ycw.github.io/three-strip/examples/taper-and-twist)
- [uv](//ycw.github.io/three-strip/examples/uv)
- [morph](//ycw.github.io/three-strip/examples/morph)
- [animate](//ycw.github.io/three-strip/examples/animate)

## Installation

via cdn

https://cdn.jsdelivr.net/gh/ycw/three-strip@{VERSION}/build/three-strip.js

via npm

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

`Strip` constructor:

```js
new Strip(
   curve,         // determine the flow
   segment,       // no. of divisions 
   radius = 0.5,  // breadth
   tilt = 0.0,    // twist
   uv = null      // a fn to generate uv
)
```

A strip contains a geometry and TBN frames

```js
const strip = new Strip( .. )
strip.geometry   // an indexed buffer geometry
strip.frames     // TBN frames

strip.frames[0][0] // first frame's Tangent ( Vector3 )
strip.frames[0][1] // first frame's Binormal ( Vector3 )
strip.frames[0][2] // first frame's Normal ( Vector3 )
```


Basic usage:

```js
// make a 10-segment strip
const strip = new Strip(curve, 10)
```

Control breadth by `radius` : 

( breadth is `2 * radius` )

```js
// constant breadth of 1 (radius=.5)
new Strip(curve, 10, 0.5) 

// variant breadth from 0 to 2 (radius=0 to 1) 
new Strip(curve, nSegment, (i, I) => i / I) 

// i : index of sample point ( 0based )
// I : sample point total - 1
// i/I : in range [0..1] included
``` 

Control twisting by `tilt` ( around tangent ) :

```js
// twist whole strip by 90d 
new Strip(curve, 10, 0.5, Math.PI / 2)

// variant twisting
new Strip(curve, 10, 0.5, (i, I) => i / I * Math.PI)
```

Set UV by `uv` : 

( [explore](//ycw.github.io/three-strip/examples/uv) pre-defined uv fns )

```js
// use pre-defined uv fns
new Strip(curve, 10, 0.5, 0, Strip.UvFns[0])

// which is eq. to
new Strip(curve, 10, 0.5, 0, (i, I) => [0, i/I, 1, i/I])

// ---
// Uv fn must return arr of 4 numbers, which represents 
// two uv pairs [ u0, v0, u1, v1 ].

// 1st pair(u0,v0) for the 1st handle of #i sample point
// 2nd pair(u1,v1) for the 2nd handle of #i sample point

// Each sample point has 2 handles which span across +-binormal
// ( 1st handle refers to the one at +ve binormal )
```

Morphing by `setMorphs()` : 

( see example - [morph](//ycw.github.io/three-strip/examples/morph) )

```js
const strip = new Strip( .. )

// set
strip.setMorphs([
   { curve: .., radius: .., tilt: .. },
   { curve: .., radius: .., tilt: .. },
   ..
])

// delete
strip.setMorphs(null)
```

Show TBN frames by `Strip.Helper()` :

( do not honor morphing )

```js
// basic usage:
scene.add(new Strip.Helper(strip))

// optional params:
const helper = new Strip.Helper(
   strip, 
   1,         // axes length
   '#ff0000', // x-axis ( binormal )
   '#00ff00', // y-axis ( normal )
   '#0000ff', // z-axis ( tangent )
)

// set colors
helper.setColors('cyan', 'magenta', 'yellow')

// set axes length
helper.setLength(0.5)

// update helper if strip props changed
strip.radius *= 2
helper.update()

// dispose 
helper.dispose()
```

## Optimization

Set multiple props in one go by `setProps()` :

( see example - [set props in render loop](//ycw.github.io/three-strip/examples/animate) )

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

## Build

To build for different targets, config tsconfig.json :

```json
{
   "compilerOptions": {
      "target": "ES2015" 
   }
}
```

Then, run 

```
$ npm run build
```
