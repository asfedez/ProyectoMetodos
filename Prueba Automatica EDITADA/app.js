const app = new Vue({
    el: '#app',
    data: {

      
        activityList:[
            {id: "1", optimistic: 1, pessimistic: 3,  mostLikely: 2, name: "A", weekCost: 5000},
            {id: "2", optimistic: 2, pessimistic: 4,  mostLikely: 3, name: "B", weekCost: 20000},
            {id: "3", optimistic: 1, pessimistic: 3,  mostLikely: 2, name: "C", dependsOn: ["1"], weekCost: 15000},
            {id: "4", optimistic: 2, pessimistic: 6,  mostLikely: 4, name: "D", dependsOn: ["2"], weekCost: 8000},
            {id: "5", optimistic: 1, pessimistic: 7,  mostLikely: 4, name: "E", dependsOn: ["3"], weekCost: 35000},
            {id: "6", optimistic: 1, pessimistic: 9,  mostLikely: 2, name: "F", dependsOn: ["3"], weekCost: 50000},
            {id: "7", optimistic: 3, pessimistic: 11, mostLikely: 4, name: "G", dependsOn: [4, 5], weekCost: 28000},
            {id: "8", optimistic: 1, pessimistic: 3,  mostLikely: 2, name: "H", dependsOn: [6, 7], weekCost: 5000},
        ],

        indexList: null,
        newName:'',
        newOp:null,
        newPes:null,
        newLike:null,

        //poner id en 1
        list:[], //Lista Pert
        dependsOn: [],
        chart: null, //Chart Pert 
        expectTime:'',
        expectDesv:'',
        lista_Informacion: [], //Lista que obtiene datos relevantes de las tareas
        pWeekCost:'',
        projWeek:0,
        ///

        ///Para seleccionar una dependecia
        currentDependencies: [],
        selected_Depends0:'',
        selected_Depends1:'',
        dependencies_Options: [
            {text:'No', value:''}
        ],

        //Para el Diagrama GRANTT
        dataGrantt: [],
        chartGrantt:null,

        //Para diagrama de barras
        dataCost:[],
        chartCost:null
    },
    methods: {
        addActivity: function () {
            let activity = {
                id: this.lastIndex + 1,
                name: this.newName,
                optimistic: this.newOp,
                pessimistic: this.newPes,
                mostLikely: this.newLike,
                weekCost: this.pWeekCost
            }

            tempDependencies = this.currentDependencies

            if(tempDependencies.length != 0){
                activity.dependsOn = tempDependencies.map(e=>e)
            }

            this.activityList.push(activity)


            console.log(this.selected);
            
        },
        searchActivity(id){
            for (let index = 0; index < this.activityList.length; index++) {
                if(this.activityList[index].id==id){
                    this.newName=this.activityList[index].name
                    this.newOp=this.activityList[index].optimistic
                    this.newPes=this.activityList[index].pessimistic
                    this.newLike=this.activityList[index].mostLikely
                    this.dep0=this.activityList[index].dependsOn0
                    this.dep1=this.activityList[index].dependsOn1
                    this.pWeekCost=this.activityList[index].weekCost
                    this.indexList = index
                }
            }
            
        },
        editActivity(){
                   
                
            this.activityList[this.indexList].name=this.newName,
            this.activityList[this.indexList].optimistic= this.newOp,
            this.activityList[this.indexList].pessimistic= this.newPes,
            this.activityList[this.indexList].mostLikely= this.newLike,
            this.activityList[this.indexList].dependsOn0= this.selected_Depends0,
            this.activityList[this.indexList].dependsOn1= this.selected_Depends1,
            this.activityList[this.indexList].weekCost= this.pWeekCost
                    
            

        },
        createPert(){

            if(this.chart != null){
                this.chart.dispose();
                this.chart=null;
            }
            
            // create a chart
            this.chart = anychart.pert();
            
            // set chart data
            this.chart.data(this.activityList, "asTable");
            
            // set the title of the chart
            this.chart.title("PERT Chart");
            
            // set the container id for the chart
            this.chart.container("container");
            
            // initiate drawing the chart
            this.chart.draw();  
              
        },
        showCriticalPath(){
             // set critical path milestones colors
            milestones = this.chart.criticalPath().milestones();
            milestones.fill("#ffab91");
            milestones.hovered().fill("#ff6e40");
            milestones.selected().fill("#ff6e40");
            milestones.labels().fontColor("#86614e");
            // set critical tasks stroke
            tasks = this.chart.criticalPath().tasks();
            tasks.stroke("#ffab91");
        },
        showStats(){
            
            
            var deviation = this.chart.getStat("pertChartCriticalPathStandardDeviation");
            var duration = this.chart.getStat("pertChartProjectDuration");
            
            /*******
             * 
             * 
             * 
             * 
             * 
             * 
             * 
             * 
             * 
             */
            //Este 16 tiene que ser el tiempo de duración del proyecto
            var probabilityToEnd = (parseInt(this.projWeek)-duration)/deviation;

            // set the chart title to show the duration
            this.expectTime = "The duration equals " + duration+ " weeks";
            this.expectTime += "\n Standard deviation for this project is " + deviation.toFixed(2) + " weeks";
            this.expectTime += "\n  The probability to end the project on time is  " + probabilityToEnd.toFixed(2);


            // this.update_Lista_Informacion();
        },
        update_Lista_Informacion(){
             //Obtener los detalles de las tareas
             tasks = this.chart.tasks();
             position = 0;

             let bandera = true

             this.chart.tasks().lowerLabels().format(function(e){
                console.log('update_Lista_Informacion', e);
                
                if(bandera){
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
                
                 bandera = !bandera;
             });
             

             console.log(this.lista_Informacion)
 
             //Ordenar la lista por orden alfabetico
             this.lista_Informacion.sort(function (a, b) {
                 if (a.id > b.id) {
                   return 1;
                 }
                 if (a.id < b.id) {
                   return -1;
                 }
                 // a must be equal to b
                 return 0;
               });
        },
        createGrantt(){


            if(this.chartGrantt==null){
                this.updateGranttData()
                // create a chart
                this.chartGrantt = anychart.bar();
            
                // create a range bar series and set the data
                var series = this.chartGrantt.rangeBar(this.dataGrantt);
            

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
            }else{
                this.chartGrantt.dispose();

                this.chartGrantt=null;

                this.updateGranttData()

                // create a chart
                this.chartGrantt = anychart.bar();
            
                // create a range bar series and set the data
                var series = this.chartGrantt.rangeBar(this.dataGrantt);
            

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
            }  
        },
        updateGranttData(){
            this.update_Lista_Informacion();

            for (let index = 0; index < this.lista_Informacion.length; index++) {
                
                this.dataGrantt[index] = {
                    x: this.lista_Informacion[index].name, 
                    low: this.lista_Informacion[index].earliestStart,
                    high: this.lista_Informacion[index].earliestFinish,
                    normal: {
                        fill: (( this.lista_Informacion[index].isCritical) ? "#fa2050" : "#1ea8f7"),
                        stroke: null,
                        label: {enabled: true},
                    },
                    duration: this.lista_Informacion[index].duration,
                    critical:  (( this.lista_Informacion[index].isCritical) ? "Actividad Critica" : "No critica")
                }     
            }
        },
        costChart(){

            if(this.chartCost==null){
                this.updateCostData();

                // create a chart
                this.chartCost = anychart.column();

                // create a column series and set the data
                var series = this.chartCost.column(this.dataCost);

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
            }else{

                this.updateCostData();

                this.chartCost.dispose();

                this.chartCost=null;


                // create a chart
                this.chartCost = anychart.column();

                // create a column series and set the data
                var series = this.chartCost.column(this.dataCost);

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
                
            }
        

        },
        updateCostData(){
            this.update_Lista_Informacion()
            for (let index = 0; index < this.lista_Informacion.length; index++) {
                    
                this.dataCost[index] = {
                    x: this.lista_Informacion[index].name,
                    value: this.lista_Informacion[index].weekCost*this.lista_Informacion[index].duration,
                    normal: {
                        fill: (( this.lista_Informacion[index].isCritical) ? "#fa2050" : "#1ea8f7"),
                        stroke: null,
                        label: {enabled: true},
                    },
                    weekCost: this.lista_Informacion[index].weekCost,
                    duration: this.lista_Informacion[index].duration,
                    critical:  (( this.lista_Informacion[index].isCritical) ? "Critica" : "No critica")

                }
                
            }
        }

    },
    computed: {
        lastIndex () {
            let list = this.activityList
            let number = list[list.length -1].id
            if(parseInt(number)){
                return parseInt(number)
            }else{
                return list.length -1
            }
        }
    },
})






