var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    innerRadius = 180,
    outerRadius = Math.min(width, height) / 2.5,
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


var xScaleOffset = Math.PI * 75/180;
var x = d3.scaleBand()
    .range([xScaleOffset, 2 * Math.PI + xScaleOffset])
    .align(0);

var y = d3.scaleLinear()
    .range([innerRadius, outerRadius]);

var z = d3.scaleOrdinal()
    // .range(["#a1d76a", "#91bfdb", "#e465cb", "#ba6be4", "#eea669"]);
    .range(["#F0EAD3", "#FCE196", "#F99E51", "#67A291", "#58828A"]);

var primaryKey = "month";

d3.csv("../data/weird-5-day2month.csv", function(d, i, columns) {
  for (var k in d) {
    if ( k !== primaryKey) d[k] = (+d[k]);
  }
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);
  var zClasses = keys;
  var meanReviews = d3.mean(data, function(d) { return d3.sum(keys, function(key) { return d[key]; }); });
  var maxReviews = d3.max(data, function(d) { return d3.sum(keys, function(key) { return d[key]; }); });

  x.domain(data.map(function(d) { return d[primaryKey]; }));
  y.domain([0, maxReviews]);
  z.domain(zClasses);

  // Reviews
  g.append('g')
   .selectAll("g")
   .data(d3.stack().keys(keys)(data))
   .enter().append("g")
   .attr("fill", function(d) { return z(d.key); })
   .selectAll("path")
   .data(function(d) { return d; })
   .enter().append("path")
   .attr("d", d3.arc()
          .innerRadius(function(d) { return y(d[0]); })
          .outerRadius(function(d) { return y(d[1]); })
          .startAngle(function(d) { return x(d.data[primaryKey]) - x(1) + 2*Math.PI/24; })
          .endAngle(function(d) { return x(d.data[primaryKey]) + x.bandwidth() - x(1) + 2*Math.PI/24; })
          .padAngle(x.bandwidth()/2)
          .padRadius(innerRadius));

  //yAxis
  var yAxis = g.append("g")
      .attr("text-anchor", "middle");

  var yTicksValues = d3.ticks(0, Math.ceil(maxReviews*1.1), 4);

  // Mean value line
  console.log('meanReviews: ', meanReviews);

  var yMeanTick = yAxis
    .append("g")
    .datum([meanReviews]);

  yMeanTick.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#C0625E")
      .attr("stroke-dasharray", "5 3")
      .attr("r", y);

  var yTick = yAxis
    .selectAll("g")
    .data(yTicksValues)
    .enter().append("g");

  // Circular scale
  yTick.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#ccdcea")
      .attr("r", y);

  yTick.append("text")
      .attr("y", function(d) { return -y(d); })
      .attr("dy", "0.35em")
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", 5)
      .text(y.tickFormat(5, "s"));

  yTick.append("text")
      .attr("y", function(d) { return -y(d); })
      .attr("dy", "0.35em")
      .text(y.tickFormat(5, "s"));

  yAxis.append("text")
      .attr("y", function(d) { return -y(yTicksValues.pop()); })
      .attr("dy", "-2em")
      .text("Restaurants #Reviews");

  // Labels for xAxis
  var label = g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) { return "rotate(" + ((x(d[primaryKey]) + x.bandwidth() / 2) * 180 / Math.PI - 90 - 60) + ")translate(" + innerRadius + ",0)"; });
      // .attr("transform", function(d) { return "rotate(" + ((x(d[primaryKey]) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; });

  label.append("line")
       .attr("x2", function(d) { return -4; })
       // .attr("x2", function(d) { return (((d[primaryKey] % 5) == 0) | (d[primaryKey] == '1')) ? -7 : -4 })
       .attr("stroke", "#000");

  label.append("text")
       .attr("transform", function(d) { return (x(d[primaryKey]) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
       .text(function(d) { return d[primaryKey]; });
       // .text(function(d) { 
       //      var xlabel = (((d[primaryKey] % 5) == 0) | (d[primaryKey] == '1')) ? d[primaryKey] : '';
       //  return xlabel; });

  // Legend
  var legend = g.append("g")
    .selectAll("g")
    .data(zClasses)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(-20," + (i - (zClasses.length - 1) / 2) * 25+ ")"; });

  legend.append("circle")
      .attr("r", 8)
      .attr("fill", z);

  legend.append("text")
      .attr("x", 15)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .text(function(d) { return d; });

});
