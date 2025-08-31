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
				area:"g"
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
			}
		},
		created(){
			window.addEventListener("resize", this.resise)
		},
		async mounted(){
			var process = this.process//Thanks vue for 'good' system of env. Without this do not work DB
			await this.LoadData();
			this.resise(1);
		}
	}
</script>

<template>
	<article>
		<ul class="list-unstyled card-columns" :style="`column-count : ${this.columnCount};`">
			<li class="mx-3" v-for="item in this.list" >
				<a :href="`/timetable/${item.name}`">{{ item.name }}</a>
			</li>
			
		</ul>
		
	</article>
</template>

<style scoped>
</style>
