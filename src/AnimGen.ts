import type * as THREE from 'three';
import { Strip } from "./Strip";
import * as Err from './Err';

export interface AnimClass {
  /**
   * Contruct animation meta. 
   * 
   * @example
   * ```js
   * const anim = new Strip.Anim(strip, 10, 1);
   * const mesh = new THREE.Mesh(anim.geometry);
   * const mixer = new THREE.AnimationMixer(mesh);
   * const action = mixer.clipAction(anim.clip);
   * action.setDuration(7).play();
   * // Don't forget to update mixer in render loop.
   * ```
   * 
   * @param strip A strip instance acts as a 'rail'.
   * @param seg Segment count of moveing strip. 
   * @param dur Animation duration in sec.
   */
  new(
    strip: Strip,
    seg: number,
    dur: number
  ): Anim;
}

interface Anim {
  /** The passed strip which is used as a 'rail' */
  get strip(): null | Strip;

  /** 
   * Segment count of moving strip; clamped. 
   */
  get segment(): number;

  /** Animation duration */
  get duration(): number;

  /** A non-indexed geometry */
  get geometry(): null | THREE.BufferGeometry;

  /** A AnimationClip */
  get clip(): null | THREE.AnimationClip;

  /** Dispose geometry; unref all object refs */
  dispose(): void;

  /** Check if anim is disposed */
  get isDispose(): boolean;
}

export function AnimGen($: typeof THREE): AnimClass {
  return class {

    #strip: null | Strip;
    #seg: number;
    #dur: number;
    #geom: null | THREE.BufferGeometry;
    #clip: null | THREE.AnimationClip;
    #disposed: boolean;

    constructor(
      strip: Strip,
      seg: number,
      dur: number
    ) {

      if (strip.isDisposed) {
        throw new Err.GeometryHasDisposedError();
      }

      this.#strip = strip;
      this.#seg = Math.max(1, Math.min(strip.segment, seg)) | 0;
      this.#dur = dur;
      this.#geom = null;
      this.#clip = null;
      this.#disposed = false;
      this.#compute();
    }

    #compute() {

      // guard

      if (!this.#strip) return;

      // cache

      const seg = this.#seg;
      const strip = this.#strip;

      const $geom = new $.BufferGeometry();
      const $po = strip.geometry!.getAttribute('position').array as Float32Array;
      const $no = strip.geometry!.getAttribute('normal').array as Float32Array;
      const $nF32_3 = 6 * 3 * seg; // n f32 for pos/normal
      const $maPo: THREE.Float32BufferAttribute[] = [];
      const $maNo: THREE.Float32BufferAttribute[] = [];
      const $trks: THREE.KeyframeTrack[] = [];

      // window-by-window

      for (let i = 0, I = strip.segment; i <= I; ++i) {

        // find part(s) ( split if strip exceeds tail )

        const start = i; // seg idx
        const end = i + seg;
        const parts = (end <= I)
          ? [[start, end, 0]]
          : [[start, start + I - i, 0], [0, end - I, I - i]];

        // morphattribs pos & normal

        const aPo = new $.Float32BufferAttribute($nF32_3, 3);
        const aNo = new $.Float32BufferAttribute($nF32_3, 3);

        for (const [start, end, offset] of parts) {
          cp_f32_3comp(start, end, $po, aPo.array as Float32Array, offset);
          cp_f32_3comp(start, end, $no, aNo.array as Float32Array, offset);
        }

        $maPo.push(aPo);
        $maNo.push(aNo);

        // keyframe tracks 

        const J = strip.segment;
        const ts = new Float32Array(J + 1); // .times
        const vs = new Float32Array(J + 1); // .values

        for (let j = 0; j <= J; ++j) {
          ts[j] = j / J * this.#dur;
          vs[j] = +(i === j);
        }

        $trks.push(new $.KeyframeTrack(
          `.morphTargetInfluences[${i}]`, ts, vs, $.InterpolateDiscrete
        ));
      }

      // set morphattribs and attribs

      $geom.morphAttributes.position = $maPo;
      $geom.morphAttributes.normal = $maNo;

      $geom.setAttribute('position', $maPo[0].clone());
      $geom.setAttribute('normal', $maNo[0].clone());

      // set attrib uv ( remap frm 'rail'-space to 'moving strip'-space )

      if (strip.uv) {

        const aUv = new $.Float32BufferAttribute(6 * 2 * seg, 2);

        const I = seg;
        for (let i = 0, uvA = strip.uv(0, I), uvB; i < I; ++i) {

          // next sample point uvs
          uvB = strip.uv(i + 1, I);

          // (uvB.0, uvB.1) 2---3 (uvB.2, uvB.3)
          //                |\  |
          //                |  \|
          // (uvA.0, uvA.1) 0---1 (uvA.2, uvA.3)
          aUv.set([
            uvA[0], uvA[1], uvA[2], uvA[3], uvB[0], uvB[1], // tri 0,1,2
            uvB[0], uvB[1], uvA[2], uvA[3], uvB[2], uvB[3] // tri 2,1,3
          ], 12 * i);

          // swap
          uvA = uvB;
        }
        $geom.setAttribute('uv', aUv);
      }

      this.#geom = $geom;
      this.#clip = new $.AnimationClip(undefined, this.#dur, $trks);
    }

    get strip() {
      return this.#strip;
    }

    get geometry() {
      return this.#geom;
    }

    get clip() {
      return this.#clip;
    }

    get segment() {
      return this.#seg;
    }

    get duration() {
      return this.#dur;
    }

    dispose() {
      if (this.#disposed) return;
      this.#strip = null;
      this.#geom?.dispose();
      this.#geom = null;
      this.#clip = null;
      this.#seg = NaN;
      this.#dur = NaN;
      this.#disposed = true;
    }

    get isDispose() {
      return this.#disposed;
    }
  }
}

/**
 * Pluck four 3tuples from {src}; put six 3tuples into {dst}
 * Repeat for each seg in range from {startSeg} to {endSeg} (excluded)
 * 
 * @param startSeg start seg index 
 * @param endSeg end seg index
 * @param src pluck data from 
 * @param dst write data into 
 * @param dstOffsetSeg dst offset in segment 
 */

function cp_f32_3comp(
  startSeg: number, endSeg: number,
  src: Float32Array, dst: Float32Array, dstOffsetSeg: number
) {
  for (let i = 0, at = -1; i < endSeg - startSeg; ++i) {
    at = 6 * (startSeg + i); // {src} idx ( 6=2*3comp )
    
    // pluck (x,y,z)s from {src}, put into {dst}
    // 2---3
    // |\  |   ^^^^
    // |  \|   flow
    // 0---1   ^^^^
    dst.set([
      src[at], src[at + 1], src[at + 2],       // v0 (x,y,z) 
      src[at + 3], src[at + 4], src[at + 5],   // v1 (x,y,z)
      src[at + 6], src[at + 7], src[at + 8],   // v2 (x,y,z)
      src[at + 6], src[at + 7], src[at + 8],   // v2 (x,y,z)
      src[at + 3], src[at + 4], src[at + 5],   // v1 (x,y,z)
      src[at + 9], src[at + 10], src[at + 11], // v3 (x,y,z)
    ], 18 * (i + dstOffsetSeg));
  }
}