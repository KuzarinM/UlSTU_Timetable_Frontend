import ApiMixines from "./ApiMixines";

const AdminApiMixine ={
    mixins: [
         ApiMixines
     ],
     methods:{
        async LogInAsUser(username, password){
            return await this.__CreateResponce(await this.__makeRequest(
                "POST",
                "/Admin/login",
                {
                    login: username,
                    password: password
                },
                null,
                null
            ));
        },
        async StartParsing(username, password, ignoreDownload, forceUpdate){
            return await this.__CreateResponce(await this.__makeRequest(
                "POST",
                "/Admin/Parse/Start",
                {
                    login: username,
                    password: password
                },
                null,
                {
                    ignoreDownload: ignoreDownload,
                    forceUpdate: forceUpdate
                }
            ));
        },
        // НОВОЕ: Получение статуса парсинга
        async GetParsingStatus(){
            return await this.__CreateResponce(await this.__makeRequest(
                "GET",
                "/Admin/Parse/Status",
                null,
                null,
                null
            ));
        },
        async SetFirstWeek(newValue){
            return await this.__CreateResponce(await this.__makeRequest(
                "PUT",
                "/Admin/firstWeek",
                null,
                null,
                {
                    datetime: newValue
                }
            ));
        },
    }
}
export default AdminApiMixine