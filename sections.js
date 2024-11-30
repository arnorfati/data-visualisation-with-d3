
let salarySizeScale, salaryXScale, categoryColorScale, assetSizeScale, x1Scale, x2Scale
let simulation, nodes
let categoryLegend, salaryLegend

const categories = ['주식', 'ISA','입출금','펀드', '대출',
    '예금', 'IRP','보험/방카',
     '적금','퇴직연금',
    '외환',
    '청약']
const colors = ['#ffcc00', '#ff6666', '#cc0066', '#0c7b93', '#f688bb', '#65587f', '#baf1a1', '#333333', '#75b79e',  '#66cccc', '#9de3d0', '#9399ff']//, '#0c7b93', '#eab0d9', '#baf1a1', '#9399ff'
const categoriesXY = {'주식':    [0, 500, 4040000, 86.1],
                        'ISA':  [0, 800, 1400000, 119.9],
                        '입출금': [0, 200, 700000, 106.4],
                        '펀드':  [200, 500, 980000, 153.3],
                        '대출':  [200, 800, 2010000, 105.2],
                        '예금':  [200, 200, 400000, 102.5],
                        'IRP':  [400, 500, 1680000, 123.3],
                        '보험/방카': [400, 800, 280000, 79.5],
                        '적금': [400, 200, 2178000, 115.2],
                        '퇴직연금': [600, 500, 1400000, 93.2],
                        '외환': [600, 800, 280000, 99.6],
                        '청약': [600, 200, 1500000, 160.0]}

const margin = {left: 170, top: 50, bottom: 50, right: 20}
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom

//Read Data, convert numerical categories into floats
//Create the initial visualisation


d3.csv('data/recent-grads.csv', function(d){
    return {
        Major: d.Major,
        Total: +d.Total,
        x1: +d.x1,
        x2: +d.x2,
        asset_size: +d.asset_size,
        asset_size_part2 :+d.asset_size_part2,
        Men: +d.Men,
        Women: +d.Women,
        Median: +d.Median,
        fin_type : d.fin_type,
        Unemployment: +d.Unemployment_rate,
        Category: d.Major_category,
        ShareWomen: +d.ShareWomen, 
        HistCol: +d.Histogram_column,
        Midpoint: +d.midpoint
    };
}).then(data => {
    dataset = data
    console.log(dataset)
    createScales()
    setTimeout(drawInitial(), 100)
})



//Create all the scales and save to global variables

function createScales(){
    salarySizeScale = d3.scaleLinear(d3.extent(dataset, d => d.Median), [5, 50])

    assetSizeScale = d3.scaleLinear(d3.extent(dataset, d => d.asset_size), [10, 50])
    assetSizeScale2 = d3.scaleLinear(d3.extent(dataset, d => d.asset_size_part2), [15, 60])

    // x1Scale = d3.scaleLinear([0,1], [margin.left, margin.left + width])
    // x2Scale = d3.scaleLinear([0,1], [margin.top + height, margin.top])
    x1Scale = d3.scaleLinear([0,1], [margin.left,width - margin.right + 190])
    x2Scale = d3.scaleLinear([0,1], [height - margin.bottom + 90,  margin.top + 10])
    
    
    
    salaryXScale = d3.scaleLinear(d3.extent(dataset, d => d.Median), [margin.left, margin.left + width+250])
    salaryYScale = d3.scaleLinear([0, 1600000], [margin.top + height, margin.top])
    categoryColorScale = d3.scaleOrdinal(categories, colors)
    shareWomenXScale = d3.scaleLinear(d3.extent(dataset, d => d.ShareWomen), [margin.left, margin.left + width])
    enrollmentScale = d3.scaleLinear([0,1], [margin.left + 120, margin.left + width - 50])
    enrollmentSizeScale = d3.scaleLinear(d3.extent(dataset, d=> d.asset_size_part2), [10,60])
    histXScale = d3.scaleLinear([0,1], 
        [margin.left, margin.left + width - 50]) // 오른쪽 여백 추가
    histYScale = d3.scaleLinear(
        [0, d3.max(dataset, d => d.HistCol)], // 0부터 시작하도록 수정
        [height + margin.top, margin.top]) // 위아래 여백 확보
}

