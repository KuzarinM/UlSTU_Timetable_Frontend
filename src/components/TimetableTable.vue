<script>
    export default {
        data(){
            return{
                url:"http://homeserver/api/28022023/timetable/",
                groupId:Number,
                TableHeaders:Array,
                TableLines:Array
            }
        },
        async created(){
            this.TableHeaders = ["1-ая","2-ая","3-ая","4-ая","5-ая","6-ая","7-ая","8-ая"]
            this.groupId = 19246
            this.LoadTimetable()
        },
        methods:{
            async LoadTimetable(){
                const responce = await fetch(this.url+this.groupId)
                const json = await responce.json()
                this.TableLines = json[0];
            }
        }
    }

</script>
<template>

        <table class="table table-bordered m-0 p-0">
            <thead class="table-primary">
                <tr>
                    <th v-for="item in TableHeaders"><p>{{ item }}</p></th>
                </tr>
            </thead>
            <tbody>
               <tr v-for="line in TableLines">
                    <td v-for="item in line">
                        <div v-for="pair in item">
                            <p>{{ pair.type }}</p>
                            <p>{{ pair.dname }}</p>
                            <p>{{ pair.tname }}</p>
                            <p>{{ pair.place }}</p>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

    
</template>
<style>

</style>