import type * as THREE from 'three'
import type { Strip } from './Strip'
import * as Err from './Err'

const X_COLOR = '#ff0000';
const Y_COLOR = '#00ff00';
const Z_COLOR = '#0000ff';

export interface StripHelperClass {
  /**
   * Construct a strip helper which shows right-handed TBN frames of strip.
   * @param strip Strip object
   * @param length Length of axes; default is `1`
   * @param xColor x-axis color ( for binormal ); default is `'#ff0000'`
   * @param yColor y-axis color ( for normal ); default is `'#00ff00'`
   * @param zColor z-axis color ( for tangent ); default is `'#0000ff'`
   */
  new(
    strip: Strip,
    length?: number,
    xColor?: THREE.ColorRepresentation,
    yColor?: THREE.ColorRepresentation,
    zColor?: THREE.ColorRepresentation
  ): StripHelper;
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
   * @returns 
   */
  setColors(
    xColor?: THREE.ColorRepresentation,
    yColor?: THREE.ColorRepresentation,
    zColor?: THREE.ColorRepresentation
  ): void;

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

export function StripHelperGen($: typeof THREE): StripHelperClass {

  return class extends $.LineSegments {

    #strip: null | Strip = null;
    #len: number = NaN;
    #c0: null | THREE.Color = null;
    #c1: null | THREE.Color = null;
    #c2: null | THREE.Color = null;
    #disposed = false;

    constructor(
      strip: Strip,
      length: number = 1,
      xColor: THREE.ColorRepresentation = X_COLOR,
      yColor: THREE.ColorRepresentation = Y_COLOR,
      zColor: THREE.ColorRepresentation = Z_COLOR,
    ) {

      // guard

      if (strip.isDisposed) {
        throw new Err.GeometryHasDisposedError();
      }

      super(
        new $.BufferGeometry(),
        new $.LineBasicMaterial({ vertexColors: true })
      );

      this.type = 'StripHelper';
      this.#strip = strip;
      this.#len = length;
      this.#c0 = new $.Color(xColor);
      this.#c1 = new $.Color(yColor);
      this.#c2 = new $.Color(zColor);
      this.#disposed = false;

      this.update();
    }

    getColors() {

      // guard ( helper is disposed ) 

      if (
        this.#disposed ||
        !this.#c0 || !this.#c1 || !this.#c2
      ) return [null, null, null];

      // return clones

      return [this.#c0.clone(), this.#c1.clone(), this.#c2.clone()];
    }

    setColors(
      xColor?: THREE.ColorRepresentation,
      yColor?: THREE.ColorRepresentation,
      zColor?: THREE.ColorRepresentation,
    ) {

      if (
        this.#disposed ||
        !this.#c0 || !this.#c1 || !this.#c2
      ) return;

      xColor = new $.Color(xColor ?? this.#c0);
      yColor = new $.Color(yColor ?? this.#c1);
      zColor = new $.Color(zColor ?? this.#c2);

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

    getLength() {
      return this.#len;
    }

    setLength(x: number) {
      if (this.#disposed) return;
      this.#len = x;
      this.update();
    }

    update() {

      this.geometry.dispose();

      // guard ( helper has disposed )

      if (
        this.#disposed ||
        !this.#strip ||
        !this.#c0 || !this.#c1 || !this.#c2
      ) return;

      // guard ( strip has disposed )

      if (
        this.#strip.isDisposed ||
        !this.#strip.geometry || !this.#strip.frames
      ) return;

      // cache

      const $frms = this.#strip.frames;
      const $I = $frms.length;

      // re alloc

      const aColor = new $.Float32BufferAttribute($I * 18, 3);
      this.geometry.setAttribute('color', aColor);

      const aPo = new $.Float32BufferAttribute($I * 18, 3);
      this.geometry.setAttribute('position', aPo);

      // cache

      const $v0 = new $.Vector3();
      const $v1 = new $.Vector3();
      const $v2 = new $.Vector3();
      const $v3 = new $.Vector3();
      const $aPo = this.#strip.geometry.attributes.position;

      for (let i = 0, $i = -1; i < $I; ++i) {

        // find pos ( mid of 2 handles )

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

        $v3.addVectors($v0, $v1).multiplyScalar(.5); // =sample point, p

        $v0.copy($frms[i][1]).multiplyScalar(this.#len).add($v3); // B for x
        $v1.copy($frms[i][2]).multiplyScalar(this.#len).add($v3); // N for y
        $v2.copy($frms[i][0]).multiplyScalar(this.#len).add($v3); // T for z

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

    dispose() {
      if (this.#disposed) return;

      this.#strip = null; // unref
      this.#len = NaN;
      this.#c0 = null;
      this.#c1 = null;
      this.#c2 = null;
      this.geometry.dispose();
      Array.isArray(this.material)
        ? this.material.forEach(m => m.dispose())
        : this.material.dispose();
      this.#disposed = true;
    }

    get isDisposed() {
      return this.#disposed;
    }
  }
}