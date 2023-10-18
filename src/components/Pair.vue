<script>
	import $ from "jquery"; 
	import APIHelper from "../mixins/APIHelper.js";
    
	export default{
		mixins:[APIHelper],
		data(){
			return{
				isEmpty:true,
				divClass:"",
				textClass:"",
				data:[]
			}
		},
		props:{
			pairs:Array,
			weekNumber:Number,
			dayNumber:Number,
			pairNumber:Number,
			PairIsNowFunc:Function,
			IsDesctop:Boolean,
			pairTiming:Array,
			timetableType:String
		},
		methods:{
			GetPairColorLine(subject){
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
			PairDivClassDefine(){
				this.divClass = 'p-1 '
				if(this.pairs!=null){
					if(this.pairs.some(x=>x.isDif != 1)) this.divClass+= 'p-1 table-active '
				} 
				if(this.PairIsNowFunc(this.weekNumber, this.dayNumber, this.pairNumber)) this.divClass += "current-day "

			},
			PrepareData(){
				if(!this.isEmpty){
				if(this.timetableType != "g"){
					this.data = []
					const tmp = this.pairs.filter(x=>x.isDif!=0).reduce((groups,item)=>{
						if(groups[item.subject] == null){
							groups[item.subject] = item;
						}
						else{
							const group = groups[item.subject]
							if(!group.places.includes(item.place)) group.places.push(item.place)
							if(!group.groups.includes(item.group)) group.groups.push(item.group)
							if(!group.teachers.includes(item.teacher)) group.teachers.push(item.teacher)
							groups[item.subject] = group;
						}
						return groups;
					}, {})
					for (var key in tmp)
					{
						this.data.push(tmp[key])
					}
					console.log(this.data)
				}
				else{
					this.data = this.pairs.filter(x=>x.isDif!=0)
				}
			}
			}
		},
		mounted(){
			this.isEmpty = this.pairs == null || this.pairs.filter(x=>x.isDif!=0).length == 0
			this.PairDivClassDefine();
			if(this.IsDesctop){
				this.textClass = "text-wrap text-center m-0"
			}
			else{
				this.textClass = " m-0"
			}
			this.PrepareData()
		}
	}
</script>

<template>
	<td :class="this.divClass">
		<div class="p-0 m-0" v-if="!this.isEmpty" >
			<div class="p-0 m-0" v-for="(subject, si) in this.data">
				<h6 class="fw-bold m-0" v-if="!this.IsDesctop && si==0">{{ this.pairNumber +1 }} - {{ this.pairTiming[this.pairNumber] }}</h6>
				
				<hr :class="this.GetPairColorLine(subject)"/>

				<p :class="this.textClass"  >
					{{ subject.subject }}
				</p>
				<div class="m-0 p-0" >
					<a :href="t" v-if="this.timetableType != 't'" v-for="t in subject.teachers">
						<p :class="this.textClass">
							{{ t }}
						</p>
					</a>
					<a :href="g" v-else v-for="g in subject.groups">
						<p :class="this.textClass">
							{{ g }}
						</p>
					</a>
				</div>
				<div class="m-0 p-0">
					<a :href="p.replace('/','%2F')" v-if="this.timetableType != 'p'" v-for="p in subject.places">
						<p :class="this.textClass">
						{{ p }}
						</p>
					</a>
					<a :href="g" v-else  v-for="g in subject.groups">
						<p :class="this.textClass">
							{{ g }}
						</p>
					</a>
				</div>
			</div>
		</div>
		<p class="text-center " v-else>-</p>		
	</td>
</template>

<style scoped>
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
a{
	color: black !important;
}

</style>
