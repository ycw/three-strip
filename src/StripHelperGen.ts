import type * as THREE from 'three'
import type { Strip } from './Strip'
import * as Err from './Err'

// A fn generates a StripHelper class
export function StripHelperGen($: typeof THREE) {
  return class StripHelper extends $.LineSegments {

    #strip: Strip;
    #len: number;
    #c0: THREE.Color;
    #c1: THREE.Color;
    #c2: THREE.Color;

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

      // guard

      if (!strip.geometry || !strip.frames) {
        throw new Err.GeometryHasDisposedError();
      }

      // build

      super(
        new $.BufferGeometry(),
        new $.LineBasicMaterial({ vertexColors: true })
      );

      this.#strip = strip;
      this.#len = length;
      this.#c0 = new $.Color(xColor);
      this.#c1 = new $.Color(yColor);
      this.#c2 = new $.Color(zColor);

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

      // guard

      if (
        this.#c0.equals(xColor) &&
        this.#c1.equals(yColor) &&
        this.#c2.equals(zColor)
      ) return;

      this.#c0 = xColor;
      this.#c1 = yColor;
      this.#c2 = zColor;

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

      // guard

      if (!this.#strip.geometry || !this.#strip.frames) {
        return;
      }

      const $frms = this.#strip.frames;
      const $I = $frms.length;

      const aColor = new $.Float32BufferAttribute($I * 18, 3)
      this.geometry.setAttribute('color', aColor);

      const aPo = new $.Float32BufferAttribute($I * 18, 3);
      this.geometry.setAttribute('position', aPo);

      const $v0 = new $.Vector3();
      const $v1 = new $.Vector3();
      const $v2 = new $.Vector3();
      const $v3 = new $.Vector3();
      const $aPo = this.#strip.geometry.attributes.position;

      for (let i = 0, $i = -1; i < $I; ++i) {

        $v0.set(
          $aPo.getX($i = i * 2),
          $aPo.getY($i),
          $aPo.getZ($i)
        );

        $v1.set(
          $aPo.getX(++$i),
          $aPo.getY($i),
          $aPo.getZ($i)
        );

        $v3.addVectors($v0, $v1).multiplyScalar(.5);

        $v0.copy($frms[i][1]).multiplyScalar(this.#len).add($v3); // B
        $v1.copy($frms[i][2]).multiplyScalar(this.#len).add($v3); // N
        $v2.copy($frms[i][0]).multiplyScalar(this.#len).add($v3); // T

        (aPo.array as Float32Array).set([
          $v3.x, $v3.y, $v3.z, $v0.x, $v0.y, $v0.z, // p->B
          $v3.x, $v3.y, $v3.z, $v1.x, $v1.y, $v1.z, // p->N
          $v3.x, $v3.y, $v3.z, $v2.x, $v2.y, $v2.z, // p->T
        ], i * 18);

        // vert colors

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
  }
}