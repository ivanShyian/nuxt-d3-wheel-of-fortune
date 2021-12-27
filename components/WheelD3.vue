<template>
  <div
    ref='wheel'
    class='wheel'
  >
    <svg
      id="d3"
      style='width: 100%; height: 100%'
    />
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'WheelD3',
  data: () => ({
    arrayLength: 22,
    width: null,
    height: null,
  }),
  computed: {
    tempArray() {
      return Array(this.arrayLength).fill({id: 0, value: 1}).map((v, idx) => ({...v, id: idx}))
    },
    margin() {
      const margin = {top: 40, bottom: 40, left: 20, right: 20}
      const vertical = margin.top + margin.bottom
      const horizontal = margin.left + margin.right
      return {
        ...margin,
        vertical,
        horizontal,
        sum: vertical + horizontal
      }
    }
  },
  mounted() {
    const {offsetWidth, offsetHeight} = this.$refs.wheel
    this.width = offsetWidth
    this.height = offsetHeight
    this.initSvg()
  },
  methods: {
    initSvg() {
      const sliceR = 360 / this.tempArray.length
      const halfSliceR = sliceR / 2
      const radius = Math.min(this.width, this.height) / 2 - this.margin.vertical

      // Wheel wrapper
      const svg = d3.select('#d3').append('g')
        .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`)

      // Init all parts of svg
      const callback = this.initSvgGradients(svg, radius) // returns radialGradient
      this.initWheelSlices(svg, radius, sliceR, halfSliceR, callback)
      this.initOuterCircle(svg, radius)
      this.initSpinButton(svg, radius, halfSliceR)
    },
    initOuterCircle(svg, radius) {
      const outerWheel = svg.append('g')

      // OuterCircle
      outerWheel.append('path')
        .attr('class', 'arc')
        .attr('d', this.arcCircleGenerator(radius + 12, radius + 35))
        .attr('fill', 'url(#outerCircleGradient)')

      // Triangle
      const triangle = d3.symbol()
        .type(d3.symbolTriangle)
        .size(1337)

      outerWheel.append('path')
        .attr('d', triangle)
        .attr('transform', `translate(0, -${radius + 15}) rotate(180)`)
        .attr('fill', 'url(#outerCircleGradient)')

    },
    initWheelSlices(svg, radius, sliceRadius, halfSliceRadius, gradientCallback) {
      const slicesArcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

      const pie = d3.pie().value(data => data.value)
      const dataReady = pie(this.tempArray)

      const wheel = svg.append('g')
        .attr('transform', `rotate(${halfSliceRadius})`)
        .attr('id', 'wheel')

      // Slices
      wheel.selectAll('slices')
        .data(dataReady)
        .enter()
        .append('path')
        .attr('d', slicesArcGenerator)
        .attr('fill', d => d.index % 2 ? 'url(#mainGreenGradient)' : 'url(#mainYellowGradient)')
        .attr('stroke', 'white')
        .style('stroke-width', '5px')

      // Dots
      const dotsGroup = wheel.append('g')
        .attr('transform', `rotate(${halfSliceRadius})`)

      dotsGroup.selectAll('sliceDots')
        .data(dataReady)
        .enter()
        .append('path')
        .attr('d', this.arcCircleGenerator(0, 12))
        .attr('fill', 'url(#outerCircleGradient)')
        .attr('stroke', 'white')
        .style('stroke-width', '5px')
        .attr('transform', (d) => {
          const [xAxis, yAxis] = slicesArcGenerator.centroid(d)
          return `translate(${xAxis * 2}, ${yAxis * 2})`
        })

      // Add radialGradient before setting up gifts
      gradientCallback()

      // Gifts
      const giftsGroup = wheel.append('g')

      const eachGiftGroup = giftsGroup.selectAll('giftsSquare')
        .data(dataReady)
        .enter()
        .append('g')
        .attr('filter', 'url(#dropshadow)')
        .attr('transform', d => {
          const [xAxis, yAxis] = slicesArcGenerator.centroid(d)
          return `translate(${xAxis * 1.5}, ${yAxis * 1.5}) rotate(${((d.startAngle+d.endAngle)/2) * (180/Math.PI)})`
        })

      // @TODO Refactor
      const rectSizeDependOfLength = () => {
        const size = Math.min(this.width, this.height) / this.tempArray.length
        if (this.tempArray.length < 4) return size/3
        if (this.tempArray.length < 6) return size/2
        if (this.tempArray.length < 8) return size/1.5
        return size
      }

      const rectSize = rectSizeDependOfLength()

      eachGiftGroup.append('rect')
        .attr('width', rectSize)
        .attr('height', rectSize)
        .attr('rx', '8')
        .attr('x', -(rectSize / 2))
        .attr('y', -(rectSize / 2))
        .attr('fill', '#fff')

      const fakeRectSize = rectSize + rectSize / 3
      eachGiftGroup.append('rect')
        .attr('width', fakeRectSize)
        .attr('height', fakeRectSize)
        .attr('rx', '8')
        .attr('x', -(fakeRectSize / 2))
        .attr('y', -(fakeRectSize / 2))
        .attr('fill', 'none')
    },
    initSpinButton(svg, radius, halfSliceRadius) {
      const buttonGroup = svg.append('g')
        .attr('id', 'buttonGroup')
        .style('cursor', 'pointer')
        .on('click', () => this.onSpin(halfSliceRadius))

      buttonGroup.append('path')
        .attr('d', this.arcCircleGenerator(0, 70))
        .attr('fill', 'url(#buttonInner)')
        .attr('stroke', 'white')
        .style('stroke-width', '5px')

      buttonGroup.append('path')
        .attr('d', this.arcCircleGenerator(0, 55))
        .attr('fill', 'url(#buttonInnerShadow)')

      buttonGroup.append('text')
        .text('Пуск')
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'middle')
        .style('font-size', '36px')
        .style('font-weight', '700')
        .style('letter-spacing', '2px')
        .style('fill', '#fff')
    },
    initSvgGradients(svg, radius) {
      const svgDefs = svg.append('defs')

      // Green slices
      const greenSlicesGradient = svgDefs.append('linearGradient')
        .attr('id', 'mainGreenGradient')
        .attr('gradientUnits', 'userSpaceOnUse')

      greenSlicesGradient.append('stop')
        .attr('class', 'stopLeftGreen')
        .attr('offset', '0')
      greenSlicesGradient.append('stop')
        .attr('class', 'stopRightLightGreen')
        .attr('offset', '1')

      // Yellow slices
      const yellowSlicesGradient = svgDefs.append('linearGradient')
        .attr('id', 'mainYellowGradient')
        .attr('gradientUnits', 'userSpaceOnUse')

      yellowSlicesGradient.append('stop')
        .attr('class', 'stopLeftYellow')
        .attr('offset', '0')
      yellowSlicesGradient.append('stop')
        .attr('class', 'stopRightYellow')
        .attr('offset', '1')

      // Outer circle, button, slice circles
      const outerCircleGradient = svgDefs.append('linearGradient')
        .attr('id', 'outerCircleGradient')
        .attr('x1', '148.367')
        .attr('y1', '359.5')
        .attr('x2', '313.559')
        .attr('y2', '-206.157')

      outerCircleGradient.append('stop')
        .attr('class', 'stopLeftOuterCircle')
        .attr('offset', '0')
      outerCircleGradient.append('stop')
        .attr('class', 'stopRightOuterCircle')
        .attr('offset', '1')

      // Spin button inner
      const buttonInner = svgDefs.append('linearGradient')
        .attr('id', 'buttonInner')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', '40.3869')
        .attr('y1', '0.873047')
        .attr('x2', '40.3869')
        .attr('y2', '79.9291')

      buttonInner.append('stop')
        .attr('class', 'stopButtonInner')
      buttonInner.append('stop')
        .attr('class', 'stopButtonInnerEnd')
        .attr('offset', '1')

      // Spin button inner shadow
      const buttonInnerShadow = svgDefs.append('linearGradient')
        .attr('id', 'buttonInnerShadow')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', '114.894')
        .attr('y1', '130.764')
        .attr('x2', '7.68626')
        .attr('y2', '9.79003')

      buttonInnerShadow.append('stop')
        .attr('class', 'stopButtonInnerShadow')
      buttonInnerShadow.append('stop')
        .attr('class', 'stopButtonInnerShadowEnd')
        .attr('offset', '1')

      // Inner circle (slices)
      const innerCircleGradient = svgDefs.append('radialGradient')
        .attr('id', 'innerCircleGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('cx', '0')
        .attr('cy', '0')
        .attr('r', radius)

      innerCircleGradient.append('stop')
        .attr('class', 'innerCircleStartStop')
        .attr('offset', '0')
      innerCircleGradient.append('stop')
        .attr('class', 'innerCircleSecondStartStop')
        .attr('offset', '0.44')
      innerCircleGradient.append('stop')
        .attr('class', 'innerCircleEndStop')
        .attr('offset', '0.85')
      innerCircleGradient.append('stop')
        .attr('class', 'innerCircleSecondEndStop')
        .attr('offset', '1')

      // Square (gift) shadow
      const itemFilter = svgDefs.append('filter')
        .attr('id', 'dropshadow')
        .attr('width', '300%')
        .attr('height', '300%')

      const deviation = () => {
        if (this.tempArray.length >= 14) return 4
        if (this.tempArray.length >= 10) return 10
        if (this.tempArray.length >= 8) return 14
        if (this.tempArray.length >= 6) return 10
        return 8
      }

      itemFilter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', deviation())
        .attr('result', 'blur')
      itemFilter.append('feOffset')
        .attr('in', 'blur')
        .attr('dx', '0')
        .attr('dy', '5')
        .attr('result', 'offsetBlur')

      const feMerge = itemFilter.append('feMerge')

      feMerge.append('feMergeNode')
        .attr('in', 'offsetBlur')
      feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic')

      return () => svg.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', radius)
        .attr('fill', 'url(#innerCircleGradient)')
    },
    arcCircleGenerator(innerR, outerR) {
      return d3.arc()
        .innerRadius(innerR)
        .outerRadius(outerR)
        .startAngle(0)
        .endAngle(Math.PI * 2)()
    },
    onSpin(halfSliceRadius) {
      const oldRotation = halfSliceRadius
      const additionalRotates = 7
      const halfSliceMinusDef = halfSliceRadius - 1
      const plusOrMinus = Math.random() < 0.5
        ? -(Math.random() * halfSliceMinusDef).toFixed(2)
        : +(Math.random() * halfSliceMinusDef).toFixed(2)

      const rotation = halfSliceRadius + 360 * additionalRotates + plusOrMinus

      const rotTween = (to) => {
        const i = d3.interpolate(oldRotation % 360, rotation)
        return (t) => `rotate(${i(t)})`
      }

      d3.select('#wheel')
        .transition()
        .duration(7000)
        .ease(d3.easeCubicOut)
        .attrTween('transform', rotTween)
        .on('start', () => d3.select('#buttonGroup').on('click', null))
    }
  }
}
</script>
<style>
.wheel {
  width: 100%;
  height: 100%;
}

.stopLeftGreen {
  stop-color: #1C8050;  /* Indigo */
}
.stopRightLightGreen {
  stop-color: #00FF85;  /* Teal */
}

.stopLeftYellow {
  stop-color: #D6FFA3;
}
.stopRightYellow {
  stop-color: #F8FFA8;
}

.stopLeftOuterCircle {
  stop-color: #FDAA35;
}
.stopRightOuterCircle {
  stop-color: #F85247;
}

.innerCircleStartStop {
  stop-color: #076310;
}
.innerCircleSecondStartStop {
  stop-color: #F9EEC9;
  stop-opacity: 0;
}
.innerCircleEndStop {
  stop-color: #D4FBD8;
  stop-opacity: 0.17;
}
.innerCircleSecondEndStop {
  stop-color: #FFE3E3;
  stop-opacity: 0;
}

.stopButtonInner {
  stop-color: #ECA035;
}
.stopButtonInnerEnd {
  stop-color: #F85247;
}

.stopButtonInnerShadow {
  stop-color: #FD9D38;
}
.stopButtonInnerShadowEnd {
  stop-color: #FBE3FF;
  stop-opacity: 0;
}
</style>
