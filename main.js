const vaccinationsUrl =
  "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv";

const newDeathUrl =
  "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/cases_deaths/new_deaths.csv";

const width = window.innerWidth;
const height = window.innerHeight * 0.7;
const margin = { left: 100, right: 90, top: 60, bottom: 60 };
const tooltipCircleRadius = 5;

const spinnerOptions = {
  lines: 13, // The number of lines to draw
  length: 60, // The length of each line
  width: 17, // The line thickness
  radius: 80, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: "spinner-line-fade-quick", // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: "#ffffff", // CSS color or array of colors
  fadeColor: "transparent", // CSS color or array of colors
  top: "50%", // Top position relative to parent
  left: "50%", // Left position relative to parent
  shadow: "0 0 1px transparent", // Box-shadow for the lines
  zIndex: 2000000000, // The z-index (defaults to 2e9)
  className: "spinner", // The CSS class to assign to the spinner
  position: "absolute", // Element positioning
};

const drawVaccinationsChart = (
  svg,
  filteredVaccinationData,
  filteredNewDeathData,
  selectedLocation,
  selectedAttribute
) => {
  const vaccinationDataMap = new Map(
    filteredVaccinationData.map((d) => [d.date, d.value])
  );

  const newDeathDataMap = new Map(
    filteredNewDeathData.map((d) => [d.date, d.value])
  );

  const xScale = d3
    .scaleTime()
    .domain([
      d3.min([
        d3.min(filteredNewDeathData, (d) => d.date),
        d3.min(filteredVaccinationData, (d) => d.date),
      ]),
      d3.max([
        d3.max(filteredNewDeathData, (d) => d.date),
        d3.max(filteredVaccinationData, (d) => d.date),
      ]),
    ])
    .range([margin.left, width - margin.right]);

  const vaccinationsScale = d3
    .scaleLinear()
    .domain(d3.extent(filteredVaccinationData, (d) => d.value))
    .range([height - margin.bottom, margin.top]);

  const newDeathScale = d3
    .scaleLinear()
    .domain(d3.extent(filteredNewDeathData, (d) => d.value))
    .range([height - margin.bottom, margin.top]);

  const legendGroup = svg
    .selectAll(".legend-group")
    .data([null])
    .join("g")
    .attr("class", "legend-group")
    .attr("transform", `translate(${margin.left + 10}, ${margin.top + 20})`);

  legendGroup
    .selectAll(".location")
    .data([null])
    .join("text")
    .attr("class", "location")
    .style("font-family", "sans-serif")
    .style("font-size", "1.2em")
    .style("font-weight", "bold")
    .text(selectedLocation);

  legendGroup
    .selectAll(".legend-line")
    .data(["blue", "red"])
    .join("line")
    .attr("class", "legend-line")
    .attr("x1", 5)
    .attr("x2", 20)
    .attr("y1", (d, i) => i * 20 + 20)
    .attr("y2", (d, i) => i * 20 + 20)
    .attr("stroke", (d) => d)
    .attr("stroke-width", 2);

  legendGroup
    .selectAll(".legend-text")
    .data(["Vaccinations", "Deaths"])
    .join("text")
    .attr("class", "legend-text")
    .attr("x", 25)
    .attr("y", (d, i) => i * 20 + 20)
    .attr("dy", 5)
    .text((d) => d);

  svg
    .selectAll(".x-axis")
    .data([null])
    .join("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  svg
    .selectAll(".vaccinations-axis")
    .data([null])
    .join("g")
    .attr("class", "vaccinations-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(vaccinationsScale));

  svg
    .selectAll(".newdeath-axis")
    .data([null])
    .join("g")
    .attr("class", "newdeath-axis")
    .attr("transform", `translate(${width - margin.right}, 0)`)
    .call(d3.axisRight(newDeathScale));

  svg
    .selectAll(".vacc-title")
    .data([null])
    .join("text")
    .attr("class", "vacc-title")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 2))
    .attr("y", 30)
    .style("font-family", "sans-serif")
    .style("font-size", "1.2em")
    .attr("text-anchor", "middle")
    .text(selectedAttribute);

  svg
    .selectAll(".death-title")
    .data([null])
    .join("text")
    .attr("class", "death-title")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 2))
    .attr("y", width - 30)
    .style("font-family", "sans-serif")
    .style("font-size", "1.2em")
    .attr("text-anchor", "middle")
    .text("Deaths");

  const vaccinationsLine = d3
    .line()
    .defined((d) => d.value !== 0)
    .x((d) => xScale(d.date))
    .y((d) => vaccinationsScale(d.value));

  const newDeathLine = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => newDeathScale(d.value));

  const vaccinationPath = svg
    .selectAll(".vaccination-line")
    .data([null])
    .join("path")
    .attr("class", "vaccination-line")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("stroke-opacity", 1)
    .attr("d", vaccinationsLine(filteredVaccinationData));

  const newDeathPath = svg
    .selectAll(".newdeath-line")
    .data([null])
    .join("path")
    .attr("class", "newdeath-line")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("stroke-opacity", 1)
    .attr("d", newDeathLine(filteredNewDeathData));

  const tooltip = svg
    .selectAll(".tooltip")
    .data([null])
    .join("g")
    .attr("class", "tooltip")
    .style("pointer-events", "none");

  const vaccCircle = svg
    .selectAll(".vacc-circle")
    .data([null])
    .join("circle")
    .attr("class", "vacc-circle");

  const deathCircle = svg
    .selectAll(".death-circle")
    .data([null])
    .join("circle")
    .attr("class", "death-circle");

  const pointerMoved = (event) => {
    const vaccinationDates = [...vaccinationDataMap.keys()];
    const i = d3.bisect(vaccinationDates, xScale.invert(event.pageX));
    const vaccDate = vaccinationDates[i];
    const vaccValue = vaccinationDataMap.get(vaccDate);

    const newDeathDates = [...newDeathDataMap.keys()];
    const j = d3.bisect(newDeathDates, xScale.invert(event.pageX));
    const deathDate = newDeathDates[j];
    const deathValue = newDeathDataMap.get(deathDate);

    const title = `Date: ${d3.timeFormat("%b %-d, %Y")(
      deathDate
    )}\nVaccinations: ${d3.format(",")(vaccValue)}\nDeath: ${d3.format(",")(
      deathValue
    )}`;

    vaccCircle
      .attr("cx", xScale(vaccDate))
      .attr("cy", vaccinationsScale(vaccValue))
      .attr("r", tooltipCircleRadius)
      .attr("fill", "blue")
      .style("visibility", "visible");

    deathCircle
      .attr("cx", xScale(deathDate))
      .attr("cy", newDeathScale(deathValue))
      .attr("r", tooltipCircleRadius)
      .attr("fill", "red")
      .style("visibility", "visible");

    tooltip
      .style("display", null)
      .attr(
        "transform",
        `translate(${xScale(deathDate)}, ${
          (height - margin.top - margin.bottom) / 2
        })`
      );

    const tooltipLine = tooltip
      .selectAll("line")
      .data([null])
      .join("line")
      .attr("y1", height / 2)
      .attr("y2", -(height / 2 - margin.top - margin.bottom))
      .attr("stroke-width", 4)
      .attr("stroke", "grey");

    const tooltipBox = tooltip
      .selectAll("path")
      .data([null])
      .join("path")
      .attr("fill", "skyblue")
      .attr("stroke", "none");

    const tooltipText = tooltip
      .selectAll("text")
      .data([null])
      .join("text")
      .attr("transform", "translate(20, 0)")
      .call((text) =>
        text
          .selectAll("tspan")
          .data(title.split(/\n/))
          .join("tspan")
          .attr("x", 0)
          .attr("y", (_, i) => `${i * 1.1}em`)
          .text((d) => d)
      );

    const { x, y, width: w, height: h } = tooltipText.node().getBBox();

    tooltipBox.attr(
      "d",
      `M10,${h / 2 + 20} v${-h / 2 - 5} l-7,-7 l7,-7 v${-h / 2 + 5} h${
        w + 20
      } v${h + 15} z`
    );
  };

  const pointerLeft = () => {
    tooltip.style("display", "none");
    vaccCircle.style("visibility", "hidden");
    deathCircle.style("visibility", "hidden");
  };

  svg
    .selectAll(".hover-rect")
    .data([null])
    .join("rect")
    .attr("class", "hover-rect")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom)
    .attr("fill", "transparent")
    .on("pointerenter pointermove", pointerMoved)
    .on("pointerleave", pointerLeft)
    .on("touchstart", (event) => event.preventDefault());
};

