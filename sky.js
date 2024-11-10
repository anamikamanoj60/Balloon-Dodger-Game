import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(0, 2, 16);
light.castShadow = true;

const amb_light = new THREE.AmbientLight(0x404040);

const textureLoader = new THREE.TextureLoader();
const groundTex = textureLoader.load('sky.jpg');

const ground_geometry = new THREE.BoxGeometry(70, 35, 1);
const ground_material = new THREE.MeshLambertMaterial({ map: groundTex, color: 0xffffff });
const ground = new THREE.Mesh(ground_geometry, ground_material);

scene.add(ground);
scene.add(light);
scene.add(amb_light);
camera.position.z = 21;

const loader = new GLTFLoader();
let balloon; // Declare balloon at a higher scope

loader.load('scene.gltf', (gltf) => {
  balloon = gltf.scene; // Assign the loaded balloon to the higher-scoped variable
  balloon.position.set(0, 0, 0);
  balloon.scale.set(0.3, 0.3, 0.3);
  balloon.position.y = -10;
  balloon.position.z = 7;
  scene.add(balloon);
  animate();
});

let rotationSpeed = 0.01;
let spheresPerMinute = 30; // Customize the number of spheres per minute here
let score = 0; // Add a variable to keep track of the score
let gameOver = false; // Add a flag to track whether the game is over

document.addEventListener('keydown', (keychange) => {
  if (balloon && !gameOver) { // Check if balloon exists and the game is not over
    switch (keychange.key) {
      case 'ArrowUp':
        balloon.position.y += 0.3;
        break;
      case 'ArrowDown':
        balloon.position.y -= 0.3;
        break;
      case 'ArrowLeft':
        balloon.position.x -= 0.3;
        break;
      case 'ArrowRight':
        balloon.position.x += 0.3;
        break;
      case 'r':
        rotationSpeed += 0.01;
        break;
      case 's':
        if (rotationSpeed >= 0) {
          rotationSpeed -= 0.01;
        }
        break;
    }
  }
});
function createSphere() {
  const radius = 1; // Set the radius of the sphere
  const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  sphere.position.x = Math.random() * 40 - 20;
  sphere.position.y = 20;
  sphere.position.z = 7;

  //sphere.position.z = Math.random() * 7;

  const velocity = Math.random() * 0.1 + 0.1;
  sphere.userData = { velocity };

  scene.add(sphere);

  return sphere;
}

/*
function createSphere() {
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  sphere.position.x = Math.random() * 40 - 20;
  sphere.position.y = 20;
  sphere.position.z = Math.random() * 7;

  const velocity = Math.random() * 0.1 + 0.1;
  sphere.userData = { velocity };

  scene.add(sphere);

  return sphere;
}
  */

const spheres = [];
let lastSphereCreationTime = Date.now();

function checkCollision(sphere) {
  const distance = balloon.position.distanceTo(sphere.position);

  if (distance < 3) {
    endGame();
  }
}

function endGame() {
  gameOver = true; // Set the game over flag to true

  const endText = document.createElement('div');
  endText.style.position = 'absolute';
  endText.style.top = '50%';
  endText.style.left = '50%';
  endText.style.transform = 'translate(-50%, -50%)';
  endText.style.fontSize = '24px';
  endText.style.color = 'white';
  endText.textContent = `Game Over! You touched a sphere. Score: ${score}`;
  document.body.appendChild(endText);

  cancelAnimationFrame(animate);
}

function animate() {
  requestAnimationFrame(animate);

  const previousScoreText = document.getElementById('scoreText');
  if (previousScoreText) {
    document.body.removeChild(previousScoreText);
  }

  for (let i = 0; i < spheres.length; i++) {
    const sphere = spheres[i];
    sphere.position.y -= sphere.userData.velocity;

    if (sphere.position.y < -20) {
      scene.remove(sphere);
      spheres.splice(i, 1);
      i--;

      if (!gameOver) {
        score++;
      }
    } else {
      checkCollision(sphere);
    }
  }

  if (balloon) {
    balloon.rotation.y += rotationSpeed;
  }

  const currentTime = Date.now();
  const elapsedTime = (currentTime - lastSphereCreationTime) / 1000;

  if (elapsedTime >= 20 / spheresPerMinute) {
    const sphere = createSphere();
    spheres.push(sphere);
    lastSphereCreationTime = currentTime;
  }

  const scoreText = document.createElement('div');
  scoreText.style.position = 'absolute';
  scoreText.style.top = '10px';
  scoreText.style.left = '10px';
  scoreText.style.fontSize = '18px';
  scoreText.style.color = 'white';
  scoreText.textContent = `Score: ${score}`;
  scoreText.id = 'scoreText';
  document.body.appendChild(scoreText);

  renderer.render(scene, camera);
}

animate();
