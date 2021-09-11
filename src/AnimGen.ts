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

        // find parts; split if strip exceeds tail

        const start = i; // seg idx
        const end = i + seg;
        const parts = (end <= I)
          ? [[start, end, 0]]
          : [[start, start + I - i, 0], [0, end - I, I - i]];

        // morphattribs pos & normal

        const aPo = new $.Float32BufferAttribute($nF32_3, 3);
        const aNo = new $.Float32BufferAttribute($nF32_3, 3);

        for (const [start, end, offset] of parts) {
          cp_f32(3, start, end, $po, aPo.array as Float32Array, offset);
          cp_f32(3, start, end, $no, aNo.array as Float32Array, offset);
        }

        $maPo.push(aPo);
        $maNo.push(aNo);

        // keyframe tracks

        const times: number[] = [];
        const values: number[] = [];

        for (let j = 0, J = strip.segment; j <= J; ++j) {
          times.push(j / J * this.#dur);
          values.push(+(i === j));
        }

        $trks.push(new $.KeyframeTrack(
          `.morphTargetInfluences[${i}]`,
          times, values, $.InterpolateDiscrete
        ));
      }

      // set morphattribs and attribs

      $geom.morphAttributes.position = $maPo;
      $geom.morphAttributes.normal = $maNo;

      $geom.setAttribute('position', $maPo[0].clone());
      $geom.setAttribute('normal', $maNo[0].clone());

      // set attrib uv ( remap )

      if (strip.uv) {
        const uvs = [];
        for (let i = 0, I = seg; i <= I; ++i) {
          uvs.push(strip.uv(i, I));
        }
        const aUv = new $.Float32BufferAttribute(6 * 2 * seg, 2);
        for (let i = 0; i < seg; ++i) {
          const v0 = uvs[i].slice(0, 2);
          const v1 = uvs[i].slice(2, 4);
          const v2 = uvs[i + 1].slice(0, 2);
          const v3 = uvs[i + 1].slice(2, 4);
          aUv.set([
            ...v0, ...v1, ...v2,
            ...v2, ...v1, ...v3
          ], 12 * i);
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
 * A fn to pluck 4-vert data from {src} to gen 6-vert data put into {dst};
 * repeat for each seg in range from {startSeg} to {endSeg} (excluded).
 * 
 * @param comp n component; 3 for pos/normal; 2 for uv
 * @param startSeg start seg index 
 * @param endSeg end seg index
 * @param src pluck data from 
 * @param dst write data into 
 * @param dstOffsetSeg dst offset in segment 
 */
function cp_f32(
  comp: number, // n component; 3 for pos/normal, 2 for uv
  startSeg: number, endSeg: number,
  src: Float32Array, dst: Float32Array, dstOffsetSeg: number
) {
  for (let i = 0; i < endSeg - startSeg; ++i) {

    // pluck 4-vert (4handles) data in seq from {src}

    const startF32 = 2 * comp * (startSeg + i);
    const v0 = src.slice(startF32, startF32 + comp);
    const v1 = src.slice(startF32 + comp, startF32 + comp * 2);
    const v2 = src.slice(startF32 + comp * 2, startF32 + comp * 3);
    const v3 = src.slice(startF32 + comp * 3, startF32 + comp * 4);

    // gen 6-vert (2tris) data; put into {dst}

    dst.set([
      ...v0, ...v1, ...v2,
      ...v2, ...v1, ...v3
    ], (6 * comp) * (i + dstOffsetSeg));
  }
}