import * as THREE$1 from 'three';

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

declare class Strip {
    #private;
    /**
     * threejs lib
     */
    static get THREE(): null | typeof THREE$1;
    static set THREE(x: null | typeof THREE$1);
    /**
     * A helper showing TBN frames for each sample point.
     */
    static get Helper(): {
        new (strip: Strip, length?: number, xColor?: THREE$1.ColorRepresentation, yColor?: THREE$1.ColorRepresentation, zColor?: THREE$1.ColorRepresentation): {
            "__#1@#strip": Strip | null;
            "__#1@#len": number;
            "__#1@#c0": THREE$1.Color | null;
            "__#1@#c1": THREE$1.Color | null;
            "__#1@#c2": THREE$1.Color | null;
            "__#1@#disposed": boolean;
            getColors(): null[] | THREE$1.Color[];
            setColors(xColor?: THREE$1.ColorRepresentation | undefined, yColor?: THREE$1.ColorRepresentation | undefined, zColor?: THREE$1.ColorRepresentation | undefined): void;
            getLength(): number;
            setLength(x: number): void;
            update(): void;
            dispose(): void;
            readonly isDisposed: boolean;
            type: string;
            readonly isLineSegments: true;
            geometry: THREE$1.BufferGeometry;
            material: THREE$1.Material | THREE$1.Material[];
            readonly isLine: true;
            morphTargetInfluences?: number[] | undefined;
            morphTargetDictionary?: {
                [key: string]: number;
            } | undefined;
            computeLineDistances(): any;
            raycast(raycaster: THREE$1.Raycaster, intersects: THREE$1.Intersection[]): void;
            updateMorphTargets(): void;
            id: number;
            uuid: string;
            name: string;
            parent: THREE$1.Object3D | null;
            children: THREE$1.Object3D[];
            up: THREE$1.Vector3;
            readonly position: THREE$1.Vector3;
            readonly rotation: THREE$1.Euler;
            readonly quaternion: THREE$1.Quaternion;
            readonly scale: THREE$1.Vector3;
            readonly modelViewMatrix: THREE$1.Matrix4;
            readonly normalMatrix: THREE$1.Matrix3;
            matrix: THREE$1.Matrix4;
            matrixWorld: THREE$1.Matrix4;
            matrixAutoUpdate: boolean;
            matrixWorldNeedsUpdate: boolean;
            layers: THREE$1.Layers;
            visible: boolean;
            castShadow: boolean;
            receiveShadow: boolean;
            frustumCulled: boolean;
            renderOrder: number;
            animations: THREE$1.AnimationClip[];
            userData: {
                [key: string]: any;
            };
            customDepthMaterial: THREE$1.Material;
            customDistanceMaterial: THREE$1.Material;
            readonly isObject3D: true;
            onBeforeRender: (renderer: THREE$1.WebGLRenderer, scene: THREE$1.Scene, camera: THREE$1.Camera, geometry: THREE$1.BufferGeometry, material: THREE$1.Material, group: THREE$1.Group) => void;
            onAfterRender: (renderer: THREE$1.WebGLRenderer, scene: THREE$1.Scene, camera: THREE$1.Camera, geometry: THREE$1.BufferGeometry, material: THREE$1.Material, group: THREE$1.Group) => void;
            applyMatrix4(matrix: THREE$1.Matrix4): void;
            applyQuaternion(quaternion: THREE$1.Quaternion): any;
            setRotationFromAxisAngle(axis: THREE$1.Vector3, angle: number): void;
            setRotationFromEuler(euler: THREE$1.Euler): void;
            setRotationFromMatrix(m: THREE$1.Matrix4): void;
            setRotationFromQuaternion(q: THREE$1.Quaternion): void;
            rotateOnAxis(axis: THREE$1.Vector3, angle: number): any;
            rotateOnWorldAxis(axis: THREE$1.Vector3, angle: number): any;
            rotateX(angle: number): any;
            rotateY(angle: number): any;
            rotateZ(angle: number): any;
            translateOnAxis(axis: THREE$1.Vector3, distance: number): any;
            translateX(distance: number): any;
            translateY(distance: number): any;
            translateZ(distance: number): any;
            localToWorld(vector: THREE$1.Vector3): THREE$1.Vector3;
            worldToLocal(vector: THREE$1.Vector3): THREE$1.Vector3;
            lookAt(vector: number | THREE$1.Vector3, y?: number | undefined, z?: number | undefined): void;
            add(...object: THREE$1.Object3D[]): any;
            remove(...object: THREE$1.Object3D[]): any;
            removeFromParent(): any;
            clear(): any;
            attach(object: THREE$1.Object3D): any;
            getObjectById(id: number): THREE$1.Object3D | undefined;
            getObjectByName(name: string): THREE$1.Object3D | undefined;
            getObjectByProperty(name: string, value: string): THREE$1.Object3D | undefined;
            getWorldPosition(target: THREE$1.Vector3): THREE$1.Vector3;
            getWorldQuaternion(target: THREE$1.Quaternion): THREE$1.Quaternion;
            getWorldScale(target: THREE$1.Vector3): THREE$1.Vector3;
            getWorldDirection(target: THREE$1.Vector3): THREE$1.Vector3;
            traverse(callback: (object: THREE$1.Object3D) => any): void;
            traverseVisible(callback: (object: THREE$1.Object3D) => any): void;
            traverseAncestors(callback: (object: THREE$1.Object3D) => any): void;
            updateMatrix(): void;
            updateMatrixWorld(force?: boolean | undefined): void;
            updateWorldMatrix(updateParents: boolean, updateChildren: boolean): void;
            toJSON(meta?: {
                geometries: any;
                materials: any;
                textures: any;
                images: any;
            } | undefined): any;
            clone(recursive?: boolean | undefined): any;
            copy(source: any, recursive?: boolean | undefined): any;
            addEventListener(type: string, listener: (event: THREE$1.Event) => void): void;
            hasEventListener(type: string, listener: (event: THREE$1.Event) => void): boolean;
            removeEventListener(type: string, listener: (event: THREE$1.Event) => void): void;
            dispatchEvent(event: {
                [attachment: string]: any;
                type: string;
            }): void;
        };
        DefaultUp: THREE$1.Vector3;
        DefaultMatrixAutoUpdate: boolean;
    };
    /**
     * Practical uv fn set.
     */
    static UvFns: [UvFn, UvFn, UvFn, UvFn];
    /**
     * Generate Strip.
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
    get geometry(): THREE$1.BufferGeometry | null;
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
