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
                "/Admin/Parse",
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
    }
}

export default AdminApiMixine