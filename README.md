# About three-strip

Generate strip geometry for three.js. Supports taper, twist, dasharray and
uvgen.

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

scene.add(new StripHelper(strip, segments));
```

## Docs

`Strip`

```ts
new (curve, radius?, tilt?);
// curve: 3d curve or curvepath
// radius: half breadth
// tilt: twist angle (in radian) around tangent
```

- `.curve`
- `.radius`
- `.tilt`
- `.computeFrames(nSeg)` : Get r-handed coords frames.



---
`StripGeometry` ( extends `BufferGeometry` )

```ts
new (strip, nSeg, uvFn?);
new (strip, [nSeg, dashArray?, dashOffset?], uvFn?);
// nSeg: segment count ( +ve int )
// dashArray: dash-gap list ( +ve ints )
// dashOffset: dash offset ( int )
// uvFn: uvgen fn ( see UvPreset )
```

Ex. dashed strip

```ts
new StripGeometry(strip, [10, [1, 2, 3]]);
// since dashArray has odd number of values, it's repeated
// to yield even number of values, i.e. [1,2,3,1,2,3]
```



---
`StripHelper` ( extends `LineSegments` )

```ts
new (strip, segments, size?, xColor?, yColor?, zColor?);
```

- `.strip`
- `.segments` : segment count
- `.size` : axes length
- `.xColor` : x-axis color
- `.yColor` : y-axis color
- `.zColor` : z-axis color
- `.update()` : update helper

Ex. update helper props

```ts
const helper = new StripHelper(strip, 10);
helper.xColor.setClassName("purple");
helper.segments *= 2;
helper.update();
```



---
`UvPreset`

```ts
UvPreset.dash; // arr of dash-space uv fns.
UvPreset.strip; // arr of strip-space uv fns.
```

Ex.

```ts
new StripGeometry(strip, 100, UvPreset.dash[0]);
new StripGeometry(strip, 100, UvPreset.strip[0]);
```
