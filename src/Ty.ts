export type Curve =
  | THREE.Curve<THREE.Vector3>
  | THREE.CurvePath<THREE.Vector3>;

export type RadiusFn = (i: number, I: number) => number;

export type TiltFn = (i: number, I: number) => number;

type UvTuple = [number, number, number, number]; // u0 v0 u1 v1
export type UvFn = (i: number, I: number) => UvTuple;

export type Morph = {
  curve: Curve;
  radius?: number | RadiusFn;
  tilt?: number | TiltFn;
};

export type Frame = [
  THREE.Vector3, // T
  THREE.Vector3, // B
  THREE.Vector3  // N
];
