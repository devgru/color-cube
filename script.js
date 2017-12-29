var maxSpeed = 3;
var maxSpeedSq = Math.pow(maxSpeed, 2);

var container;

var camera;
var controls;
var scene;
var renderer;

init();

function move(p, t) {
  var distance = p.distanceToSquared(t);
  var isTooFar = distance > maxSpeedSq;

  if (isTooFar) {
    var step = new THREE.Vector3()
      .subVectors(t, p)
      .setLength(maxSpeed);
    p.add(step);
    return false;
  } else {
    p.copy(t);
    return true;
  }
}

function startAnimation(fn) {
  var meshes = scene.children.filter(function (o) {
    return o instanceof THREE.Mesh;
  });
  meshes.map(fn);
  animate();

  function animate() {
    var updates = meshes.map(function (mesh) {
      var data = mesh.userData;
      if (data.targetReached) return false;

      var p = mesh.position;
      var t = data.target;
      data.targetReached = move(p, t);
      mesh.updateMatrix();

      return true;
    }).filter(Boolean).length;

    controls.update();
    render();
    //console.log('animation step #', updates, animations++);

    if (updates) requestAnimationFrame(animate);
  }
}

function init() {
  camera = new THREE.PerspectiveCamera(50, 1, 1, 10000);
  camera.position.z = 500;

  controls = new THREE.OrbitControls(camera);
  //controls.autoRotate = true;

  var currentPoint = 0;
  var points = generatePoints();
  function rotate() {
    return
    if (currentPoint < points.length) {
      controls.update();

      requestAnimationFrame(rotate);
    }
  }

  scene = new THREE.Scene();
  points.forEach(function (point) { scene.add(point); })
  rotate();

  // renderer

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x808080);

  container = document.getElementById('container');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);
  controls.addEventListener('change', function () {
    render();
  });

  onWindowResize();
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  render();
}

function render() {
  renderer.render(scene, camera);
}