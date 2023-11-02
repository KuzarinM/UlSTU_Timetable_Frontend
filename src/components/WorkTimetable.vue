<script>
	import $ from "jquery"; 
	import APIHelper from "../mixins/APIHelper.js";
	import {sql} from "@vercel/postgres";
    
	export default{
		mixins:[APIHelper],
		data(){
			return{
				cellTiming:["06:00-8:00","08:00-10:00","10:00-12:00","12:00-14:00","14:00-16:00","16:00-18:00","18:00-20:00","20:00-22:00"],
				startFirstWeek: new Date(2023, 8, 4),
				cellTimingInt:[],
				pairTimingInt:[510,600,690,810,900,990,1080,1170],
				firstWeek:null,
				today:null,
				myObject:Object,
				error:null,
				timetable:[
					[
						null,//Пн
						null,//ВТ
						null,//СР
						null,//ЧТ
						null,//ПТ
						null, //СБ
						null //ВС
					],
					[
						null,//Пн
						null,//ВТ
						null,//СР
						null,//ЧТ
						null,//ПТ
						null, //СБ
						null //ВС
					]
				],
				dataLoaded:false,
				style:""
			}
		},
		methods:{
			capitalizeFirstLetter(string) {
				return string.charAt(0).toUpperCase() + string.slice(1);
			},
			async LoadData(){
				var group = this.$route.params.group
				var rows = await this.LoadObjectsFromDB(group);
				console.log(rows)

				if(rows == null) return;

				rows.forEach(element => {

					this.GetCellIndex(element).forEach(ind=>{
						
						if(this.timetable[element.week?1:0][element.day] == null){
							this.timetable[element.week?1:0][element.day] = [null,null,null,null,null,null,null,null]
						}
						if(this.timetable[element.week?1:0][element.day][ind] == null){
							this.timetable[element.week?1:0][element.day][ind] = []
						}
						this.timetable[element.week?1:0][element.day][ind].push({
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
					
				});
				this.dataLoaded = true;
			},
			GetCellIndex(element){
				var sTime = this.pairTimingInt[element.pair]
				var eTime = this.pairTimingInt[element.pair+1]
				var res = []
				for (let index = 0; index < this.cellTimingInt.length; index++) {
					if(eTime<this.cellTimingInt[index])
					{
						res.push(index-1)
						return res
					} 
					if(sTime<=this.cellTimingInt[index]){
						res.push(index-1)
					}
				}
				return res
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
				this.cellTimingInt = []
				this.cellTiming.forEach(x=>this.cellTimingInt.push(
					this.getTimeInt(new Date(`0000-01-01T${x.split("-")[0]}:00`))
					))
				console.log(this.cellTimingInt)
			},
			GetTableCLass(pairs){
				if(pairs!=null && pairs.length>0) return "table-danger table-bordered border-dark"
			}
		},
		async mounted(){
			this.CreateIntTiming();

			this.style = this.$route.query["style"] 
			if(this.style == null) this.style = "default"

			await this.LoadData();
		}
	}
</script>

<template>
	<article v-if="this.dataLoaded">
		<div class="table-responsive d-flex flex-column" v-for="(week,wi) in this.timetable">
			<h2 class="text-center">{{ wi!=0?"Чётная неделя": "Нечётная неделя" }}</h2>
			<table :class="`table ${this.style=='maxim'? 'table-success':''} table-bordered border-dark`">
				<thead>
					<tr>
						<th scope="col" v-for="item in this.cellTiming">{{item}}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="day in week">
						<td :class="this.GetTableCLass(pair)" v-for="pair in day">
							<div class="text-center d-flex flex-column m-0" v-for="lesson in pair">
								<p class="m-0">{{lesson.subject}}</p>
								<a class="text-wrap m-0" :href="`/timetable/${lesson.teacher}`">{{lesson.teacher}}</a>
								<a class="text-wrap m-0" :href="`/timetable/${lesson.group}`">{{lesson.group}}</a>
								<a class="text-wrap m-0" :href="`/timetable/${lesson.place.replace('/','%2F')}`">{{lesson.place}}</a>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		
	</article>
</template>

<style scoped>
a{
	color: black !important;
}
</style>
