

//Will need to set up a server to test the CSV data in chrome, opting to
//use more dummy data for the time being

var tempData = [
  {"date": '2014-2-17', "close": '38.89'},
  {date: '2014-3-14', close: '38.99'},
  {date: '2014-4-11', close: '59.72'},
  {date: '2014-6-2', close: '42.29'},
  {date: '2014-6-20', close: '35.89'},
  {date: '2014-7-19', close: '43.96'},
  {date: '2014-8-4', close: '40.21'},
  {date: '2014-9-12', close: '27.69'},
  {date: '2014-9-20', close: '56.23'},
  {date: '2014-10-10', close: '61.55'},
  {date: '2014-10-20', close: '63.59'}
]
tempData = aaplData;

//object to hold summary data for our stock - add more later (quantile, SD, etc)
var dataSummary = {
  minClosingValue: d3.min(tempData, (d) => {return d.close}),
  maxClosingValue: d3.max(tempData, (d) => {return d.close}),
  mean: 0,
  sd: 0,
  intercept: 0,
  regressionCoef: 1
}
//controls how quickly data points are rendered
var delayFactor = 8;

/*
Calculates number of milliseconds to delay drawing the regression line and
data point color changes, based on the number of data points in our data set
*/
var millisecondDelay = () => {
  var ms = 0;
  for(var i = 0; i < tempData.length; i++)
    ms +=  delayFactor;
  return ms;
}

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


//Calculate min and max values for y axis, high/low +/- 20%
var maxYdomain = () => {
  return parseInt(dataSummary.maxClosingValue) + (parseInt(dataSummary.maxClosingValue)/5.0);
}

var minYdomain = () => {
  return parseInt(dataSummary.minClosingValue) - (parseInt(dataSummary.minClosingValue)/5.0);
}


//idea for y-scale: use d3.range or d3.ticks to create array of y-scale arguments
//want an array of linearly-spaced values from min - 10ish% to max + 10ish%
//var y = d3.ticks(0,100, 25);
var yScale = d3.scaleLinear()
    .domain([maxYdomain(),minYdomain()])
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
var d3ViewPort =  d3.select('.viewport')
var svg = d3ViewPort.append('svg')
var dots = svg.append('g')
for (var i = 0; i < tempData.length; i++){
  var data = []
  data.push(tempData[i]);
  dots.append("circle")
    .data(data)
    .attr("r", 0)
    .attr("cx", (d) => { return x(Date.parse(d.date)) })
    .attr("cy", (d) => { return yScale(d.close) })
    .attr('close', data[0].close)
    .attr('date', data[0].date)
    .attr('outlier', (d) => { return (d.outlier ? true : false)})
    .on('mouseenter', function() {
      var dataPoint = d3.select(this);
      if (dataPoint.attr('outlier') === 'true') {
        showInfo(dataPoint);
        }
      })
      .on("mouseout", function(d) {
          d3.select('.viewport')
          .selectAll('rect').remove()
          d3.select('.viewport')
          .selectAll('.outlier-data').remove()
    })
    .style('stroke', 'black')
    .style('fill', 'white')
    .transition()
    .delay(delayFactor * i)
    .attr("r", 3.5)
      }
}