function createLegend(x, y){
    let svg = d3.select('#legend')

    svg.append('g')
        .attr('class', 'categoryLegend')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend = d3.legendColor()
                            .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
                            .shapePadding(10)
                            .scale(categoryColorScale)
    
    d3.select('.categoryLegend')
        .call(categoryLegend)

    // 범례 항목을 2열로 배치하고 간격 조정
    d3.selectAll('.categoryLegend .cell')
        .attr('transform', function(d, i) {
            const col = i % 2; // 열 계산
            const row = Math.floor(i / 2); // 행 계산
            return `translate(${col * 120}, ${row * 20})`; // x, y 위치 조정
        });
}

function createSizeLegend(){
    let svg = d3.select('#legend2')
    svg.append('g')
        .attr('class', 'sizeLegend')
        .attr('transform', `translate(0,50)`)

    sizeLegend2 = d3.legendSize()
        .scale(assetSizeScale)
        .shape('circle')
        .shapePadding(50)
        // .orient('horizontal')
        .title('자산 총액(₩)')
        .labelFormat(d3.format(",.2r"))
        .cells(4)

    d3.select('.sizeLegend')
        .call(sizeLegend2)
}

function createSizeLegend2(){
    let svg = d3.select('#legend3')
    svg.append('g')
        .attr('class', 'sizeLegend2')
        .attr('transform', `translate(50,100)`)

    sizeLegend2 = d3.legendSize()
        .scale(enrollmentSizeScale)
        .shape('circle')
        .shapePadding(55)
        .orient('horizontal')
        .title('지출 횟수 크기(건)')
        .labels(['5', '50', '300'])
        .labelOffset(30)
        .cells(3)

    d3.select('.sizeLegend2')
        .call(sizeLegend2)
}

// All the initial elements should be create in the drawInitial function
// As they are required, their attributes can be modified
// They can be shown or hidden using their 'opacity' attribute
// Each element should also have an associated class name for easy reference

