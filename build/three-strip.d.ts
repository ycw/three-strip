import * as THREE from 'three';

declare type Curve = THREE.Curve<THREE.Vector3> | THREE.CurvePath<THREE.Vector3>;
declare type RadiusFn = (i: number, I: number) => number;
declare type TiltFn = (i: number, I: number) => number;
declare type UvTuple = [number, number, number, number];
declare type UvFn = (i: number, I: number) => UvTuple;
declare type Morph = {
    curve: Curve;
    radius?: number | RadiusFn;
    tilt?: number | TiltFn;
};
declare type Frame = [
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3
];

interface StripHelperClass {
    /**
     * Construct a strip helper which shows right-handed TBN frames of strip.
     * @param strip Strip object
     * @param length Length of axes; default is `1`
     * @param xColor x-axis color ( for binormal ); default is `'#ff0000'`
     * @param yColor y-axis color ( for normal ); default is `'#00ff00'`
     * @param zColor z-axis color ( for tangent ); default is `'#0000ff'`
     */
    new (strip: Strip, length?: number, xColor?: THREE.ColorRepresentation, yColor?: THREE.ColorRepresentation, zColor?: THREE.ColorRepresentation): StripHelper;
}
interface StripHelper extends THREE.LineSegments {
    /**
     * Get colors of each axis.
     * @returns array of colors ( clone )
     */
    getColors(): (null | THREE.Color)[];
    /**
     * Set colors for each axis
     * @param xColor x-axis color
     * @param yColor y-axis color
     * @param zColor z-axis color
     */
    setColors(xColor?: THREE.ColorRepresentation, yColor?: THREE.ColorRepresentation, zColor?: THREE.ColorRepresentation): void;
    /**
     * Get length of axes.
     * @returns length of axes
     */
    getLength(): number;
    /** Set length of axes */
    setLength(x: number): void;
    /** Update internal geometry to sync with strip. */
    update(): void;
    /** Dispose internal geometry and material; unref all object refs. */
    dispose(): void;
    /** Check if helper is disposed. */
    get isDisposed(): boolean;
}

interface AnimClass {
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
    new (strip: Strip, seg: number, dur: number): Anim;
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

declare class Strip {
    #private;
    /**
     * threejs lib
     */
    static get THREE(): null | typeof THREE;
    static set THREE(x: null | typeof THREE);
    /**
     * A helper showing TBN frames for each sample point.
     */
    static get Helper(): StripHelperClass;
    /**
     * Generate animation meta tailored for threejs animation system.
     */
    static get Anim(): AnimClass;
    /**
     * Practical uv fn set.
     */
    static UvFns: [UvFn, UvFn, UvFn, UvFn];
    /**
     * Construct a Strip.
     *
     * @param crv A curve that determines the flow of strip
     * @param seg Number of divisions used to sample the curve
     * @param r Radius ( strip breadth is 2r ), default is `0.5`
     * @param tilt Roll around tangent, default is `0`, in radian
     * @param uv Uv generator fn, default is `null`
     */
    constructor(crv: Curve, seg: number, r?: number | RadiusFn, tilt?: number | TiltFn, uv?: null | UvFn);
    /**
     * A curve to determine strip flow.
     */
    get curve(): null | Curve;
    set curve(x: null | Curve);
    /**
     * Number of divisions; larger the value, smoother the strip.
     * Value must be an integer greater than 0.
     */
    get segment(): number;
    set segment(x: number);
    /**
     * Radius; determine the strip breadth ( which is 2 * radius ).
     */
    get radius(): number | RadiusFn;
    set radius(x: number | RadiusFn);
    /**
     * Tilt; determine twisting ( around tangent )
     */
    get tilt(): number | TiltFn;
    set tilt(x: number | TiltFn);
    /**
     * A fn to generate texcoords. It must return array of 4 numbers
     * representing two uv pairs `[u0,v0, u1,v1]` for +ve handle and
     * -ve handle at sample point #i correspondingly.
     *
     * Each sample point has two handles which span across +-binormal.
     * The 1st handle refers to the one at +ve binormal.
     *
     * @example
     * ```js
     * const uv = (i, I) => [0, i/I, 1, i/I]
     * const strip = new Strip(curve, 10, 0.5, 0, uv);
     * ```
     *
     * There're few predefined uv fns at `String.UvFns`.
     * see https://ycw.github.io/three-strip/examples/uv/
     *
     * @example
     * ```js
     * const strip = new Strip(curve, 10, 0.5, 0, Strip.UvFns[0]);
     * ```
     */
    get uv(): null | UvFn;
    set uv(x: null | UvFn);
    /**
     * Indexed `BufferGeometry`.
     */
    get geometry(): THREE.BufferGeometry | null;
    /**
     * Array of RHand TBN frames.
     *
     * A frame is in form of `[T,B,N]` where TBN are `Vector3`s.
     *
     * @example
     * ```js
     * strip.frames[0][0] // 1st frame's tangent
     * strip.frames[0][1] // 1st frame's binormal
     * strip.frames[0][2] // 1st frame's normal
     * ```
     */
    get frames(): Frame[] | null;
    /**
     * Get sample points.
     *
     * @returns array of points ( deepclone )
     */
    getPoints(): THREE.Vector3[] | null;
    /**
     * Set morphs.
     *
     * A morph is in form of `{ curve, radius=0.5, tilt=0 }`.
     *
     * Pass `null` will delete all morph attributes from geometry.
     *
     * This fn skips eqaulity checking:
     *
     * @example
     * ```js
     * const arr = [{ curve: c1 }]
     * strip.setMorphs(arr)
     * arr.push({ curve: c2 })
     * strip.setMorphs(arr) // OK. strip has 2 morphs now
     * ```
     *
     * @param mrps Array of morphs
     */
    setMorphs(mrps: null | Morph[]): void;
    /**
     * Set properties in one go. Pass `undefined` means that 'keep it unchanged'.
     *
     * @examples
     * ```js
     * strip.setProp(
     *   undefined, // `curve` unchanged
     *   undefined, // `segment` unchanged
     *   strip.radius * 2, // double radius
     *   0, // zero the tilt
     *   null // delete attrib uv
     * )
     * ```
     *
     * @param crv new curve object ( accept null )
     * @param seg new segment count
     * @param r new radius ( accept fn )
     * @param tilt new tilt ( accept fn )
     * @param uv new uv fn ( accept null )
     */
    setProps(crv?: null | Curve, seg?: number, r?: number | RadiusFn, tilt?: number | TiltFn, uv?: null | UvFn): void;
    /**
     * Dispose geometry and unref all object refs
     */
    dispose(): void;
    /**
     * Check if strip has disposed ( i.e. called `.dispose()` ).
     */
    get isDisposed(): boolean;
}

export { Strip };
