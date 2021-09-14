import * as THREE from 'three';

declare type RadiusFn = (i: number, I: number) => number;
declare type TiltFn = (i: number, I: number) => number;
declare type UvFn = (i: number, I: number) => [
    number,
    number,
    number,
    number
];
declare type Frame = [
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3
];

declare type Curve = THREE.Curve<THREE.Vector3> | THREE.CurvePath<THREE.Vector3>;
declare class Strip {
    curve: Curve;
    radius: number | RadiusFn;
    tilt: number | TiltFn;
    static UvPresets: [UvFn, UvFn, UvFn, UvFn];
    constructor(curve: Curve, radius?: number | RadiusFn, tilt?: number | TiltFn);
    computeFrames(segments: number): Frame[];
}

declare type Segments = number | [number] | [number, number] | [number, number, number];
declare class StripGeometry extends THREE.BufferGeometry {
    #private;
    strip: Strip;
    segments: Segments;
    uvFn?: UvFn | undefined;
    constructor(strip: Strip, segments: Segments, uvFn?: UvFn | undefined);
}

declare class StripHelper extends THREE.LineSegments {
    strip: Strip;
    segments: number;
    length: number;
    xColor: THREE.Color;
    yColor: THREE.Color;
    zColor: THREE.Color;
    constructor(strip: Strip, segments: number, length?: number, xColor?: THREE.ColorRepresentation, yColor?: THREE.ColorRepresentation, zColor?: THREE.ColorRepresentation);
    update(): void;
}

export { Strip, StripGeometry, StripHelper };
