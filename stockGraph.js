

var tempData = [
  {date: 2012-10-10, close: 91.55},
  {date: 2012-10-11, close: 89.72},
  {date: 2012-10-12, close: 87.69}
]



var axes = {
  x: d3.scaleLinear().domain([0, 100]).range([0, 200]),
  y: d3.scaleLinear().domain([0, 100]).range([0, 400])
};

var x = d3.scaleTime()
    .domain([
      new Date(Date.parse('2014-01-01')),
      new Date(Date.parse('2014-04-01'))
    ])
    .range([0, 300]);

var xAxis = d3.axisBottom(x).ticks(4);

const graph = () => {
  d3.select('body')
    .append('svg') //later, add div to html and select it
    .attr('class', 'viewport')
    .attr('width', 300)
    .attr('height', 250)
    .style('background-color', 'grey')
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + (230) + ')') //putting it at 'height' (== 250) pushes scale off the graph
    .call(xAxis)
}


graph();
