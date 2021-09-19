import * as THREE from "three";
import { Curve, RadiusFn, TiltFn, UvFn, Frame } from "./Type";

function uvFnGen(
  x: number,
  mode: 0 | 1 | 2 | 3
): ReturnType<UvFn> {
  switch (mode) {
    case 0: return [0, x, 1, x];
    case 1: return [x, 1, x, 0];
    case 2: return [1, x, 0, x];
    case 3: return [x, 0, x, 1];
  }
}

export class Strip {

  static UvPresets: {
    dash: [UvFn, UvFn, UvFn, UvFn],
    strip: [UvFn, UvFn, UvFn, UvFn]
  } = ({
    dash: [
      (i, I) => uvFnGen(i / I, 0),
      (i, I) => uvFnGen(i / I, 1),
      (i, I) => uvFnGen(i / I, 2),
      (i, I) => uvFnGen(i / I, 3),
    ],
    strip: [
      (_i, _I, j, J) => uvFnGen(j / J, 0),
      (_i, _I, j, J) => uvFnGen(j / J, 1),
      (_i, _I, j, J) => uvFnGen(j / J, 2),
      (_i, _I, j, J) => uvFnGen(j / J, 3),
    ]
  });

  constructor(
    public curve: Curve,
    public radius: number | RadiusFn = 1,
    public tilt: number | TiltFn = 0
  ) { }

  // r-handed coords frames 
  // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf
  computeFrames(
    segments: number
  ) {
    const $T0 = new THREE.Vector3();
    const $B0 = new THREE.Vector3();
    const $N0 = new THREE.Vector3();
    const $T = new THREE.Vector3();
    const $B = new THREE.Vector3();
    const $N = new THREE.Vector3();
    const $v0 = new THREE.Vector3();
    const $v1 = new THREE.Vector3();

    const frames: Frame[] = [];
    const tiltFn = this.tilt instanceof Function
      ? this.tilt
      : () => this.tilt as number;

    const $set = (i: number, I: number) => {
      frames[i] = [] as unknown as Frame;
      frames[i][0] = $B0.clone(); //B
      frames[i][1] = $N0.clone(); //N
      frames[i][2] = $T0.clone(); //T
      frames[i][3] = this.curve.getPointAt(i / I); //O
      const t = tiltFn(i, I);
      t && frames[i][0].applyAxisAngle($T0, t);
      t && frames[i][1].applyAxisAngle($T0, t);
    }

    // 1st T
    this.curve.getTangentAt(0, $T0);

    // 1st B
    $v1.set(Math.abs($T0.x), Math.abs($T0.y), Math.abs($T0.z));
    $v0.set(1, 0, 0);
    ($v1.y <= $v1.x)
      ? ($v1.z <= $v1.y ? $v0.set(0, 0, 1) : $v0.set(0, 1, 0))
      : ($v1.z <= $v1.x) && $v0.set(0, 0, 1);
    $v1.crossVectors($T0, $v0).normalize();
    $B0.crossVectors($T0, $v1);

    // 1st N
    $N0.crossVectors($T0, $B0);

    // set 1st frame
    $set(0, segments);

    // rest..
    for (let i = 1, u = NaN; i <= segments; ++i) {

      // ratio
      u = i / segments;

      // T
      this.curve.getTangentAt(u, $T);

      // B
      $B.copy($B0);
      $v1.crossVectors($T0, $T).length() > Number.EPSILON
        && $B.applyAxisAngle(
          $v1.normalize(),
          Math.acos(Math.max(-1, Math.min(1, $T0.dot($T))))
        );

      // N
      $N.crossVectors($T, $B);

      // put
      $T0.copy($T);
      $N0.copy($N);
      $B0.copy($B);

      // set frame
      $set(i, segments);
    }
    return frames;
  }
}