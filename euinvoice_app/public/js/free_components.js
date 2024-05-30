Vue.component("timesheet", {
    data: () => {
        return {
            date_value: (new Date()).toISOString(),
            mm_yyyy: `${(new Date()).toISOString().substring(5, 7)}-${(new Date()).toISOString().substring(0, 4)}`,
            consultant: '',
            shark: '',
            client: '',
            client_contact: '',
            fields: [{key:"label", label:"Date"}, "hours", "type", "comments", "show_details"],
            calendar: [],
            type_opt:[
                {value:'Work', text:'Work day'},
                {value:'Holiday', text:'Holyday'},
                {value:'Sick', text:'Sick leave'},
                {value: 'Weekend', text: 'Weekend'}

            ],
            show: true
        }
    },

    methods: {
        onContext(ctx) {
            //console.log(ctx)
            // The date formatted in the locale, or the `label-no-date-selected` string
            // The following will be an empty string until a valid date is entered
            this.mm_yyyy = `${ctx.selectedYMD.substring(5, 7)}-${ctx.selectedYMD.substring(0, 4)}`

            //create the calendar
            var tmp_dm = new Date(this.date_value)
            // Add a month and set to last day of previous
            // i.e. set to last day of current month
            tmp_dm.setMonth(tmp_dm.getMonth() + 1, 0)
            this.calendar = []

            for (let index = 1; index <= tmp_dm.getDate(); index++) {
                let tmp = new Date(this.date_value)
                tmp.setDate(index)
                label_tmp = tmp.toLocaleDateString("en-US", { weekday: "short", day: "2-digit" })
                this.calendar.push({
                    date: tmp.toISOString(),
                    label: label_tmp,
                    hours: (label_tmp.indexOf("Sat") != -1 || label_tmp.indexOf("Sun") != -1) ? 0 : 8,
                    type: (label_tmp.indexOf("Sat") != -1 || label_tmp.indexOf("Sun") != -1) ? 'Weekend' : 'Work',
                    comments: ''
                })
            }
        },

        rowClass(item, type) {
            if (!item || type !== 'row') return
            if (item.label.indexOf("Sat") != -1 || item.label.indexOf("Sun") != -1) return 'table-success'
        },

        updateCalendar(item){
            //console.log(item);


        },

        exportToExcel() {
            const BORDER_ALL = {border: {top:{style:'thin'}, right:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}}} 
            let main_header = [
                { v: "Month", t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" }} }},
                { v: "Employee", t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" } } } },
                { v: "Intermediary", t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" } } } },
                { v: "Client", t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" } } } },
                { v: "Contact", t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" } } } }
            ],
            calendar_header = [
                { v: "Date", t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" }} }},
                { v: "Worked hours", t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" } } } },
                { v: "Holidays", t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" } } } },
                { v: "Sick leave", t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" } } } },
                { v: "Comments", t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" } } } }
            ];
            /* generate worksheet and workbook */
            const worksheet = XLSX.utils.aoa_to_sheet([main_header]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, `Month - ${this.mm_yyyy}`);
            /* header information */
            let row = [
                { v: this.mm_yyyy, t: "s", s: { ...BORDER_ALL }},
                { v: this.consultant, t: "s", s: { ...BORDER_ALL }},
                { v: this.shark, t: "s", s: { ...BORDER_ALL }},
                { v: this.client, t: "s", s: { ...BORDER_ALL }},
                { v: this.client_contact, t: "s", s: { ...BORDER_ALL }},
            ]
            XLSX.utils.sheet_add_aoa(worksheet, [row], {origin: "A2"});

            XLSX.utils.sheet_add_aoa(worksheet, [calendar_header], {origin: "A5"});

            let tmp =[], date_opt = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }

            this.calendar.map( elm =>{
                if(elm.type=='Weekend'){
                    tmp.push([
                        { v: (new Date(elm.date)).toLocaleDateString('de-DE', date_opt), t: "s", s: { ...BORDER_ALL,fill: { fgColor: { rgb: "DADADA" }} }},
                        { v: 0, t: "s", s: { ...BORDER_ALL,fill: { fgColor: { rgb: "DADADA" }} }},
                        { v: 0, t: "s", s: { ...BORDER_ALL,fill: { fgColor: { rgb: "DADADA" }} }},
                        { v: 0, t: "s", s: { ...BORDER_ALL,fill: { fgColor: { rgb: "DADADA" }} }},
                        { v: elm.comments, t: "s", s: { ...BORDER_ALL,fill: { fgColor: { rgb: "DADADA" }} }},
                    ])
                }else{
                    tmp.push([
                        { v: (new Date(elm.date)).toLocaleDateString('de-DE', date_opt), t: "s", s: { ...BORDER_ALL }},
                        { v: elm.type=="Work"?elm.hours:0, t: "s", s: { ...BORDER_ALL }},
                        { v: elm.type=="Holiday"?elm.hours:0, t: "s", s: { ...BORDER_ALL }},
                        { v: elm.type=="Sick"?elm.hours:0, t: "s", s: { ...BORDER_ALL }},
                        { v: elm.comments, t: "s", s: { ...BORDER_ALL }},
                    ])
                }
            })
            XLSX.utils.sheet_add_aoa(worksheet, tmp, {origin: "A6"});

            let total_hours = this.calendar.reduce((acc, crt) => {
                acc[crt.type] += crt.hours
                return acc
            }, 
                {'Work': 0, 'Holiday':0 , 'Sick':0, 'Weekend': 0} 
            )

            //Total rows
            row = [
                [
                { v: 'Total Hours', t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" }}  }},
                { v: total_hours['Work'], t: "s", s: { ...BORDER_ALL }},
                { v: total_hours['Holiday'], t: "s", s: { ...BORDER_ALL }},
                { v: total_hours['Sick'], t: "s", s: { ...BORDER_ALL }},
            ],
            [
                { v: 'Total Days', t: "s", s: { ...BORDER_ALL, font: { bold: true }, fill: { fgColor: { rgb: "B8D9F1" }}  }},
                { v: total_hours['Work']/8, t: "s", s: { ...BORDER_ALL }},
                { v: total_hours['Holiday']/8, t: "s", s: { ...BORDER_ALL }},
                { v: total_hours['Sick']/8, t: "s", s: { ...BORDER_ALL }},
            ],
            ]

            XLSX.utils.sheet_add_aoa(worksheet, row, {origin: `A${this.calendar.length+8}`});


            /* calculate column width */
            worksheet['!cols'] = [
                { width: 12 }, 
                { width: 14 }, 
                { width: 14 }, 
                { width: 14 }, 
                { width: 25 }, 
            ];

            /* create an XLSX file and try to save to Presidents.xlsx */
            if(!workbook.Custprops) workbook.Custprops = {};
            workbook.Custprops["URL"] = "https://euro-invoice.eu/freetimesheet";
            XLSX.writeFile(workbook, "Timesheet.xlsx", 
            { 
                compression: true,
                Props: {
                    Author: 'eInvoice',
                    Title: 'Timesheet',
                    Subject: 'Free Timesheet generated by eInvoice',
                    Company: 'euro-invoice',
                    Category: 'Backoffice Management',
                    Keywords: 'timesheet, Euro Invoice, digitalization, AI, bigdata',
                    Comments: 'Timesheet generated with https://euro-invoice.eu/freetimesheet',
                    CreatedDate: (new Date()).toISOString()
                } 
            });
        }
    },

    created() {
        //Fill in the calendar with the current month data
        var tmp_dm = new Date(this.date_value)
        // Add a month and set to last day of previous
        // i.e. set to last day of current month
        tmp_dm.setMonth(tmp_dm.getMonth() + 1, 0)
        this.calendar = []

        for (let index = 1; index <= tmp_dm.getDate(); index++) {
            let tmp = new Date(this.date_value)
            tmp.setDate(index)
            label_tmp = tmp.toLocaleDateString("en-US", { weekday: "short", day: "2-digit" })
            this.calendar.push({
                date: tmp.toISOString(),
                label: label_tmp,
                hours: (label_tmp.indexOf("Sat") != -1 || label_tmp.indexOf("Sun") != -1) ? 0 : 8,
                type: (label_tmp.indexOf("Sat") != -1 || label_tmp.indexOf("Sun") != -1) ? 'Weekend' : 'Work',
                comments:''
            })
        }
    },

    template: `
    <div>
    <b-card title="Free Timesheet" header-tag="header" footer-tag="footer">
	  <template #header>
        <h6 class="mb-0">Fill in your timesheet</h6>
      </template>    

        <label for="date-input">Choose a date</label>
        <b-input-group class="mb-3">
        <b-form-input id="date-input" v-model="mm_yyyy" type="text" placeholder="MM-YYYY" autocomplete="off"></b-form-input>
        <b-input-group-append>
            <b-form-datepicker v-model="date_value" button-only right locale="en-US" aria-controls="date-input" @context="onContext"></b-form-datepicker>
        </b-input-group-append>
        </b-input-group>
    
        <b-form-group id="fs-consultant" label-cols="4" content-cols="8" label="Consultant's Full Name" label-for="input-consultant">
        <b-form-input id="input-consultant" v-model="consultant"></b-form-input>
        </b-form-group>
        <b-form-group id="fs-main"  label-cols="4" content-cols="8"  label="Intermediary Company" label-for="input-main">
        <b-form-input id="input-main" v-model="shark"></b-form-input>
        </b-form-group>
        <b-form-group id="fs-client"  label-cols="4" content-cols="8"  label="Final Client" label-for="input-client">
        <b-form-input id="input-client" v-model="client"></b-form-input>
        </b-form-group>
        <b-form-group id="fs-contact"  label-cols="4" content-cols="8"  label="Final Client Contact" label-for="input-contact">
        <b-form-input id="input-contact" v-model="client_contact"></b-form-input>
        </b-form-group>        

        <b-table fixed responsive :items="calendar" :fields="fields" :tbody-tr-class="rowClass">
            <template #cell(show_details)="row">
                <b-button size="sm" @click="row.toggleDetails" class="mr-2">{{ row.detailsShowing ? 'Hide' : 'Show'}} Details</b-button>
            </template>
        

            <template #row-details="row">
                <b-card>
                <b-row class="mb-2">
                    <b-col sm="3" class="text-sm-right"><b>Hours:</b></b-col>
                    <b-col>{{ row.item.hours }}</b-col>
                </b-row>

                <b-row class="mb-2">
                    <b-col sm="3" class="text-sm-right"><b>Type of time logged:</b></b-col>
                    <b-col><b-form-select v-model="row.item.type" :options="type_opt"></b-form-select></b-col>
                </b-row>

                <b-row class="mb-2">
                    <b-col sm="3" class="text-sm-right"><b>Comments:</b></b-col>
                    <b-col><b-form-input id="input-comments" v-model="row.item.comments"></b-form-input></b-col>
                </b-row>

                <b-row>
                    <b-col sm="6" class="text-sm-left">
                        <b-button size="sm" @click="row.toggleDetails">Hide Details</b-button>
                    </b-col>
                </b-row>
                </b-card>
            </template>
        </b-table>


      <template #footer>
      <b-button variant="success" @click="exportToExcel">Export to Excel</b-button>
        <!-- <h6 class="mb-0">Export to PDF</h6> -->
      </template>
    </b-card>
    </div>
    `
})


Vue.component("invoice", {
    data: function () {
        return {
            show: true
        }
    },

    template: `
    <div>
    <b-card title="Free eInvoice" header-tag="header" footer-tag="footer">
	  <template #header>
        <h6 class="mb-0">Fill in your eInvoice</h6>
      </template>    
    
        <template #footer>
        <h6 class="mb-0">Export to XML | Export to PDF</h6>
        </template>
    </b-card>
    </div>
    `

})