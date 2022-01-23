<template>
  <Wheel
    id='svg-wheel'
    style='width: 100%;
    height: 100%'
  />
</template>

<script>
import Wheel from 'assets/wheel.svg'
import imageToDataURL from '~/utils/toDataURL'

export default {
  name: 'WheelSvg',
  components: { Wheel },
  mounted() {
    this.initEventsAndConfigSlices()
  },
  methods: {
    initEventsAndConfigSlices() {
      const buttonNode = document.querySelector('.wheel_svg__svgWheelButton')
      const svgDefs = document.querySelector('#svg-wheel defs')
      this.configButton(buttonNode)
      this.configPrizes(svgDefs)
    },
    configButton(button) {
      // Creating svg node text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      this.setAttributesNS(text, {
        x: '50%',
        y: '50%',
        fill: '#fff',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-size': '16px'
      })
      // Adding text and append to svg this node
      const textNode = document.createTextNode('Пуск')
      text.appendChild(textNode)
      button.appendChild(text)

      button.style.cursor = 'pointer'
      button.addEventListener('click', this.rotateCircle)
    },
    async configPrizes(defs) {
      // Extract all patterns that returns use-tags with images
      const patternList = []
      defs.childNodes.forEach(node => node.nodeName === 'pattern' && patternList.push(node))
      // Add new images to existed svg defs
      const dataURL = await imageToDataURL(
        'https://www.gravatar.com/avatar/d50c83cc0c6523b4d3f6085295c953e0',
        'png'
      )

      // @TODO wrap code below to loop (patternList.length)
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      this.setAttributesNS(image, {
        id: 'custom',
        width: '2000',
        height: '2000',
      }, [
        'http://www.w3.org/1999/xlink',
        'href',
        dataURL
      ])
      defs.appendChild(image)
      // @TODO wrap end

      // Change images to new one
      patternList.forEach(pattern => pattern.children[0].setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#custom'))
    },
    setAttributesNS(el, attrs, extended = []) {
      for (const key in attrs) {
        el.setAttributeNS(null, key, attrs[key])
      }
      if (extended.length) el.setAttributeNS(...extended)
    },
    rotateCircle() {
      document.querySelector('.wheel_svg__svgWheelButton')
        .removeEventListener('click', this.rotateCircle)

      const rotation = this.calculateRotationValue(8)
      const animationDuration = '7000'
      const style = document.createElement('style')
      style.innerHTML = `
        .animate {
          animation-name: spinning;
          animation-duration: ${animationDuration[0]}s;
          animation-timing-function: cubic-bezier(.08,-0.16,0,1);
        }
        @keyframes spinning {
          from {
            transform: rotate(0);
          }
          to {
            transform: rotate(${rotation}deg);
          }
        }`
      document.head.appendChild(style)

      const wheel = document.querySelector('.wheel_svg__svgWheelSlices')
      wheel.style.transformOrigin = 'center center'
      wheel.classList.add('animate')

      setTimeout(() => {
        wheel.style.transform = `rotate(${rotation}deg)`
      }, +animationDuration - 100)
    },
    calculateRotationValue(countOfSlices = 8) {
      const additionalRotates = 4
      const slice = 360 / countOfSlices
      const halfSliceMinusDef = (slice / 2) - 1
      const plusOrMinus = Math.random() < 0.5
        ? -(Math.random() * halfSliceMinusDef).toFixed(2)
        : +(Math.random() * halfSliceMinusDef).toFixed(2)

      // slice * id // negative id
      return 360 * additionalRotates + (slice * 3) + plusOrMinus
    }
  }
}
</script>
