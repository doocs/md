import Vue from 'vue'
import VueRouter from 'vue-router'
import index from '@/views'

Vue.use(VueRouter)

const routes = [
  {
    path: `/`,
    name: `index`,
    component: index,
  },
]

const router = new VueRouter({
  mode: `history`,
  base: process.env.BASE_URL,
  routes,
})

export default router
