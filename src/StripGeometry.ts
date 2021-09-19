import * as THREE from "three";
import { Strip } from "./Strip";
import { UvFn, Segments, ParsedSegments } from "./Type";

export class StripGeometry extends THREE.BufferGeometry {
  
  constructor(
    strip: Strip,
    segments: number | Segments,
    uvFn?: UvFn,
  ) {
    super();
    this.#compute(strip, StripGeometry.parseSegments(segments), uvFn);
  }

  static parseSegments(
    segments: number | Segments
  ) {
    const s = [] as unknown as ParsedSegments;
    if (Array.isArray(segments)) {
      s[0] = segments[0];
      s[1] = (segments[1] === undefined) ? [segments[0]] : segments[1];
      s[2] = segments[2] || 0;
    } else {
      s[0] = segments;
      s[1] = [segments];
      s[2] = 0;
    }

    // segment count
    s[0] = Math.max(1, s[0] | 0);

    // dash array
    s[1] = s[1].filter(x => x >= 1).map(x => x | 0);
    s[1].length || (s[1] = [s[0]]);
    s[1].length % 2 && s[1].push(...s[1]);

    // dash offset
    s[2] |= 0;

    return s;
  }

  #compute(
    strip: Strip,
    [nStripSeg, dashArr, dashOff]: ParsedSegments,
    uvFn?: UvFn,
  ) {
    const indices: number[] = [];
    const ps: number[] = [];
    const uvs: number[] = [];

    const lut_isDash = dashArr.flatMap((x, i) => Array(x).fill(1 - i % 2));
    const lut_dashIdx = dashArr.flatMap((x) => Array.from(Array(x).keys()));
    const lut_nDashSeg = dashArr.flatMap((x) => Array(x).fill(x));

    const frms = strip.computeFrames(nStripSeg);
    const rFn = strip.radius instanceof Function
      ? strip.radius
      : () => strip.radius as number
      ;
    const $v0 = new THREE.Vector3();
    const $v1 = new THREE.Vector3();
    const lutLen = lut_isDash.length;
    for (let i = 0, $i, $lutIdx, $nDashSeg, $nVert = 0; i < nStripSeg;) {
      // lut idx
      $i = (dashOff + i) % lutLen;
      $lutIdx = ($i < 0) ? lutLen + $i : $i;

      // subseg count
      $i = lut_nDashSeg[$lutIdx] - lut_dashIdx[$lutIdx];
      $nDashSeg = (i + $i > nStripSeg) ? nStripSeg - i : $i;

      // is dash
      if (lut_isDash[$lutIdx]) {
        for (let j = 0, $B, $P, $r, $v; j <= $nDashSeg; ++j) {
          // pos
          [$B, , , $P] = frms[i + j];
          $r = rFn(i + j, nStripSeg);
          $v0.copy($B).multiplyScalar($r).add($P);
          $v1.copy($B).multiplyScalar(-$r).add($P);
          ps.push($v0.x, $v0.y, $v0.z, $v1.x, $v1.y, $v1.z);

          // uv
          uvFn && uvs.push(...uvFn(
            j < $nDashSeg
              ? lut_dashIdx[$lutIdx + j]
              : lut_dashIdx[$lutIdx + j - 1] + 1
            , lut_nDashSeg[$lutIdx],
            i + j, nStripSeg
          ));

          // idx
          (j < $nDashSeg) && indices.push(
            ($v = 2 * j + $nVert), $v + 1, $v + 2,
            $v + 2, $v + 1, $v + 3
          );
        }
        $nVert += 2 * ($nDashSeg + 1);
      }
      i += $nDashSeg;
    }

    this.attributes.position = new THREE.Float32BufferAttribute(ps, 3);
    uvFn && (this.attributes.uv = new THREE.Float32BufferAttribute(uvs, 2));
    this.setIndex(indices);
    this.computeVertexNormals();
  }
}