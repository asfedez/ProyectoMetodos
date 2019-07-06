document.addEventListener('keydown', e=>{
    if(e.ctrlKey && e.keyCode == 77){
        app.project_Name = 'Instalación de equipo para control de contaminación atmosférica'
        app.projWeek = 16
        app.activityList = [
            {id: "1", optimistic: 1, pessimistic: 3,  mostLikely: 2, name: "A", weekCost: 5000},
                {id: "2", optimistic: 2, pessimistic: 4,  mostLikely: 3, name: "B", weekCost: 20000},
                {id: "3", optimistic: 1, pessimistic: 3,  mostLikely: 2, name: "C", dependsOn: ["1"], weekCost: 15000},
                {id: "4", optimistic: 2, pessimistic: 6,  mostLikely: 4, name: "D", dependsOn: ["2"], weekCost: 8000},
                {id: "5", optimistic: 1, pessimistic: 7,  mostLikely: 4, name: "E", dependsOn: ["3"], weekCost: 35000},
                {id: "6", optimistic: 1, pessimistic: 9,  mostLikely: 2, name: "F", dependsOn: ["3"], weekCost: 50000},
                {id: "7", optimistic: 3, pessimistic: 11, mostLikely: 4, name: "G", dependsOn: ["4", "5"], weekCost: 28000},
                {id: "8", optimistic: 1, pessimistic: 3,  mostLikely: 2, name: "H", dependsOn: ["6", "7"], weekCost: 5000},
        ]
    }
})

Vue.component('modal', {
    template: '#modal',
    props: ['show', 'closeBtn', 'callback', 'closeCallback'],
    computed: {
        sClass(){
            if(this.show){
                return 'modal__show'
            }
            return ''
        },
        closeText(){
            console.log(this.closeBtn)
            return (this.closeBtn != null && this.closeBtn.trim() != '')?this.closeBtn:'Cerrars'
        },
        saveBtn(){
            return this.callback != null && typeof this.callback == 'function'
        }
    },
    methods: {
        close(){
            if(this.closeCallback != null && typeof this.closeCallback == 'function'){
                this.closeCallback()
            }
            this.$emit('close')
        }
    }
})

