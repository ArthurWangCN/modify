import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './utils/draggable'
import './assets/style/style.css'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
