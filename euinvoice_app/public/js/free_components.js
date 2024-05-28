Vue.component("timesheet", {
    data: () => {
        return {
            date_value: (new Date()).toISOString(),
            mm_yyyy: `${(new Date()).toISOString().substring(5, 7)}-${(new Date()).toISOString().substring(0, 4)}`,
            consultant: '',
            shark: '',
            client: '',
            client_contact: '',
            fields: ["label", "hours", "type", "show_details"],
            calendar: [],
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
                    type: (label_tmp.indexOf("Sat") != -1 || label_tmp.indexOf("Sun") != -1) ? 'Weekend' : 'Work day'
                })
            }
        },

        rowClass(item, type) {
            if (!item || type !== 'row') return
            if (item.label.indexOf("Sat") != -1 || item.label.indexOf("Sun") != -1) return 'table-success'
        },

        exportToExcel() {
            /* generate worksheet and workbook */
            const worksheet = XLSX.utils.json_to_sheet(this.calendar);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Month");
            /* fix headers */
            XLSX.utils.sheet_add_aoa(worksheet, [["Name", "Birthday"]], { origin: "A1" });

            let row = [
                { v: "Courier: 24", t: "s", s: { font: { name: "Courier", sz: 24 } } },
                { v: "bold & color", t: "s", s: { font: { bold: true, color: { rgb: "FF0000" } } } },
                { v: "fill: color", t: "s", s: { fill: { fgColor: { rgb: "E9E9E9" } } } },
                { v: "line\nbreak", t: "s", s: { alignment: { wrapText: true } } },
            ];
            
            // STEP 3: Create worksheet with rows; Add worksheet to workbook
            XLSX.utils.sheet_add_aoa(worksheet, [row]);

            /* calculate column width */
            const max_width = this.calendar.reduce((w, r) => Math.max(w, r.type.length), 10);
            worksheet["!cols"] = [ { wch: max_width } ];

            /* create an XLSX file and try to save to Presidents.xlsx */
            XLSX.writeFile(workbook, "Timesheet.xlsx", { compression: true });
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
                type: (label_tmp.indexOf("Sat") != -1 || label_tmp.indexOf("Sun") != -1) ? 'Weekend' : 'Work day'
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
    

        <b-form-group id="fs-month" label-cols-sm="4" label-cols-lg="3" content-cols-sm content-cols-lg="7" label="Month" label-for="input-month">
        <b-form-input id="input-month" v-model="mm_yyyy.substring(0,2)"></b-form-input>
        </b-form-group>
        <b-form-group id="fs-year" label-cols-sm="4" label-cols-lg="3" content-cols-sm content-cols-lg="7" label="Year" label-for="input-year">
        <b-form-input id="input-year" v-model="mm_yyyy.substring(3,7)"></b-form-input>
        </b-form-group>

        <b-form-group id="fs-consultant" label-cols-sm="4" label-cols-lg="3" content-cols-sm content-cols-lg="7" label="Consultant" label-for="input-consultant">
        <b-form-input id="input-consultant" v-model="consultant"></b-form-input>
        </b-form-group>
        <b-form-group id="fs-main" label-cols-sm="4" label-cols-lg="3" content-cols-sm content-cols-lg="7" label="Intermediary Company" label-for="input-main">
        <b-form-input id="input-main" v-model="shark"></b-form-input>
        </b-form-group>
        <b-form-group id="fs-client" label-cols-sm="4" label-cols-lg="3" content-cols-sm content-cols-lg="7" label="Final Client" label-for="input-client">
        <b-form-input id="input-client" v-model="client"></b-form-input>
        </b-form-group>
        <b-form-group id="fs-contact" label-cols-sm="4" label-cols-lg="3" content-cols-sm content-cols-lg="7" label="Client Contact" label-for="input-contact">
        <b-form-input id="input-contact" v-model="client_contact"></b-form-input>
        </b-form-group>        

        <b-table :items="calendar" :fields="fields" :tbody-tr-class="rowClass">
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
                    <b-col sm="3" class="text-sm-right"><b>Type of time log:</b></b-col>
                    <b-col>{{ row.item.type }}</b-col>
                </b-row>

                <b-button size="sm" @click="row.toggleDetails">Hide Details</b-button>
                </b-card>
            </template>
        </b-table>


      <template #footer>
      <b-button variant="success" @click="exportToExcel">Export to Excel</b-button>

        <h6 class="mb-0">Export to PDF</h6>
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