import ApiMixines from "./ApiMixines";

const TimetableApiMixine ={
    mixins: [ 
        ApiMixines 
    ],
     methods:{
        async GetTeacherTimetable(teacherId){
            return await this.__CreateResponce(await this.__makeRequest(
                "GET",
                "/timetable/teacher",
                null,
                null,
                {
                    tid: teacherId
                }
            ));
        },
        async GetGroupTimetable(groupId){
            return await this.__CreateResponce(await this.__makeRequest(
                "GET",
                "/timetable/group",
                null,
                null,
                {
                    gid: groupId
                }
            ));
        },
        async GetPlaceTimetable(placeId){
            return await this.__CreateResponce(await this.__makeRequest(
                "GET",
                "/timetable/place",
                null,
                null,
                {
                    pid: placeId
                }
            ));
        }
     }
}

export default TimetableApiMixine