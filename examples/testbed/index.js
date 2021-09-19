import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Strip, StripGeometry, StripHelper } from '../../build/three-strip.js'
import { Pane } from '//cdn.skypack.dev/tweakpane@3.0.5?min'

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 2, .1, 100);
const controls = new OrbitControls(camera, renderer.domElement);

scene.background = new THREE.Color('white');
controls.target.set(0, 2, 0);
camera.position.set(0, 2, 3);
controls.enableDamping = true;

scene.add(new THREE.GridHelper());

// ----
// params
// ----

const uvFns = {
  0: Strip.UvPresets.strip[0],
  1: Strip.UvPresets.strip[1],
  2: Strip.UvPresets.strip[2],
  3: Strip.UvPresets.strip[3],
  4: Strip.UvPresets.dash[0],
  5: Strip.UvPresets.dash[1],
  6: Strip.UvPresets.dash[2],
  7: Strip.UvPresets.dash[3],
};

const params = {
  twist: 0,
  taper: 0,
  nSeg: 50,
  useDash: true,
  dashArray: '1,2,3',
  dashOffset: 0,
  uvFnsIdx: 0,
};

// ----
// Curve
// ----

const curve = new THREE.LineCurve3(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 4, 0)
);

// ----
// Mesh
// ----

const { geom, strip } = make(params);
const map = new THREE.TextureLoader().load('../img/a.jpg');
const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map });
const mesh = new THREE.Mesh(geom, mat);
scene.add(mesh);

// ----
// StripHelper
// ----

const helper = new StripHelper(strip, params.nSeg, .2);
helper.material.depthTest = false;
scene.add(helper);

// ----
// Strip and StripGeometry
// ----

function make(params) {
  const strip = new Strip(
    curve,
    (i, I) => 1 - i / I * params.taper,
    (i, I) => i / I * params.twist + Math.PI / 2
  );
  const par1 = params.useDash
    ? [
      params.nSeg,
      params.dashArray.split(',').map(Number.parseFloat),
      params.dashOffset
    ]
    : params.nSeg
    ;
  const geom = new StripGeometry(strip, par1, uvFns[params.uvFnsIdx]);
  return { strip, geom };
}

// ----
// GUI
// ----

const pane = new Pane({ title: 'three-strip' });
pane.addInput(params, 'twist', { min: -Math.PI * 2, max: Math.PI * 2 });
pane.addInput(params, 'taper', { min: 0, max: 1 });
pane.addInput(params, 'uvFnsIdx', {
  title: 'uvFn',
  options: {
    'UvPresets.strip[0]': 0,
    'UvPresets.strip[1]': 1,
    'UvPresets.strip[2]': 2,
    'UvPresets.strip[3]': 3,
    'UvPresets.dash[0]': 4,
    'UvPresets.dash[1]': 5,
    'UvPresets.dash[2]': 6,
    'UvPresets.dash[3]': 7,
  }
});
pane.addInput(params, 'nSeg', { min: 1, max: 100, step: 10 });
pane.addInput(params, 'useDash');
const dashArrayInput = pane.addInput(params, 'dashArray');
const dashOffsetInput = pane.addInput(params, 'dashOffset', { min: -10, max: 10, step: 1 });
pane.on('change', (e) => {
  const { geom, strip } = make(params);
  mesh.geometry.dispose();
  mesh.geometry = geom;

  helper.strip = strip;
  helper.segments = params.nSeg;
  helper.update();

  dashArrayInput.hidden = !params.useDash;
  dashOffsetInput.hidden = !params.useDash;
});

// ----
// render
// ----

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  controls.update();
});

// ----
// view
// ----

function resize(w, h, dpr = devicePixelRatio) {
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', () => resize(innerWidth, innerHeight));
dispatchEvent(new Event('resize'));
document.body.prepend(renderer.domElement);