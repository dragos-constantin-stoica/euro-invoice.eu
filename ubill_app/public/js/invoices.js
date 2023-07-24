Vue.component("Invoices", {
    data() {
        return {
            loading: true,
            company:null,
            client: null,
            contract: null,
            newdata: { 
              issue_date: (new Date()).toISOString().substring(0,10), 
              due_date: '', 
              invoice_due_term: 1, 
              currency: 'EUR', 
              exchange_rate:1, 
              payment_instructions: '',
              template: ''
            },
            newitem:{
              service_product:'',
              description: '',
              unit: '',
              quantity: 1,
              unit_price: 0,
              price: 0,
              vat: 0,
              total:0
            },
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
            vat_list: [
              { value: 0.0, text: '0%' },
              { value: 2.1, text: '2.1%' },
              { value: 3.0, text: '3%' },
              { value: 4.0, text: '4%' },
              { value: 4.8, text: '4.8%' },
              { value: 5.0, text: '5%' },
              { value: 5.5, text: '5.5%' },
              { value: 6.0, text: '6%' },
              { value: 7.0, text: '7%' },
              { value: 8.0, text: '8%' },
              { value: 9.0, text: '9%' },
              { value: 9.5, text: '9.5%' },
              { value: 10.0, text: '10%' },
              { value: 12.0, text: '12%' },
              { value: 13.0, text: '13%' },
              { value: 13.5, text: '13.5%' },
              { value: 14.0, text: '14%' },
              { value: 15.0, text: '15%' },
              { value: 16.0, text: '16%' },
              { value: 17.0, text: '17%' },
              { value: 18.0, text: '18%' },
              { value: 19.0, text: '19%' },
              { value: 20.0, text: '20%' },
              { value: 21.0, text: '21%' },
              { value: 22.0, text: '22%' },
              { value: 23.0, text: '23%' },
              { value: 24.0, text: '24%' },
              { value: 25.0, text: '25%' },
              { value: 27.0, text: '27%' },
            ],
            company_list: [
        		{ value: null, text: 'Please select an option' }
             ],
            client_list: [
              { value: null, text: 'Please select an option' }
            ],
            contract_list: [
              { value: null, text: 'Please select an option' }
            ],  
            invoice_due_term_list: [
              { value:30, text:'30 days' },
              { value:45, text:'45 days' },
              { value:60, text:'60 days' },
              { value:90, text:'90 days' },
              { value:1, text:'Other' },
            ],
            template_list: [
              { value: null, text: 'Please select an option' }
            ],   
            invoice_fields: [ {key: 'service_product', label:'Item'}, 'price', 'total' ],    
            invoice_items:[ ],      
            show: true
        }
    },

    methods:{
      addItem: function(){
        this.newitem.price = Number.parseFloat(this.newitem.quantity * this.newitem.unit_price).toFixed(2)
        this.newitem.total = Number.parseFloat(this.newitem.price * (1.00 + this.newitem.vat/100.00)).toFixed(2)
        let tmp = this.newitem
        this.invoice_items.push(tmp)
        this.newitem = {
          service_product:'',
              description: '',
              unit: '',
              quantity: 1,
              unit_price: 0,
              price: 0,
              vat: 0,
              total:0
        }
      }
    },

    computed: {
      lineTotal() {
        return Number.parseFloat(this.newitem.quantity * this.newitem.unit_price * (1.00 + this.newitem.vat / 100.00)).toFixed(2)
      }
    },

    created() {
      axios.get('/companies')
      .then(response => {
        console.log(response.data)
        if (response.data.status == 'ok') {
          this.company_list = response.data.dataset.map(item => {
            let tmp = {}
            tmp.value = item
            tmp.text = item.name
            return tmp
          })
          //we select by default the 1st company
          this.company = this.company_list[0].value
          this.company.invoice_number = 0
          this.loading = false
        }
      })
    },

    template: `
    <div class="d-flex justify-content-center mb-3" v-if="loading">
          <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Invoices" sub-title="Create new invoice">
      <b-card-text>
        <b-form-group :label='$t("invoices.company")' label-for="company" label-cols-sm="3">
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
        </b-form-group>
        
        <b-form-group :label='$t("invoices.client")' label-for="client" label-cols-sm="3">
        <b-form-select id="client" v-model="client" :options="client_list"></b-form-select>
        <b-form-text id="client-help">Select one of the Clients from the list.</b-form-text>
        </b-form-group>

        <b-form-group :label='$t("invoices.contract")' label-for="contract" label-cols-sm="3">
        <b-form-select id="contract" v-model="contract" :options="contract_list"></b-form-select>
        <b-form-text id="contract-help">Select one of the Contracts from the list.</b-form-text>
        </b-form-group>        

        <b-form-group :label='$t("invoices.serial_number")' label-for="invoice_number" label-cols-sm="3">
          <b-form-input id="invoice_number" v-model="company.invoice_number" plaintext="true"></b-form-input>
        </b-form-group>
            
        <b-form-group :label='$t("invoices.issue_date")' label-for="invoice_issue_date" label-cols-sm="3">
          <b-form-input id="invoice_issue_date" type="date" v-model="newdata.issue_date"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("invoices.due_term")' label-for="invoice_due_date" label-cols-sm="3">
        <b-form-select id="invoice_due_term" v-model="newdata.invoice_due_term" :options="invoice_due_term_list"></b-form-select>
        <b-form-text id="invoice_due_term-help">Select one of the Invoice due terms from the list.</b-form-text>
        </b-form-group>
        
        <b-form-group :label='$t("invoices.due_date")' label-for="invoice_due_date" label-cols-sm="3">
          <b-form-input id="invoice_due_date" type="date" v-model="newdata.due_date"></b-form-input>
        </b-form-group>
      
        <b-form-group :label='$t("invoices.currency")' label-for="invoice_currency" label-cols-sm="3">
          <b-form-select id="invoice_currency" v-model="newdata.currency" :options="currency_list"></b-form-select>
        </b-form-group>

        <b-form-group :label='$t("invoices.exchange_rate")' label-for="invoice_exchange_rate" label-cols-sm="3">
          <b-form-input id="invoice_exchange_rate" v-model="newdata.exchange_rate"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("invoices.template")' label-for="template" label-cols-sm="3">
        <b-form-select id="template" v-model="newdata.template" :options="template_list"></b-form-select>
        <b-form-text id="template-help">Select one Template from the list.</b-form-text>
        </b-form-group>  
        
        <b-form-group :label='$t("invoices.payment_instructions")' label-cols-sm="3">
        <b-form-textarea v-model="newdata.payment_instructions" rows="5" max-rows="7"></b-form-textarea>
        </b-form-group>

        <div>
          <b-table responsive :items="invoice_items" :fields="invoice_fields" caption-top>
          <template #table-caption>Invoice items</template>
          </b-table>
        </div>

        <b-form-group :label='$t("invoices.newitem")' label-for="newitem" label-cols-sm="3">
        <b-input-group>
         <template #prepend>
         <b-input-group-text >{{$t("invoices.item")}}</b-input-group-text>
         </template>
        <b-form-input v-model="newitem.service_product"></b-form-input>  
        </b-input-group>
        <b-input-group> 
        <template #prepend>
         <b-input-group-text >{{$t("invoices.description")}}</b-input-group-text>
         </template>
        <b-form-input v-model="newitem.description"></b-form-input>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.unit")}}</b-input-group-text>
         </template> 
        <b-form-input v-model="newitem.unit"></b-form-input>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.quantity")}}</b-input-group-text>
         </template>
        <b-form-input v-model="newitem.quantity"></b-form-input>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.unit_price")}}</b-input-group-text>
         </template>
        <b-form-input v-model="newitem.unit_price"></b-form-input>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.vat")}}</b-input-group-text>
         </template>
        <b-form-select v-model="newitem.vat" :options="vat_list"></b-form-select>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.total")}}</b-input-group-text>
         </template>
        <b-form-input v-model="lineTotal" plaintext='true'></b-form-input>
        </b-input-group>

        <b-button variant="primary" @click="addItem">Add</b-button>
      </b-form-group>

      </b-card-text>

      
    </b-card>
    </div>
	`
});
