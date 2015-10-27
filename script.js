var maxSpeed = 3;
var maxSpeedSq = Math.pow(maxSpeed, 2);

var container;

var camera;
var controls;
var scene;
var renderer;

var animations = 0;

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
  d3.shuffle(points);
  function rotate() {
    if (currentPoint < points.length) {
      scene.add(points[currentPoint++]);
      controls.update();

      requestAnimationFrame(rotate);
    }
    //controls.rotateLeft(Math.PI * 2 * 0.5 / 360);
  }

  scene = new THREE.Scene();
  rotate();


  /*
   var fgMaterial = new THREE.MeshBasicMaterial({shading: THREE.FlatShading});
   var trelloRed = [ '#fbedeb',
   '#f5d3ce',
   '#efb3ab',
   '#ec9488',
   '#ef7564',
   '#eb5a46',
   '#cf513d',
   '#b04632',
   '#933b27',
   '#6e2f1a' ];


   trelloRed.forEach(function (rgb) {
   pushPoint(rgb, fgMaterial);
   });*/

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