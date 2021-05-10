<template>
  <div class="modify-wrapper">
    <div class="modify-header">
      <h2>编改</h2>
      <div class="modify-btns">
        <el-button>保存</el-button>
        <el-button type="primary">完成编改</el-button>
      </div>
    </div>

    <div class="modify-content">
      <!-- 左侧 缩略图 -->
      <nav class="modify-l">
        <el-scrollbar style="height:100%;">
          <ul class="thumbnail-list">
            <li
              class="thumbnail-item"
              :class="{'active': item.id===curThumbnail.id}"
              v-for="item in thumbnailList"
              :key="item.id"
              @click="getCurThumbnail(item)"
            >
              <img class="thumbnail-image" :src="item.imgUrl" alt="">
            </li>
          </ul>
        </el-scrollbar>
      </nav>

      <div style="height: 100%;">
        <el-scrollbar style="height:100%;" ref="scroll">
          <!-- 图片区域 -->
          <div class="modify-c" id="wrapper">
            <div class="img-wrapper">
              <div id="rect" @click="handleRectClick($event)">
                <div
                  v-for="(item, index) in imgRectList"
                  :key="index"
                  class="rect"
                  :class="{'hightlight-red': item.isHighlight}"
                  :style="{'width': item.width, 'height': item.height, 'left': item.left, 'top': item.top}"
                  @mouseover="highlightImgRect(item,$event)"
                  @mouseout="clearHightlight(item)"
                ></div>
              </div>
              <img :width="divWidth" src="../assets/images/1.png" alt="">
            </div>
          </div>

          <!-- 文字区域 -->
          <div class="modify-r">
            <div class="img-wrapper">
              <div class="redRect-wrapper" v-show="showRedRect">
                <div id="red-rect"></div>
              </div>
              <canvas id="canvas"  :width="divWidth" height="1000"></canvas>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <el-dialog
      width="640px"
      title="编改"
      v-dialogDrag
      custom-class="modify-dialog"
      :visible.sync="dialogVisible"
      :modal="false"
      :close-on-click-modal="false"
      :append-to-body="true"
      :before-close="cancelModify"
    >
      <el-input type="textarea" ref="inputText" :rows="6" resize="none" v-model="curLineTxt"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmModify">确 定</el-button>
        <el-button @click="cancelModify">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// layoutJson: 图片方框的坐标信息
// ocrResult: 识别出的内容信息
import {layoutJson, ocrResult} from '../utils/layoutJson';

const NAV_WIDTH = 200;
const HEADER_HEIGHT = 60;

