<script>
	import $ from "jquery"; 
	import APIHelper from "../mixins/APIHelper.js";
	import {sql} from "@vercel/postgres";
    
	export default{
		mixins:[APIHelper],
		data(){
			return{
				myGroup:Object,
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
				style:"default"
			}
		},
		methods:{
			capitalizeFirstLetter(string) {
				return string.charAt(0).toUpperCase() + string.slice(1);
			},
			async LoadData(){
				var group = this.$route.params.group
				if(group != "" && group != null){
					
					this.myGroup =  (await sql`SELECT * FROM "Group" WHERE name = ${group};`).rows[0];
					if(this.myGroup == null){
						this.error = "Группа с таким названием не существует. Удивительно, согласен. Но вот так. Описались может? Если нет, то свяжитесь с главным по этой вот всей стстеме и передайте ему свиток с жалобой. Хотя, вероятно, он уже сейчас сидит и пишет очередной фикс, который закроет проблемму. Но лучше свиток то пердать, а то вдруг об этом баге до вас никто не слышал.."
						return;
					}
				}
				else{
					this.error = "Строка запроса не верна. Вообще там после .../timetable/ должно идти название группы. Подумайте над этим."
				}
				console.log(this.myGroup)

				var rows = (await sql`SELECT * FROM Timetable WHERE gid = ${this.myGroup.id}`).rows
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
						pairNumber: element.pair
					}) 
				});

				console.log(this.timetable)
				this.dataLoaded = true;
			},
			GetPairDivClass(pairs,weekIndex, dayIndex, pairIndex = null){
				var tmp = 'p-1 '
				var pn = pairIndex;
				if(pairs!=null){
					if(pairs.some(x=>x.isDif != 1)) tmp+= 'p-1 table-active '
					pn = pairs[0].pairNumber
				} 
				if(pn!=null){
					if(this.CheckCurentDateAndTime(weekIndex, dayIndex, pn)) tmp += "current-day "
				}

				return tmp
			},
			GetPairColorLine(subject, weekIndex, dayIndex, pairIndex){
				switch(subject.type){
					case 'лек':
						return "lection opacity-70 "
					case 'пр':
						return "practic opacity-70 "
					case 'лаб':
						return "labwork opacity-70 "
				}
				return "d-none"
			},
			CheckCurentDate(week,day, pair){
				return(week*7+day == (new Date(new Date().toDateString()) - this.getCurrentFirstWeek())/ (1000*60*60*24))
			},
			CheckCurentDateAndTime(week, day, pair){
				if(this.CheckCurentDate(week,day)){
					var tmp = this.getTimeInt(new Date())
					return (tmp>= this.pairTimingInt[pair] && ( this.pairTimingInt.length > (pair+1) && tmp < this.pairTimingInt[pair+1]))
				}
				return false
			},
			getCurrentFirstWeek(){
				var tmp = new Date(this.startFirstWeek ) 
				tmp.setDate(this.startFirstWeek.getDate() + parseInt((new Date(new Date().toDateString()) - this.startFirstWeek) /
				 1209600000) * 14) //1000 * 60 * 60 * 24 * 14 = 1209600000
				return tmp
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
			}

		},
		async mounted(){
			var process = this.process//Thanks vue for 'good' system of env. Without this do not work DB
			await this.LoadData();
			var current = $(".current-day")[0]

			this.style = this.$route.query["style"] 
			if(this.style == null) this.style = "default"
			if(current!=null){
				current.scrollIntoView({behavior: "smooth"})
			}
		}
	}
</script>

<template>
	<article class="d-flex flex-column mx-auto" v-if="this.dataLoaded">
		<h2 class="text-center">{{ this.myGroup.name }}</h2>
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
							<td v-for="(pairs, pi) in day" :class="this.GetPairDivClass(pairs, wi, di, pi)">
								<div class="p-0 m-0" v-if="pairs!=null && pairs.filter(x=>x.isDif!=0).length != 0" >
									<div class="p-0 m-0" v-for="subject in pairs.filter(x=>x.isDif!=0)">
										<hr :class="this.GetPairColorLine(subject, wi, di, pi)"/>
										<p class="text-wrap text-center m-0"  >
											{{ subject.subject }} <br>
											{{ subject.teacher }} <br>
											{{ subject.place }}
										</p>
									</div>
								</div>
								<p class="text-center " v-else>-</p>
							</td>
						</tr>
					</tbody>
				</table>
				</div>
				<!--Это таблица для мобилок. Она иная и её концепция скопированна с мобильной версии распиания на LMS-->
				<div class="d-block d-md-none table-responsive panel p-0">
					<table :class="`table table-bordered border-dark mb-1 ${this.style=='maxim'? 'table-success':''}`" v-for="(day,di) in week" >
						<thead >
							<tr >
								<th :class="this.CheckCurentDate(wi,di)? 'labwork opacity-1 text-white' : ''" scope="col">
									<p class="text-start opacity-1 ">{{ this.dayOfWeekExtendet[di]}}</p>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(pairs, pi) in day.filter(x=>x!=null && x.filter(y=>y.isDif!=0).length > 0)" >
								<td :class="this.GetPairDivClass(pairs, wi, di)">
									<h6 class="fw-bold m-0">{{ day.indexOf(pairs) +1 }} - {{ this.pairTiming[day.indexOf(pairs)] }}</h6>
									<div v-for="subject in pairs.filter(x=>x.isDif!=0)">
										<hr :class="this.GetPairColorLine(subject, wi, di, pi)"/>
										<p class="m-0">
											{{ subject.subject }} <br>
											{{ subject.teacher }} <br>
											{{ subject.place }}
										</p>
									</div>
								</td>
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
.w-fit-content{
	width: fit-content;
}
.current-day{
	border: solid;
	border-width: thick;
}

hr {
    display: block;
    height: 10px;
    border: 0;
    margin: 0;
    padding: 0;
}
</style>
