const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const logScale = d3.scaleLog().domain([1, 4001]);
const color = d3.scaleSequential((d) => d3.interpolateReds(logScale(d + 1)));

var country_array = new Array();
var year = 2000;
var div_hint = d3.select("#hint").style("opacity", 0.95);

const dataPromise = Promise.all([
  d3.json("world_map.json"),
  d3.csv("attack.csv"),
  d3.csv("globalterrorism.csv"),
  d3.csv("data2.csv"),
]);

dataPromise.then(([map_data, attack_data, global, data2]) => {
  const countries = topojson.feature(map_data, map_data.objects.countries);
  const projection = d3
    .geoMercator()
    .scale(135)
    .center([-11, 0])
    .rotate([0, 0])
    .translate([width / 2, height / 2 + 160]);
  const pathGenerator = d3.geoPath().projection(projection);
  const paths = svg.selectAll("path").data(countries.features);

  for (var i = 0; i < attack_data.length; i++) {
    var attack = attack_data[i];
    for (c in attack) {
      attack[c] = +attack[c];
    }
  }
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
    if (Number(year) < 1992) {
      if (Soviet_countries.includes(country_name)) {
        return "Soviet Union";
      } else {
        return country_name;
      }
    } else {
      return country_name;
    }
  };

  global.forEach((d) => {
    d.year = +d.iyear;
    d.city = d.city;
    d.latitude = +d.latitude;
    d.longitude = +d.longitude;
    d.size = +d.nkill;
  });
  console.log(global);

  data2.forEach((d) => {
    d.year = +d.year;
    d.data = +d.data;
  });

  console.log(data2);

  // -------------- draw map with different color ---------------------------

  async function draw_map1(year = 2000) {
    let worldmap = d3.select("svg.mappp");

    worldmap
      .append("path")
      .attr("class", "sphere")
      .attr("d", pathGenerator({ type: "Sphere" }));

    let attack = attack_data[Number(year) - 1970];

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

    paths
      .enter()
      .append("path")
      .attr("class", "countries")
      .attr("d", (d) => pathGenerator(d))
      .attr("stroke", "black")
      .attr("fill", (d) => color(attack_num(d.properties.name)))
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
        one_country = d3
          .select(this)
          .style("stroke", "#428F89")
          .style("stroke-width", 3)
          .attr("class", "markedone1");
        country_array.push(name);
        d3.select("#hint").style("opacity", 0.0);
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

    // legend
    const lgHeight = 180;
    const barWidth = 2;

    var y = d3.scaleLog().domain([1, 4001]).range([lgHeight, 0]);

    var yLegend = d3
      .axisRight(y)
      .tickValues([3, 10, 100, 1000, 2000, 4000])
      .tickFormat(d3.format(",.1s"))
      .tickSize(3, 0);

    worldmap
      .append("g")
      .attr("class", "yLegend")
      .attr(
        "transform",
        "translate(" + (90 + 20) + "," + (515 + barWidth) + ")"
      )
      .call(yLegend);

    worldmap
      .append("text")
      .attr("class", "anotation")
      .attr("text-anchor", "start")
      .attr("transform", "translate(" + 88 + "," + 506 + ")")
      .text("Attack Amount");

    worldmap
      .append("g")
      .attr("width", lgHeight)
      .attr("class", "logScale")
      .attr("transform", "translate(" + 90 + "," + 515 + ")")
      .selectAll("bars")
      .data(d3.range(1, lgHeight, barWidth))
      .enter()
      .append("rect")
      .attr("y", (d, i) => lgHeight - i * barWidth)
      .attr("x", 0)
      .attr("width", 20)
      .attr("height", barWidth)
      .attr("fill", color);
  }

  // -------------- draw the map with points --------------------------
  function draw_map2(year = 2000) {
    let worldmap = d3.select("svg.mappp");

    worldmap
      .append("path")
      .attr("class", "sphere")
      .attr("d", pathGenerator({ type: "Sphere" }));

    paths
      .enter()
      .append("path")
      .attr("class", "countries")
      .attr("fill", "rgb(99,95,93)")
      .attr("stroke", "black")
      .attr("d", (d) => pathGenerator(d))

      .on("click", function (path, d) {
        var name = d.properties.name;
        one_country = d3
          .select(this)
          .style("stroke", "#428F89")
          .style("stroke-width", 3)
          .attr("class", "markedone2");
        country_array.push(name);
        d3.select("#hint").style("opacity", 0.0);
        draw_linechart(country_array);
      });

    let div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0.0);

    function point_color(num) {
      if (num == 0) {
        return "rgb(255,150,150)";
      } else {
        if (num <= 10) {
          return "rgb(255,100,100)";
        } else {
          if (num <= 50) {
            return "rgb(255,50,50)";
          } else {
            if (num <= 100) {
              return "rgb(255,30,30)";
            } else {
              return "rgb(255,0,0)";
            }
          }
        }
      }
    }

    //The legend
    var colorScale = d3
      .scaleLinear()
      .domain([100, 0])
      .range(["rgb(255,100,100)", "rgb(255,150,150)"]);

    var legend = d3.legendColor().scale(colorScale);

    lengg = d3
      .select("svg.mappp")
      .append("g")
      .attr("id", "legend")
      .attr("transform", "translate(90, 580)")
      .call(legend);

    worldmap
      .append("text")
      .attr("class", "anotation")
      .attr("text-anchor", "start")
      .attr("transform", "translate(" + 88 + "," + 568 + ")")
      .text("Casualty");

    worldmap
      .selectAll(".point")
      .data(global.filter((d) => d.year == year))
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d) => projection([d.longitude, d.latitude])[0])
      .attr("cy", (d) => projection([d.longitude, d.latitude])[1])
      .attr("r", 2)
      .attr("fill", (d) => point_color(d.size))
      .on("mouseover", function (point, d) {
        var city_name = d.city;
        var casualty = d.size;
        div.transition().duration(200).style("opacity", 0.95);
        div
          .html(city_name + "<br/>casualty: " + casualty)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        div.transition().duration(500).style("opacity", 0);
      });

    // slider
    var slider = d3.select("#slider");
    slider.on("change", function () {
      var year = Number(this.value);
      d3.selectAll(".sphere").remove();
      d3.selectAll(".point").remove();
      d3.selectAll(".countries").remove();
      draw_map2(year);
      d3.select("output#slidertext").text(year);
    });
  }

  // -------------- The linechart starts from here ----------------------------
  let g = d3
    .select("svg.linechart")
    .append("g")
    .attr("transform", "translate(" + 100 + "," + 290 + ")")
    .attr("id", "linechart");

  var x = d3.scaleLinear().domain([1970, 2020]).range([0, 430]);

  g.append("g")
    .attr("transform", "translate(0," + 300 + ")")
    .attr("id", "x_axis")
    .call(d3.axisBottom(x));

  var max_y = 100;

  var y = d3.scaleLinear().domain([0, max_y]).range([300, 0]);
  g.append("g").attr("id", "y_axis").call(d3.axisLeft(y)).selectAll("text");

  g.append("text")
    .attr("class", "attack_text")
    .attr("text-anchor", "end")
    .attr("x", 40)
    .attr("y", -10)
    .text("Attack Amount");

  function draw_linechart(country_array) {
    d3.select("#y_axis").remove();

    //console.log(country_array);
    var y_scale = [];
    for (i in country_array) {
      //console.log(country_array);
      n = d3.max(
        data2.filter((d) => d.country == country_array[i]),
        (d) => d.data
      );
      //console.log(n);
      y_scale.push(parseInt(n * 1.2));
    }

    //console.log(Math.max(...y_scale));

    max_y = Math.max(...y_scale);

    var y = d3.scaleLinear().domain([0, max_y]).range([300, 0]);
    g = d3
      .select("#linechart")
      .append("g")
      .call(d3.axisLeft(y))
      .attr("id", "y_axis");

    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0.0);

    for (i in country_array) {
      g.append("path")
        .datum(data2.filter((d) => country_array[i] == d.country))
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", d3.schemeCategory10[i])
        .attr("stroke-width", 1.5)
        .on("mouseover", function (line, d) {
          //console.log(d);
          div.transition().duration(200).style("opacity", 0.95);
          div
            .html(d[0].country)
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function (d) {
          div.transition().duration(500).style("opacity", 0);
        })
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return x(d.year);
            })
            .y(function (d) {
              return y(d.data);
            })
        );

      // legend
      g.append("g")
        .attr("class", "lineLegend")
        .attr("transform", "translate(" + 25 + "," + i * 15 + ")")
        .append("text")
        .text(country_array[i])
        .attr("fill", "black")
        .attr("transform", "translate(15,9)"); //align texts with boxes
      g.append("rect")
        .attr("class", "legend")
        .attr("transform", "translate(" + 20 + "," + i * 15 + ")")
        .attr("fill", d3.schemeCategory10[i])
        .attr("width", 10)
        .attr("height", 10);
    }
  }

  // button click
  var btns = document.getElementsByTagName("button");

  btns[0].onclick = function change_view() {
    if (falg) {
      d3.selectAll(".logScale").remove();
      d3.selectAll(".yLegend").remove();
      d3.selectAll(".anotation").remove();
      d3.selectAll("#legend").remove();
      d3.selectAll(".sphere").remove();
      d3.selectAll(".countries").remove();
      var year = document.getElementById("slider").value;
      draw_map2(year);
      console.log("Change from map1 to map 2");
      falg = false;
    } else {
      d3.selectAll("#legend").remove();
      d3.selectAll(".anotation").remove();
      d3.selectAll(".countries").remove();
      d3.selectAll(".sphere").remove();
      d3.selectAll(".point").remove();
      var year = document.getElementById("slider").value;
      draw_map1(year);
      falg = true;
    }
  };

  btns[1].onclick = function clear_data() {
    d3.select("#hint").style("opacity", 0.95);
    country_array = [];
    d3.selectAll(".line").remove();
    d3.selectAll(".legend").remove();
    d3.selectAll(".lineLegend").remove();
    marked1 = d3.selectAll(".markedone1").style("stroke-width", 1);
    marked1.style("stroke", "black").attr("class", "countries");
    marked2 = d3.selectAll(".markedone2").style("stroke-width", 1);
    marked2.style("stroke", "black").attr("class", "countries");
  };
  // initialization

  var falg = true;

  draw_map1();
});
