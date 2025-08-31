import ApiMixines from "./ApiMixines";

const TimetableObjectApiMixine ={
    mixins: [ 
        ApiMixines 
    ],
    methods:{
        async GetGroupList(pageNumber, pageSize, serach){
            return await this.__CreateResponce(await this.__makeRequest(
                "GET",
                "/groups",
                null,
                null,
                {
                    limit: pageSize,
                    offset: pageNumber*pageSize,
                    search: serach
                }
            ));
        },
        async GetGroup(id, name){
            return await this.__CreateResponce(await this.__makeRequest(
                "GET",
                "/group",
                null,
                null,
                {
                    id: id,
                    name: name
                }
            ));
        },
        async GetTeacherList(pageNumber, pageSize, serach){
            return await this.__CreateResponce(await this.__makeRequest(
                "GET",
                "/teachers",
                null,
                null,
                {
                    limit: pageSize,
                    offset: pageNumber*pageSize,
                    search: serach
                }
            ));
        },
        async GetTeacher(id, name){
            return await this.__CreateResponce(await this.__makeRequest(
                "GET",
                "/teacher",
                null,
                null,
                {
                    id: id,
                    name: name
                }
            ));
        },
        async GetPlacesList(pageNumber, pageSize, serach){
            return await this.__CreateResponce(await this.__makeRequest(
                "GET",
                "/places",
                null,
                null,
                {
                    limit: pageSize,
                    offset: pageNumber*pageSize,
                    search: serach
                }
            ));
        },
        async GetPlace(id, name){
            return await this.__CreateResponce(await this.__makeRequest(
                "GET",
                "/place",
                null,
                null,
                {
                    id: id,
                    name: name
                }
            ));
        },
    }
}

export default TimetableObjectApiMixine