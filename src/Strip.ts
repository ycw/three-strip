import type * as THREE from 'three'
import type { Curve, RadiusFn, TiltFn, UvFn, Morph, Frame } from './Ty'
import * as Err from './Err'
import { StripHelperGen } from './StripHelperGen'

// ----
// Defaults
// ----

const RADIUS = 0.5;
const TILT = 0;
const UV = null;

// ----
// Strip
// ----

export class Strip {

  static #THREE: null | typeof THREE = null;
  static #Helper: null | ReturnType<typeof StripHelperGen>;

  /**
   * threejs lib
   */
  static get THREE() { return Strip.#THREE }
  static set THREE(x: null | typeof THREE) {
    Strip.#THREE = x;
    Strip.#Helper = StripHelperGen(x);
  }

  /**
   * A helper showing TBN frames for each sample point. 
   */
  static get Helper() {
    if (!this.#Helper) {
      throw new Err.DependencyInjectionError();
    }
    return this.#Helper;
  }

  /**
   * Practical uv fn set.
   */
  static UvFns: [UvFn, UvFn, UvFn, UvFn] = [
    (i, I) => [0, i / I, 1, i / I], // uv frame = (-Binormal, Tangent)
    (i, I) => [i / I, 1, i / I, 0], // rot 90d 
    (i, I) => [1, 1 - i / I, 0, 1 - i / I], // rot 180d
    (i, I) => [1 - i / I, 0, 1 - i / I, 1], // rot 270d 
  ];

  #crv: Curve;
  #seg: number;
  #r: number | RadiusFn = RADIUS;
  #tilt: number | TiltFn = TILT;
  #uv: null | UvFn;
  #mrps: null | Morph[];
  #geom: null | THREE.BufferGeometry;
  #frms: null | Frame[];
  #rFn: RadiusFn = () => RADIUS;
  #tiltFn: TiltFn = () => TILT;

  /**
   * Generate Strip.
   * 
   * @param crv A curve that determines the flow of strip
   * @param seg Number of divisions used to sample the curve
   * @param r Radius ( strip breadth is 2r ), default is `0.5`
   * @param tilt Roll around tangent, default is `0`, in radian 
   * @param uv Uv generator fn, default is `null`
   */
  constructor(
    crv: Curve,
    seg: number,
    r: number | RadiusFn = RADIUS,
    tilt: number | TiltFn = TILT,
    uv: null | UvFn = UV,
  ) {
    if (!Strip.#THREE) {
      throw new Err.DependencyInjectionError();
    }
    this.#crv = crv;
    this.#seg = seg;
    this.#setR(r);
    this.#setTilt(tilt);
    this.#uv = uv;
    this.#mrps = null;
    this.#geom = null;
    this.#frms = null;
    this.#geom = new Strip.#THREE.BufferGeometry();
    this.#update(true, true, true, true, !!this.#uv, false);
  }

  #setR(x: number | RadiusFn) {
    this.#r = x;
    this.#rFn = typeof x == 'function' ? x : () => x;
  }

