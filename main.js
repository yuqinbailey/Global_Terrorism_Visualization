const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

async function draw(year = 1979) {
  const attack_data = await d3.csv("attack.csv");
  let attack = attack_data[Number(year) - 1970];

  for (c in attack) {
    attack[c] = +attack[c];
  }
  //console.log(attack);

  const map_data = await d3.json("world_map.json");
  const countries = topojson.feature(map_data, map_data.objects.countries);
  //console.log(countries);

  const projection = d3
    .geoMercator()
    .scale(135)
    .center([-11, 0])
    .rotate([0, 0])
    .translate([width / 2, height / 2]);

  const pathGenerator = d3.geoPath().projection(projection);

  let worldmap = d3.select("svg.mappp");

  worldmap
    .append("path")
    .attr("class", "sphere")
    .attr("d", pathGenerator({ type: "Sphere" }));

  const color = d3
    .scaleLinear()
    .domain([0, 4000])
    .interpolate(() => d3.interpolatePiYG);

  var attack_num = function (country_name) {
    if (attack[country_name] === undefined) {
      return 0;
    } else {
      return attack[country_name];
    }
  };

  // tooltip
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0.0);

  const paths = worldmap
    .selectAll("path")
    .data(countries.features)
    .enter()
    .append("path")
    .attr("class", "countries")
    .attr("d", (d) => pathGenerator(d))
    .attr("fill", d => color(4000 - attack_num(d.properties.name)))
    .on("mouseover", function (path, d) {
      var country_name = d.properties.name;
      div.transition().duration(200).style("opacity", 0.95);
      div
        .html(country_name + "<br/>" + attack_num(country_name))
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      div.transition().duration(500).style("opacity", 0);
    });
}
draw(2017);

// The linechart starts from here
d3.csv("data2.csv").then(function (data) {
  data.forEach((d) => {
    d.year = d.year;
    d.country = d.country;
    d.number = +d.data;
  });

  let g = d3
    .select("svg.linechart")
    .append("g")
    .attr("transform", "translate(" + 100 + "," + 290 + ")")
    .attr("class", "linechart");

  var x = d3.scaleLinear().domain([1970, 2020]).range([0, 430]);
  g.append("g")
    .attr("transform", "translate(0," + 300 + ")")
    .call(d3.axisBottom(x));

  var y = d3.scaleLinear().domain([0, 400]).range([300, 0]);
  g.append("g").call(d3.axisLeft(y));

  // Add the valueline path
  //console.log(data.)
  g.append("path")
    .datum(data.filter((d) => d.country == "Philippines"))
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x(function (d) {
          return x(d.year);
        })
        .y(function (d) {
          return y(d.number);
        })
    );
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
