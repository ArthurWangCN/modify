<template>
  <div id="app">
    <!-- <el-button type="primary" @click="modifyVisible=true;">show dialog</el-button>
    <modify-dialog :visible="modifyVisible" @updateVisible="updateVisible"></modify-dialog> -->
    <router-view></router-view>
  </div>
</template>

<script>
import ModifyDialog from './components/ModifyDialog.vue'

export default {
  name: 'app',
  components: {
    ModifyDialog
  },
  data () {
    return {
      modifyVisible: false
    }
  },
  methods: {
    updateVisible(val) {
      this.modifyVisible = val;
    }
  }
}
</script>

<style>
</style>
