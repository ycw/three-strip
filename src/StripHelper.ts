import * as THREE from "three";
import { Strip } from "./Strip";

export class StripHelper extends THREE.LineSegments {

  xColor: THREE.Color;
  yColor: THREE.Color;
  zColor: THREE.Color;

  constructor(
    public strip: Strip,
    public segments: number,
    public length = 1,
    xColor: THREE.ColorRepresentation = 0xff0000,
    yColor: THREE.ColorRepresentation = 0x00ff00,
    zColor: THREE.ColorRepresentation = 0x0000ff
  ) {
    super(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ vertexColors: true })
    );
    this.type = "StripHelper";
    this.xColor = new THREE.Color(xColor);
    this.yColor = new THREE.Color(yColor);
    this.zColor = new THREE.Color(zColor);
    this.update();
  }

  update() {
    const segments = Math.max(1, this.segments | 0);
    const length = Math.max(0, this.length);
    const frames = this.strip.computeFrames(segments);
    const ps = new Float32Array(18 * frames.length);
    const cs = new Float32Array(18 * frames.length);
    this.geometry.dispose();
    this.geometry.attributes.position = new THREE.BufferAttribute(ps, 3);
    this.geometry.attributes.color = new THREE.BufferAttribute(cs, 3);

    for (const [i, [B, N, T, O]] of frames.entries()) {
      // pos
      B.multiplyScalar(length).add(O);
      N.multiplyScalar(length).add(O);
      T.multiplyScalar(length).add(O);
      ps.set([
        O.x, O.y, O.z, B.x, B.y, B.z,
        O.x, O.y, O.z, N.x, N.y, N.z,
        O.x, O.y, O.z, T.x, T.y, T.z,
      ], 18 * i);

      // color
      cs.set([
        this.xColor.r, this.xColor.g, this.xColor.b,
        this.xColor.r, this.xColor.g, this.xColor.b,
        this.yColor.r, this.yColor.g, this.yColor.b,
        this.yColor.r, this.yColor.g, this.yColor.b,
        this.zColor.r, this.zColor.g, this.zColor.b,
        this.zColor.r, this.zColor.g, this.zColor.b,
      ], 18 * i);
    }
  }
}