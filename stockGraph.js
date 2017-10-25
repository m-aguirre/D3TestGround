

//Will need to set up a server to test the CSV data in chrome, opting to
//use more dummy data for the time being

var tempData = [
  {date: '2014-10-10', close: '61.55'},
  {date: '2014-4-11', close: '59.72'},
  {date: '2014-9-12', close: '27.69'},
  {date: '2014-6-20', close: '35.89'},
  {date: '2014-7-19', close: '43.96'},
  {date: '2014-8-4', close: '40.21'},
  {date: '2014-2-17', close: '38.89'},
  {date: '2014-6-2', close: '42.29'},
  {date: '2014-3-14', close: '38.99'},
  {date: '2014-10-20', close: '63.59'},
  {date: '2014-9-20', close: '56.23'}
]


// d3.csv('./AAPL.csv', (data) => {
//   data.forEach( (d) => {
//     d.date = d.date;
//     d.close = +d.close;
//   })
//   console.log(data[0])
// })

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
  d3.select('.viewport')
  .selectAll("circle")
  .data(tempData)
  .enter().append("circle")
        .attr("r", 3.5)
        .attr("cx", (d) => { return x(Date.parse(d.date)); })
        .attr("cy", (d) => { return yScale(d.close) })
        .style('stroke', 'black')
        .style('fill', 'none')
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
Want to find the equation y = b0 + b1x1
where our dependent variable y is the stock price
and our independent variable is the number of days from the origin
*/
const calculateRegressionLine = (data) => {

  var sumX = 0;
  var sumY = 0;
  var sumXY = 0;
  var sumXSquared = 0;
  var sumYSquared = 0;
  var n = Object.keys(data).length;

  data.forEach( (d) => {
    var date = d.date;
    var y = +d.close;
    var x = (Math.floor((Date.parse(date) - Date.parse('2014-01-01'))/86400000));

    sumX += x;
    sumY += y;
    sumXY += (x * y);
    sumXSquared += (x * x);
    sumYSquared += (y * y);
  });

  console.log(sumX);
  console.log(sumY);

  b0 = ( ((sumY * sumXSquared) - (sumX * sumXY)) / ((n * sumXSquared) - (sumX * sumX)) );
  b1 = ( ((n * sumXY) - (sumX * sumY)) / ((n * sumXSquared) - (sumX * sumX)) );

  console.log(b0);
  console.log(b1);

}

//Now we want to draw a line, then we will use our regression coefficient to
//make a proper regression line


var line = {
  start: {x: "2014-01-01", y: 3},
  end: {x: "2014-12-31", y: 80 }
}

const drawLine = () => {
  d3.select('.viewport')
  .append('g')
  .append('line')
  .style('stroke', 'blue')
  .attr('x1', x(Date.parse(line.start.x)))
  .attr('y1', yScale(line.start.y))
  .attr('x2', x(Date.parse(line.end.x)))
  .attr('y2', yScale(line.end.y))
}

graph();
placeXAxis();
placeYAxis();
plotDataPoints();
calculateRegressionLine(tempData);
drawLine();

//placeCartesianPlane();
