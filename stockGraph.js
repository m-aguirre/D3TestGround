

var tempData = [
  {date: 2012-10-10, close: 91.55},
  {date: 2012-10-11, close: 89.72},
  {date: 2012-10-12, close: 87.69}
]



// var axes = {
//   x: d3.scaleLinear().domain([0, 100]).range([0, 200]),
//   y: d3.scaleLinear().domain([0, 100]).range([0, 400])
// };
const graph = () => {
  d3.select('body').append('svg')
    .attr('class', 'viewport')
    .attr('width', 300)
    .attr('height', 250)
    .style('background-color', 'black')
}

graph();
