import type * as THREE from "three";

export type RadiusFn = (i: number, I: number) => number;

export type TiltFn = (i: number, I: number) => number;

export type UvFn = (i: number, I: number) => [
  number, number, // u0, v0 
  number, number // u1, v1
];

export type Curve =
  | THREE.Curve<THREE.Vector3>
  | THREE.CurvePath<THREE.Vector3>
  ;

export type Frame = [
  THREE.Vector3, THREE.Vector3, THREE.Vector3, // B, N, T
  THREE.Vector3 // Origin
];