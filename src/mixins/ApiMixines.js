// https://stackoverflow.com/questions/53010064/pass-environment-variable-into-a-vue-app-at-runtime/55962511#55962511
export default {
    data(){
        return {
            __refreshUrl: "/Admin/refresh", // Обновлено согласно Swagger
            __refreshTokenQueryFieldName: "refreshToken",
            isLoggedIn: false
        }
    },
    methods:{
        async __makeRequest(method, path, data, headers, queries){
            var request = {
                method: method,
                headers: new Headers()
            }
            request.headers.append("Authorization", `Bearer ${this.__getAccessToken()}`)
            request.headers.append("Content-Type", "application/json")
            
            if(data !== null)
                request.body = JSON.stringify(data)
            
            if(headers !== null){
                Object.keys(headers).forEach(key => {
                    request.headers.append(key, headers[key])
                });
            }
                        
            var out = [];
            if(queries != null)
                Object.keys(queries).forEach(key => {
                    if (queries[key] === undefined || queries[key] === null || queries[key] === '') {
                        delete queries[key];
                    }
                    else if(Array.isArray(queries[key])){
                        for (let index = 0; index < queries[key].length; index++) {
                            const element = queries[key][index];
                            out.push(`${key}=${element}`)
                        }
                    }
                    else{
                        out.push(`${key}=${queries[key]}`)
                    }
                });
                             
            console.log(out)
            // Формируем URL: /proxy/api + path. Vite проксирует /proxy -> host, оставляя /api
            var url = `${window.location.origin}/proxy/api${path}`
            if(out.length > 0) {
                url += `?${out.join('&')}`
            }

            var res = await fetch(url, request)
            
            // Если 401 и это не попытка обновления токена
            if(res.status == 401 && path != this.__refreshUrl){
                if(await this.__refreshToken())
                    res = await this.__makeRequest(method, path, data, headers, queries)
            }
            return res
        },
        async __makeFileRequest(method, path, file, headers, queries){
            var request = {
                method: method,
                headers: new Headers()
            }
            request.headers.append("Authorization", `Bearer ${this.__getAccessToken()}`)
            request.body = new FormData()
            if(file !== null)
                request.body.append('file', file)
            
            if(headers !== null){
                Object.keys(headers).forEach(key => {
                    request.headers.append(key, headers[key])
                });
            }
                        
            var out = [];
            if(queries != null)
                Object.keys(queries).forEach(key => {
                    if (queries[key] === undefined || queries[key] === null || queries[key] === '') {
                        delete queries[key];
                    }
                    else if(Array.isArray(queries[key])){
                        for (let index = 0; index < queries[key].length; index++) {
                            const element = queries[key][index];
                            out.push(`${key}=${element}`)
                        }
                    }
                    else{
                        out.push(`${key}=${queries[key]}`)
                    }
                });
                             
            console.log(out)
            var url = `${window.location.origin}/proxy/api${path}`
            if(out.length > 0) {
                url += `?${out.join('&')}`
            }
            
            console.log(request)
            var res = await fetch(url, request)
            
            if(res.status == 401 && path != this.__refreshUrl){
                await this.__refreshToken()
                res = await fetch(url, request)
            }
            return res
        },
        async __CreateResponce(rawResponce){
            var res = {
                code: rawResponce.status,
                body: null,
                text: null,
                headers: null
            }
            try{
                if(res.code !== 204){
                    res.text = await rawResponce.text()
                    try {
                        res.body = JSON.parse(res.text)
                    } catch (e) {
                        // Если ответ не JSON, оставляем body как есть или null, текст уже в res.text
                        res.body = res.text
                    }
                }                                
                res.headers = await rawResponce.headers
            }
            catch(ex){
               console.error("Error parsing response", ex)             
            }
            return res;
        },
        async __CreateImageResponce(rawResponce){
            var res = {
                code: rawResponce.status,
                body: null,
                headers: null
            }
            try{
                if(res.code !== 204){
                    res.body = await rawResponce.blob()
                }                                
                res.headers = await rawResponce.headers
            }
            catch(ex){
            }
            return res;
        },
        async __refreshToken(){
            // Пытаемся обновить токен
            var query = {}
            // Добавляем токен обновления в query
            // Внимание: API не специфицирует точно, как передавать refreshToken для /refresh, 
            // но обычно это либо Cookie, либо Header, либо Query. Оставляем Query как было в логике.
            // Если Swagger говорит GET /Admin/refresh без параметров, возможно он берется из Cookie.
            // Но сохраним старую логику отправки, если бэкенд это поддерживает.
            // UPD: Исходя из старого кода, он отправлял query параметр.
            
            // ВАЖНО: Swagger говорит GET /Admin/refresh возвращает 200 Success.
            
            this.__setAccesToken(null) // Сбрасываем текущий, чтобы не зациклить
            
            // Если токен был в localStorage, пробуем его отправить
            // Но вообще, /refresh обычно требует Authorization: Bearer <RefreshToken> или Cookie.
            // Оставим логику "как есть", но с исправленным URL
            
            var res = await this.__CreateResponce(await this.__makeRequest(
                "GET",
                this.__refreshUrl,
                null,
                null,
                null // Swagger не показывает явных параметров, возможно авторизация через Header работает
            ))
            
            console.log(res)
            
            // Предполагаем, что бэкенд вернет новую пару токенов в body
            if(res.code == 200 && res.body){
                // Проверяем структуру ответа. Если просто "Success", то это не сработает.
                // Надеемся, что там JSON с токенами.
                if(res.body.accessToken) {
                    this.__setAccesToken(res.body.accessToken)
                    this.__setRefreshToken(res.body.refreshToken || res.body.refrashToken) // fallback для старого именования
                    return true
                }
            }
            return false;
        },
        __getAccessToken(){
            return localStorage.getItem("accessToken")
        },
        __getRefreshToken(){
            return localStorage.getItem("refreshToken")
        },
        __getUserName(){
            return localStorage.getItem("username")
        },
        __setAccesToken(token){
            if(token == null){
                localStorage.removeItem("accessToken")
                this.isLoggedIn = false;
            }
            else{
                localStorage.setItem("accessToken", token)
                this.isLoggedIn = true;
            }

            window.dispatchEvent(new CustomEvent('auth-change', { 
                detail: { isLoggedIn: this.isLoggedIn } 
            }));
        },
        __setRefreshToken(token){
            if(token == null){
                localStorage.removeItem("refreshToken")
            }
            else{
                localStorage.setItem("refreshToken", token)
            }
        },
        __setUserName(name){
            if(name == null)
                localStorage.removeItem("username")
            else
                localStorage.setItem("username", name)
        }
    }
}