<script>
import AdminApiMixine from '../mixins/AdminApiMixine';

export default{
    data(){
        return{
            login:"",
            password:"",
            isEmailValid:true,
            isPassowrdValid:true
        }
    },
    mixins:[
        AdminApiMixine
    ],
    methods:{
        async LogIn(){
            var res = await this.LogInAsUser(this.login, this.password)
            // Логика получения user зависит от ответа. Swagger просто говорит "Success". 
            // Предполагаем, что токены уже установлены или возвращены в body.
            // Старый код пытался извлечь body[0]
            
            if(res.code == 200){
                // Если API возвращает JSON с токеном, ApiMixines должен это обработать или мы делаем это тут
                if(res.body && res.body.accessToken){
                    this.__setAccesToken(res.body.accessToken)
                    // this.__setRefreshToken(...) // Если сервер возвращает его
                } else if (res.body && typeof res.body === 'string' && res.body.length > 10) {
                     // Если возвращается просто строка токена
                     this.__setAccesToken(res.body)
                }

                console.log("Success");
                this.$router.go(-1)
            }
            else if(res.code == 400)
            {
                console.log(res.text)
                if(this.$refs.login) this.$refs.login.innerText = res.text
                this.isEmailValid = false;
                this.isPassowrdValid = true;
            }
            return false
        },
        clearData(){
            this.__setAccesToken(null)
            this.__setRefreshToken(null)
            this.__setUserName(null)
        }
    },
    async mounted(){
        this.clearData();
    }
}
</script>
<template>
    <h1 class="text-center">Вход</h1>
    <form 
        class="d-flext flex-column border border-dark rounded-3 p-3 align-self-center w-md-50"
        @submit.prevent="this.LogIn()"
        style="width: fit-content; margin-left: auto;margin-right: auto;"
    >
        <div class="d-flext flex-column mb-3">
            <label for="" class="form-label fs-4">Логин</label>
            <input 
                type="text" 
                required
                class="form-control" 
                aria-describedby="helpId"
                ref="loginInput"
                v-model="this.login"
            />
            <small id="helpId" ref="login" :hidden="this.isEmailValid" class="form-text text-danger">Help text</small>
        </div>
        <div class="d-flext flex-column mb-3">
            <label for="" class="form-label fs-4">Пароль</label>
            <input 
                type="password" 
                required
                class="form-control" 
                minlength="2"
                aria-describedby="helpId"                
                v-model="this.password"
            />
            <small id="helpId" ref="password" :hidden="this.isPassowrdValid" class="form-text text-danger">Help text</small>
        </div>
        <div class="d-flext flex-column mb-3">
            <button 
                type="submit" 
                class="btn btn-success w-100"
            >
                Войти
            </button>
        </div>
     </form>
</template>