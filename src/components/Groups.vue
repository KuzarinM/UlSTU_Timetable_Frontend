<script>
	import $ from "jquery"; 
	import { VueScreenSizeMixin } from 'vue-screen-size';
	import TimetableObjectApiMixine from "../mixins/TimetableObjectApiMixine";
    
	export default{
		mixins:[
			TimetableObjectApiMixine, 
			VueScreenSizeMixin
		],
		data(){
			return{
				list:[],
				dataLoaded:false,
				columnCount:1,
				area:"g",
				search:""
			}
		},
		methods:{
			async LoadData(){
				var search = this.$route.query.search;

				switch (this.$route.params.area) {
					case "groups":
						this.area = "g"
						this.list = await this.GetGroupList(0, 1000, search)
						break;
					case "teachers":
						this.area = "t"
						this.list = await this.GetTeacherList(0, 1000, search)
						break;
					case "places":
						this.area = "p"
						this.list = await this.GetPlacesList(0, 1000, search)
						break;
				}

				console.log(this.list)
				
				this.list = this.list.body.sort((a,b)=>a.name.localeCompare(b.name))

				this.dataLoaded = true
			},
			resise(e){
				this.wight = window.innerWidth;
				this.columnCount = window.innerWidth  / 160 | 0
			},
			find(){
				var quries = JSON.parse(JSON.stringify(this.$route.query));

				quries["search"]=this.search

				this.$router.push(
					{
						path: this.$route.fullPath,
						query: quries, 
						params: this.$route.params 
					}
				);

				return false
			}
		},
		created(){
			window.addEventListener("resize", this.resise)
		},
		async mounted(){
			await this.$router.isReady()

			this.search = this.$route.query.search

			await this.LoadData();

			this.resise(1);
		}
	}
</script>

<template>
	<article>
		<div class="m-3">
			<form class="d-flex my-3 my-lg-0" @submit="find">
				<input 
					class="form-control me-sm-2 my-2" 
					name="search" 
					placeholder="Введите поисковой запрос" 
					type="text"
					v-model="search"
				>
				<button class="btn btn-outline-success my-2 ms-2" type="submit">Поиск</button>
			</form>
		</div>


		<ul class="list-unstyled card-columns" :style="`column-count : ${this.columnCount};`">
			<li class="mx-3" v-for="item in this.list" >
				<router-link :to="`/timetable/${item.name}`" class="green" >{{ item.name }}</router-link>
			</li>
			
		</ul>
		
	</article>
</template>

<style scoped>
</style>
