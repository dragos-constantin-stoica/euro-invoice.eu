Vue.component("Invoices", {
    data() {
        return {
            loading: true,
            company:null,
            client: null,
            contract: null,
            newdata: { 
              issue_date: '', 
              due_date:'', 
              invoice_due_term: null, 
              currency: null, 
              exchange_rate:1, 
              payment_instructions: '',
              template: ''
            },
            newitem:{
              service_product:'',
              description: '',
              unit: '',
              quantity: 0,
              unit_price: 0,
              price: 0,
              vat: 0,
              total:0
            },
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
              { value: null, text: 'Please select an option' }
            ],
            template_list: [
              { value: null, text: 'Please select an option' }
            ],   
            invoice_fields: [ {key: 'service_product', label:'Item'}, 'price', 'total' ],    
            invoice_items:[
            ],      
            show: true
        }
    },

    methods:{
      addItem: function(){
        this.newitem.price = this.newitem.quantity * this.newitem.unit_price
        this.newitem.total = this.newitem.price * this.newitem.vat
        let tmp = this.newitem
        this.invoice_items.push(tmp)
        this.newitem = {
          service_product:'',
              description: '',
              unit: '',
              quantity: 0,
              unit_price: 0,
              price: 0,
              vat: 0,
              total:0
        }
      }
    },

    created() {
      axios.get('/companies')
      .then(response => {
        console.log(response.data)
        if (response.data.status = 'ok') {
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
          <b-form-input id="invoice_currency" v-model="newdata.currency"></b-form-input>
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
        <b-form-input v-model="newitem.vat"></b-form-input>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.total")}}</b-input-group-text>
         </template>
        <b-form-input v-model="newitem.total"></b-form-input>
        </b-input-group>

        <b-button variant="primary" @click="addItem">Add</b-button>
      </b-form-group>

      </b-card-text>

      
    </b-card>
    </div>
	`
});
