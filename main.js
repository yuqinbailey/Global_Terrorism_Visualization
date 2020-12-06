const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");


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
    .attr("fill", d => color(4000 - attack_num(d.properties.name)*100))
    .on("mouseover", function (path, d) {
      var country_name = d.properties.name;
      div.transition().duration(200).style("opacity", 0.95);
      div
        .html(country_name + "<br/>attack: " + attack_num(country_name))
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      div.transition().duration(500).style("opacity", 0);
    })
    //.on("mousedown", function(d){paths.attr("fill","blue")});

    // slider
    var slider = d3.select('#slider');
    slider.on('change', function() {
        var year = Number(this.value);
        d3.selectAll(".sphere").remove();
        d3.selectAll(".countries").remove();
        draw_map1(year);
        d3.select("output#slidertext").text(year);
    });
}


//draw the map with points
function draw_map2(year = 2000){

  const projection = d3.geoMercator()
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


  d3.json('world_map.json').then((data)=>{
    //console.log(data.objects);
    const countries = topojson.feature(data, data.objects.countries);
        

    //console.log(pathGenerator.bounds(countries));
   

    const paths = svg.selectAll('path')
      .data(countries.features);
    paths.enter().append('path')
      .attr("class", "countries")
      .attr("fill","white")
      .attr("stroke","black")
      .attr('d', d => pathGenerator(d))
      /*
      doucument.onmousemove = function(event){
          event = event || window.event;
          var left = event.clientX;
          var top = event.clientY;
        
          paths.style.left = left+"px";
          paths.style.top = top+"px";
        };
      });
    paths.onmouseup = function(){
      document.onmousemove = null;
    }
*/
    
});

  d3.csv("globalterrorism.csv").then(function (data) {
    data.forEach((d) => {
      d.year = +d.iyear;
      d.city = d.city;
      d.latitude = +d.latitude;
      d.longitude = +d.longitude;
      d.attacktype = d.attacktype;
      d.size = +d.nkill;
    });

    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0.0);

    worldmap.selectAll(".point")
      .data(data.filter(d => d.year == year))
      .enter().append('circle')
      .attr("class","point")
      .attr("cx",d => projection([d.longitude,d.latitude])[0])
      .attr("cy",d => projection([d.longitude,d.latitude])[1])
      .attr("r",3)
      .attr("fill","red")
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

    // slider
    var slider = d3.select('#slider');
    slider.on('change', function() {
        var year = Number(this.value);
        d3.selectAll(".sphere").remove();
        d3.selectAll(".countries").remove();
        d3.selectAll(".point").remove();
        draw_map2(year);
        d3.select("output#slidertext").text(year);
    });

  })
  };

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

function clear_data(){
  d3.selectAll(".line").remove()
}

var falg = true;

draw_map1();

function change_view(){
  if(falg){
    d3.selectAll(".sphere").remove();
    d3.selectAll(".countries").remove();
    draw_map2();
    console.log("Change from map1 to map 2")
    falg = false;
  }else{
    d3.selectAll(".countries").remove();
    d3.selectAll(".sphere").remove();
    d3.selectAll(".point").remove();
    draw_map1();
    falg = true;
  }
  }