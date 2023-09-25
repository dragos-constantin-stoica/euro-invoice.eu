Vue.component("payments", {
    data() {
        return {
            loading: true,
            company_data: null,
            invoice_data: null,
            company:null,
            newdata: {date: (new Date()).toISOString().substring(0, 10), type:'bank_transfer', amount:0.0, currency: 'EUR'},
            sortBy: 'INVOICE_NUMBER',
            sortDesc: false,
            isBusy: true,
            invoices:[],
            invoices_fields:[
              { key: 'INVOICE_NUMBER', label: 'No.', sortable: true },
              { key: 'INVOICE_DATE', label: 'Issued', sortable: true },
              { key: 'INVOICE_TOTAL', label: 'Total', sortable: true },
              'show_details'
            ],
            company_list: [
        		  { value: null, text: 'Please select an option' }
            ],
            currency_list: [
              { value: 'BGN', text: 'BGN' },
              { value: 'CZK', text: 'CZK' },
              { value: 'DKK', text: 'DKK' },
              { value: 'EUR', text: 'EUR' },
              { value: 'HUF', text: 'HUF' },
              { value: 'PLN', text: 'PLN' },
              { value: 'RON', text: 'RON' },
              { value: 'SKK', text: 'SKK' },
            ],
            type_list:[
              { value:'bank_transfer', text: 'Bank transfer'},
              { value: 'cash', text: 'Cash payment'},
              { value: 'credit_card', text: 'Credit card'}
            ],           
            show: true
        }
    },

    methods:{
      rowRG(item, type){
        if (!item || type != 'row') return
        if (item.STATUS == 'payed') return 'table-success'
        //Not fully payed and the invoice is due
        if (Date.parse(item.INVOICE_DUE_DATE) <= Date.now()) return 'table-danger'
      },
      registerPayment(item){
        console.log(item);
        this.newdata.currency=item.EXCHANGE_RATE.from
        this.newdata.amount = Number.parseFloat(this.newdata.amount)
        axios.post('/registerpayment',{
          company_id: this.company._id,
          invoice_number: item.INVOICE_NUMBER,
          payment: this.newdata
        })
             .then(response => {
              console.log(response.data);
              if(response.data.status == 'ok'){
                this.isBusy = true
                showToast(response.data.status == 'ok' ? response.data.message : response.data.error, 'Message from Server', response.data.status == 'ok' ? 'success' : 'error')
                //Update invoices
                this.invoice_data = response.data.dataset
                this.invoices = []
                this.invoice_data[this.company._id].forEach(element => {
                  this.invoices.push(element.payload)
                });
                this.newdata = {date: (new Date()).toISOString().substring(0, 10), type:'bank_transfer', amount:0.0, currency: 'EUR'}
                this.isBusy = false
              }
             })
      },
      displayPayments(item){
        return item.PAYMENTS.reduce((acc, crtitem) => acc + crtitem.amount, 0.0).toFixed(2)
      },
      displayPDF(item){
        let fulldata = this.invoice_data[this.company._id].find((elm) => elm.payload.INVOICE_NUMBER == item.INVOICE_NUMBER)
        let draft = fulldata.template
      	let tmp = Handlebars.compile(draft)
      	let PDF_DOC = JSON.parse(tmp(fulldata.payload))
      	pdfMake.createPdf(PDF_DOC).open();
      }
    },

    created() {

      const dataURLs = ['/companies', '/invoices']
      const getData = async () => {
        try {
          const [ companies, invoices ] = await Promise.all(dataURLs.map(url => axios.get(url).then(res => res.data))) 
          console.log(companies, invoices)
          if (companies.status == 'ok' && invoices.status == 'ok'){
            this.company_data = companies.dataset
            this.invoice_data = invoices.dataset

            this.company_list = this.company_data.map(item => {
              let tmp = {}
              tmp.value = item
              tmp.text = item.name
              return tmp
            })
            //we select by default the 1st company
            this.company = this.company_list[0].value

            //deal with the invoice data
            this.isBusy = true
            this.invoice_data[this.company._id].forEach(element => {
              this.invoices.push(element.payload)
            });

            this.loading = false
            this.isBusy = false
          }
        } catch (error) {
          console.log(error)
        }
      }
      getData()

    },

    template: `
    <div class="d-flex text-center justify-content-center m-3" v-if="loading">
        <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Payments" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">Manage invoices</h6>
      </template>  
      
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>  
      
      <b-table hover responsive :items="invoices" :fields="invoices_fields" :tbody-tr-class="rowRG" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :busy="isBusy" sort-icon-left>
      <template #cell(INVOICE_TOTAL)="row">
        {{ row.value.toFixed(2) }} {{row.item.EXCHANGE_RATE.from}}
      </template>
      <template #cell(show_details)="row">
        <b-button pill variant="warning" size="sm" @click="row.toggleDetails" class="mr-2">
          {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
        </b-button>
      </template>
      <template #row-details="row">
        <b-card>
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Invoice number:</b></b-col>
            <b-col>{{ row.item.INVOICE_NUMBER }}</b-col>
          </b-row>
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Status:</b></b-col>
            <b-col>{{ row.item.STATUS }}</b-col>
          </b-row>
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Issue date:</b></b-col>
            <b-col>{{ row.item.INVOICE_DATE }}</b-col>
          </b-row>
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Due date:</b></b-col>
            <b-col>{{ row.item.INVOICE_DUE_DATE }}</b-col>
          </b-row>
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Customer:</b></b-col>
            <b-col>{{ row.item.CUSTOMER.name }}</b-col>
          </b-row>           
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Total:</b></b-col>
            <b-col>{{ row.item.INVOICE_TOTAL.toFixed(2) }}</b-col>
          </b-row>  
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Payed:</b></b-col>
            <b-col>{{ displayPayments(row.item) }}</b-col>
          </b-row>
          <b-row>
          	<b-col>         
          		<b-button pill variant="warning" size="sm" @click="row.toggleDetails">Hide Details</b-button>
          	</b-col>
          	<b-col>
          		<b-button pill variant="info" size="sm" @click="displayPDF(row.item)">Show Invoice</b-button>
          	</b-col>
          </b-row>
        </b-card>
        <b-card v-if="row.item.STATUS!= 'payed'">
          <b-form-group :label='$t("payment.type")' label-for="payment_type" label-cols-sm="3">
            <b-form-select id="payment_type" v-model="newdata.type" :options="type_list"></b-form-select>
          </b-form-group>

          <b-form-group :label='$t("payment.date")' label-for="payment_date" label-cols-sm="3">
            <b-form-input id="payment_date" type="date" v-model="newdata.date"></b-form-input>
          </b-form-group>

          <b-form-group :label='$t("payment.amount")' label-for="payment_amount" label-cols-sm="3">
            <b-form-input id="payment_amount" v-model="newdata.amount" type="number"></b-form-input>
          </b-form-group>


          <b-form-group :label='$t("payment.currency")' label-for="payment_currency" label-cols-sm="3">
            <b-form-select id="payment_currency" v-model="row.item.EXCHANGE_RATE.from" :options="currency_list" disabled></b-form-select>
          </b-form-group>

          <b-button variant="success" size="sm" @click="registerPayment(row.item)">Register payment</b-button> 
        </b-card>
      </template>
      </b-table>

      <template #footer>
      Have a long and prosperous life!  
      </template>
    </b-card>
    </div>
	`
});