export default {
  name: 'modify',
  data () {
    return {
      divWidth: 800,
      dialogVisible: false, // 编改弹窗显隐
      thumbnailList: [{
        id: '1',
        imgUrl: require('../assets/images/1.png')
      }, {
        id: '2',
        imgUrl: require('../assets/images/1.png')
      }],
      curThumbnail: '', // 当前缩略图
      imgRectList: '',  // 图片方框列表数据
      scale: 0, // 缩放比例
      curLineTxt: '', // 点击方框文字
      curLineIndex: 0,  // 点击方框的index
      modifyList: [], // 已编改列表
      showRedRect: false, // 文字区域红框显隐
      curTarget: '',  // 当前点击对象
      hoverTimer: '',   // 悬浮方框定时器
    }
  },
  mounted () {
    this.drawimgRectList();
    this.renderText();
  },
  methods: {
    // 当前缩略图
    getCurThumbnail(item) {
      this.curThumbnail = item;
    },

    // 绘制中间图片方框
    drawimgRectList() {
      // 计算缩放比例
      let naturalW = parseInt(ocrResult.ImageWidth);
      var currentW = document.getElementById('wrapper').clientWidth;
      this.scale = currentW / naturalW;

      this.imgRectList = layoutJson.data;
      this.imgRectList.forEach(item => {
        item.width = (Math.ceil(parseInt(item.width)*this.scale) + 6) + 'px';
        item.height = (Math.ceil(parseInt(item.height)*this.scale) + 4) + 'px';
        item.left = (Math.floor(parseInt(item.left)*this.scale) - 2) + 'px';
        item.top = (Math.floor(parseInt(item.top)*this.scale) - 2) + 'px';
        this.$set(item, 'isHighlight', false);
      })
    },

    // 获取图片方框点击事件对象
    handleRectClick(e) {
      console.log(e);
      this.curTarget = e.target;
      var pageX = e.pageX;
      var pageY = e.pageY;
      this.getRectText(pageX, pageY)
    },

    // 获取点击方框的文字
    getRectText(pageX, pageY) {
      let scrollDistance = this.$refs['scroll'].wrap.scrollTop;
      const x = pageX - NAV_WIDTH;
      const y = pageY + scrollDistance - HEADER_HEIGHT;
      for(let i=0; i<ocrResult.Cnki.length; i++) {
        const l = Math.ceil((ocrResult.Cnki[i].position.split(',')[0])*this.scale) - 2;
        const t = Math.ceil((ocrResult.Cnki[i].position.split(',')[1])*this.scale) - 2;
        const w = Math.ceil((ocrResult.Cnki[i].position.split(',')[2])*this.scale) + 6;
        const h = Math.ceil((ocrResult.Cnki[i].position.split(',')[3])*this.scale) + 4;
        // debugger

        if (
          x > l && x < l+w &&
          y > t && y < t+h
        ) {
          this.curTarget.style.borderColor = '#dc3023';

          // 显示右侧高亮红框
          let rect = document.getElementById('red-rect');
          rect.style.width = (Math.ceil((ocrResult.Cnki[i].position.split(',')[2])*this.scale) + 6) + 'px';
          rect.style.height = (Math.ceil((ocrResult.Cnki[i].position.split(',')[3])*this.scale) + 4) + 'px';
          rect.style.left = (Math.floor((ocrResult.Cnki[i].position.split(',')[0])*this.scale) -2) + 'px';
          rect.style.top = (Math.floor((ocrResult.Cnki[i].position.split(',')[1])*this.scale) -2) + 'px';
          rect.style.position = 'absolute';
          this.showRedRect = true;

          this.curLineTxt = ocrResult.Cnki[i].content;
          this.curLineIndex = i;
          this.dialogVisible = true;
          this.$nextTick(() => {
            this.$refs['inputText'].focus();
          })
          return;
        }
      }
    },

    // 绘制右侧文字
    renderText(){
      var canvas = document.getElementById('canvas');
      var ctx;
      canvas.width = this.divWidth;
      canvas.height = Math.ceil(ocrResult.ImageHight * this.scale);
      if (!canvas.getContext) return;
      ctx = canvas.getContext("2d");
      for(var i=0; i<ocrResult.Cnki.length; i++) {
        ctx.font = Math.ceil((ocrResult.Cnki[i].position.split(',')[3]) * this.scale) + "px 宋体";
        // 绘制文字
        ctx.fillText(
          ocrResult.Cnki[i].content,
          Math.ceil((ocrResult.Cnki[i].position.split(',')[0]) * this.scale),
          Math.ceil((ocrResult.Cnki[i].position.split(',')[1]) * this.scale) + Math.ceil((ocrResult.Cnki[i].position.split(',')[3] - 10) * this.scale),
          Math.ceil((ocrResult.Cnki[i].position.split(',')[2]) * this.scale)
        );
      }
      // 已修改的行显示蓝框
      this.modifyList.forEach(item => {
        ctx.strokeStyle = "#41a0e9";
        ctx.strokeRect(
          Math.floor((item.position.split(',')[0]) * this.scale) - 2,
          Math.floor((item.position.split(',')[1]) * this.scale) - 2,
          Math.ceil((item.position.split(',')[2]) * this.scale) + 4,
          Math.ceil((item.position.split(',')[3]) * this.scale) + 4
        );
      })
    },

    // 悬浮高亮
    highlightImgRect(item,e) {
      this.hoverTimer = setTimeout(() => {
        item.isHighlight = true;
        let rect = document.getElementById('red-rect');
        rect.style.width = item.width;
        rect.style.height = item.height;
        rect.style.left = item.left;
        rect.style.top = item.top;
        rect.style.position = 'absolute';
        this.showRedRect = true;
      }, 1000);
    },
    clearHightlight(item) {
      clearTimeout(this.hoverTimer)
      item.isHighlight=false;
      if (!this.dialogVisible) this.showRedRect = false;
    },

    // 编改弹窗
    confirmModify() {
      ocrResult.Cnki[this.curLineIndex].content = this.curLineTxt;

      // 当前行是否修改过
      const hasModified = this.modifyList.some(item => {
        return item.id === ocrResult.Cnki[this.curLineIndex].id;
      })
      if (!hasModified) {
        this.modifyList.push(ocrResult.Cnki[this.curLineIndex]);
      }

      this.renderText();
      this.resetStatus();
    },
    cancelModify() {
      this.resetStatus();
    },
    // 编改后重置状态
    resetStatus () {
      this.dialogVisible = false;
      this.curLineTxt = '';
      this.showRedRect = false;
      this.curTarget.style.borderColor = "#28ca46 ";
    },
  }
}
</script>