function drawInitial(){
    createSizeLegend()
    createSizeLegend2()

    let svg = d3.select("#vis")
                    .append('svg')
                    .attr('width', 1000)
                    .attr('height', 950)
                    .attr('opacity', 1)
// 생성형AI활용 화면 내 차트 크기 맞추기                    
                    .attr('viewBox', `0 0 1000 950`)
                    .attr('preserveAspectRatio', 'xMidYMid meet')

    // let xAxis = d3.axisBottom(salaryXScale)
    //                 .ticks(4)
    //                 .tickSize(700 + 80)

    // let xAxisGroup = svg.append('g')
    //     .attr('class', 'first-axis')
    //     .attr('transform', 'translate(0, 0)')
    //     .call(xAxis)
    //     .call(g => g.select('.domain')
    //         .remove())
    //     .call(g => g.selectAll('.tick line'))
    //         .attr('stroke-opacity', 0.2)
    //         .attr('stroke-dasharray', 2.5)

    // Instantiates the force simulation
    // Has no forces. Actual forces are added and removed as required

    simulation = d3.forceSimulation(dataset)

     // Define each tick of simulation
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            
    })

    // Stop the simulation until later
    simulation.stop()

    // Selection of all the circles 
    nodes = svg
        .selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('r', d => salarySizeScale(d.Median) * 1.6)
        .attr('fill', d => categoryColorScale(d.Category))
        
    

        simulation 
            .force('forceX', d3.forceX(500))
            .force('forceY', d3.forceY(500))
            .force('collide', d3.forceCollide(d => salarySizeScale(d.Median) * 1.6 + 4))
            .alpha(0.6).alphaDecay(0.05).restart()
        
    // Add mouseover and mouseout events for all circles
    // Changes opacity and adds border
    svg.selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)

    function mouseOver(d, i){

        console.log('hi')
        d3.select(this)
            .transition('mouseover').duration(100)
            .attr('opacity', 1)
            .attr('stroke-width', 5)
            .attr('stroke', 'black')
            
        d3.select('#tooltip')
            .style('left', (d3.event.pageX + 10)+ 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(`<strong>자산 유형:</strong> ${d.Category}
                <br><strong>상품명:</strong> ${d.Major[0] + d.Major.slice(1,).toLowerCase()} 
                <br> <strong>자산 금액:</strong> ₩${d3.format(",.2r")(d.asset_size)} 
                <br> <strong>수익율:</strong> ${Math.round(d.ShareWomen*100)}%
                <br> <strong>금융기관:</strong> ${d.fin_type}`
            )
                
                
    }
    
    function mouseOut(d, i){
        d3.select('#tooltip')
            .style('display', 'none')

        d3.select(this)
            .transition('mouseout').duration(100)
            .attr('opacity', 0.8)
            .attr('stroke-width', 0)
    }

    //Small text label for first graph
    svg.selectAll('.small-text')
        .data(dataset)
        .append('text')
            .text((d, i) => d.Major.toLowerCase())
            .attr('class', 'small-text')
            .attr('x', margin.left)
            .attr('y', (d, i) => i * 5.2 + 30)
            .attr('font-size', 7)
            .attr('text-anchor', 'end')
    
    //All the required components for the small multiples charts
    //Initialises the text and rectangles, and sets opacity to 0 
    svg.selectAll('.cat-rect')
        .data(categories).enter()
        .append('rect')
            .attr('class', 'cat-rect')
            .attr('x', d => categoriesXY[d][0] + 120 + 1000)
            .attr('y', d => categoriesXY[d][1] + 30)
            .attr('width', 160)
            .attr('height', 30)
            .attr('opacity', 0)
            .attr('fill', 'grey')


    svg.selectAll('.lab-text')
        .data(categories).enter()
        .append('text')
        .attr('class', 'lab-text')
        .attr('opacity', 0)
        .raise()

    svg.selectAll('.lab-text')
        // .text(d => d.Category)
        .attr('x', d => categoriesXY[d][0] + 200 + 1000)
        .attr('y', d => categoriesXY[d][1] - 500)
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')       

    svg.selectAll('.lab-text')
            .on('mouseover', function(d, i){
                d3.select(this)
                    .text(d => `${d}: 총 자산: ₩${d3.format(",.2r")(categoriesXY[d][2])}`)
                    
            })
            .on('mouseout', function(d, i){
                d3.select(this)
                    .text(d)
            })


    // Best fit line for gender scatter plot

    const bestFitLine = [{x: 0.4, y: 56093}, {x: 1.5, y: 455423}]
    const lineFunction = d3.line()
                            .x(d => shareWomenXScale(d.x))
                            .y(d => salaryYScale(d.y))

    // Axes for Scatter Plot
    svg.append('path')
        .transition('best-fit-line').duration(430)
            .attr('class', 'best-fit')
            .attr('d', lineFunction(bestFitLine))
            .attr('stroke', 'grey')
            .attr('stroke-dasharray', 6.2)
            .attr('opacity', 0)
            .attr('stroke-width', 3)

    let scatterxAxis = d3.axisBottom(shareWomenXScale)
    let scatteryAxis = d3.axisLeft(salaryYScale)

    svg.append('g')
        .call(scatterxAxis)
        .attr('class', 'scatter-x')
        .attr('opacity', 0)
        .attr('transform', `translate(0, ${(height / 2)+50})`)
        .call(g => g.select('.domain')
            .attr('stroke', 'gray')
            .attr('stroke-dasharray', '4,4'))
        .call(g => g.selectAll('.tick line')
            .attr('stroke', 'gray')
            .attr('stroke-dasharray', '2,2'))
        .call(g => g.selectAll('.tick text')
            .remove())

    // 축의 맨 왼쪽에 "변동성" 텍스트 추가
    svg.append('text')
        .attr('class', 'scatterX1Text')
        .attr('opacity', 0)
        .attr('x', margin.left) // 왼쪽 여백에 위치
        .attr('y', height / 2 + 40) // 축 바로 위에 위치
        .attr('text-anchor', 'start') // 텍스트 시작점 기준 정렬
        .attr('fill', 'gray')
        .text('적극투자')

    // 축의 맨 오른쪽에 "안정성" 텍스트 추가
    svg.append('text')
        .attr('class', 'scatterX2Text')  
        .attr('opacity', 0)    
        .attr('x', width - margin.right + 190) // 오른쪽 여백에 위치
        .attr('y', height / 2 + 40) // 축 바로 위에 위치
        .attr('text-anchor', 'end') // 텍스트 끝점 기준 정렬
        .attr('fill', 'gray')
        .text('안정추구')
    

    svg.append('g')
        .call(scatteryAxis)
        .attr('class', 'scatter-y')
        .attr('opacity', 0)
        .attr('transform', `translate(${(width / 1.5)+30}, 0)`)
        .call(g => g.select('.domain')
            .attr('stroke', 'gray')
            .attr('stroke-dasharray', '4,4'))
        .call(g => g.selectAll('.tick line')
            .attr('stroke', 'gray')
            .attr('stroke-dasharray', '2,2'))
        .call(g => g.selectAll('.tick text')
            .remove())
        // .call(g => g.selectAll('.tick line'))
        //     .attr('stroke-opacity', 0.2)
        //     .attr('stroke-dasharray', 2.5)

    // Axes for Histogram 

    let histxAxis = d3.axisBottom(enrollmentScale)

    svg.append('g')
        .attr('class', 'enrolment-axis')
        .attr('transform', 'translate(0, 700)')
        .attr('opacity', 0)
        .call(histxAxis)

    // y축의 맨 위에 "장기성" 텍스트 추가
    svg.append('text')
        .attr('class', 'scatterY1Text')
        .attr('opacity', 0)
        .attr('x', (width / 2) + 125) // 가로 중앙에 위치
        .attr('y', margin.top + 10) // 위쪽 여백에 위치
        .attr('text-anchor', 'middle') // 텍스트 중앙 정렬
        .attr('fill', 'gray')
        .text('장기성');

    // y축의 맨 아래에 "단기성" 텍스트 추가
    svg.append('text')
        .attr('class', 'scatterY2Text')
        .attr('opacity', 0)
        .attr('x', (width / 2)+ 125) // 가로 중앙에 위치
        .attr('y', height - margin.bottom + 90) // 아래쪽 여백에 위치
        .attr('text-anchor', 'middle') // 텍스트 중앙 정렬
        .attr('fill', 'gray')
        .text('단기성');


    svg.append('text')
        .attr('class', 'bubbleX1Text')
        .attr('opacity', 0)
        .attr('x', margin.left) // 왼쪽 여백에 위치
        .attr('y', height / 2 + 40) // 축 바로 위에 위치
        .attr('text-anchor', 'start') // 텍스트 시작점 기준 정렬
        .attr('fill', 'gray')
        .text('단기성')


    svg.append('text')
        .attr('class', 'bubbleX2Text')  
        .attr('opacity', 0)    
        .attr('x', width - margin.right + 190) // 오른쪽 여백에 위치
        .attr('y', height / 2 + 40) // 축 바로 위에 위치
        .attr('text-anchor', 'end') // 텍스트 끝점 기준 정렬
        .attr('fill', 'gray')
        .text('장기성')

}