  #setTilt(x: number | TiltFn) {
    this.#tilt = x;
    this.#tiltFn = typeof x == 'function' ? x : () => x;
  }

  /**
   * Curve(/CurvePath); determine strip flow.
   */
  get curve() {
    return this.#crv;
  }

  set curve(x: Curve) {
    this.#crv = x;
    this.#update(true, false, false, false, false, false);
  }

  /**
   * Number of divisions; large the value, smoother the strip.
   */
  get segment() {
    return this.#seg;
  }

  set segment(x: number) {
    this.#seg = Math.max(1, x | 0); // int(x); min=1 
    this.#update(false, true, false, false, false, false);
  }

  /**
   * Radius; determine the strip breadth ( 2 * radius ).
   */
  get radius() {
    return this.#r;
  }

  set radius(x: number | RadiusFn) {
    if (x !== this.#r) {
      this.#setR(x);
      this.#update(false, false, true, false, false, false);
    }
  }

  /**
   * Tilt; determine twisting ( around tangent )
   */
  get tilt() {
    return this.#tilt;
  }

  set tilt(x: number | TiltFn) {
    if (x !== this.#tilt) {
      this.#setTilt(x);
      this.#update(false, false, false, true, false, false);
    }
  }

  /**
   * A fn to generate texcoords. It must return array of 4 numbers
   * representing two uv pairs `[u0,v0, u1,v1]` for +ve handle and 
   * -ve handle at sample point #i correspondingly. 
   * 
   * @example
   * ```js
   * (i, I) => [0, i/I, 1, i/I]
   * ```
   * 
   * ---
   * Each sample point has two handles which span across +-binormal.
   * The 1st handle refers to the one at +ve binormal.
   */
  get uv() {
    return this.#uv;
  }

  set uv(x: null | UvFn) {
    if (this.#uv === x) return;
    this.#uv = x;
    if (x) this.#update(false, false, false, false, true, false);
    else this.#geom?.deleteAttribute('uv');
  }

  /**
   * Indexed `BufferGeometry`. 
   */
  get geometry() {
    return this.#geom;
  }

  /**
   * Moving frames; in form of `[T,B,N]` where TBN are `Vector3`s.
   */
  get frames() {
    return this.#frms;
  }

  /**
   * Set morphing. 
   * 
   * Pass `null` will delete all morph attributes from geometry.  
   * 
   * This fn skips eqaulity checking:
   * 
   * @example 
   * ```js
   * const arr = [{ curve: c1 }]
   * strip.setMorphs(arr)
   * 
   * // mutate arr ( strip will not auto-update )
   * arr.push({ curve: c2 }) 
   * 
   * // pass same arr ref ( Ok. strip has 2 morphs )
   * strip.setMorphs(arr)
   * ```
   * 
   * @param mrps Array of morph ( curve, radius and tilt )
   */
  setMorphs(
    mrps: null | Morph[]
  ) {
    if (mrps) {
      this.#mrps = mrps;
      this.#update(false, false, false, false, false, true);
    } else if (this.#geom) {
      this.#geom.morphAttributes.position = [];
      this.#geom.morphAttributes.normal = [];
    }
  }

  setProps(
    crv: Curve = this.#crv,
    seg: number = this.#seg,
    r: number | RadiusFn = this.#r,
    tilt: number | TiltFn = this.#tilt,
    uv: null | UvFn = this.#uv
  ) {

    const bCrv = this.#crv !== crv;
    if (bCrv) this.#crv = crv;

    const bSeg = this.#seg !== seg;
    if (bSeg) this.#seg = seg;

    const bR = this.#r !== r;
    if (bR) this.#setR(r);

    const bTilt = this.#tilt !== tilt;
    if (bTilt) this.#setTilt(tilt);

    const bUv = (this.#uv !== uv) && !!uv; // uv is fn -> true
    if (!uv) {
      this.geometry?.deleteAttribute('uv');
    }
    this.#uv = uv;

    if (bCrv || bSeg || bR || bTilt || bUv) {
      this.#update(bCrv, bSeg, bR, bTilt, bUv, false);
    }
  }

  /**
   * Dispose geometry and delete frames.
   */
  dispose() {
    this.#geom?.dispose();
    this.#geom = null;
    this.#frms = null;
  }

  // Assumption: 
  // This fn doesn't handle deletion of attrib uv and morph attribs
  // those cases ( when .uv=null or .morph=null ) must be handle in
  // setters w/o calling #update. 
  #update(
    bCrv: boolean,
    bSeg: boolean,
    bR: boolean,
    bTilt: boolean,
    bUv: boolean,
    bMrp: boolean
  ) {

    if (!this.#geom) return;

    const $ = Strip.THREE!;

    // ---- geometry
    this.#geom.dispose();
    const geom = this.#geom!;

    // ---- guards ( for skipping tasks in giant loop )
    // | flag  | affect attribs
    // |-      |-
    // | bCrv  | pos, norm
    // | bSeg  | pos, norm, uv, index (+mrp targets' pos and norm)
    // | bR    | pos (chg radius won't affect existin' norm)
    // | bTilt | pos, norm
    // | bUv   | uv
    // | bMrp  | mrp targets' pos and norm
    const isUpdPo = bCrv || bSeg || bR || bTilt;
    const isUpdNo = bCrv || bSeg || bTilt;
    const isUpdUv = bUv || bSeg;
    const isUpdIdx = bSeg;
    const isUpdMrp = bSeg || bMrp;

    // --- frame 
    const frms = isUpdNo || bSeg || !this.#frms
      ? (this.#frms = []) // new
      : this.#frms; // reuse 

    // --- attrib pos
    (isUpdPo) && geom.setAttribute('position',
      new $.Float32BufferAttribute(12 * this.#seg, 3)); // 4 vec3
    const aPo = geom.getAttribute('position');

    // --- attrib normal
    (isUpdNo) && geom.setAttribute('normal',
      new $.Float32BufferAttribute(12 * this.#seg, 3)); // 4 vec3
    const aNo = geom.getAttribute('normal');

    // --- attrib uv
    (bSeg || (isUpdUv && !geom.hasAttribute('uv'))) &&
      geom.setAttribute('uv',
        new $.Float32BufferAttribute(8 * this.#seg, 2)); // 4 vec2
    const aUv = geom.getAttribute('uv');

    // --- indices  
    const idxs: number[] | null = isUpdIdx ? [] : null;

    // --- samples ( pts and LHand TBN )
    const pts = this.#crv.getSpacedPoints(this.#seg);
    const { tangents: Ts, binormals: Bs, normals: Ns } =
      this.#crv.computeFrenetFrames(this.#seg);

    // --- caching
    const $I = this.#seg;
    const $v0 = new $.Vector3();
    const $v1 = new $.Vector3();

    // --- uber-loop
    for (let i = 0, $i = -1, $r = NaN, $tilt = NaN; i <= $I; ++i) {

      if (isUpdPo || isUpdNo) {

        $r = this.#rFn(i, $I);
        $tilt = this.#tiltFn(i, $I);

        // Rhand TBN
        frms[i] ??= [$v0, $v0, $v0] // stubs ( pass tsc )
        frms[i][0] = Ts[i];
        frms[i][1] = $tilt ? Ns[i].applyAxisAngle(Ts[i], $tilt) : Ns[i];
        frms[i][2] = $tilt ? Bs[i].applyAxisAngle(Ts[i], $tilt) : Bs[i];
      }

      if (isUpdPo) {
        $v0.copy(frms[i][1]).multiplyScalar($r).add(pts[i]);
        $v1.copy(frms[i][1]).multiplyScalar(-$r).add(pts[i]);

        (aPo.array as Float32Array).set([
          $v0.x, $v0.y, $v0.z,
          $v1.x, $v1.y, $v1.z
        ], i * 6);
      }

      if (isUpdUv) { // this incl a case: segment count chg but #uv=null 
        if (this.#uv) { // guard #uv=null is required.
          (aUv.array as Float32Array).set(this.#uv(i, $I), i * 4);
        }
      }

      if (isUpdIdx && i < $I) { // upto second last sample point 
        idxs!.push(
          ($i = i * 2),
          $i + 1,
          $i + 2,
          $i + 2,
          $i + 1,
          $i + 3
        );
      }
    }

    if (isUpdIdx) {
      geom.setIndex(idxs);
    }

    if (isUpdNo) { // avg normal ( quads based )
      if (this.#seg > 1) {
        for (let i = 0; i < frms.length; ++i) {
          if (i === 0 || i === frms.length - 1) {
            (aNo.array as Float32Array).set([
              frms[i][2].x, frms[i][2].y, frms[i][2].z,
              frms[i][2].x, frms[i][2].y, frms[i][2].z
            ], i * 6);
          } else {
            $v0.addVectors(frms[i - 1][2], frms[i][2])
              .add(frms[i + 1][2])
              .divideScalar(3);
            (aNo.array as Float32Array).set([
              $v0.x, $v0.y, $v0.z,
              $v0.x, $v0.y, $v0.z
            ], i * 6);
          }
        }
      }
    }

    // --- morph
    if (isUpdMrp) {
      if (this.#mrps) {
        geom.morphAttributes.position = [];
        geom.morphAttributes.normal = [];
        for (const { curve, radius, tilt } of this.#mrps) {
          const { geometry: g } = new Strip(
            curve,
            this.#seg,
            radius ?? RADIUS,
            tilt ?? TILT
          );
          geom.morphAttributes.position.push(g!.getAttribute('position'));
          geom.morphAttributes.normal.push(g!.getAttribute('normal'));
        }
      }
    }

    // --- set dirty
    if (isUpdPo) geom.attributes.position.needsUpdate = true;
    if (isUpdNo) geom.attributes.normal.needsUpdate = true;
    if (isUpdUv) geom.attributes.uv.needsUpdate = true;
    if (isUpdIdx) geom.index!.needsUpdate = true;
  }
}