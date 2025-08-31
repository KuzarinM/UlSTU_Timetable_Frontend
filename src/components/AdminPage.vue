<script>
import AdminApiMixine from '../mixins/AdminApiMixine'

export default{
    data(){
        return {
            parseRequest:{
                login: "",
                password: "",
                forceUpdate: false,
                ignoreDownload: false
            }
        }
    },
    mixins:[
        AdminApiMixine
    ],
    methods:{
        async IniciateParsing(){
            if(!confirm(`Вы уверены что вы хотите начать парсинг/выгрузку?`))
                return

            var res = await this.StartParsing(
                this.parseRequest.login, 
                this.parseRequest.password, 
                this.parseRequest.ignoreDownload, 
                this.parseRequest.forceUpdate
            )

            if(res.code == 200){
                alert(res.body.logs.join("\n"))
            }
        },
    }
}
</script>

<template>

    <div
        class="d-flex flex-column"
    >
        <div class="d-flex w-100">
            <hr class="hr me-2" style="width: 5%;"/>
            <span class="text-nowrap">Начать выгрузку </span>
            <hr class="hr w-100 ms-2" />
        </div>

        <form 
            ref="form"
            class="mb-3 d-flex flex-column flex-md-row text-center" 
            style="width: fit-content; align-self: center;"
        >
            <div class="m-3">
                <label for="" class="form-label">Логин от lms</label>
                <input
                    type="text"
                    class="form-control"
                    name=""
                    id=""
                    placeholder=""
                    v-model="this.parseRequest.login"
                />
            </div>
            <div class="m-3">
                <label for="" class="form-label">Пароль от lms</label>
                <input
                    type="password"
                    class="form-control"
                    name=""
                    id=""
                    placeholder=""
                    v-model="this.parseRequest.password"
                />
            </div>

            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    value=""
                    id=""
                    checked
                    v-model="this.parseRequest.forceUpdate"
                />
                <label class="form-check-label" for=""> Нужно ли устроить силовое обновление </label>
            </div>

            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    value=""
                    id=""
                    checked
                    v-model="this.parseRequest.ignoreDownload"
                />
                <label class="form-check-label" for=""> Нужно ли игнорировать загрузку </label>
            </div>
            

            <button
                type="button"
                class="btn btn-primary my-auto"
                @click="this.IniciateParsing"
            >
                Загрузить
            </button>
            
            
        </form>

    </div>
</template>

<style scoped>
</style>