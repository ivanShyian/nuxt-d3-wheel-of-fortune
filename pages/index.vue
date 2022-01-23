<template>
  <div class='index' style='height: 100vh'>
    <div class='container'>
      <WheelD3 />
<!--      <WheelSvg />-->
    </div>
  </div>
</template>

<script>
import WheelD3 from '../components/WheelD3'
export default {
  name: 'IndexPage',
  components: { WheelD3 },
}
</script>
<style lang='less'>
.index {
  background-color: #2e0d56;
}
.container {
  margin: 0 auto;
  max-width: 1140px;
  height: 100%;
}
</style>