<style>
#rect, .redRect-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  box-sizing: border-box;
}
.rect, #red-rect {
  position: absolute;
  box-sizing: border-box;
  border: 2px solid #dc3023;
  cursor: pointer;
  z-index: 9;
}
.rect {
  border-color: #28ca46 ;
}
.hightlight-red {
  border-color: #dc3023 !important;
  z-index: 9;
}
.modify-wrapper {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  position: relative;
  min-width: 1400px;
}

.modify-header {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, .2);
  z-index: 99;
}
.modify-header h2 {
  font-size: 16px;
  font-weight: normal;
  color: #606266;
}
.modify-wrapper .el-button {
  border-color: #41a0e9;
  color: #41a0e9;
}
.modify-wrapper .el-button--primary,
.modify-wrapper .el-button:hover {
  background-color: #41a0e9;
  color: #ffffff;
}
.modify-wrapper .el-button--primary:hover {
  background-color: #3f96d8;
}

.modify-content {
  height: calc(100vh - 60px);
  padding-top: 60px;
}
.modify-l {
  width: 200px;
  height: 100%;
  border-right: 1px solid #ebeef5;
  box-sizing: border-box;
  float: left;
}
.modify-wrapper .el-scrollbar__wrap {overflow-x: hidden;}
.thumbnail-list {
  margin: 0 auto;
}
.thumbnail-item {
  margin: 20px 0;
}
.thumbnail-item.active .thumbnail-image,
.thumbnail-item:hover .thumbnail-image {
  /* border: none; */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, .2);
}
.thumbnail-image {
  width: 160px;
  height: 220px;
  box-sizing: border-box;
  display: block;
  cursor: pointer;
  border: 2px solid #ebeef5;
  margin: 0 auto;
  transition: all .3s ease;
}

.modify-c, .modify-r {
  float: left;
  width: 800px;
  height: 100%;
  border-left: 2px solid #f8f9fb;
  border-right: 2px solid #f8f9fb;
}
.modify-r{
  margin-left: 52px;
}

.img-wrapper {
  position: relative;
}

/* 编改弹窗 */
.dialog-fade-enter-active .modify-dialog,
.dialog-fade-leave-active .modify-dialog {
  animation-fill-mode: forwards;
}
.dialog-fade-enter-active .modify-dialog {
  animation-duration: 0.3s;
  animation-name: modify-dialog-open;
  animation-timing-function: cubic-bezier(0.6, 0, 0.4, 1);
}
.dialog-fade-leave-active .modify-dialog {
  animation-duration: 0.3s;
  animation-name: modify-dialog-close;
}
@keyframes modify-dialog-open {
  0% {
    opacity: 0;
    transform: scale3d(0, 0, 1);
  }
  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}
@keyframes modify-dialog-close {
  0% { opacity: 1; }
  100% {
    opacity: 0;
    transform: scale3d(0.5, 0.5, 1);
  }
}
.modify-dialog {
  border-radius: 10px;
}
.modify-dialog .el-dialog__header {
  height: 60px;
  box-sizing: border-box;
  border-bottom: 1px solid #e4e4e4;
}
.modify-dialog .el-dialog__body {
  padding: 20px;
}
.modify-dialog .el-dialog__footer{
  padding-top: 4px;
  text-align: center;
}
.modify-dialog .el-button {
  width: 106px;
  height: 38px;
}
.modify-dialog .el-button--primary {
  background-color: #41a0e9;
}
.modify-dialog .el-button--primary:hover {
  background-color: #3f96d8;
}
.modify-dialog .el-button+.el-button {
  margin-left: 44px;
}
</style>
