<template>
  <div class="modify-wrapper">
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
        <div class="modify-c" id="wrapper">
          <!-- <el-scrollbar style="height:100%;" ref="scroll"> -->
            <div class="img-wrapper">
              <div id="rect" @click="getCoordinate($event)">
                <div
                  v-for="(item, index) in imgRects"
                  :key="index"
                  class="rect"
                  :class="{'hightlight-red': item.isHightLight}"
                  :style="{'width': item.width, 'height': item.height, 'left': item.left, 'top': item.top}"
                  @mouseover="highlightImgRect(item,$event)"
                  @mouseout="clearHightlight(item)"
                ></div>
              </div>
              <img width="800px" src="../assets/images/1.png" alt="">
            </div>
          <!-- </el-scrollbar> -->
        </div>

        <div class="modify-r">
          <!-- <el-scrollbar style="height:100%;" ref="textScroll"> -->
            <div class="img-wrapper">
              <div class="redRect-wrapper" v-show="showRedRect">
                <div id="red-rect"></div>
              </div>
              <canvas id="canvas"  width="800" height="1000"></canvas>
            </div>
          <!-- </el-scrollbar> -->
        </div>
      </el-scrollbar>
    </div>

    <el-dialog
      width="30%"
      title="编改"
      v-dialogDrag
      :visible.sync="dialogVisible"
      :modal="false"
      :close-on-click-modal="false"
      :append-to-body="true"
      :before-close="cancelModify"
    >
      <el-input type="textarea" :rows="4" resize="none" v-model="curLineTxt"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelModify">取 消</el-button>
        <el-button type="primary" @click="confirmModify">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {layoutJson, ocrResult} from '../utils/layoutJson'
