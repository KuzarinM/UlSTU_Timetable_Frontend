<script>
	import $ from "jquery"; 
	import APIHelper from "../mixins/APIHelper.js";
	import {sql} from "@vercel/postgres";
	import Pair from './Pair.vue'
    
	export default{
		mixins:[APIHelper],
		components:{
			Pair
		},
		data(){
			return{
				myObject:Object,
				startFirstWeek: new Date(2023, 8, 4),
				dayOfWeek:["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"],
				dayOfWeekExtendet:["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"],
				pairTiming:["08:30-09:50","10:00-11:20","11:30-12:50","13:30-14:50","15:00-16:20","16:30-17:50","18:00-19:20","19:30-20:50"],
				pairTimingInt:[510,600,690,810,900,990,1080,1170],
				timetable:[
					[
						[null,null,null,null,null,null,null,null],//Пн
						[null,null,null,null,null,null,null,null],//ВТ
						[null,null,null,null,null,null,null,null],//СР
						[null,null,null,null,null,null,null,null],//ЧТ
						[null,null,null,null,null,null,null,null],//ПТ
						[null,null,null,null,null,null,null,null] //СБ
					],
					[
						[null,null,null,null,null,null,null,null],
						[null,null,null,null,null,null,null,null],
						[null,null,null,null,null,null,null,null],
						[null,null,null,null,null,null,null,null],
						[null,null,null,null,null,null,null,null],
						[null,null,null,null,null,null,null,null]
					]
				],
				dataLoaded:false,
				error:"",
				style:"default",
				firstWeek:null,
				today:null
			}
		},
		methods:{
			capitalizeFirstLetter(string) {
				return string.charAt(0).toUpperCase() + string.slice(1);
			},
			async LoadData(){
				var group = this.$route.params.group
				var rows = await this.LoadObjectsFromDB(group);
				console.log(this.myObject)

				if(rows == null) return;
				
				rows.forEach(element => {
					if(this.timetable[element.week?1:0][element.day][element.pair] == null){
						this.timetable[element.week?1:0][element.day][element.pair] = []
					}
					this.timetable[element.week?1:0][element.day][element.pair].push({
						subject: `${this.capitalizeFirstLetter(element.type)}. ${this.capitalizeFirstLetter(element.subject)}`,
						teacher: element.teacher,
						place: element.place,
						isDif: element.isdifference,
						type :  element.type,
						pairNumber: element.pair,
						group:element.group,
						groups:[element.group],
						places:[element.place],
						teachers:[element.teacher]
					}) 
				});

				console.log(this.timetable)
				this.dataLoaded = true;
			},
			async LoadObjectsFromDB(name){
				if(name != "" && name != null){

					const tmp = (await sql`
						SELECT *, 'g' as type FROM "Group" WHERE name = ${name} UNION
						SELECT *, 't' as type FROM teacher WHERE name = ${name} UNION
						SELECT *, 'p' as type FROM place WHERE name = ${name}
						`).rows[0]
					if(tmp == null){
						this.error = "C таким именем не существует ни групп, ни аудиторий, ни преподавателей. Удивительно, согласен. Но вот так. Описались может? Если нет, то свяжитесь с главным по этой вот всей стстеме и передайте ему свиток с жалобой. Хотя, вероятно, он уже сейчас сидит и пишет очередной фикс, который закроет проблемму. Но лучше свиток то пердать, а то вдруг об этом баге до вас никто не слышал.."
						return null; 
					}
					this.myObject = tmp

					switch(this.myObject.type){
						case 'g':
						return (await sql`SELECT * FROM Timetable WHERE gid = ${this.myObject.id}`).rows;
						case 't':
						return (await sql`SELECT * FROM Timetable WHERE tid = ${this.myObject.id}`).rows;
						case 'p':
						return (await sql`SELECT * FROM Timetable WHERE pid = ${this.myObject.id}`).rows;
					}
					this.error = "Что произошло? такого вообще не могло случится. Как ты сюда попал????"
					return;
				}
				this.error = "Строка запроса не верна. Вообще там после .../timetable/ должно идти название группы, имя преподавателя или номмер аудитории. Подумайте над этим."
				return null;
			},
			CheckCurentDate(week,day){
				//1000*60*60*24=86400000 Умножение менее затратно чем деление
				return((week*7+day)*86400000 == (this.today - this.firstWeek))
			},
			CheckCurentDateAndTime(week, day, pair){
				if(this.CheckCurentDate(week,day)){
					var tmp = this.getTimeInt(new Date())
					return (tmp>= this.pairTimingInt[pair] &&
					 		( this.pairTimingInt.length > (pair+1) && tmp < this.pairTimingInt[pair+1]))
				}
				return false
			},
			GetCurrentFirstWeek(){
				this.firstWeek = new Date(this.startFirstWeek ) 
				this.firstWeek.setDate(this.startFirstWeek.getDate() + 
					parseInt((this.today - this.startFirstWeek) / 1209600000) * 14) //1000 * 60 * 60 * 24 * 14 = 1209600000
				return this.firstWeek
			},
			getTimeInt(date){
				return date.getHours()*60 + date.getMinutes()
			},
			CreateIntTiming(){
				this.pairTimingInt = []
				this.pairTiming.forEach(x=>this.pairTimingInt.push(
					this.getTimeInt(new Date(`0000-01-01T${x.split("-")[0]}:00`))
					))
				console.log(this.pairTimingInt)
			},
			GetMyObjectName(){
				switch (this.myObject.type) {
					case "g":
						return `Группа ${this.myObject.name}`
					case "t":
						return `Преподаватель ${this.myObject.name}`
					case "p":
						return `Аудитория ${this.myObject.name}`

				}
			}
		},
		async mounted(){
			var process = this.process//Thanks vue for 'good' system of env. Without this do not work DB

			this.today = new Date(new Date().toDateString())
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
		<div class="flex-column">
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
						<tr v-for="(day,di) in week" 
							class=" table-bordered border-dark">
							<td scope="row">
								<H3 class="text-center">{{this.dayOfWeek[di]}}</H3>
							</td>
							<Pair v-for="(dayPairs, pi) in day" :pairs="dayPairs" :week-number="wi" :day-number="di" :pair-number="pi" 
								:PairIsNowFunc="this.CheckCurentDateAndTime" :-is-desctop="true" :timetable-type="this.myObject.type"/>
						</tr>
					</tbody>
				</table>
				</div>
				<!--Это таблица для мобилок. Она иная и её концепция скопированна с мобильной версии распиания на LMS-->
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
							<tr v-for="(pairs, pi) in day.filter(x=>x!=null && x.filter(y=>y.isDif!=0).length > 0)" >

								<Pair :pairs="pairs" :week-number="wi" :day-number="di" :pair-number="day.indexOf(pairs)" 
									:PairIsNowFunc="this.CheckCurentDateAndTime" :-is-desctop="false" :pair-timing="this.pairTiming"
									:timetable-type="this.myObject.type"/>
							</tr>
							<tr v-if="!day.some(x => x != null && x.filter(y => y.isDif != 0).length > 0)">
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
		<small>Нет, ну они правда грузятся. Не верите, ну я могу добавить гифку колечка вращающегося, так лучше что-ли будет.
			 Быстрее всё равно не загрузится, ибо там идёт обращение к БД и конвертация. К слову, может это интернет просто не тянет?</small>
	</div>
	<div v-else>
		<H1 class="text-center">Произошла какая-то ошибка. Посмотрите ниже, чтобы понять, какая</H1>
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