attributeList = [
  "daily_people_vaccinated",
  "daily_people_vaccinated_per_hundred",
  "daily_vaccinations",
  "daily_vaccinations_per_million",
  "people_fully_vaccinated",
  "people_fully_vaccinated_per_hundred",
  "people_vaccinated",
  "people_vaccinated_per_hundred",
  "total_boosters",
  "total_boosters_per_hundred",
  "total_vaccinations",
  "total_vaccinations_per_hundred",
];

const vaccinationDataParse = (d) => {
  d.date = d3.timeParse("%Y-%m-%d")(d.date);
  attributeList.forEach((attr) => {
    d[attr] = +d[attr];
  });
  return d;
};

const newDeathDataParse = (d) => {
  Object.keys(d).forEach((t) => {
    if (t === "date") {
      d[t] = d3.timeParse("%Y-%m-%d")(d[t]);
    } else {
      d[t] = +d[t];
    }
  });
  return d;
};

const main = async () => {
  const spinnerTarget = document.getElementById("spinner");
  const spinner = new Spinner(spinnerOptions).spin(spinnerTarget);
  const vaccinationsData = await d3.csv(vaccinationsUrl, vaccinationDataParse);
  const newDeathData = await d3.csv(newDeathUrl, newDeathDataParse);
  spinner.stop();
  const locationList = [...new Set(vaccinationsData.map((d) => d.location))];

  const svg = d3
    .select("#main-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let selectedLocation = "World";
  let selectedAttribute = "daily_people_vaccinated";
  let selectedDates = [
    d3.min([
      d3.min(newDeathData, (d) => d.date),
      d3.min(vaccinationsData, (d) => d.date),
    ]),
    d3.max([
      d3.max(newDeathData, (d) => d.date),
      d3.max(vaccinationsData, (d) => d.date),
    ]),
  ];

  jSuites.dropdown(document.getElementById("location"), {
    data: locationList,
    value: "World",
    autocomplete: true,
    width: "280px",
    onload: () => {
      drawVaccinationsChart(
        svg,
        vaccinationsData
          .filter((d) => d.location === selectedLocation)
          .map((d) => ({
            date: d.date,
            value: d[selectedAttribute],
          }))
          .filter(
            (t) => t.date >= selectedDates[0] && t.date <= selectedDates[1]
          ),
        newDeathData
          .map((d) => ({ date: d.date, value: d[selectedLocation] }))
          .filter(
            (t) => t.date >= selectedDates[0] && t.date <= selectedDates[1]
          ),
        selectedLocation,
        selectedAttribute
      );
    },
    onchange: (d) => {
      selectedLocation = d.value;
      drawVaccinationsChart(
        svg,
        vaccinationsData
          .filter((t) => t.location === selectedLocation)
          .map((t) => ({
            date: t.date,
            value: t[selectedAttribute],
          }))
          .filter(
            (t) => t.date >= selectedDates[0] && t.date <= selectedDates[1]
          ),
        newDeathData
          .map((d) => ({ date: d.date, value: d[selectedLocation] }))
          .filter(
            (t) => t.date >= selectedDates[0] && t.date <= selectedDates[1]
          ),
        selectedLocation,
        selectedAttribute
      );
    },
  });

  jSuites.dropdown(document.getElementById("attribute"), {
    data: attributeList,
    value: "daily_people_vaccinated",
    autocomplete: true,
    width: "280px",
    onchange: (d) => {
      selectedAttribute = d.value;
      drawVaccinationsChart(
        svg,
        vaccinationsData
          .filter((t) => t.location === selectedLocation)
          .map((t) => ({
            date: t.date,
            value: t[selectedAttribute],
          }))
          .filter(
            (t) => t.date >= selectedDates[0] && t.date <= selectedDates[1]
          ),
        newDeathData
          .map((d) => ({ date: d.date, value: d[selectedLocation] }))
          .filter(
            (t) => t.date >= selectedDates[0] && t.date <= selectedDates[1]
          ),
        selectedLocation,
        selectedAttribute
      );
    },
  });

  const dateSlider = document.getElementById("date-slider");

  noUiSlider.create(dateSlider, {
    range: {
      min: selectedDates[0].getTime(),
      max: selectedDates[1].getTime(),
    },
    step: 24 * 60 * 60 * 1000,
    start: selectedDates,
    connect: true,
    tooltips: true,
    format: {
      to: (d) => d3.timeFormat("%d-%b-%Y")(new Date(d)),
      from: Number,
    },
  });

  d3.select(".noUi-target")
    .style("width", `${width - margin.left - margin.right}px`)
    .style("position", "sticky")
    .style("left", `${margin.left}px`);

  dateSlider.noUiSlider.on("update", (dates) => {
    selectedDates = dates.map((d) => d3.timeParse("%d-%b-%Y")(d));
    drawVaccinationsChart(
      svg,
      vaccinationsData
        .filter((t) => t.location === selectedLocation)
        .map((t) => ({
          date: t.date,
          value: t[selectedAttribute],
        }))
        .filter(
          (t) => t.date >= selectedDates[0] && t.date <= selectedDates[1]
        ),
      newDeathData
        .map((d) => ({ date: d.date, value: d[selectedLocation] }))
        .filter(
          (t) => t.date >= selectedDates[0] && t.date <= selectedDates[1]
        ),
      selectedLocation,
      selectedAttribute
    );
  });
};

main();
