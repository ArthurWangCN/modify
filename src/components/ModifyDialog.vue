<template>
  <el-dialog title="外层 Dialog" :visible.sync="modifyVisible">
    <el-dialog
      width="30%"
      title="内层 Dialog"
      :visible.sync="innerVisible"
      append-to-body>
    </el-dialog>
    <div slot="footer" class="dialog-footer">
      <el-button @click="modifyVisible = false">取 消</el-button>
      <el-button type="primary" @click="innerVisible = true">打开内层 Dialog</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'modifyDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      innerVisible: false
    }
  },
  computed: {
    modifyVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('updateVisible', val);
      }
    }
  },
  methods: {
    
  }
}
</script>
