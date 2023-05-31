import * as THREE from "./threejs/three.module.js";
import { STLLoader } from "./threejs/STLLoader.js";
import { OrbitControls } from "./threejs/OrbitControls.js";

let scene, camera, renderer, object;

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe1e1e1);

  const canvasWidth = 600; // Ancho deseado del canvas
  const canvasHeight = 400; // Alto deseado del canvas

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
  light.intensity = 2.5; // Aumenta la intensidad de la luz
  scene.add(light);

  let light2 = new THREE.DirectionalLight(0xffffff);
  light2.position.set(-10, -10, -10);
  light2.intensity = 3; // Aumenta la intensidad de la luz
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
    console.log("Ancho:", width);
    console.log("Altura:", height);
    console.log("Largo:", lengthElement);

    // Mostrar las medidas en el HTML
    updateDimensions(dimensions);

    // Calcular el volumen en cm3
    const volumeInCm3 = calculateVolume(object);
    console.log("Volumen:", volumeInCm3, "cm³");

    // Calcular el peso en gramos
    const density = 1.4; // Densidad de la pieza en g/cm³
    const weightInGrams = calculateWeight(volumeInCm3, density);

    console.log("Peso:", weightInGrams, "g");

    // Calcular el peso de la base extra
    const extraWeight = calculateExtraWeight(
      dimensions.length,
      dimensions.width
    );
    console.log("Peso de la base extra:", extraWeight, "g");

    // Calcular el número de capas por 1 mm de altura
    const layersPerOneMillimeter = Math.ceil(dimensions.height * 28);
    console.log("Total de capas:", layersPerOneMillimeter);

    const timePrint = Math.ceil((layersPerOneMillimeter * 18) / 60);
    console.log("Tiempo de impresion aproximado:", timePrint, "min");

    animate();

    animate();
  });
}

// -------------------------para archivos STL---------------

// ----------------------funciones para tamaño de pieza--------------

function getDimensions(mesh) {
  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);

  const scale = 10; // Factor de escala para convertir de metros a milímetros

  return {
    width: size.x * scale,
    height: size.y * scale,
    length: size.z * scale,
  };
}

function updateDimensions(dimensions) {
  widthElement.textContent = dimensions.width.toFixed(2) + " mm";
  lengthElement.textContent = dimensions.length.toFixed(2) + " mm";
  heightElement.textContent = dimensions.height.toFixed(2) + " mm";
}

// Obtener las referencias a los elementos HTML
const widthElement = document.getElementById("width");
const lengthElement = document.getElementById("length");
const heightElement = document.getElementById("height");

function calculateVolume(object) {
  const geometry = object.geometry;

  // Verificar que la geometría sea un BufferGeometry
  if (geometry instanceof THREE.BufferGeometry) {
    geometry.computeBoundingBox();

    const positionAttribute = geometry.getAttribute("position");
    const positions = positionAttribute.array;
    const itemSize = positionAttribute.itemSize;
    const count = positionAttribute.count;

    let volume = 0;

    // Recorrer los vértices y calcular el volumen utilizando el método de integración del tetraedro
    for (let i = 0; i < count; i += 3) {
      const p1 = new THREE.Vector3(
        positions[i * itemSize],
        positions[i * itemSize + 1],
        positions[i * itemSize + 2]
      );
      const p2 = new THREE.Vector3(
        positions[(i + 1) * itemSize],
        positions[(i + 1) * itemSize + 1],
        positions[(i + 1) * itemSize + 2]
      );
      const p3 = new THREE.Vector3(
        positions[(i + 2) * itemSize],
        positions[(i + 2) * itemSize + 1],
        positions[(i + 2) * itemSize + 2]
      );

      const tetrahedronVolume = p1.dot(p2.cross(p3)) / 6;
      volume += tetrahedronVolume;
    }

    const volumeInMm3 = Math.abs(volume);
    const volumeInCm3 = volumeInMm3 / 1000;

    return volumeInCm3;
  }

  return 0;
}

function calculateWeight(volumeInCm3, density) {
  const weightInGrams = volumeInCm3 * density;
  return weightInGrams;
}

function calculateExtraWeight(length, width) {
  const height = 6; // Altura adicional en mm
  const volumeInCm3 = (length * width * height) / 1000; // Volumen en cm³
  const density = 1; // Densidad en gr/cm³ (se puede ajustar según el material)
  const weightInGrams = volumeInCm3 * density;
  return weightInGrams;
}

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
