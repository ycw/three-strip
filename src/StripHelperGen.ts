import type * as THREE from 'three'
import type { Strip } from './Strip'
import * as Err from './Err'

// A fn generates a StripHelper class
export function StripHelperGen($: null | typeof THREE) {
  if (!$) {
    throw new Err.DependencyInjectionError();
  }
  return makeClass($);
}

function makeClass($: typeof THREE) {
  return class StripHelper extends $.LineSegments {

    #strip: Strip;
    #len: number;
    #c0: THREE.Color;
    #c1: THREE.Color;
    #c2: THREE.Color;

    #nFrm: number;
    #colorNeedsUpdate: boolean;

    /**
     * 
     * @param strip Strip object
     * @param length The length of axes
     * @param xColor Color of x-axis ( for binormal )
     * @param yColor Color of y-axis ( for normal )
     * @param zColor Color of z-axis ( for tangent )
     */
    constructor(
      strip: Strip,
      length: number = 1,
      xColor: THREE.ColorRepresentation = '#ff0000',
      yColor: THREE.ColorRepresentation = '#00ff00',
      zColor: THREE.ColorRepresentation = '#0000ff',
    ) {

      // --- guard
      if (!strip.geometry || !strip.frames) {
        throw new Err.GeometryHasDisposedError();
      }

      // --- build
      super(
        new $.BufferGeometry(),
        new $.LineBasicMaterial({ vertexColors: true })
      );

      this.#strip = strip;
      this.#len = length;
      this.#c0 = new $.Color(xColor);
      this.#c1 = new $.Color(yColor);
      this.#c2 = new $.Color(zColor);
      this.#nFrm = -1; // will force attrib color creation in update()
      this.#colorNeedsUpdate = true;

      this.update();
    }

    /**
     * Set axes colors.
     * 
     * @param xColor x-axis color
     * @param yColor y-axis color
     * @param zColor z-axis color
     * @returns 
     */
    setColors(
      xColor: THREE.ColorRepresentation = this.#c0,
      yColor: THREE.ColorRepresentation = this.#c1,
      zColor: THREE.ColorRepresentation = this.#c2,
    ) {
      xColor = new $.Color(xColor);
      yColor = new $.Color(yColor);
      zColor = new $.Color(zColor);

      // --- guard
      if (
        this.#c0.equals(xColor) &&
        this.#c1.equals(yColor) &&
        this.#c2.equals(zColor)
      ) return;

      this.#c0 = xColor;
      this.#c1 = yColor;
      this.#c2 = zColor;

      this.#colorNeedsUpdate = true;
      this.update();
    }

    /**
     * Set axes length.
     * 
     * @param x length
     */
    setLength(
      x: number
    ) {
      this.#len = x;
      this.update();
    }

    /**
     * Update helper object.
     */
    update() {

      this.geometry.dispose();

      // --- guard
      if (!this.#strip.geometry || !this.#strip.frames) {
        // throw new Err.GeometryHasDisposedError();
        return;
      }

      // set new attrib 'color' if frame count is changed
      if (this.#strip.frames.length !== this.#nFrm) {
        this.geometry.setAttribute('color',
          new $.Float32BufferAttribute(this.#strip.frames.length * 18, 3)
        );
        this.#nFrm = this.#strip.frames.length;
        this.#colorNeedsUpdate = true;
      }

      // attrib color
      const aColor = this.geometry.getAttribute('color');

      // sample points
      const samples = this.#strip.curve.getSpacedPoints(this.#strip.segment);

      // positions
      const pts = [];

      for (const [i, frm] of this.#strip.frames.entries()) {

        // points
        pts.push(
          samples[i],
          frm[1].clone().multiplyScalar(this.#len).add(samples[i]), // B (=x)
          samples[i],
          frm[2].clone().multiplyScalar(this.#len).add(samples[i]), // N (=y)
          samples[i],
          frm[0].clone().multiplyScalar(this.#len).add(samples[i]), // T (=z)
        );

        // vert colors
        if (this.#colorNeedsUpdate) {
          (aColor.array as Float32Array).set([
            this.#c0.r, this.#c0.g, this.#c0.b,
            this.#c0.r, this.#c0.g, this.#c0.b,
            this.#c1.r, this.#c1.g, this.#c1.b,
            this.#c1.r, this.#c1.g, this.#c1.b,
            this.#c2.r, this.#c2.g, this.#c2.b,
            this.#c2.r, this.#c2.g, this.#c2.b
          ], i * 18);
        }
      }

      // set attrib 'position'
      this.geometry.setFromPoints(pts);

      // set dirty attrib 'color'
      if (this.#colorNeedsUpdate)
        this.geometry.attributes.color.needsUpdate = true;

      // reset
      this.#colorNeedsUpdate = false;
    }
  }
}