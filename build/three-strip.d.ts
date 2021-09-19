import * as THREE from 'three';

declare type RadiusFn = (i: number, I: number) => number;
declare type TiltFn = (i: number, I: number) => number;
declare type UvFn = (i: number, I: number, j: number, J: number) => ([
    number,
    number,
    number,
    number
]);
declare type Curve = THREE.Curve<THREE.Vector3> | THREE.CurvePath<THREE.Vector3>;
declare type Frame = [
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3
];
declare type Segments = [number] | [number, number[]] | [number, number[], number];
declare type ParsedSegments = [
    number,
    number[],
    number
];

declare class Strip {
    curve: Curve;
    radius: number | RadiusFn;
    tilt: number | TiltFn;
    constructor(curve: Curve, radius?: number | RadiusFn, tilt?: number | TiltFn);
    computeFrames(segments: number): Frame[];
}

declare class StripGeometry extends THREE.BufferGeometry {
    #private;
    constructor(strip: Strip, segments: number | Segments, uvFn?: UvFn);
    static parseSegments(segments: number | Segments): ParsedSegments;
}

declare class StripHelper extends THREE.LineSegments {
    strip: Strip;
    segments: number;
    size: number;
    xColor: THREE.Color;
    yColor: THREE.Color;
    zColor: THREE.Color;
    constructor(strip: Strip, segments: number, size?: number, xColor?: THREE.ColorRepresentation, yColor?: THREE.ColorRepresentation, zColor?: THREE.ColorRepresentation);
    update(): void;
}

declare class UvPreset {
    static dash: [UvFn, UvFn, UvFn, UvFn];
    static strip: [UvFn, UvFn, UvFn, UvFn];
}

export { Strip, StripGeometry, StripHelper, UvPreset };