const showInfo = (outlier) => {
  console.log(outlier.attr('date'))
  var d3ViewPort =  d3.select('.viewport')
  var svg = d3ViewPort.append('svg')
  var rect = svg.append('rect')
  .attr('width', 115)
  .attr('height', 55)
  .attr('class', 'outlier-info-box')
  .attr('x', outlier.attr('cx'))
  .attr('y', outlier.attr('cy'))
  .attr('rx', 5)
  .attr('ry', 5)

  svg.append('text')
  .attr('class', 'outlier-data')
  .attr("dx", function(d){return +outlier.attr('cx') + 10})
  .attr("dy", function(d){return +outlier.attr('cy') + 20})
  .text("Date: " + outlier.attr('date'))

  svg.append('text')
  .attr('class', 'outlier-data')
  .attr("dx", function(d){return +outlier.attr('cx') + 10})
  .attr("dy", function(d){return +outlier.attr('cy') + 42.5})
  .text("Close: $" + outlier.attr('close').slice(0,5))
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
const calculateRegressionEquation = (data) => {

  var sumX = 0;
  var sumY = 0;
  var sumXY = 0;
  var sumXSquared = 0;
  var sumYSquared = 0;
  var n = Object.keys(data).length;

  data.forEach( (d) => {
    var date = d.date;
    var y = +d.close;
    //number of days between current date and january first
    var x = (Math.floor((Date.parse(date) - Date.parse('2014-01-01'))/86400000));

    sumX += x;
    sumY += y;
    sumXY += (x * y);
    sumXSquared += (x * x);
    sumYSquared += (y * y);
  });

  var b0 = ( ((sumY * sumXSquared) - (sumX * sumXY)) / ((n * sumXSquared) - (sumX * sumX)) );
  var b1 = ( ((n * sumXY) - (sumX * sumY)) / ((n * sumXSquared) - (sumX * sumX)) );

  // x variables
  //TODO maybe use first date from data set instead of jan1
  var minDateNumeric = d3.min(tempData, (d) => { return Math.floor((Date.parse(d.date) - Date.parse('2014-01-01'))/86400000)});
  var maxDateNumeric = d3.max(tempData, (d) => { return Math.floor((Date.parse(d.date) - Date.parse('2014-01-01'))/86400000)});
  var startY = b0 + (minDateNumeric * b1);
  var endY = b0 + (maxDateNumeric * b1);

  //Set line start and end y-coordinates
  line.start.y = startY;
  line.end.y = endY;
  //Set summary regression coef & intercept
  dataSummary.intercept = b0;
  dataSummary.regressionCoef = b1;

}

const calculateVariance = (data) => {
  var mean = d3.mean(data, (d) => {return d.close});
  dataSummary.mean = mean;
  var sumLeastSquares = data.reduce( (sum, d) => {
    return (sum + ((d.close - mean) * (d.close - mean)))
  }, 0)
  dataSummary.sd = Math.sqrt(sumLeastSquares / (Object.keys(data).length - 1));
  return sumLeastSquares / (Object.keys(data).length - 1);
}

var line = {
  start: {x: "2014-01-01", y: 3},
  end: {x: "2014-12-31", y: 80 }
}

const drawRegressionLine = () => {
  d3.select('.viewport')
  .append('g')
  .append('line')
  .attr('x1', x(Date.parse(line.start.x)))
  .attr('y1', yScale(line.start.y))
  .attr('x2', x(Date.parse(line.start.x)))
  .attr('y2', yScale(line.start.y))
  .transition()
  .duration(1000)
  .attr('x2', x(Date.parse(line.end.x)))
  .attr('y2', yScale(line.end.y))
  .style('stroke', 'black')
  .style('stroke-width', 3)
}

//adds outlier tag to any stock date that is considered an outlier
const identifyOutliers = (data, sigma) => {
  sigma = sigma/2;
  data.forEach((d) => {
    var pointOnLine = ((Math.floor((Date.parse(d.date) - Date.parse('2014-01-01'))/86400000)) * dataSummary.regressionCoef) + dataSummary.intercept;
    if (+d.close > (pointOnLine + sigma) || +d.close < (pointOnLine - sigma)) {
      d.outlier = true;
    }
  });
}

const colorOutliersRed = (data) => {
  d3.select('.viewport')
  .selectAll('circle')
  .transition()
  .duration(1000)
  .style('stroke', (d) => { return (d.outlier ? '#ff0202' : '#bcbcbc'); })
  .style('fill', (d) => { return (d.outlier ? '#ff0202' : '#bcbcbc'); })
}

const render = () => {
  d3.select('.viewport').remove();
  calculateRegressionEquation(tempData);
  calculateVariance(tempData);
  identifyOutliers(tempData, dataSummary.sd);
  graph();
  placeXAxis();
  placeYAxis();
  plotDataPoints();
  setTimeout(() => {drawRegressionLine()}, millisecondDelay());
  setTimeout(() => {colorOutliersRed(tempData)}, millisecondDelay() + 750);
}
