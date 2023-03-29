import { createRouter, createWebHistory } from 'vue-router'
import TimetableTable from "../components/TimetableTable.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:"/",
      name:"Timetable",
      component: TimetableTable
    }
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView
    // },
    // {
    //   path: '/about',
    //   name: 'about',

    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})
export default router
