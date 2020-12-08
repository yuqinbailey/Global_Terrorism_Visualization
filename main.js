const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

var country_array = new Array();
var year = 2000;


//draw map with different color
async function draw_map1(year = 2000) {
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
      //console.log(country_name);
      return 0;
    } else {
      return attack[country_name];
    }
  };

  // deal with Soviet Union
  var show_Soviet = function (country_name, year) {
    const Soviet_countries = [
      "Armenia",
      "Azerbaijan",
      "Belarus",
      "Estonia",
      "Georgia",
      "Kazakhstan",
      "Kyrgyzstan",
      "Latvia",
      "Lithuania",
      "Moldova",
      "Russia",
      "Tajikistan",
      "Turkmenistan",
      "Ukraine",
      "Uzbekistan",
    ];
    if ((Number(year) < 1992)) {
        if (Soviet_countries.includes(country_name)) {
            return "Soviet Union";
        } else {
            return country_name;
        }
    } else {
      return country_name;
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
    .attr("stroke", "black")
    .attr("fill", (d) => color(4000 - attack_num(d.properties.name) * 100))
    .on("mouseover", function (path, d) {
      var country_name = d.properties.name;
      div.transition().duration(200).style("opacity", 0.95);
      div
        .html(
          show_Soviet(country_name, year) +
            "<br/>attack: " +
            attack_num(country_name)
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      div.transition().duration(500).style("opacity", 0);
    })
    .on("click", function (path, d) {
      var name = d.properties.name;
      one_country = d3.select(this);
      one_country.style("stroke", "blue");
      one_country.style("stroke-width", 5);
      one_country.attr("class", "markedone");
      country_array.push(name);
      draw_linechart(country_array);
    });

  // slider
  var slider = d3.select("#slider");
  slider.on("change", function () {
    var year = Number(this.value);
    d3.selectAll(".sphere").remove();
    d3.selectAll(".countries").remove();
    draw_map1(year);
    d3.select("output#slidertext").text(year);
  });
}


//draw the map with points
function draw_map2(year = 2000) {
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

  d3.json("world_map.json").then((data) => {
    const countries = topojson.feature(data, data.objects.countries);

    //console.log(pathGenerator.bounds(countries));

    const paths = svg.selectAll("path").data(countries.features);
    paths
      .enter()
      .append("path")
      .attr("class", "countries")
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("d", (d) => pathGenerator(d))

      .on("click", function (path, d) {
        var name = d.properties.name;
        one_country = d3.select(this);
        one_country.style("stroke", "blue");
        one_country.style("stroke-width", 5);
        one_country.attr("class", "markedone");
        country_array.push(name);
        draw_linechart(country_array);
        
      });
  });

  var div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0.0);

  d3.csv("globalterrorism.csv").then(function (data) {
    data.forEach((d) => {
      d.year = +d.iyear;
      d.city = d.city;
      d.latitude = +d.latitude;
      d.longitude = +d.longitude;
      d.size = +d.nkill;
    });

function point_color(num){
  if (num ==0){
    return "rgb(255,150,150)"
  }else{
    if(num <= 10){
      return "rgb(255,100,100)"
    }else{
      if (num <=50){
        return "rgb(255,50,50)"
      }else{
        if(num <= 100){
          return "rgb(255,30,30)"
        }else{return "rgb(255,0,0)"}
      }
    }
  }
}

    worldmap
      .selectAll(".point")
      .data(data.filter((d) => d.year == year))
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d) => projection([d.longitude, d.latitude])[0])
      .attr("cy", (d) => projection([d.longitude, d.latitude])[1])
      .attr("r",  3)
      .attr("fill", (d) =>point_color(d.size))
      //.style("stroke", "black")
      .on("mouseover", function (point, d) {
        var city_name = d.city;
        var casualty = d.size;
        div.transition().duration(200).style("opacity", 0.95);
        div
          .html(city_name + "<br/>" + "casualty: "+casualty)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        div.transition().duration(500).style("opacity", 0);
      });
  });

  // slider
  var slider = d3.select("#slider");
  slider.on("change", function () {
    var year = Number(this.value);
    d3.selectAll(".sphere").remove();
    d3.selectAll(".countries").remove();
    draw_map2(year);
    d3.select("output#slidertext").text(year);
  });
    
}


// The linechart starts from here
let g = d3
  .select("svg.linechart")
  .append("g")
  .attr("transform", "translate(" + 100 + "," + 290 + ")")
  .attr("id", "linechart");

var x = d3.scaleLinear().domain([1970, 2020]).range([0, 430]);

g.append("g")
  .attr("transform", "translate(0," + 300 + ")")
  .attr("id","x_axis")
  .call(d3.axisBottom(x));

var max_y = 100

var y = d3.scaleLinear().domain([0, max_y]).range([300, 0]); // TODO
g.append("g")
.attr("id","y_axis")
.call(d3.axisLeft(y));

function draw_linechart(country_array) {
  d3.csv("data2.csv").then(function (data) {
    data.forEach((d) => {
      d.year = d.year;
      d.country = d.country;
      d.number = +d.data;
    });

    d3.select("#y_axis").remove()


console.log(country_array)
var y_scale = [];
for (i in country_array){
  //console.log(country_array[i])
  n = d3.max(data.filter((d)=> d.country == country_array[i]),(d)=> d.number);
  //console.log(n)
  y_scale.push(parseInt(n*1.2));
}

console.log(Math.max(...y_scale))

max_y = Math.max(...y_scale)

var y = d3.scaleLinear().domain([0, max_y]).range([300, 0]);
g = d3.select("#linechart").append("g")
  .call(d3.axisLeft(y))
  .attr("id","y_axis");

      
for (i in country_array){
  g.append("path")
  .datum(data.filter((d) => country_array[i] == d.country))
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
}

    
  });
}

function clear_data() {
  country_array = []
  d3.selectAll(".line").remove();
  marked = d3
    .selectAll(".markedone")
    .style("stroke-width", 1)
    marked.style("stroke", "black")
    .attr("class", "countries");
}

var falg = true;

draw_map1();

function change_view() {
  if (falg) {
    d3.selectAll(".sphere").remove();
    d3.selectAll(".countries").remove();
    draw_map2();
    console.log("Change from map1 to map 2");
    falg = false;
  } else {
    d3.selectAll(".countries").remove();
    d3.selectAll(".sphere").remove();
    d3.selectAll(".point").remove();
    draw_map1();
    falg = true;
  }
};