export default {
  name: 'modify',
  data () {
    return {
      dialogVisible: false,
      thumbnailList: [{
        id: '1',
        imgUrl: require('../assets/images/1.png')
      }, {
        id: '2',
        imgUrl: require('../assets/images/1.png')
      }],
      curThumbnail: '',
      scale: 0,
      curLineTxt: '',
      curLineId: '',
      curLineIndex: 0,
      modifyList: [],
      curSelectedObj: '',
      showRedRect: false,
      curTarget: '',
      // prevTarget: '',
      imgRects: '',
      hoverTimer: '',
    }
  },
  mounted () {
    // this.renderImgRect();
    
    // this.drawRect();
    let naturalW = Number(ocrResult.ImageWidth);
    var currentW = document.getElementById('wrapper').clientWidth;
    var ratio = currentW / naturalW;
    this.scale = ratio;
    this.imgRects = layoutJson.data;
    this.imgRects.forEach(item => {
      item.width = (Math.ceil(parseInt(item.width)*ratio) + 4) + 'px';
      item.height = (Math.ceil(parseInt(item.height)*ratio) + 4) + 'px';
      item.left = (Math.floor(parseInt(item.left)*ratio) - 2) + 'px';
      item.top = (Math.floor(parseInt(item.top)*ratio) - 2) + 'px';
      this.$set(item, 'isHightLight', false);
    })
    console.log(this.imgRects)
    this.draw();
  },
  methods: {
    // 当前缩略图
    getCurThumbnail(item) {
      this.curThumbnail = item;
    },

    // 绘制中间图片方框
    renderImgRect() {
      const layout = layoutJson.data;
      let naturalW = Number(ocrResult.ImageWidth);
      var currentW = document.getElementById('wrapper').clientWidth;
      var ratio = currentW / naturalW;
      this.scale = ratio;
      // console.log(ratio);
      let rectFragment = '';
      let rectWrapper = document.getElementById('rect')
      for (let i=0; i < layout.length; i++) {
        // let rect = document.createElement('div');
        rectFragment = this.drawRect(layout[i], ratio);
        rectWrapper.appendChild(rectFragment);
      }
      // console.log(rectFragment)
    },

    // 中间图片方框
    drawRect(rectObj, ratio) {
      let rect = document.createElement('div');
      rect.style.width = Math.ceil(parseInt(rectObj.width)*ratio) + 'px';
      rect.style.height = Math.ceil(parseInt(rectObj.height)*ratio) + 'px';
      rect.style.left = (Math.floor(parseInt(rectObj.left)*ratio) - 1) + 'px';
      rect.style.top = (Math.floor(parseInt(rectObj.top)*ratio) - 1) + 'px';
      rect.style.position = 'absolute';
      rect.style.border = '2px solid #32dc32';
      rect.className = 'rect';
      rect.style.cursor = 'pointer';
      // console.log(rect)
      return rect;
    },

    // 获取图片点击事件对象
    getCoordinate(e) {
      console.log(e);
      // e.target.style.borderColor = 'red';
      this.curTarget = e.target;
      // console.log(this.$refs['scroll'].wrap.scrollTop);
      // let scrollDistance = this.$refs['scroll'].wrap.scrollTop;
      var offsetX = e.pageX;
      var offsetY = e.pageY;
      this.pointInRect(offsetX, offsetY)
    },

    // 点击方框的文字信息
    pointInRect(offsetX, offsetY, isHover=false) {
      let scrollDistance = this.$refs['scroll'].wrap.scrollTop;
      const x = offsetX - 200;
      const y = offsetY + scrollDistance;
      for(var i=0; i<ocrResult.Cnki.length; i++) {
        var l = Math.ceil((ocrResult.Cnki[i].position.split(',')[0])*this.scale);
        var t = Math.ceil((ocrResult.Cnki[i].position.split(',')[1])*this.scale);
        var w = Math.ceil((ocrResult.Cnki[i].position.split(',')[2])*this.scale);
        var h = Math.ceil((ocrResult.Cnki[i].position.split(',')[3])*this.scale);
        // debugger
        if (
          x > l && x < l+w &&
          y > t && y < t+h
        ) {
          // console.log(x, y);
          // console.log(ocrResult.Cnki[i].content);
          // console.log(ocrResult.Cnki[i].id);
          this.curSelectedObj = ocrResult.Cnki[i];

          this.curTarget.style.borderColor = 'red';
          
          // 右侧红框
          let rect = document.getElementById('red-rect');
          rect.style.width = Math.ceil((ocrResult.Cnki[i].position.split(',')[2])*this.scale) + 'px';
          rect.style.height = Math.ceil((ocrResult.Cnki[i].position.split(',')[3])*this.scale) + 'px';
          rect.style.left = Math.floor((ocrResult.Cnki[i].position.split(',')[0])*this.scale) + 'px';
          rect.style.top = Math.floor((ocrResult.Cnki[i].position.split(',')[1])*this.scale) + 'px';
          rect.style.position = 'absolute';
          this.showRedRect = true;

          // this.$refs['textScroll'].wrap.scrollTop = Math.floor((ocrResult.Cnki[i].position.split(',')[1])*this.scale) - offsetY;

          if (!isHover) {
            this.curLineTxt = ocrResult.Cnki[i].content;
            this.curLineId = ocrResult.Cnki[i].id;
            this.curLineIndex = i;
            this.dialogVisible = true;
          }
          return;
        }
      }
    },

    // 绘制右侧文字
    draw(){
      var canvas = document.getElementById('canvas');
      var ctx;
      canvas.width = 800;
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
        // 画框
        // ctx.strokeRect(
        //   Math.ceil((ocrResult.Cnki[i].position.split(',')[0]) * this.scale),
        //   Math.ceil((ocrResult.Cnki[i].position.split(',')[1]) * this.scale),
        //   Math.ceil((ocrResult.Cnki[i].position.split(',')[2]) * this.scale),
        //   Math.ceil((ocrResult.Cnki[i].position.split(',')[3]) * this.scale)
        // );
      }
      this.modifyList.forEach(item => {
        ctx.strokeStyle="blue";
        ctx.strokeRect(
          Math.ceil((item.position.split(',')[0]) * this.scale),
          Math.ceil((item.position.split(',')[1]) * this.scale),
          Math.ceil((item.position.split(',')[2]) * this.scale),
          Math.ceil((item.position.split(',')[3]) * this.scale)
        );
      })
    },

    // 编改弹窗
    confirmModify() {
      ocrResult.Cnki[this.curLineIndex].content = this.curLineTxt;

      const hasModified = this.modifyList.some(item => {
        return item.id === ocrResult.Cnki[this.curLineIndex].id;
      })
      if (!hasModified) {
        this.modifyList.push(ocrResult.Cnki[this.curLineIndex]);
      }

      this.draw();
      this.resetStatus();
    },
    cancelModify() {
      this.resetStatus();
    },
    resetStatus () {
      this.dialogVisible = false;
      this.curLineTxt = '';
      this.showRedRect = false;
      this.curTarget.style.borderColor = "#32dc32";
    },
    selectLine(e) {
      if (this.curTarget) this.curTarget.style.borderColor = "#32dc32";
      this.curTarget = e.target;
      // this.prevTarget = e.target;
      var offsetX = e.pageX;
      var offsetY = e.pageY;
      console.log(offsetX, offsetY)
      this.pointInRect(offsetX, offsetY, true)
    },
    highlightImgRect(item,e) {
      this.hoverTimer = setTimeout(() => {
        console.log(e)
        item.isHightLight = true;
        let rect = document.getElementById('red-rect');
        rect.style.width = item.width;
        rect.style.height = item.height;
        rect.style.left = item.left;
        rect.style.top = item.top;
        rect.style.position = 'absolute';
        // this.$refs['textScroll'].wrap.scrollTop = parseInt(item.top) - e.pageY;
        // console.log(item.top)
        this.showRedRect = true;
      }, 1000);
    },
    clearHightlight(item) {
      clearTimeout(this.hoverTimer)
      item.isHightLight=false;
      if (!this.dialogVisible) this.showRedRect = false;
    }
  }
}
</script>

<style scoped>
#rect, .redRect-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  box-sizing: border-box;
  /* z-index: 9; */
}
.rect, #red-rect {
  position: absolute;
  box-sizing: border-box;
  border: 2px solid red;
  cursor: pointer;
  z-index: 9;
}
.rect {
  border-color: #32dc32;
}
.hightlight-red {
  border-color: red !important;
}
.modify-wrapper {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  position: relative;
  min-width: 1366px;
  /* overflow: hidden; */
}
.modify-l {
  width: 200px;
  height: 100%;
  background-color: hsla(0,0%,0%,.1);
  box-sizing: border-box;
  padding: 10px 0;
  float: left;
}
.modify-wrapper >>> .el-scrollbar__wrap {overflow-x: hidden;}
.thumbnail-list {
  width: 114px;
  margin: 0 auto;
}
.thumbnail-item {
  margin-bottom: 5px;
  padding: 7px;
  transition: all ease .3s;
}
.thumbnail-item.active,
.thumbnail-item:hover {
  background-color: hsla(0,0%,100%,.3);
  box-shadow: 0 1px 0 hsla(0,0%,100%,.05) inset, 0 0 1px hsla(0,0%,100%,.1) inset, 0 0 1px hsla(0,0%,0%,.2);
}
.thumbnail-image {
  width: 100px;
  height: 133px;
  box-sizing: border-box;
  display: block;
  cursor: pointer;
  border: 1px solid hsla(0,0%,0%,.5);
}

.modify-c, .modify-r {
  float: left;
  /* position: relative; */
  width: 800px;
  height: 100%;
}
.img-wrapper {
  position: relative;
}
</style>
