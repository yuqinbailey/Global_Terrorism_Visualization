const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

let color = d3.scaleQuantize([1, 10], d3.schemeBlues[9]);

const attack = d3.csv("attack.csv");
console.log(attack);
console.log(typeof attack);

d3.csv("attack.csv").then(function (data) {
  data.forEach((d) => {
    d.iyear = +d.iyear;
    d.attacktype1 = +d.attacktype1;
    //console.log("log", d.iyear);
  });
});




 d3.json('world_map.json').then((data)=>{
  //console.log(data.objects);
  const countries = topojson.feature(data, data.objects.countries);
  //console.log(countries);
  
  const projection = d3.geoMercator()
  .scale(135)
  .center([-11, 0])
  .rotate([0, 0])
  .translate([width/2, height/2]);

  const pathGenerator = d3.geoPath().projection(projection);
  
  /*
  svg
    .append("path")
    .attr("class", "sphere")
    .attr("d", pathGenerator({ type: "Sphere" }));

  //console.log(pathGenerator.bounds(countries));

  //console.log(pathGenerator({type:'Sphere'}));
  const paths = svg.selectAll("path").data(countries.features);
  paths
    .enter()
    .append("path")
    .attr("class", "countries")
    .attr("d", (d) => pathGenerator(d));

  let width = 380;
  let height = 350;
  */

  let worldmap = d3.select("svg.mappp")

  worldmap.append('path')
    .attr("class", "sphere")
    .attr('d', pathGenerator({type:'Sphere'}));
 
  
    //console.log(pathGenerator.bounds(countries));
 

  console.log(pathGenerator({type:'Sphere'}));
  const paths = worldmap.selectAll('path')
    .data(countries.features);
  paths.enter().append('path')
    .attr("class", "countries")
    .attr('d', d => pathGenerator(d));
 });

 
//The linechart start from here
d3.csv("data2.csv").then(function(data) {
  
    data.forEach(d => {
        d.year = d.year;
        d.country = d.country;
        d.number = +d.data;
    });
 
  let g = d3.select("svg.linechart").append("g")
          .attr("transform", "translate(" + 100 + "," + 200 + ")")
          .attr("class","linechart");

  var x = d3.scaleLinear()
    .domain([1970,2020])
    .range([0,430]);
  g.append("g")
    .attr("transform", "translate(0," + 300 + ")")
    .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .domain([0, 400])
    .range([300, 0])
  g.append("g")
    .call(d3.axisLeft(y));

  // Add the valueline path.
  //console.log(data.)
  g.append("path")
      .datum(data.filter(d => d.country == "Philippines"))
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.number) }))

  
  
  });
/*
  g.append('g')
      .attr("transform", "translate(0," + 400 + ")")
      .attr('class', 'x-axis')
      .call(xAxis);
  g.append('g')
      .attr("transform", "translate(0," + 100 + ")")
      .attr('class', 'y-axis')
      .call(yAxis);

  g.append("path")
      .datum(d)
      .data(data.filter(d => d.month == m))
  
  svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })
        )

*/



