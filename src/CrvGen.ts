import type * as THREE from 'three'
import type { Frame } from './Ty'

type UFn = (i: number, I: number) => number;
type EachFn = (i: number, I: number, f: Frame, p: THREE.Vector3) => void;

export function CrvGen($: typeof THREE) {
  return class Crv extends $.Curve<THREE.Vector3> {

    constructor() {
      super();
    }

    forEachTBN(
      seg: number, // seg count in desired rng
      uFn: UFn, // gen desired rng
      eachFn: EachFn, // call on each TBN formed
    ) {

      // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf

      // cache

      const $T0 = new $.Vector3();
      const $B0 = new $.Vector3();
      const $N0 = new $.Vector3();
      const $T = new $.Vector3();
      const $B = new $.Vector3();
      const $N = new $.Vector3();
      const $v0 = new $.Vector3();
      const $v1 = new $.Vector3();
      let $u = uFn(0, seg);

      // find first tangent

      this.getTangentAt($u, $T0);

      // select an initial normal vector perpendicular to the first tangent vector,
      // and in the direction of the minimum tangent xyz component

      $v1.set(Math.abs($T0.x), Math.abs($T0.x), Math.abs($T0.z));
      $v0.set(1, 0, 0);
      if ($v1.y <= $v1.x) $v1.z <= $v1.y ? $v0.set(0, 0, 1) : $v0.set(0, 1, 0);
      else if ($v1.z <= $v1.x) $v0.set(0, 0, 1);

      // find first normal; binormal

      $v1.crossVectors($T0, $v0).normalize();
      $N0.crossVectors($T0, $v1);
      $B0.crossVectors($T0, $N0);

      // call

      this.getPointAt($u, $v1);
      eachFn(0, seg, [$T0.clone(), $B0.clone(), $N0.clone()], $v1);

      // compute TBN

      for (let i = 1; i <= seg; i++) {

        $u = uFn(i, seg);

        // curr TBN

        this.getTangentAt($u, $T);
        $N.copy($N0);
        $B.copy($B0);

        // set curr normal

        $v1.crossVectors($T0, $T);
        if ($v1.length() > Number.EPSILON) {
          $v1.normalize();
          $N.applyAxisAngle($v1, Math.acos(clamp($T0.dot($T))));
        }

        // set curr binormal

        $B.crossVectors($T, $N);

        // call

        this.getPointAt($u, $v1);
        eachFn(i, seg, [$T.clone(), $B.clone(), $N.clone()], $v1);

        // swap

        $T0.copy($T);
        $N0.copy($N);
        $B0.copy($B);
      }
    }
  }
}


function clamp(x: number) {
  return x < -1 ? -1 : (x > 1) ? 1 : x;
}