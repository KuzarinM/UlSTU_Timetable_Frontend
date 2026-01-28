<script>
  import { RouterLink, RouterView } from 'vue-router'
  import $ from "jquery"; 
  import { Collapse } from 'bootstrap';
  import ApiMixines from './mixins/ApiMixines.js';

  export default{
    mixins:[
      ApiMixines
    ],
    data() {
      return {
        bsCollapse: null,
        isUserLoggedIn: false
      };
    },
    methods: {
      toggleNavbar() {
        this.bsCollapse.toggle();
      },
      closeNavbar() {
        if (this.$refs.collapsibleNav && this.$refs.collapsibleNav.classList.contains('show')) {
          this.bsCollapse.hide();
        }
      },
      logout(){
        this.__setAccesToken(null)
        this.__setRefreshToken(null)
        this.$router.push('/login') // Желательно редиректить после выхода
      }
    }, 
    // Watcher больше не критичен для обновления извне, но можно оставить
    watch: {
      isLoggedIn(newVal) {
        this.isUserLoggedIn = newVal
      }
    },
    mounted() {
      this.bsCollapse = new Collapse(this.$refs.collapsibleNav, {
        toggle: false,
      });

      // 1. Инициализация при загрузке
      this.isLoggedIn = !!this.__getAccessToken()
      this.isUserLoggedIn = this.isLoggedIn

      console.log("Logged In:", this.isLoggedIn)

      // 2. ДОБАВЛЕНО: Слушаем событие от LoginPage (или любого другого места)
      window.addEventListener('auth-change', (event) => {
        this.isUserLoggedIn = event.detail.isLoggedIn;
        this.isLoggedIn = event.detail.isLoggedIn; // Обновляем и локальную переменную миксина
      });
    },
    // Желательно удалять слушатель при уничтожении компонента, 
    // хотя App.vue редко уничтожается, это хороший тон.
    unmounted() {
       window.removeEventListener('auth-change');
    }
  }
</script>
<template>
<header class="mx-1">
    <nav class="navbar navbar-expand-sm navbar-light bg-light  p-2 w-100">
      <router-link class="navbar-brand" to="/">
        <img src="/timetable.ico" height="80" class="m-0">
      </router-link>
      <button 
        class="navbar-toggler d-lg-none" 
        type="button" 
        aria-controls="collapsibleNavId" 
        aria-expanded="true" 
        aria-label="Toggle navigation"
        @click="toggleNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="collapsibleNavId" ref="collapsibleNav">
        <ul class="navbar-nav me-auto mt-2 mt-lg-0 w-100" style="justify-content: space-between;">
          <div class="d-flex flex-column flex-md-row">
            <li class="nav-item">
              <router-link to="/search/groups" class="nav-link" @click="closeNavbar">Группы</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/search/teachers" class="nav-link" @click="closeNavbar">Преподаватели</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/search/places" class="nav-link" @click="closeNavbar">Аудитории</router-link>
            </li>
          </div>
          <div v-if="isUserLoggedIn" class="d-flex flex-column flex-md-row">
              <li class="nav-item">
                <router-link to="/admin" class="nav-link">Админка</router-link>
              </li>
              <li class="nav-item">
                <a class="nav-link" @click="logout()" style="cursor: pointer;">Выйти</a>
              </li>
            </div>
            <div v-else>
              <li class="nav-item">
                <router-link to="/login" class="nav-link">Войти</router-link>
              </li>
            </div>
          </ul>
      </div>
    </nav>
  </header>
  <RouterView :key="$route.fullPath" />
</template>
<style scoped>
nav{
  border-style: solid;
  border-radius: 0px 0px 8px 8px;
  border-width: 0px 2px 3px 2px;
}
</style>