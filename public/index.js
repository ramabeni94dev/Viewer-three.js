import * as THREE from "./threejs/three.module.js";
import { STLLoader } from "./threejs/STLLoader.js";
import { OrbitControls } from "./threejs/OrbitControls.js";

let scene, camera, renderer, object;

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe1e1e1);

  const canvasWidth = 800; // Ancho deseado del canvas
  const canvasHeight = 600; // Alto deseado del canvas

  camera = new THREE.PerspectiveCamera(
    75,
    canvasWidth / canvasHeight,
    0.1,
    10000
  );
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(canvasWidth, canvasHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(object);

  let control = new OrbitControls(camera, renderer.domElement);

  let light = new THREE.DirectionalLight(0xffffff);
  light.position.set(10, 10, 10);
  scene.add(light);

  let light2 = new THREE.DirectionalLight(0xffffff);
  light2.position.set(-10, -10, -10);
  scene.add(light2);

  animate();
}

// -------------------------para archivos STL---------------

function loadSTL(file) {
  let loader = new STLLoader();
  loader.load(file, (model) => {
    if (object) {
      scene.remove(object);
    }

    object = new THREE.Mesh(
      model,
      new THREE.MeshLambertMaterial({ color: 0x60574e })
    );
    object.scale.set(0.1, 0.1, 0.1);
    object.position.set(0, -5, 0);
    object.rotation.x = -Math.PI / 2;

    // Centrar la geometría de la pieza
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);

    scene.add(object);

    // Obtener las medidas de ancho, largo y alto
    const dimensions = getDimensions(object);

    // Mostrar las medidas en el HTML
    updateDimensions(dimensions);

    animate();
  });
}

// -------------------------para archivos STL---------------

// ----------------------funciones para tamaño de pieza--------------

function getDimensions(mesh) {
  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);

  return {
    width: size.x,
    length: size.y,
    height: size.z,
  };
}

function updateDimensions(dimensions) {
  widthElement.textContent = dimensions.width.toFixed(2);
  lengthElement.textContent = dimensions.length.toFixed(2);
  heightElement.textContent = dimensions.height.toFixed(2);
}

// Obtener las referencias a los elementos HTML
const widthElement = document.getElementById("width");
const lengthElement = document.getElementById("length");
const heightElement = document.getElementById("height");

// ----------------------funciones para tamaño de pieza--------------

// ----------------------carga d earchivos--------------

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

document.addEventListener("DOMContentLoaded", () => {
  init();

  const form = document.querySelector("form");
  const fileInput = document.getElementById("fileInput");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const file = fileInput.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      loadSTL(fileURL);
      fileInput.value = ""; // Limpiar el campo de carga de archivos
    }
  });
});

// ----------------------carga d earchivos--------------