//Cleaning Function
//Will hide all the elements which are not necessary for a given chart type 

function clean(chartType){
    let svg = d3.select('#vis').select('svg')
    if (chartType !== "isScatter") {
        svg.select('.scatter-x').transition().attr('opacity', 0)
        svg.select('.scatterX1Text').transition().attr('opacity', 0)
        svg.select('.scatterX2Text').transition().attr('opacity', 0)
        
        svg.select('.scatter-y').transition().attr('opacity', 0)
        svg.select('.scatterY1Text').transition().attr('opacity', 0)
        svg.select('.scatterY2Text').transition().attr('opacity', 0)

        svg.select('.bubbleX1Text').transition().attr('opacity', 0)
        svg.select('.bubbleX2Text').transition().attr('opacity', 0)
        
    }
    if (chartType !== "isMultiples"){
        svg.selectAll('.lab-text').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.cat-rect').transition().attr('opacity', 0)
            .attr('x', 1800)
    }
    if (chartType !== "isFirst"){
        svg.select('.first-axis').transition().attr('opacity', 0)
        svg.selectAll('.small-text').transition().attr('opacity', 0)
            .attr('x', -200)
    }
    if (chartType !== "isHist"){
        svg.selectAll('.hist-axis').transition().attr('opacity', 0)
    }
    if (chartType !== "isBubble"){
        svg.select('.enrolment-axis').transition().attr('opacity', 0)
    }
}

