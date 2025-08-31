import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import AdminPage from '../components/AdminPage.vue'
import Timetable from '../components/Timetable.vue'
import Groups from '../components/Groups.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:"/",
      redirect:"/search/groups"
    },
    {
      path: '/search/:area',
      name: 'search',
      component: Groups,
      meta:{
        authorized:false,
        adminOnly:false
      }
    },
    {
      path: '/timetable/:group',
      name: 'timetable',
      component: Timetable,
      meta:{
        authorized:false,
        adminOnly:false
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta:{
        authorized:false,
        adminOnly:false
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage,
      meta:{
        authorized:true,
      },
    },
  ]
})
router.beforeEach(Check)

function Check(to, from, next)
{
  if(to.meta.authorized && localStorage.getItem("accessToken")===null){
      next({
        path: '/login'
      })
  }
  next()
}

export default router
