let app = new Vue({
    el: '#app',
    data: {


        activityList:[

        ],

        expectTime:'',
        expectDesv:'',
        lista_Informacion: [], //Lista que obtiene datos relevantes de las tareas
        pWeekCost:'',
        projWeek:0,
        dataChart:[],

        ///Para seleccionar una dependecia
        currentDependencies: [],
        
        //Chart Pert
        chartPert: null, 
        //Para el Diagrama GRANTT
        chartGrantt:null,

        //Para diagrama de barras
        chartCost:null,
        data_LocalStorage:[],
        report_Num:0,
        project_Name:'',
        durationTime: null,
        probabilityToEnd: null,
        cost_Total: null,

    },
    methods: {
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
            this.chartPert.title(`Diagrama PERT/CPM del proyecto ${this.project_Name}`);

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

            var project_Total = 0


            console.log('INGRESA', this.dataChart);
            for (let index = 0; index < this.dataChart.length; index++) {
                
                this.cost_Total  += this.dataChart[index].value
                
            }

            //Este 16 tiene que ser el tiempo de duración del proyecto
            var probabilityToEnd = (parseInt(this.projWeek)-duration)/deviation;

            // set the chart title to show the duration
            this.expectTime = `Fecha limite de entrega del proyecto ${this.projWeek} semanas.`
            this.durationTime = `Duración del proyecto ${duration} semanas.`
            this.probabilityToEnd = `La probabilidad de finalizar el proyecto en ${this.projWeek} 
            semanas es de ${(probabilityToEnd*100).toFixed(2)}%.`
            
        },
        update_Lista_Informacion(){
             //Obtener los detalles de las tareas
             tasks = this.chartPert.tasks();
             position = 0;

             let self = this
             let flag = true

             this.chartPert.tasks().lowerLabels().format(function(e){
                console.log('update_Lista_Informacion', e);

                if(flag){
                    self.lista_Informacion[position] = {
                        id: null,
                        name: e.name,
                        duration: e.duration,
                        earliestStart: e.earliestStart,
                        earliestFinish: e.earliestFinish,
                        latestStart: e.latestStart,
                        latestFinish: e.latestFinish,
                        isCritical: e.isCritical,
                        weekCost: null
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

            for (let index = 0; index < this.lista_Informacion.length; index++) {
                self.lista_Informacion[index].id = self.activityList[index].id
                self.lista_Informacion[index].weekCost = self.activityList[index].weekCost
            }
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
                this.chartGrantt.title(`Diagrama Grantt del proyecto ${this.project_Name}`);

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
                this.chartCost.title(`Costo por actividades ${this.project_Name}`);

                // set the titles of the axes
                this.chartCost.xAxis().title("Actividades");
                this.chartCost.yAxis().title("Costo");

                // set the container id
                this.chartCost.container("container3");

                // initiate drawing the this.chartCost
                this.chartCost.draw();
        },
        getNameById (id){
            for (const activitie of this.activityList) {
                if(activitie.id == id){
                    return activitie.name
                }
            }
            return ''
        }
    },
    computed: {
        dependencies () {
            let obj = {}
            for (let i = 0; i < this.activityList.length; i++) {
                let activitie = this.activityList[i]
               
                console.log('activitie', activitie, activitie.hasOwnProperty('dependsOn'))
                if(activitie.hasOwnProperty('dependsOn')){
                    if(activitie.dependsOn != null){
                        obj[activitie.id] = []

                        for (let j = 0; j < activitie.dependsOn.length; j++) {
                            let dependency = this.getNameById( activitie.dependsOn[j] )
                            console.log(dependency)

                            obj[activitie.id].push(dependency)
                        }
                    }
                }
            }

            return obj
        }
    },
    mounted (){
        let reports = JSON.parse(localStorage.report_List)
        let report = reports[reports.length - 1]
        this.project_Name = report.project_Name
        this.activityList = report.activityList
        this.projWeek = report.projWeek


        this.createPert()
        this.showCriticalPath()
        
        this.createGrantt()
        this.costChart()

        this.showStats()

        
        
    }
    
})