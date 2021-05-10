import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Modify',
    component: () => import(/* webpackChunkName: "about" */ '../components/Modify.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
