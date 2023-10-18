<script>
	import $ from "jquery"; 
	import APIHelper from "../mixins/APIHelper.js";
	import {sql} from "@vercel/postgres";
	import { VueScreenSizeMixin } from 'vue-screen-size';
    
	export default{
		mixins:[APIHelper, VueScreenSizeMixin],
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

				switch (this.$route.params.area) {
					case "groups":
						this.area = "g"
						break;
					case "teachers":
						this.area = "t"
						break;
					case "places":
						this.area = "p"
						break;
				}
				var search = this.$route.query.search;

				if(search != null && search != ""){
					search += "%"
					switch (this.area) {
						case "g":
							this.list = (await sql`SELECT * FROM "Group" WHERE LOWER(name) LIKE LOWER(${search})`).rows;
							break;
						case "t":
							this.list = (await sql`SELECT * FROM teacher WHERE LOWER(name) LIKE LOWER(${search})`).rows;
							break;
						case "p":
							this.list = (await sql`SELECT * FROM place WHERE LOWER(name) LIKE LOWER(${search})`).rows;
							break;
					}
					
				}
				else{
					switch (this.area) {
						case "g":
							this.list = (await sql`SELECT * FROM "Group"`).rows;
							break;
						case "t":
							this.list = (await sql`SELECT * FROM teacher`).rows;
							break;
						case "p":
							this.list = (await sql`SELECT * FROM place`).rows;
							break;
					}
				}

				this.list = this.list.sort((a,b)=>a.name.localeCompare(b.name))

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
