
class OutlierDetector {
  constructor(data) {
    this.data = data;
    this.dataSummary = {
      minClosingValue: d3.min(this.data, (d) => {return d.close}),
      maxClosingValue: d3.max(this.data, (d) => {return d.close}),
      mean: 0,
      sd: 0,
      intercept: 0,
      regressionCoef: 0
    }
    //controls speed of animation
    this.delayFactor = 8;

    //creates linearly spaced scale for x-coordinate
    this.xScale = d3.scaleTime()
        .domain([
          new Date(Date.parse('2014-01-01')),
          new Date(Date.parse('2015-01-01'))
        ])
        .range([0, 600]);

    //creates y scale based on min and max closing prices
    this.yScale = d3.scaleLinear()
        .domain([this.maxYdomain(),this.minYdomain()])
        .range([0,450]);

    this.xAxis = d3.axisBottom(this.xScale).ticks(14);
    this.yAxis = d3.axisLeft(this.yScale).ticks(6);

    this.line = {
      start: {x: "2014-01-01", y: 0},
      end: {x: "2014-12-31", y: 0 }
    }

    this.calculateRegressionEquation(this.data);
    this.calculateSD(this.data);
    this.identifyOutliers(this.data, this.dataSummary.sd);
    this.addViewport();
  }

  /*
  Calculates number of milliseconds to delay drawing the regression line and
  data point color changes, based on the number of data points in our data set
  */
  millisecondDelay() {
    var ms = 0;
    for(var i = 0; i < this.data.length; i++)
      ms +=  this.delayFactor;
    return ms;
  }

  //Calculate min and max values for y axis, high/low +/- 20%
  maxYdomain() {
    return parseInt(this.dataSummary.maxClosingValue) + (parseInt(this.dataSummary.maxClosingValue)/5.0);
  }

  minYdomain() {
    return parseInt(this.dataSummary.minClosingValue) - (parseInt(this.dataSummary.minClosingValue)/5.0);
  }

  /*
  Finds the equation y = b0 + b1x1
  where our dependent variable y is the stock price
  and our independent variable is the number of days from the origin
  */
  calculateRegressionEquation(data) {

    var sumX = 0;
    var sumY = 0;
    var sumXY = 0;
    var sumXSquared = 0;
    var sumYSquared = 0;
    var n = Object.keys(data).length;

    data.forEach( (d) => {
      var date = d.date;
      var y = +d.close;
      //number of days between current date and january first - don't ask where 86400000 came from
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
    var minDateNumeric = d3.min(this.data, (d) => { return Math.floor((Date.parse(d.date) - Date.parse('2014-01-01'))/86400000)});
    var maxDateNumeric = d3.max(this.data, (d) => { return Math.floor((Date.parse(d.date) - Date.parse('2014-01-01'))/86400000)});
    var startY = b0 + (minDateNumeric * b1);
    var endY = b0 + (maxDateNumeric * b1);

    //Set line start and end y-coordinates
    this.line.start.y = startY;
    this.line.end.y = endY;
    //Set summary regression coef & intercept
    this.dataSummary.intercept = b0;
    this.dataSummary.regressionCoef = b1;
  }

  calculateSD(data) {
    var mean = d3.mean(data, (d) => {return d.close});
    this.dataSummary.mean = mean;
    var sumLeastSquares = data.reduce( (sum, d) => {
      return (sum + ((d.close - mean) * (d.close - mean)))
    }, 0)
    this.dataSummary.sd = Math.sqrt(sumLeastSquares / (Object.keys(data).length - 1));
  }

  //adds outlier tag to any stock date that is considered an outlier
  identifyOutliers(data, sigma) {
    sigma = sigma/2;
    data.forEach((d) => {
      var pointOnLine = ((Math.floor((Date.parse(d.date) - Date.parse('2014-01-01'))/86400000)) * this.dataSummary.regressionCoef) + this.dataSummary.intercept;
      if (+d.close > (pointOnLine + sigma) || +d.close < (pointOnLine - sigma)) {
        d.outlier = true;
      }
    });
  }

  addViewport() {
    d3.select('body')
      .append('svg')
      .attr('class', 'viewport')
      .attr('width', 700)
      .attr('height', 450)

    this.placeXAxis();
    this.placeYAxis();
  }

  placeXAxis() {
    d3.select('.viewport')
    .append('g')
    .attr('transform', 'translate(0,' + (450) + ')') //putting it at 'height' (== 250) pushes scale off the graph
    .call(this.xAxis)
  }

  placeYAxis() {
    d3.select('.viewport')
    .append('g')
    .attr('transform', 'translate(0,' + 0 + ')')
    .call(this.yAxis)
  }

  plotDataPoints() {
  var d3ViewPort =  d3.select('.viewport')
  var svg = d3ViewPort.append('svg')
  var dots = svg.append('g')
  for (var i = 0; i < this.data.length; i++){
    var data = []
    data.push(this.data[i]);
    dots.append("circle")
      .data(data)
      .attr("r", 0)
      .attr("cx", (d) => { return this.xScale(Date.parse(d.date)) })
      .attr("cy", (d) => { return this.yScale(d.close) })
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
      .delay(this.delayFactor * i)
      .attr("r", 3.5)
        }
      setTimeout(() => {this.drawRegressionLine()}, this.millisecondDelay());
      setTimeout(() => {this.colorOutliersRed(this.data)}, this.millisecondDelay() + 750);
  }

  drawRegressionLine() {
    d3.select('.viewport')
    .append('g')
    .append('line')
    .attr('x1', this.xScale(Date.parse(this.line.start.x)))
    .attr('y1', this.yScale(this.line.start.y))
    .attr('x2', this.xScale(Date.parse(this.line.start.x)))
    .attr('y2', this.yScale(this.line.start.y))
    .transition()
    .duration(1000)
    .attr('x2', this.xScale(Date.parse(this.line.end.x)))
    .attr('y2', this.yScale(this.line.end.y))
    .style('stroke', 'black')
    .style('stroke-width', 3)
  }

  colorOutliersRed(data) {
    d3.select('.viewport')
    .selectAll('circle')
    .transition()
    .duration(1200)
    .style('stroke', (d) => { return (d.outlier ? '#ff0202' : '#bcbcbc'); })
    .style('fill', (d) => { return (d.outlier ? '#ff0202' : '#bcbcbc'); })
  }

}

const render = () => {
  d3.select('.viewport').remove();
  var data = aaplData;
  var graph = new OutlierDetector(data);
  graph.plotDataPoints();
}
