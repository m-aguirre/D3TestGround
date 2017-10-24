

var tempData = [
  {date: '2014-10-10', close: '61.55'},
  {date: '2014-4-11', close: '59.72'},
  {date: '2014-9-12', close: '27.69'},
  {date: '2014-6-20', close: '35.89'}
]

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
    .range([0,450]);

var xAxis = d3.axisBottom(x).ticks(14);
var yAxis = d3.axisLeft(yScale).ticks(6);

const graph = () => {
  d3.select('body')
    .append('svg') //later, add div to html and select it
    .attr('class', 'viewport')
    .attr('width', 700)
    .attr('height', 450)
}

const plotDataPoints = () => {
  d3.select('.viewport').selectAll("dot")
  .data(tempData)
  .enter().append("circle")
        .attr("r", 3.5)
        .attr("cx", (d) => { return x(Date.parse(d.date)); })
        .attr("cy", (d) => { return yScale(d.close) });
}

const placeXAxis = () => {
  d3.select('.viewport')
  .append('g')
  .attr('transform', 'translate(0,' + (450) + ')') //putting it at 'height' (== 250) pushes scale off the graph
  .call(xAxis)
}

const placeYAxis = () => {
  d3.select('.viewport')
  .append('g')
  .attr('transform', 'translate(0,' + 0 + ')')
  .call(yAxis)
}

/*
Now we have an svg that contains our graph axes.  Before we begin plotting points,
we want to make a 'graph area' tht precisely matches with our x and y axes so that
when we plot, the data points match with the axis ticks
*/

//going with a different approach, may delete this function later - it doesnt work
const placeCartesianPlane = () => {
  d3.select('.viewport')
  .append('g')
//  .attr('class', 'cartesian-plane')
  .attr('width', 600)
  .attr('height', 400)
  .style('background-color', 'blue')
//  .attr('transform', 'translate(50,50)')


}


graph();
placeXAxis();
placeYAxis();
plotDataPoints();
//placeCartesianPlane();
