var cubeItems = 5 + 1;
var cubeSpace = 7;
var cubeRatio = 2;
var pointSize = cubeSpace / cubeRatio;
var colorStep = 255 / (cubeItems - 1);
var R = 256 * 256;
var G = 256;
var B = 1;

var axisX = new THREE.Vector3(1, 0, 0);
var axisY = new THREE.Vector3(0, 1, 0);
var axisZ = new THREE.Vector3(0, 0, 1);
var angleX = -Math.PI / 4;
var angleY = -Math.PI / 4;
var angleZ = Math.atan(1 / Math.sqrt(2));

var sphere = new THREE.SphereGeometry(pointSize);
var bgMaterial = new THREE.MeshBasicMaterial({
  shading: THREE.FlatShading,
  //transparent: true,
  //opacity: 0.2,
  color: '#ffffff'
});


function objectToArray(o) {
  return Object.keys(o).map(function (k) {
    return o[k];
  });
}

function formatPoint(p) {
  return objectToArray(p).map(function (n) {
    return n.toFixed();
  }).join(', ');
}

function generatePoints() {
  var result = [];
  for (var r = 0; r <= 255; r += colorStep) {
    for (var g = 0; g <= 255; g += colorStep) {
      for (var b = 0; b <= 255; b += colorStep) {
        result.push(createPoint(numberToHex(r * R + g * G + b * B), bgMaterial));
      }
    }
  }
  return result;
}

function createPoint(color, material) {
  var m = material.clone();
  m.color = new THREE.Color(color);
  //setRgbTarget(mesh);
  //setPosition(mesh.position, mesh.userData.target);

  var mesh = new THREE.Mesh(sphere, m);

  mesh.userData = {color: d3.rgb(color)};
  setRgbTarget(mesh);

  mesh.matrixAutoUpdate = false;
  setPosition(mesh.position, mesh.userData.target);
  mesh.updateMatrix();

  return mesh;
}

function numberToHex(i) {
  var pad = "000000";
  var s = i.toString(16);
  return '#' + pad.substring(0, pad.length - s.length) + s
}

function calcLabTarget(color) {
  var lab = d3.lab(color);
  return new THREE.Vector3(
    lab.b,
    1.0306 * (-100 + 2 * lab.l),
    lab.a
  );
}

function setLabTarget(mesh) {
  mesh.userData.targetReached = false;
  mesh.userData.target = calcLabTarget(mesh.userData.color);
}

function calcHsvTarget(color, cone) {
  var hsl = d3.hsl(color);
  if (isNaN(hsl.h)) hsl.h = 0;

  var rgb = d3.rgb(color);
  var rgbArray = objectToArray(rgb);

  var M = d3.max(rgbArray);
  var m = d3.min(rgbArray);
  var C = (M - m) / 256;
  var S = M == 0 ? 0: 1 - m / M;

  var hsv = {
    h: hsl.h,
    s: cone ? C : S,
    v: M / 256
  };

  hsv.h -= 45;
  var rad = Math.PI * hsv.h / 180;
  return new THREE.Vector3(
    hsv.s * 97.15,
    -103 + 206 * hsv.v,
    0
  )
    .applyAxisAngle(axisY, rad);
}
function setHsvTarget(mesh) {
  mesh.userData.targetReached = false;
  mesh.userData.target = calcHsvTarget(mesh.userData.color, false);
}
function setHsvConeTarget(mesh) {
  mesh.userData.targetReached = false;
  mesh.userData.target = calcHsvTarget(mesh.userData.color, true);
}

function calcHslTarget(color, biCone) {
  var hsl = d3.hsl(color);
  if (isNaN(hsl.s)) hsl.s = 0;
  if (isNaN(hsl.h)) hsl.h = 0;
  hsl.h -= 45;
  var rad = Math.PI * hsl.h / 180;
  var cone = biCone ? 2 * (0.5 - Math.abs(hsl.l - 0.5)) : 1;
  return new THREE.Vector3(
    hsl.s * 97.15 * cone,
    -103 + 206 * hsl.l,
    0
  )
    .applyAxisAngle(axisY, rad);
}
function setHslTarget(mesh) {
  mesh.userData.targetReached = false;
  mesh.userData.target = calcHslTarget(mesh.userData.color, false);
}

function setHslBiConeTarget(mesh) {
  mesh.userData.targetReached = false;
  mesh.userData.target = calcHslTarget(mesh.userData.color, true);
}

function rgbTransform(x) {
  return .466 * x - 59.5;
}
function calcRgbTarget(color) {
  var rgb = d3.rgb(color);
  return new THREE.Vector3(
    rgbTransform(rgb.r),
    rgbTransform(rgb.g),
    rgbTransform(rgb.b)
  )
    .applyAxisAngle(axisX, angleX)
    .applyAxisAngle(axisZ, angleZ)
    .applyAxisAngle(axisY, angleY)

}
function setRgbTarget(mesh) {
  mesh.userData.targetReached = false;
  mesh.userData.target = calcRgbTarget(mesh.userData.color);
}

function setPosition(vector, values) {
  Object.keys(values).forEach(function (k) {
    vector[k] = values[k];
  });
}

function useRgb() {
  startAnimation(setRgbTarget);
}

function useLab() {
  startAnimation(setLabTarget);
}

function useHsv() {
  startAnimation(setHsvTarget);
}

function useHsvCone() {
  startAnimation(setHsvConeTarget);
}

function useHsl() {
  startAnimation(setHslTarget);
}

function useHslBiCone() {
  startAnimation(setHslBiConeTarget);
}