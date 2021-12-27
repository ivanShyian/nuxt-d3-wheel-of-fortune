<template>
  <Wheel style='width: 100%; height: 100%' />
</template>

<script>
import Wheel from 'assets/wheel.svg'

export default {
  name: 'WheelSvg',
  components: { Wheel },
  mounted() {
    this.initEventsAndConfigSlices()
  },
  methods: {
    initEventsAndConfigSlices() {
      const buttonNode = document.querySelector('.wheel_svg__svgWheelButton')
      this.configButton(buttonNode)
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
    setAttributesNS(el, attrs) {
      for (const key in attrs) {
        el.setAttributeNS(null, key, attrs[key])
      }
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
