var cubeItems = 17 + 1;
var cubeSpace = 7;
var cubeRatio = 4;
var cubeSize = cubeSpace / cubeRatio;
var margin = -cubeSpace * (cubeItems - 1) / 2;
var colorStep = 255 / (cubeItems - 1);
var r = colorStep * 256 * 256;
var g = colorStep * 256;
var b = colorStep;

var maxSpeed = 1;
var maxSpeedSq = Math.pow(maxSpeed, 2);
var currentTarget = 'rgb';
var meshes = null;

var container, stats;

var camera, controls, scene, renderer;

var axisX = new THREE.Vector3(1, 0, 0);
var axisY = new THREE.Vector3(0, 1, 0);
var axisZ = new THREE.Vector3(0, 0, 1);
var angleX = -Math.PI / 4;
var angleY = -Math.PI / 4;
var angleZ = Math.atan(Math.sqrt(2) / 2);

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

function animate() {
    render();
    meshes.forEach(function (mesh) {
        var data = mesh.userData;
        if (data.targetReached) {
            return;
        }
        var p = mesh.position;
        var t = data.target;

        data.targetReached = move(p, t);
        mesh.updateMatrix();

    });
    stats.update();
    controls.update();
    requestAnimationFrame(animate);
}

function numberToHex(i) {
    var pad = "000000";
    var s = i.toString(16);
    return '#' + pad.substring(0, pad.length - s.length) + s
}

function changeModel() {
    if (currentTarget == 'rgb') {
        currentTarget = 'lab';
        meshes.forEach(setLabTarget);
    } else {
        currentTarget = 'rgb';
        meshes.forEach(setRgbTarget);
    }
}

function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

function setLabTarget(mesh) {
    var lab = d3.lab(mesh.userData.color);
    mesh.userData.targetReached = false;
    mesh.userData.target = new THREE.Vector3(
        (lab.b),
        -100 + 2 * lab.l,
        (lab.a)
    );
}

function rgbTransform(x) {
    return margin + cubeSpace * x / colorStep;
}
function setRgbTarget(mesh) {
    var rgb = mesh.userData.color;
    mesh.userData.targetReached = false;
    mesh.userData.target = new THREE.Vector3(
        rgbTransform(rgb.r),
        rgbTransform(rgb.g),
        rgbTransform(rgb.b)
    )
        .applyAxisAngle(axisX, angleX)
        .applyAxisAngle(axisZ, angleZ)
        .applyAxisAngle(axisY, angleY)

}

function setPosition(vector, values) {
    Object.keys(values).forEach(function (k) {
        vector[k] = values[k];
    });
}

function init() {
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 500;

    controls = new THREE.OrbitControls(camera);

    scene = new THREE.Scene();

    // world
    var cube = new THREE.SphereGeometry(cubeSize);
    var material = new THREE.MeshBasicMaterial({shading: THREE.FlatShading});

    for (var x = 0; x < cubeItems; x++) {
        for (var y = 0; y < cubeItems; y++) {
            for (var z = 0; z < cubeItems; z++) {
                var rgbInt = x * r + y * g + b * z;
                var color = d3.rgb(numberToHex(rgbInt));

                var m = material.clone();
                m.color = new THREE.Color(rgbInt);
                var mesh = new THREE.Mesh(cube, m);

                mesh.userData = {color: color};
                setRgbTarget(mesh);

                scene.add(mesh);

                mesh.matrixAutoUpdate = false;
                setPosition(mesh.position, mesh.userData.target);
                mesh.updateMatrix();
            }
        }
    }

    meshes = scene.children.filter(function (o) {
        return o instanceof THREE.Mesh;
    });

    document.getElementById('info').addEventListener('click', changeModel);

    // renderer

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x808080);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    stats = new Stats();
    var statsStyle = stats.domElement.style;
    statsStyle.position = 'absolute';
    statsStyle.top = '0px';
    statsStyle.zIndex = 100;
    container.appendChild(stats.domElement);

    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    renderer.render(scene, camera);
}