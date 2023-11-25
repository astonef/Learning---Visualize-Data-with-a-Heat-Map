
let heading = d3.select("body")
                .append("h1")
                .attr("id","title")
                .text("Temperatura Mensile Globale della Superficie Terrestre")
                .append("h4")
                .attr("id","description")
                .text("(1753 - 2015) Temperatura base 8.66 ℃")
				.style("text-align", "center");

let width = 1200
let height = 500
let padding = 60

let svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)

let legend = d3.select("body")
                .append("svg")
                .attr("id","legend")
                .attr("width", 560)
                .attr("height", 50)

// Using scaleBand to create legend
var colors = ["dodgerblue", "turquoise", "darkorange", "firebrick"];
var info = ["minore o uguale -1", "minore o uguale 0", "minore o uguale a 1", "maggiore di 1"]

var xScaler = d3.scaleBand()
                .domain(info)
                .range([25, 555]);

var xAxis = d3.axisBottom(xScaler);

    legend.append("g")
            .attr("transform", "translate(0,30)")
            .call(xAxis);

var XL = d3.scaleBand()
            .domain(colors)
            .range([25, 555])

    legend.selectAll("rect")
            .data(colors)
            .enter()
            .append("rect")
            .attr("x", (d) => XL(d))
            .attr("y", 10)
            .attr("width", XL.bandwidth())
            .attr("height", 20)
            .attr("fill", (d) => d);

let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
let req = new XMLHttpRequest()

let baseTemp
let values = []

let xScale
let yScale

let minYear
let maxYear

let generateScale = () =>{

    minYear = d3.min(values, item =>item['year'])
    maxYear = d3.max(values, item =>item['year'])

    xScale = d3.scaleTime()
                .range([padding, width-padding])
                .domain([ new Date( minYear, 0, 0), new Date(maxYear+1, 0, 0)])

    yScale = d3.scaleTime()
                .range([padding, height-padding])
                .domain([new Date(0, 0, 0), new Date(0, 12, 0) ])

}

let drawCells = () =>{

    let months = ['Gennaio','February','March','April','May','June','July','August','September','October','November','December']

    let tooltip = d3.select("body")
                .append("div")
                .attr("id","tooltip")
                .style("opacity",0)

    svg.selectAll("rect")
        .data(values)
        .enter()
        .append("rect")
        .attr("class","cell")
        .attr("fill", (item) =>{
            variance = item['variance']
            if (variance <= -1){
                return 'cornflowerblue'
            } else if(variance <= 0){
                return 'aquamarine'
            } else if (variance < 1){
                return 'orange'
            } else {
                return 'crimson'
            }
        })
        .attr("data-year", (item) => item['year'])
        .attr("data-month", (item) => (item['month'] - 1 ))
        .attr("data-temp", (item) => (baseTemp + item['variance']))
        .attr("height", (height - ( 2 * padding))/12 )
        .attr("y", (item) => yScale(new Date(0, item['month']-1, 0)))
        .attr("width", (width-(2*padding))/ (maxYear-minYear))
        .attr("x", (item) => xScale(new Date(item['year'], 0, 0)))
        .on("mouseover", (event, item) =>{
            tooltip.attr("data-year", item['year'])
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9)
                    .text(months[item['month']-1] + ' ' + item['year'] + ' : ' + (baseTemp + item['variance']).toFixed(2) +'ºC' + ' ' + item['variance'].toFixed(2) + 'ºC')
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", (event, item) =>{
            tooltip.transition()
                    .duration(500)
                    .style("opacity", 0)
        })

}

let generateAxes = () =>{

    let xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.timeFormat("%Y"))

    svg.append('g')
        .call(xAxis)
        .attr('id','x-axis')
        .attr('transform', 'translate(0, '+ (height - padding) +')')

    let yAxis = d3.axisLeft(yScale)
                    .tickFormat(d3.timeFormat('%B'))

    svg.append('g')
        .call(yAxis)
        .attr('id','y-axis')
        .attr('transform', 'translate('+padding+',0)')

}
req.open('GET', url, true)
req.send()
req.onload = () =>{
    data = JSON.parse(req.responseText)
    baseTemp = data['baseTemperature']
    values = data['monthlyVariance']
    generateScale()
    drawCells()
    generateAxes()
}