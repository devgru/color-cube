const d3 = require('d3');
const d3c = require('d3-color');

const isDisplayable = z => z.displayable();

var colors = 2;
function generateColors(offset, c, l) {
  return d3.range(0, colors).map(o => d3c.hcl(o * 360 / colors + offset, c, l));
}

function run() {
  var displayable = [];
  var number = 360 / colors;
  var stop = number / 2;
  d3.range(-stop, stop).forEach(o =>
      d3.range(10, 100).forEach(c =>
          d3.range(10, 100).forEach(function (l) {
            var colors = generateColors(o, c, l);
            var result = colors.every(isDisplayable);
            var items;
            if (result) {
              items = [o, c, l, colors.map(String)];
              displayable.push(items);
            }
          })
      )
  );
  displayable.sort((a, b) => a[1] - b[1]);
  var max = d3.max(displayable, (a) => a[1]);
  max = displayable.filter(a => a[1] == max);
  console.log(max);
  //var x = max.map((x) => x[3].map((c) => 'background:' + c));
  //x.forEach((c) => console.log('%c %c %c %c %c %c ', c[0], c[1], c[2], c[3], c[4], c[5]));
}

run();
