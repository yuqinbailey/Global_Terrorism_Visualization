const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

let color = d3.scaleQuantize([1, 10], d3.schemeBlues[9]);

const attack = d3.csv("attack.csv");
console.log(attack);
console.log(typeof attack);

d3.csv("globalterrorismdb_0718dist.csv").then(function (data) {
  data.forEach((d) => {
    d.iyear = +d.iyear;
    d.attacktype1 = +d.attacktype1;
    //console.log("log", d.iyear);
  });
});

d3.json("world_map.json").then((data) => {
  //console.log(data.objects);
  const countries = topojson.feature(data, data.objects.countries);
  //console.log(countries);

  const projection = d3
    .geoMercator()
    .scale(110)
    .center([10, 0])
    .rotate([0, 0])
    .translate([width / 2, height / 2 + 20]);

  const pathGenerator = d3.geoPath().projection(projection);

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
});
