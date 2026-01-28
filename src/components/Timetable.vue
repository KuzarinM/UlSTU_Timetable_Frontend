<script>
import $ from "jquery"; 
import APIHelper from "../mixins/APIHelper.js";
// Удален импорт sql, так как это клиентское приложение
import Pair from './Pair.vue'
import TimetableApiMixine from "../mixins/TimetableApiMixine.js";
import TimetableObjectApiMixine from "../mixins/TimetableObjectApiMixine.js";

export default{
    mixins:[APIHelper,TimetableObjectApiMixine,TimetableApiMixine],
    components:{Pair},
    data(){
        return{
            myObject:Object,
            startFirstWeek: new Date(2023, 8, 4), // Внимание: это дата для 2023 года. Для 2026 потребуется обновление логики на бэкенде или здесь.
            dayOfWeek:["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"],
            dayOfWeekExtendet:["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"],
            pairTiming:["08:30-09:50","10:00-11:20","11:30-12:50","13:30-14:50","15:00-16:20","16:30-17:50","18:00-19:20","19:30-20:50"],
            pairTimingInt:[510,600,690,810,900,990,1080,1170],
            timetable:[
                // Нечетная неделя
                [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
                // Четная неделя
                [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]]
            ],
            dataLoaded:false,
            error:"",
            style:"default",
            firstWeek:null,
            today:null,
            differenceMod:false,
            key: 1,
            timetableType:"g",
            timetableObjectName:""
        }
    },
    methods:{
        capitalizeFirstLetter(string) {
            if(!string) return "";
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        async GetTimetableByObjectName(name){
            var groupRaw = await this.GetGroup(undefined,name)
            if(groupRaw.code == 200 && groupRaw.body){
                var groupTimetable = await this.GetGroupTimetable(groupRaw.body.id)
                this.timetableType = "g"
                this.timetableObjectName = groupRaw.body.name
                return groupTimetable.body
            }
            var teacherRaw = await this.GetTeacher(undefined,name)
            if(teacherRaw.code == 200 && teacherRaw.body){
                var teacherTimetable = await this.GetTeacherTimetable(teacherRaw.body.id)
                this.timetableType = "t"
                this.timetableObjectName = teacherRaw.body.name
                return teacherTimetable.body
            }
            var placeRaw = await this.GetPlace(undefined,name)
            if(placeRaw.code == 200 && placeRaw.body){
                var placeTimetable = await this.GetPlaceTimetable(placeRaw.body.id)
                this.timetableType = "p"
                this.timetableObjectName = placeRaw.body.name
                return placeTimetable.body
            }
            return null; // Если ничего не найдено
        },
        async LoadData(){
			
			var firstWeekTask = this.GetFirstWeeekAsync()

            var group = this.$route.params.group
            var timetable = await this.GetTimetableByObjectName(group)
            
            if(timetable == null) {
                this.error = "Объект расписания не найден (группа, преподаватель или аудитория)."
                return
            }

			var res = await firstWeekTask;

			if(res.code == 200){
				this.startFirstWeek = res.body;
			}
			console.log(this.startFirstWeek)

            for (let index = 0; index < timetable.length; index++) {
                const element = timetable[index];
                
                const weekIdx = element.subject.week ? 0 : 1;
                const dayIdx = element.subject.dayOfWeak; // Swagger says dayOfWeak
                const pairIdx = element.subject.pairNumber;

                if(this.timetable[weekIdx][dayIdx][pairIdx] == null){
                    this.timetable[weekIdx][dayIdx][pairIdx] = []
                }
                
                this.timetable[weekIdx][dayIdx][pairIdx].push({
                    subject: `${this.capitalizeFirstLetter(element.subject.type)}. ${this.capitalizeFirstLetter(element.d_name)}`,
                    teacher: element.t_name,
                    place: element.p_name,
                    isDif: element.subject.isDifference,
                    type : element.subject.type,
                    pairNumber: element.subject.pairNumber,
                    group: element.g_name,
                    groups: [element.g_name],
                    places: [element.p_name],
                    teachers: [element.t_name]
                }) 
            }
            console.log(this.timetable)
            this.dataLoaded = true;
        },
        // Метод LoadObjectsFromDB удален, так как он использовал прямой SQL доступ
        CheckCurentDate(week,day){
            //1000*60*60*24=86400000 Умножение менее затратно чем деление
            if(!this.today || !this.firstWeek) return false;
            return ((week*7+day)*86400000 == (this.today - this.firstWeek))
        },
        CheckCurentDateAndTime(week, day, pair){
            if(this.CheckCurentDate(week,day)){
                var tmp = this.getTimeInt(this.today)
                return (tmp >= this.pairTimingInt[pair] && ( this.pairTimingInt.length > (pair+1) && tmp < this.pairTimingInt[pair+1]))
            }
            return false
        },
        GetCurrentFirstWeek(){
            this.firstWeek = new Date(this.startFirstWeek) 
            // Расчет текущей "первой недели" двухнедельного цикла
            this.firstWeek.setDate(this.startFirstWeek.getDate() + parseInt((this.today - this.startFirstWeek) / 1209600000) * 14) 
            return this.firstWeek
        },
        getTimeInt(date){
            return date.getHours()*60 + date.getMinutes()
        },
        CreateIntTiming(){
            this.pairTimingInt = []
            this.pairTiming.forEach(x=>this.pairTimingInt.push(this.getTimeInt(new Date(`0000-01-01T${x.split("-")[0]}:00`))))
            console.log(this.pairTimingInt)
        },
        GetMyObjectName(){
            switch (this.timetableType) {
                case "g":
                    return `Группа ${this.timetableObjectName}`
                case "t":
                    return `Преподаватель ${this.timetableObjectName}`
                case "p":
                    return `Аудитория ${this.timetableObjectName}`
            }
        },
        GetCurrentTimeInUl(){
            const now = new Date(); 
            const targetTimeZone = 'Europe/Ulyanovsk';
            const options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZone: targetTimeZone
            };
            const formatter = new Intl.DateTimeFormat('en-US', options);
            const res = formatter.format(now);
            console.log(`Time: ${res}`);
            return res;
        }
    },
    async mounted(){
        //Thanks vue for 'good' system of env. Without this do not work DB
        this.today = new Date(this.GetCurrentTimeInUl())
        this.GetCurrentFirstWeek();
        this.style = this.$route.query["style"] 
        if(this.style == null) this.style = "default"
        
        await this.LoadData();
        
        var current = $(".current-day")[0]
        if(current!=null){
            current.scrollIntoView({behavior: "smooth"})
        }
    }
}
</script>
<template>
<article class="d-flex flex-column mx-auto" v-if="this.dataLoaded">
    <h2 class="text-center">{{ this.GetMyObjectName() }}</h2>
    <div class="form-check form-switch ms-md-auto me-3 ms-3">
        <input class="form-check-input" type="checkbox" v-model="this.differenceMod" @change="this.key++"/>
        <h5 class="form-check-label">Отобразить только последние отличия</h5>
    </div>
    <div class="flex-column" :key="this.key">
        <div class="table-responsive d-flex flex-column justify-content-center" v-for="(week, wi) in this.timetable">
            <h1 class="text-center">{{ wi!=0?"Чётная неделя": "Нечётная неделя" }}</h1>
            <!--Это таблица для вывода в десктопной версии-->
            <div class="d-none d-md-block panel p-0 m-3 w-fit-content align-self-center">
                <table :class="`table table-sm table-bordered border-dark m-0 ${this.style=='maxim'? 'table-success':''}` " >
                    <thead>
                        <tr>
                            <th class="p-0" scope="col" ></th>
                            <th class="p-1" scope="col" v-for="(item,index) in week[0]">
                                <H3 class="text-center"> {{ index + 1 }}-я</H3>
                                <h6 class="text-center">{{ this.pairTiming[index] }}</h6>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(day,di) in week" class=" table-bordered border-dark">
                            <td scope="row"><H3 class="text-center">{{this.dayOfWeek[di]}}</H3></td>
                            <Pair v-for="(dayPairs, pi) in day" :pairs="dayPairs" :week-number="wi" :day-number="di" :pair-number="pi" :PairIsNowFunc="this.CheckCurentDateAndTime" :-is-desctop="true" :timetable-type="this.timetableType" :differenceMod="this.differenceMod"/>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!--Это таблица для мобилок-->
            <div class="d-block d-md-none table-responsive panel p-0 w-100">
                <table :class="`table table-bordered border-dark mb-1 ${this.style=='maxim'? 'table-success':''}`" v-for="(day,di) in week" >
                    <thead>
                        <tr>
                            <th :class="this.CheckCurentDate(wi,di)? 'labwork opacity-1 text-white' : ''" scope="col">
                                <p class="text-start opacity-1 ">{{ this.dayOfWeekExtendet[di]}}</p>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(pairs, pi) in day.filter(x=>x!=null && x.filter(y=>y.isDif!=0 || differenceMod).length > 0)" >
                            <Pair :pairs="pairs" :week-number="wi" :day-number="di" :pair-number="day.indexOf(pairs)" :PairIsNowFunc="this.CheckCurentDateAndTime" :-is-desctop="false" :pair-timing="this.pairTiming" :timetable-type="this.timetableType" :differenceMod="this.differenceMod"/>
                        </tr>
                        <tr v-if="!day.some(x => x != null && x.filter(y => y.isDif != 0 || differenceMod).length > 0)">
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</article>
<div v-else-if="this.error==''">
    <H1 class="text-center">Данные загружаются, пожалуйста подождите</H1>
    <small>Загрузка данных расписания...</small>
</div>
<div v-else>
    <H1 class="text-center">Произошла ошибка</H1>
    <p class="text-center">{{ this.error }}</p>
</div>
</template>
<style scoped>
@media only screen and (min-width: 768px) {
  .custom-class {
    align-self: center;
  }
}
.current-day{
    border: solid;
    border-width: thick;
}
</style>