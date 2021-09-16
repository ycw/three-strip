import * as THREE from "three";
import { Strip } from "./Strip";
import { UvFn } from "./Type";

type Segments =
  | number
  | [number]
  | [number, number]
  | [number, number, number]
  ;

export class StripGeometry extends THREE.BufferGeometry {

  constructor(
    strip: Strip,
    segments: Segments,
    uvFn?: UvFn
  ) {
    super();
    !Array.isArray(segments) && (segments = [segments]);
    this.#compute(
      strip,
      segments[0],
      segments[1] ?? segments[0],
      segments[2] ?? 0,
      uvFn
    );
  }

  #compute(
    strip: Strip,
    segs: number,
    subsegs: number,
    offset: number,
    uvFn?: UvFn
  ) {

    segs = Math.max(1, segs | 0);
    subsegs = Math.max(1, Math.min(segs, subsegs | 0));
    offset = (offset | 0) % segs + +(offset < 0) * segs; // support -ve

    const parts = (() => {
      const end = offset + subsegs;
      return (end <= segs)
        ? [[offset, end, 0]]
        : [[offset, segs, 0], [0, end - segs, segs - offset + 1]];
    })();

    const frames = strip.computeFrames(segs);
    const edges = subsegs + parts.length;
    const ps = new Float32Array(6 * edges);
    const uvs = uvFn ? new Float32Array(4 * edges) : null;
    const idxs: number[] = [];

    const rFn = strip.radius instanceof Function
      ? strip.radius
      : () => strip.radius as number;

    const $v0 = new THREE.Vector3();
    const $v1 = new THREE.Vector3();

    for (const [start, end, offset] of parts) {
      const subframes = frames.slice(start, end + 1);
      for (const [i, [B, , , O]] of subframes.entries()) {
        // pos
        const r = rFn(start + i, segs);
        $v0.copy(B).multiplyScalar(r).add(O);
        $v1.copy(B).multiplyScalar(-r).add(O);
        ps.set([
          $v0.x, $v0.y, $v0.z,
          $v1.x, $v1.y, $v1.z
        ], 6 * (i + offset));

        // idx
        const j = 2 * (i + offset);
        (i < subframes.length - 1) && idxs.push(
          j, j + 1, j + 2,
          j + 2, j + 1, j + 3
        );

        // uv
        (uvFn && uvs) && uvs.set(
          offset
            ? uvFn(i + offset, subsegs + 1)
            : uvFn(i, subsegs),
          4 * (i + offset)
        );
      }
    }

    this.attributes.position = new THREE.BufferAttribute(ps, 3);
    uvs && (this.attributes.uv = new THREE.BufferAttribute(uvs, 2));
    this.setIndex(idxs);
    this.computeVertexNormals();
  }
}