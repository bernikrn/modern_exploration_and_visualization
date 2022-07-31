const width = 800
const height = 500
const margin = {top:10, bottom: 40, left:60, right: 10}

const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height)
const elementGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)
const axisGroup = svg.append("g")
const xAxisGroup = axisGroup.append("g").attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
const yAxisGroup = axisGroup.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)

const x = d3.scaleLinear().range([0, width - margin.left - margin.right])
const y = d3.scaleBand().range([height - margin.top - margin.bottom, 0]).padding(0.1)

const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y)

let years
let limitYear = 2018

function drawChart(){
    d3.csv("data.csv").then(data => {
        data.map(d => d.year = +d.year)
        
        //calcula dominio de ejes, utilizando todos los datos hasta el año mas reciente
        let dataVictoriasUltimoAno = d3.entries(contadorMundiales(data, d3.max(data.map(d => d.year))))
        x.domain([0, d3.max(dataVictoriasUltimoAno.map(d => d.value))])
        y.domain(dataVictoriasUltimoAno.map(d => d.key))
        //ajusta cantidad de ticks del eje en funcion del numero de victorias del pais con mas victorias
        xAxisGroup.call(xAxis.ticks(d3.max(dataVictoriasUltimoAno.map(d => d.value))))
        yAxisGroup.call(yAxis)
        
        //filtra datos, utilizandolos solo hasta el año seleccionado
        let dataVictorias = d3.entries(contadorMundiales(data, limitYear))
        let elements = elementGroup.selectAll("rect").data(dataVictorias)
        elements.enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", d => y(d.key))
            .attr("height", y.bandwidth())
            .transition()
            .duration(300)
            .attr("width", d => x(d.value))
            .attr("fill", d => d3.max(dataVictorias.map(d => d.value)) === d.value ? "rgb(210, 0, 0)":"black")

        elements
            .attr("class", "update")
            .attr("x", 0)
            .attr("y", d => y(d.key))
            .attr("height", y.bandwidth())
            .transition()
            .duration(300)
            .attr("width", d => x(d.value))
            .attr("fill", d => d3.max(dataVictorias.map(d => d.value)) === d.value ? "rgb(210, 0, 0)":"black")

        elements.exit()
            .attr("class", "exit")
            .transition()
            .duration(300)
            .attr("width", 0)
            .remove()
    })
}
drawChart()

d3.csv("data.csv").then(data => {
    data.map(d => d.year = +d.year)
    years = data.map(d => d.year)
    elementGroup.selectAll("g")
        .join("g")
            .call(slider)
})

function slider() {
    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(years))  // rango años
        .max(d3.max(years))
        .step(4)  // cada cuánto aumenta el slider
        .width(580)  // ancho de nuestro slider
        .ticks(years.length)  
        .default(years[years.length -1])  // punto inicio de la marca
        .on('onchange', val => {
            limitYear = val
            drawChart()
        });

        var gTime = d3
        .select('div#slider-time')  // div donde lo insertamos
        .append('svg')
        .attr('width', width * 0.8)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

        gTime.call(sliderTime);

        d3.select('p#value-time').text(sliderTime.value());
}

// recibe data y año hasta el cual cuenta. Retorna objeto con pais:victorias hasta ese año.
function contadorMundiales (data, year){
    let victoriasPorPais = {}
    for (let i = 0; i < data.length && data[i].year <= year; i++){
        if (victoriasPorPais.hasOwnProperty(data[i].winner)){
            victoriasPorPais[data[i].winner] += 1
        }else if (data[i].winner !== ''){
            victoriasPorPais[data[i].winner] = 1
        }
    }
    return victoriasPorPais
}