//First draw function

function draw1(){
    //Stop simulation
    simulation.stop()
    
    let svg = d3.select("#vis")
                    .select('svg')
                    .attr('width', 1000)
                    .attr('height', 950)
    
    clean('isFirst')

    d3.select('.categoryLegend').transition().remove()

    svg.select('.first-axis')
        .attr('opacity', 1)
    
    svg.selectAll('circle')
        .transition().duration(500).delay(100)
        .attr('fill', 'black')
        .attr('r', 3)
        .attr('cx', (d, i) => salaryXScale(d.Median)+5)
        .attr('cy', (d, i) => i * 5.2 + 30)

    // svg.selectAll('.small-text').transition()
    //     .attr('opacity', 1)
    //     .attr('x', margin.left)
    //     .attr('y', (d, i) => i * 5.2 + 30)
}


function draw2(){
    let svg = d3.select("#vis")
                    .select('svg')
                    .attr('width', 1000)
                    .attr('height', 950)
    
    clean('none')

    svg.selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 5)

        // .attr('r', d => assetSizeScale(d.asset_size)*1.2)
        .attr('r', d => salarySizeScale(d.Median) * 1.2)
        .attr('fill', d => categoryColorScale(d.Category))


    simulation  
        .force('charge', d3.forceManyBody().strength([2]))
        .force('forceX', d3.forceX(d => categoriesXY[d.Category][0] + 200))
        .force('forceY', d3.forceY(d => categoriesXY[d.Category][1] - 50))
        
        .force('collide', d3.forceCollide(d => salarySizeScale(d.Median) * 1.2 ))
        // .force('collide', d3.forceCollide(d => assetSizeScale(d.asset_size))*1.2 + 4)

        .alphaDecay([0.02])

    //Reheat simulation and restart
    simulation.alpha(0.9).restart()
    
    createLegend(20, 50)
}

function draw3(){
    let svg = d3.select("#vis").select('svg')
    clean('isMultiples')
    
    svg.selectAll('circle')
        .transition().duration(400).delay((d, i) => i * 5)

        // .attr('r', d => salarySizeScale(d.Median) * 1.6)
        .attr('r', d => assetSizeScale(d.asset_size) * 1.6)
        
        
        .attr('fill', d => categoryColorScale(d.Category))

    svg.selectAll('.cat-rect').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
        .attr('x', d => categoriesXY[d][0] + 120)
        
    svg.selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
        .text(d => d)
        .attr('x', d => categoriesXY[d][0] + 200)   
        .attr('y', d => categoriesXY[d][1] + 50)
        .attr('opacity', 1)

    svg.selectAll('.lab-text')
        .on('mouseover', function(d, i){
            d3.select(this)
            .text(d => `총 자산: ₩${d3.format(",.2r")(categoriesXY[d][2])}`)
        })
        .on('mouseout', function(d, i){
            d3.select(this)
            .text(d)
        })

    simulation  
        .force('charge', d3.forceManyBody().strength([2]))
        .force('forceX', d3.forceX(d => categoriesXY[d.Category][0] + 200))
        .force('forceY', d3.forceY(d => categoriesXY[d.Category][1] - 50))
        // .force('collide', d3.forceCollide(d => salarySizeScale(d.Median) * 1.6 + 4))
        // .force('collide', d3.forceCollide(d => salarySizeScale(d.Median) + 4))
        .force('collide', d3.forceCollide(d => assetSizeScale(d.asset_size) * 1.6 + 4))
        .alpha(0.7).alphaDecay(0.02).restart()

}

