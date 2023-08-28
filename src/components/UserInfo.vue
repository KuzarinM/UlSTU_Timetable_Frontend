<script>
import $ from "jquery"; 
import APIHelper from "../mixins/APIHelper.js";

export default{
    mixins: [APIHelper],
    props: {
        isRegistration: Boolean
    },
    data() {
        return {
            registrURL: "/users",
            infoURL: "/users/me",
            MyObject:Object
        };
    },
    methods: {
        async LoadData() {
            const responce = await this.apiRequest("Get", this.infoURL);
            if (responce.status == 200) {
                this.MyObject = await responce.json();
                $("#login").val(this.MyObject.login);
            }
        },
        async Registration() {
            const userDTO = {
                login: $("#login").val(),
                password: $("#password").val()
            };
            const responce = await fetch(`${this._urlPrefix}${this.registrURL}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userDTO)
            });
            if (responce.status == 200) {
                this.$router.push("login");
            }
        },
        async UpdateUserData() {
            const userDTO = {
                login: $("#login").val(),
                password: $("#password").val()
            };
            const responce = await this.apiRequest("PUT", this.infoURL, userDTO);
            if (responce.status == 200) {
                this.$root.$forceUpdate();
            }
        },
        async DeleteUserAccaunt() {
            if (confirm("Вы действительно хотите безвозвратно удалить аккаунт?")) {
                const responce = await this.apiRequest("DELETE", this.infoURL);
                if (responce.status == 200) {
                    this.logout();
                    location = "/login";
                }
            }
        }
    },
    async mounted() {
        if (!this.isRegistration) {
            await this.LoadData();
        }
    },
}
</script>
<template>
    <article class="d-flex flex-column align-items-center">
        <h1 class="mb-3">{{ isRegistration ? "Регистрация" :"Мой профиль" }}</h1>
        <form class="d-flex flex-column panel align-items-cente" @submit.prevent="isRegistration ? this.Registration() : this.UpdateUserData() ">
            <div class="form-outline mb-3">
                <label class="form-label">Логин</label>
                <input type="text" class="form-control" id="login"  required="true"  placeholder="логин">
            </div>
            <div class="form-outline mb-3">
                <label class="form-label">Пароль</label>
                <input type="password" class="form-control" id="password" required="true"  placeholder="пароль">
            </div>
            <div class="d-flex ">
                <input class="btn btn-success me-2" type="submit" :value="isRegistration ? 'Зарегистрироваться':'Сохранить'">
                <input v-if="!isRegistration" class="btn btn-danger me-2" type="button" value="Удалить" @click="this.DeleteUserAccaunt()">
            </div>
        </form>
    </article>
</template>
<style scoped>
</style>