

var tempData = [
  {date: 2012-10-10, close: 91.55},
  {date: 2012-10-11, close: 89.72},
  {date: 2012-10-12, close: 87.69}
]

// var axes = {
//   x: d3.scaleLinear().domain([0, 100]).range([0, 600]),
//   y: d3.scaleLinear().domain([0, 100]).range([0, 400])
// };

var x = d3.scaleTime()
    .domain([
      new Date(Date.parse('2014-01-01')),
      new Date(Date.parse('2015-01-01'))
    ])
    .range([0, 600]);

//idea for y-scale: use d3.range or d3.ticks to create array of y-scale arguments
//want an array of linearly-spaced values from min - 10ish% to max + 10ish%
//var y = d3.ticks(0,100, 25);
var yScale = d3.scaleLinear()
    .domain([100,0])
    .range([35,400]);

    var y = d3.scaleTime()
        .domain([
          new Date(Date.parse('2014-01-01')),
          new Date(Date.parse('2015-01-01'))
        ])
        .range([0, 600]);

var xAxis = d3.axisBottom(x).ticks(14);
var yAxis = d3.axisLeft(yScale).ticks(6);

const graph = () => {
  d3.select('body')
    .append('svg') //later, add div to html and select it
    .attr('class', 'viewport')
    .attr('width', 700)
    .attr('height', 450)
    .style('background-color', 'grey')

}

const placeXAxis = () => {
  d3.select('.viewport')
  .append('g')
  .attr('transform', 'translate(50,' + (400) + ')') //putting it at 'height' (== 250) pushes scale off the graph
  .call(xAxis)
}

const placeYAxis = () => {
  d3.select('.viewport')
  .append('g')
  .attr('transform', 'translate(50,' + 0 + ')')
  .call(yAxis)
}

graph();
placeXAxis();
placeYAxis();