const app = new Vue({
    el: '#app',
    data: {

        modal: {
            name: false,
            time: false,
            activity: false
        },

        activityList:[
            // {id: "1", optimistic: 1, pessimistic: 3,  mostLikely: 2, name: "A", weekCost: 5000},
            // {id: "2", optimistic: 2, pessimistic: 4,  mostLikely: 3, name: "B", weekCost: 20000},
            // {id: "3", optimistic: 1, pessimistic: 3,  mostLikely: 2, name: "C", dependsOn: ["1"], weekCost: 15000},
            // {id: "4", optimistic: 2, pessimistic: 6,  mostLikely: 4, name: "D", dependsOn: ["2"], weekCost: 8000},
            // {id: "5", optimistic: 1, pessimistic: 7,  mostLikely: 4, name: "E", dependsOn: ["3"], weekCost: 35000},
            // {id: "6", optimistic: 1, pessimistic: 9,  mostLikely: 2, name: "F", dependsOn: ["3"], weekCost: 50000},
            // {id: "7", optimistic: 3, pessimistic: 11, mostLikely: 4, name: "G", dependsOn: ["4", "5"], weekCost: 28000},
            // {id: "8", optimistic: 1, pessimistic: 3,  mostLikely: 2, name: "H", dependsOn: ["6", "7"], weekCost: 5000},
        ],

        indexList: null,
        newName:'',
        newOp:null,
        newPes:null,
        newLike:null,
        dependsOn: [],
        expectTime:'',
        expectDesv:'',
        lista_Informacion: [], //Lista que obtiene datos relevantes de las tareas
        pWeekCost:'',
        projWeek:0,
        dataChart:[],

        ///Para seleccionar una dependecia
        currentDependencies: [],
        selected_Depends0:'',
        selected_Depends1:'',
        dependencies_Options: [
            {text:'No', value:''}
        ],
        
        //Chart Pert
        chartPert: null, 
        //Para el Diagrama GRANTT
        chartGrantt:null,

        //Para diagrama de barras
        chartCost:null,
        data_LocalStorage:[],
        report_Num:0,
        project_Name:''
        
        },
    methods: {
        addActivity () {

            let tempDependencies = []

            if(this.indexList == null){
                tempDependencies = this.currentDependencies.map(e=>{return e})
            }else{
                tempDependencies = this.currentDependencies
            }

            if(tempDependencies.length == 0 && this.indexList != null){
                tempDependencies = null
                
            }

            console.log(tempDependencies)

            let activity = {
                name: this.newName,
                optimistic: this.newOp,
                pessimistic: this.newPes,
                mostLikely: this.newLike,
                dependsOn: tempDependencies,
                weekCost: this.pWeekCost
            }

            if(this.indexList == null){
                activity.id = this.nextId
                this.activityList.push(activity)
            }else{
                activity.id = this.activityList[this.indexList].id
                this.activityList[this.indexList] = activity
                this.indexList = null
            }
            console.log(this.dependencies)
            this.clear()
        },
        searchActivity(id){
            for (let index = 0; index < this.activityList.length; index++) {
                let acitivity = this.activityList[index]
                if(this.activityList[index].id==id){
                    this.newName = acitivity.name
                    this.newOp = acitivity.optimistic
                    this.newPes = acitivity.pessimistic
                    this.newLike = acitivity.mostLikely
                    this.currentDependencies = (acitivity.dependsOn != null)?acitivity.dependsOn:[]
                    this.pWeekCost = acitivity.weekCost
                    this.indexList = index
                }
            }
            this.modal.activity = true
        },
        createPert(){

            if(this.chartPert != null){
                this.chartPert.dispose();
                this.chartPert=null;
            }

            // create a chartPert
            this.chartPert = anychart.pert();

            // set chartPert data
            this.chartPert.data(this.activityList, "asTable");

            // set the title of the chartPert
            this.chartPert.title("PERT ChartchartPert");

            // set the container id for the chartPert
            this.chartPert.container("container");

            // initiate drawing the chartPert
            this.chartPert.draw();

        },
        showCriticalPath(){
             // set critical path milestones colors
            milestones = this.chartPert.criticalPath().milestones();
            milestones.fill("#ffab91");
            milestones.hovered().fill("#ff6e40");
            milestones.selected().fill("#ff6e40");
            milestones.labels().fontColor("#86614e");
            // set critical tasks stroke
            tasks = this.chartPert.criticalPath().tasks();
            tasks.stroke("#ffab91");
        },
        showStats(){

            var deviation = this.chartPert.getStat("pertChartCriticalPathStandardDeviation");
            var duration = this.chartPert.getStat("pertChartProjectDuration");

            //Este 16 tiene que ser el tiempo de duración del proyecto
            var probabilityToEnd = (parseInt(this.projWeek)-duration)/deviation;

            // set the chart title to show the duration
            this.expectTime = "The duration equals " + duration+ " weeks";
            this.expectTime += "\n Standard deviation for this project is " + deviation.toFixed(2) + " weeks";
            this.expectTime += "\n  The probability to end the project on time is  " + probabilityToEnd.toFixed(2);

        },
        update_Lista_Informacion(){
             //Obtener los detalles de las tareas
             tasks = this.chartPert.tasks();
             position = 0;

             let flag = true

             this.chartPert.tasks().lowerLabels().format(function(e){
                console.log('update_Lista_Informacion', e);

                if(flag){
                    console.log(position,  app.activityList[position],  app.activityList[position].id)
                    app.lista_Informacion[position] = {
                        id: app.activityList[position].id,
                        name: e.name,
                        duration: e.duration,
                        earliestStart: e.earliestStart,
                        earliestFinish: e.earliestFinish,
                        latestStart: e.latestStart,
                        latestFinish: e.latestFinish,
                        isCritical: e.isCritical,
                        weekCost: app.activityList[position].weekCost
                    }
                    position++;
                }

                 flag = !flag;
             });


             console.log(this.lista_Informacion)

             //Ordenar la lista por orden alfabetico
             this.lista_Informacion.sort(function (a, b) {
                 if (a.earliestStart > b.earliestStart) {
                   return 1;
                 }
                 if (a.earliestStart < b.earliestStart) {
                   return -1;
                 }
                 // a must be equal to b
                 return 0;
               });
        },
        createGrantt(){


            if(this.chartGrantt != null){
                this.chartGrantt.dispose();
                this.chartGrantt=null;
            }

                this.updateChartData()
                // create a chart
                this.chartGrantt = anychart.bar();

                // create a range bar series and set the data
                var series = this.chartGrantt.rangeBar(this.dataChart);


                this.chartGrantt.tooltip().titleFormat("Actividad {%x}");
                this.chartGrantt.tooltip().format("Duración: {%duration} semanas"+
                                        "\nInicio: semana {%low}"+
                                        "\nFinal: semana {%high}"+
                                        "\n{%critical}");

                // set the chart title
                this.chartGrantt.title("Range Bar Chart: Basic Sample");

                // set the titles of the axes
                this.chartGrantt.xAxis().title("Task");
                this.chartGrantt.yAxis().title("Weeks");

                // set the container id
                this.chartGrantt.container("container2");
                    
                // initiate drawing the chart
                this.chartGrantt.draw();
        },
        updateChartData(){
            this.update_Lista_Informacion();

            for (let index = 0; index < this.lista_Informacion.length; index++) {

                this.dataChart[index] = {
                    x: this.lista_Informacion[index].name,
                    low: this.lista_Informacion[index].earliestStart,
                    high: this.lista_Informacion[index].earliestFinish,
                    normal: {
                        fill: (( this.lista_Informacion[index].isCritical) ? "#fa2050" : "#1ea8f7"),
                        stroke: null,
                        label: {enabled: true},
                    },
                    duration: this.lista_Informacion[index].duration,
                    critical:  (( this.lista_Informacion[index].isCritical) ? "Actividad Critica" : "No critica"),
                    value: this.lista_Informacion[index].weekCost*this.lista_Informacion[index].duration,
                    weekCost: this.lista_Informacion[index].weekCost,
                    duration: this.lista_Informacion[index].duration,
                }
            }
        },
        costChart(){

            if(this.chartCost != null){
                this.chartCost.dispose();
                this.chartCost=null;
            }
                this.updateChartData();

                // create a chart
                this.chartCost = anychart.column();

                // create a column series and set the data
                var series = this.chartCost.column(this.dataChart);

                this.chartCost.tooltip().titleFormat("Actividad {%x}");
                this.chartCost.tooltip().format("Costo Semanal: {%weekCost}"+
                                    "\nDuración: {%duration} semanas"+
                                    "\nTipo de actividad: {%critical}");

                // set the this.chartCost title
                this.chartCost.title("Costo total de las actividades");

                // set the titles of the axes
                this.chartCost.xAxis().title("Actividades");
                this.chartCost.yAxis().title("Costo");

                // set the container id
                this.chartCost.container("container3");

                // initiate drawing the this.chartCost
                this.chartCost.draw();
        },
        saveLocalStorage(){
            
            if (localStorage.report_List == null) {
                localStorage.report_List = JSON.stringify([])
            }

            let history = JSON.parse(localStorage.report_List)
            
            history.push( {
                activityList: this.activityList,
                project_Name: this.project_Name,
                projWeek: this.projWeek 
            })
            
            localStorage.report_List = JSON.stringify(history)
        },
        getActivityPositionById (id){
            for (let index = 0; index < this.activityList.length; index++) {
                let element = this.activityList[index];
                if(element.id == id){
                    return index
                }
            }
            return -1
        },
        getActivityById (id) {
            for (const activitie of this.activityList) {
                if(activitie.id == id){
                    return activitie
                }
            }
            return null
        },
        getNameById (id) {
            let act = this.getActivityById(id)
            if(act != null){
                return act.name
            }
            return null
        },
        deleteActivity (id) {

            console.log('id', id)
            let act = this.getActivityById(id)
            console.log('act', act)

            // if(act.hasOwnProperty('dependsOn') && act.dependsOn != null){
            //     for (let index = 0; index < act.dependsOn.length; index++) {
            //         let dependency = act.dependsOn[index]
            //         this.deleteActivity(dependency)
            //     }
            // }

            for (let index = 0; index < this.activityList.length; index++) {
                let activity = this.activityList[index]
                
                if(activity.hasOwnProperty('dependsOn') && activity.dependsOn != null){
                    let i = activity.dependsOn.indexOf(id)
                    console.log('id', id, 'index on array', i, 'activity.dependsOn', activity.dependsOn, activity.name, activity)
                    if(i > -1){ 
                        activity.dependsOn.splice(i, 1)
                    }
                }
            }

            let position = this.getActivityPositionById(id)
            this.activityList.splice(position, 1)
        },
        clear(){
            this.newName = ''
            this.newOp = ''
            this.newPes = ''
            this.newLike = ''
            this.currentDependencies = []
            this.pWeekCost = ''
        },
        getDependencyNames(dependecies = []){
            let list = []
            if(dependecies != null){
                for (let index = 0; index < dependecies.length; index++) {
                    const dependency = dependecies[index];
                    list.push(this.getNameById(dependency))
                }
            }
            return list
        }
    },
    computed: {
        nextId () {
            let list = this.activityList

            let acitivity = list[list.length - 1]

            let id =  (acitivity != null)?parseInt( acitivity.id ):-1

            if(id > 0){
                return id + 1
            }else{
                return list.length 
            }
        },
        dependencies () {
            let obj = {}
            for (let i = 0; i < this.activityList.length; i++) {
                let activitie = this.activityList[i]
                console.log('name', activitie.name)
               
                if(activitie.hasOwnProperty('dependsOn')){
                    if(activitie.dependsOn != null){
                        obj[activitie.id] = []

                        for (let j = 0; j < activitie.dependsOn.length; j++) {
                            let dependency = this.getNameById( activitie.dependsOn[j] )

                            obj[activitie.id].push(dependency)
                        }
                    }
                }
            }

            return obj
        }
    }
})