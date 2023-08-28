<script>
    import $ from "jquery"; 
    import APIHelper from "../mixins/APIHelper.js";

    export default{
        mixins:[
            APIHelper
        ],
        data(){
            return{
                logInURL:"/users/jwt/login",
                myInformationURL:"/users/who_am_i"
            }
        },
        methods:{
            async LogIn(){
                const userDTO = {
                    login: $("#login").val(),
                    password: $("#password").val()
                }
                const url = `${this._urlPrefix}${this.logInURL}`

                const responce = await fetch(url,{
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(userDTO),
                    })
                const result = await responce.text();

                if(responce.status==200){
                    sessionStorage.setItem("token", result)
                    sessionStorage.setItem("user", userDTO.login);

                    const res = await this.apiRequest("GET", this.myInformationURL);
                    if(res.status == 200){
                        sessionStorage.setItem("role",await res.text())
                    }
                    location = "/"//Да, это костыль. Каких поискать ещё, но, он работает, и это главное
                }
            }
        }
    }
</script>
<template>
    <article class="d-flex flex-column align-items-center">
        <H1 class="mb-3">Вход</H1>
        <form class="d-flex flex-column panel align-items-cente" @submit.prevent="LogIn">
            <div class="form-outline mb-3">
                <label class="form-label">Логин</label>
                <input type="text" class="form-control" id="login"  required="true"  placeholder="логин">
            </div>
            <div class="form-outline mb-3">
                <label class="form-label">Пароль</label>
                <input type="password" class="form-control" id="password" required="true"  placeholder="пароль">
            </div>
            <input class="btn btn-primary" type="submit" value="Войти">
        </form>
    </article>
</template>
<style>
</style>