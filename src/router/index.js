import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import UserInfo from '../components/UserInfo.vue'
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
      component: Login,
      meta:{
        authorized:false,
        adminOnly:false
      }
    },
    {
      path: '/registration',
      name: 'registration',
      component: UserInfo,
      meta:{
        authorized:false,
        adminOnly:false
      },
      props:{
        isRegistration:true
      }
    },
    {
      path: '/user',
      name: 'user',
      component: UserInfo,
      meta:{
        authorized:true,
        adminOnly:false
      },
      props:{
        isRegistration:false
      }
    },
  ]
})
router.beforeEach(Check)

function Check(to, from, next)
{
  if(to.meta.authorized && sessionStorage.getItem("token")===null){
      next({
        path: '/login'
      })
  }
  if(to.meta.adminOnly && sessionStorage.getItem("role")!=="ADMIN"){
    next({
      path: from.path
    })
  }
  next()
}

export default router
