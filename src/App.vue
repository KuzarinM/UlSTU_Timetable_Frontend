<script>
  import { RouterLink, RouterView } from 'vue-router'
  import $ from "jquery"; 
  import APIHelper from "./mixins/APIHelper.js";

  export default{
    mixins:[APIHelper]
  }

</script>

<template>
  <header class="mx-1">
      <div class="">
        <nav class="navbar navbar-expand-sm navbar-light bg-light container m-2">
          <a class="navbar-brand" href="#">Самое быстрое расписание</a>

          <button class="navbar-toggler d-lg-none" type="button" data-bs-toggle="collapse"
           data-bs-target="#collapsibleNavId" aria-controls="collapsibleNavId" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="collapsibleNavId">
            <ul class="navbar-nav me-auto mt-2 mt-lg-0">
              <!-- <div v-if="this.isAuthtorised()">
                <li class="nav-item">
                  <a class="nav-link active" href="/user">Учётная запись</a>
                </li>
                <li class="nav-item">
                  <form class="d-flex my-2 my-lg-0">
                    <input class="form-control me-sm-2" name="search" type="text" >
                    <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Поиск</button>
                  </form>
                </li>
                <li class="nav-item">
                  <a class="nav-link active" @click="logout()">Выйти</a>
                </li>
              </div>
              <div v-else>
                <li class="nav-item">
                  <a class="nav-link active" href="/login">Войти</a>
                </li>
              </div> -->
              <li class="nav-item">
                  <form class="d-flex my-2 my-lg-0" action="/groups">
                    <input class="form-control me-sm-2" name="search" type="text" >
                    <button class="btn btn-outline-success my-2 " type="submit">Поиск</button>
                  </form>
                </li>
            </ul>
          </div>
      </nav>
      </div>
  </header>
  <RouterView />
</template>

<style scoped>
</style>
