import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Strip, StripGeometry, StripHelper } from '../../build/three-strip.js'
import { Pane } from '//cdn.skypack.dev/tweakpane@3.0.5?min'

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 2, .1, 100);
const controls = new OrbitControls(camera, renderer.domElement);

scene.background = new THREE.Color('white');
controls.target.set(0, 1, 0);
camera.position.set(0, 1, 3);
controls.enableDamping = true;

scene.add(new THREE.GridHelper());

// ----
// params
// ----

const params = {
  twist: 0,
  taper: 0,
  segments: 50,
  subsegments: 50,
  offset: 0,
  UvPresets: 0,
};

// ----
// Curve
// ----

const curve = new THREE.LineCurve3(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 2, 0)
);

// ----
// Mesh
// ----

const { geom, strip } = make();
const map = new THREE.TextureLoader().load('../img/a.org.jpg');
const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map });
const mesh = new THREE.Mesh(geom, mat);
scene.add(mesh);

// ----
// StripHelper
// ----

const helper = new StripHelper(strip, params.segments, .1);
helper.material.depthTest = false;
scene.add(helper);

// ----
// Strip and StripGeometry
// ----

function make() {
  const strip = new Strip(
    curve,
    (i, I) => 1 - i / I * params.taper,
    (i, I) => i / I * params.twist
  );
  const geom = new StripGeometry(
    strip,
    [params.segments, params.subsegments, params.offset],
    Strip.UvPresets[params.UvPresets]
  );
  return { strip, geom };
}

// ----
// GUI
// ----

const pane = new Pane({ title: 'three-strip' });
pane.addInput(params, 'twist', { min: -Math.PI * 2, max: Math.PI * 2 });
pane.addInput(params, 'taper', { min: 0, max: 1 });
pane.addInput(params, 'segments', { min: 1, max: 100, step: 1 });
pane.addInput(params, 'subsegments', { min: 1, max: 100, step: 1 });
pane.addInput(params, 'offset', { min: -100, max: 100, step: 1 });
pane.addInput(params, 'UvPresets', { options: { 0: 0, 1: 1, 2: 2, 3: 3 } });
pane.on('change', () => {
  const { geom, strip } = make();
  mesh.geometry.dispose();
  mesh.geometry = geom;

  helper.strip = strip;
  helper.segments = params.segments;
  helper.update();

  params.subsegments = Math.min(params.segments, params.subsegments);
  pane.refresh();
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