function draw5(){
    
    let svg = d3.select('#vis').select('svg')
    clean('isMultiples')

    simulation
        .force('forceX', d3.forceX(d => categoriesXY[d.Category][0] + 200))
        .force('forceY', d3.forceY(d => categoriesXY[d.Category][1] - 50))
        .force('collide', d3.forceCollide(d => salarySizeScale(d.Median) + 4))

    simulation.alpha(1).restart()
   
    svg.selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `증감 비율: ${(categoriesXY[d][3])}%`)
        .attr('x', d => categoriesXY[d][0] + 200)   
        .attr('y', d => categoriesXY[d][1] + 50)
        .attr('opacity', 1)
    
    svg.selectAll('.lab-text')
        .on('mouseover', function(d, i){
            d3.select(this)
                .text(d)
        })
        .on('mouseout', function(d, i){
            d3.select(this)
                .text(d => `증감 비율: ${(categoriesXY[d][3])}%`)
        })
   
    svg.selectAll('.cat-rect').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
        .attr('x', d => categoriesXY[d][0] + 120)

    svg.selectAll('circle')
        .transition().duration(400).delay((d, i) => i * 4)
            .attr('fill', colorByGender)
            .attr('r', d => salarySizeScale(d.Median))

}

function colorByGender(d, i){
    if (d.ShareWomen < 0.85){
        return '#03A696'
    } else if (d.ShareWomen > 1.15) {
        return '#F24171'
    } else {
        return 'grey'
    }
}
// step1
function draw6(){
    simulation.stop()
    
    let svg = d3.select("#vis").select("svg")
    clean('isScatter')
    svg.selectAll('.scatter-x').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterX1Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterX2Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    
    svg.selectAll('.scatter-y').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterY1Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterY2Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    
    // svg.selectAll('circle')
    //     .transition().duration(800).ease(d3.easeBack)
    //     .attr('cx', d => shareWomenXScale(d.ShareWomen))
    //     .attr('cy', d => salaryYScale(d.Median))
    //     .attr('r', salarySizeScale(d.Median) * 1.6)

    svg.selectAll('circle')
    .transition()
    .duration(600).delay((d, i) => i * 2).ease(d3.easeBack)
    .attr('cx', d => x1Scale(d.x1))
    .attr('cy', d => x2Scale(d.x2))
    .attr('r', d => assetSizeScale2(d.asset_size_part2))
    .attr('fill', d => categoryColorScale(d.Category))
    
    simulation 
        // .force('forceX', d3.forceX(d.x1))
        // .force('forceY', d3.forceY(d.x2))
        .force('collide', d3.forceCollide(d => assetSizeScale(d.asset_size) * 1.6 + 4))
        .alpha(0.6).alphaDecay(0.05)
}

function draw6_1(){
    simulation.stop()
    
    let svg = d3.select("#vis").select("svg")
    clean('isScatter')
    svg.selectAll('.scatter-x').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterX1Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterX2Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    
    svg.selectAll('.scatter-y').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterY1Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterY2Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    
    // svg.selectAll('circle')
    //     .transition().duration(800).ease(d3.easeBack)
    //     .attr('cx', d => shareWomenXScale(d.ShareWomen))
    //     .attr('cy', d => salaryYScale(d.Median))
    //     .attr('r', salarySizeScale(d.Median) * 1.6)

    svg.selectAll('circle')
    .transition()
    .duration(600).delay((d, i) => i * 2).ease(d3.easeBack)
    .attr('cx', d => x1Scale(d.x1))
    .attr('cy', d => x2Scale(d.x2))
    .attr('r', d => assetSizeScale2(d.asset_size_part2))
    .attr('fill', colorByGender)
    
    simulation 
        // .force('forceX', d3.forceX(d.x1))
        // .force('forceY', d3.forceY(d.x2))
        .force('collide', d3.forceCollide(d => assetSizeScale(d.asset_size) * 1.6 + 4))
        .alpha(0.6).alphaDecay(0.05)
}


function draw6_2(){
    simulation.stop()
    
    let svg = d3.select("#vis").select("svg")
    clean('isScatter')
    svg.selectAll('.scatter-x').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterX1Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterX2Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    
    svg.selectAll('.scatter-y').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterY1Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatterY2Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    
    // svg.selectAll('circle')
    //     .transition().duration(800).ease(d3.easeBack)
    //     .attr('cx', d => shareWomenXScale(d.ShareWomen))
    //     .attr('cy', d => salaryYScale(d.Median))
    //     .attr('r', salarySizeScale(d.Median) * 1.6)

    svg.selectAll('circle')
    .transition()
    .duration(600).delay((d, i) => i * 2).ease(d3.easeBack)
    .attr('cx', d => x1Scale(d.x1))
    .attr('cy', d => x2Scale(d.x2))
    .attr('r', d => assetSizeScale2(d.asset_size_part2))
    .attr('fill', colorByGender)
    
    simulation 
        // .force('forceX', d3.forceX(d.x1))
        // .force('forceY', d3.forceY(d.x2))
        .force('collide', d3.forceCollide(d => assetSizeScale(d.asset_size) * 1.6 + 4))
        .alpha(0.6).alphaDecay(0.05)
}



