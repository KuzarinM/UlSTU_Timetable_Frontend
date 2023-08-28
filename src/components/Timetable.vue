<script>
	import $ from "jquery"; 
	import APIHelper from "../mixins/APIHelper.js";
	import {sql} from "@vercel/postgres";
    
	export default{
		mixins:[APIHelper],
		data(){
			return{
				myGroup:Object,
				dayOfWeek:["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"],
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
				error:""
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
						isDif: element.isdifference 
					}) 
				});

				console.log(this.timetable)
				this.dataLoaded = true;
			}
		},
		async mounted(){
			var process = this.process//Thanks vue for 'good' system of env. Without this do not work DB
			await this.LoadData();
		}
	}
</script>

<template>
	<article class="d-flex flex-column mx-auto" v-if="this.dataLoaded">
		<div class="table-responsive d-flex flex-column justify-content-center" v-for="(week, wi) in this.timetable">
			<h1 class="text-center">{{ wi==0?"Чётная неделя": "Нечётная неделя" }}</h1>
			<table class="panel table table-sm table-success table-bordered border-dark custom-class" >
				<thead>
					<tr>
						<th scope="col"></th>
						<th scope="col" v-for="(item,index) in week[0]">
							<H3 class="text-center"> {{ index + 1 }}-я</H3>
							</th>
					</tr>
				</thead>
				<tbody>
					<tr class="" v-for="(day,di) in week">
						<td scope="row">
							<H3 class="text-center">{{this.dayOfWeek[di]}}</H3>
						</td>
						<td v-for="(pairs, pi) in day" :class="pairs!=null && pairs.some(x=>x.isDif == 2)?'table-active':''">
							<div v-if="pairs!=null">
								<p class="text-wrap" v-for="subject in pairs.filter	(x=>x.isDif!=0)" >
									{{ subject.subject }} <br>
									{{ subject.teacher }} <br>
									{{ subject.place }}
								</p>
							</div>
							<p class="text-center " v-else>-</p>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		
		
	</article>
	<div v-else-if="this.error==''">
		<H1 class="text-center">Данные загружаются, пожалуйств подождите</H1>
		<small>Нет, ну они правда грузятся. Не верите, ну я могу добавить гивку колечка вращающегося, так лучше что-ли будет.
			 Быстрее всё равно не загрузится, ибо там идёт обращение к БД и конвертация. К слову, может это интертен просто не тянет?</small>
	</div>
	<div v-else>
		<H1 class="text-center">Произошла какая-то ошибка. Посмотрите ниже, чтобы понять, какая</H1>
		<p class="text-center">{{ this.error }}</p>
	</div>
	
</template>

<style scoped>
.custom-class {
   table-layout: fixed;
   width: 85%;
   align-self: center;
}
</style>