//하나은행 로고
function draw7(){
    let svg = d3.select('#vis').select('svg')

    clean('isBubble')

    simulation
        .force('forceX', d3.forceX(d => enrollmentScale(d.x2)))
        .force('forceY', d3.forceY(500))
        .force('collide', d3.forceCollide(d => enrollmentSizeScale(d.asset_size_part2) + 2))
        .alpha(0.8).alphaDecay(0.05).restart()

    svg.selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 4)
        .attr('r', d => enrollmentSizeScale(d.asset_size_part2))
        .attr('fill', d => categoryColorScale(d.Category))

    //Show enrolment axis (remember to include domain)
    svg.select('.enrolment-axis').attr('opacity', 0.5).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.bubbleX1Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.bubbleX2Text').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)

}

// function draw4(){
//     let svg = d3.select('#vis').select('svg')

//     clean('isHist')

//     simulation.stop()

//     svg.selectAll('circle')
//         .transition().duration(600).delay((d, i) => i * 2).ease(d3.easeBack)
//             .attr('r', 10) // 원 크기를 좀 더 작게 조정
//             .attr('cx', d => histXScale(d.x2))
//             .attr('cy', d => histYScale(d.HistCol))
//             .attr('fill', d => categoryColorScale(d.Category))

//     let xAxis = d3.axisBottom(histXScale)
//     svg.append('g')
//         .attr('class', 'hist-axis')
//         .attr('transform', `translate(0, ${height + margin.top })`)
//         .call(xAxis)

//     svg.selectAll('.lab-text')
//         .on('mouseout', )
// }
function draw4(){
    let svg = d3.select('#vis').select('svg')

    clean('isHist')

    simulation.stop()

    svg.selectAll('circle')
        .transition().duration(600).delay((d, i) => i * 2).ease(d3.easeBack)
            .attr('r', 5) // 원 크기를 좀 더 작게 조정
            .attr('cx', d => histXScale(d.Midpoint))
            .attr('cy', d => histYScale(d.HistCol))
            .attr('fill', 'LightGray')

    let xAxis = d3.axisBottom(histXScale)
    svg.append('g')
        .attr('class', 'hist-axis')
        .attr('transform', `translate(0, ${height + margin.top })`)
        .call(xAxis)

    svg.selectAll('.lab-text')
        .on('mouseout', )
}

function draw8(){
    clean('none')

    let svg = d3.select('#vis').select('svg')
    svg.selectAll('circle')
        .transition()
        .attr('r', d => salarySizeScale(d.Median) * 1.6)
        .attr('fill', d => categoryColorScale(d.Category))

    simulation 
        .force('forceX', d3.forceX(500))
        .force('forceY', d3.forceY(500))
        .force('collide', d3.forceCollide(d => salarySizeScale(d.Median) * 1.6 + 4))
        .alpha(0.6).alphaDecay(0.05).restart()
        
}



//Array of all the graph functions
//Will be called from the scroller functionality

let activationFunctions = [
    
    draw8,
    draw3,
    draw6,
    draw6_1,
    draw7,
    draw4,
    draw5, 
    draw7
]

//All the scrolling function
//Will draw a new graph based on the index provided by the scroll


let scroll = scroller()
    .container(d3.select('#graphic'))
scroll()

let lastIndex, activeIndex = 0

scroll.on('active', function(index) {
    // 모든 step에 대해 상태 업데이트
    d3.selectAll('.step')
        .classed('is-active', function(d, i) { return i === index; })
        .classed('is-leaving', function(d, i) { return i === index - 1; })
        .classed('is-next', function(d, i) { return i === index + 1; });

    // 기의 활성화 함수 실행
    activeIndex = index;
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1; 
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;
});

scroll.on('progress', function(index, progress){
    if (index == 2 & progress > 0.7){

    }
})


