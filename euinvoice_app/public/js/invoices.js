Vue.component("invoices", {
  data() {
    return {
      loading: true,
      company_data: null,
      client_data: null,
      contract_data: null,
      serialnumber_data: null,
      serviceproduct_data: null,
      company: null,
      client: null,
      contract: null,
      serviceproduct: null,
      newdata: {
        issue_date: (new Date()).toISOString().substring(0, 10),
        due_date: new Date((new Date()).setDate(new Date().getDate() + 1)).toISOString().substring(0,10),
        invoice_due_term: 1,
        currency: 'EUR',
        exchange_rate: 1,
        convert_to: 'EUR',
        payment_instructions: '',
        template: 'EN'
      },
      newitem: {
        service_product: '',
        description: '',
        unit: '',
        quantity: 1,
        unit_price: 0,
        vat: 0
      },
      currency_list: CURRENCY_LIST,
      vat_list: [
        { value: null, text: 'Please select an option' }
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
      serviceproduct_list: [
        { value: null, text: 'Please select an option' }
      ],
      invoice_due_term_list: [
        { value: 30, text: '30 days' },
        { value: 45, text: '45 days' },
        { value: 60, text: '60 days' },
        { value: 90, text: '90 days' },
        { value: 1, text: 'Other' },
      ],
      template_list: [
        { value: 'EN', text: 'English Template' },
        { value: 'RO', text: 'Romanian Template' },
        { value: 'FR', text: 'French Template' }
      ],
      invoice_fields: [
        { key: 'service_product', label: 'Item' }, 
        { key: 'price', label: 'Value' }, 
        { key: 'vat', label: 'VAT %' },
        { key: 'vat_to_pay', label: 'VAT Value'},
        { key: 'final_price', label:'Value with VAT'}
      ],
      invoice_items: [],
      show: true
    }
  },

  methods: {
    
    addItem: function () {
      let tmp = this.newitem
      tmp.unit_price = Number.parseFloat(tmp.unit_price)
      tmp.quantity = Number.parseFloat(tmp.quantity)
      this.invoice_items.push(tmp)
      this.newitem = {
        service_product: this.serviceproduct.name,
        description: '',
        unit: this.serviceproduct.unit,
        quantity: 1,
        unit_price: this.serviceproduct.unit_price,
        vat: this.serviceproduct.vat
      }
    },

    selectDueTerm(event) {
      this.newdata.due_date = new Date((new Date()).setDate(new Date(this.newdata.issue_date).getDate() + event)).toISOString().substring(0,10)
    },

    selectIssueDate(event){
      this.newdata.due_date = new Date((new Date()).setDate(new Date(event).getDate() + this.newdata.invoice_due_term)).toISOString().substring(0,10)
      this.newdata.payment_instructions = getCS(new Date(event), this.serialnumber_data[this.company._id][this.company.invoice_format].toString())
    },

    selectServiceProduct(event){
      this.newitem = {
        service_product: this.serviceproduct.name,
        description: '',
        unit: this.serviceproduct.unit,
        quantity: 1,
        unit_price: this.serviceproduct.unit_price,
        vat: this.serviceproduct.vat
      }
    },

    createInvoice: function(){
      let draft = templates[this.newdata.template]
      //handle the new invoice number on server side
      let payload = {
        DRAFT: false,
        STATUS: 'new',
        INVOICE_NUMBER: "YYYY.MM/##",
        INVOICE_FORMAT: this.company.invoice_format,
        INVOICE_DETAILS: this.newdata.payment_instructions,
        INVOICE_DATE: this.newdata.issue_date,
        INVOICE_DUE_DATE: this.newdata.due_date,
        INVOICE_DUE_TERM: this.invoice_due_term_list.find(({value})=> value === this.newdata.invoice_due_term).text || "See Due Date",
        VAT: this.invoice_items[0].vat,
        SUPPLIER: {
          name: this.company.name,
          NRNo: this.company.national_registration_number,
          vat: this.company.vat,
          address: this.company.address[0],
          bank_name: this.company.bank_accounts[0].bank_name,
          bank_iban: this.company.bank_accounts[0].iban,
          bank_swift: this.company.bank_accounts[0].swift,
          bank_bic: this.company.bank_accounts[0].bic,
          mobile: this.company.mobile,
          contact: this.company.email
        },
        CUSTOMER: {
          name: this.client.name,
          NRNo: this.client.national_registration_number,
          vat: this.client.vat,
          address: this.client.address[0],
          bank_name: this.client.bank_accounts[0].bank_name,
          bank_iban: this.client.bank_accounts[0].iban,
          bank_swift: this.client.bank_accounts[0].swift,
          bank_bic: this.client.bank_accounts[0].bic,
          contact: this.client.email,
          mobile: this.client.mobile
        },
        EXCHANGE_RATE: {
          from: this.newdata.currency,
          to: this.newdata.convert_to,
          conversion_rate: this.newdata.exchange_rate
        },
        INVOICE_LINE: this.invoice_items,
        INVOICE_SUM: this.invoice_items.reduce((acc, crtv)=>acc + crtv.unit_price*crtv.quantity, 0),
        INVOICE_VAT_SUM: this.invoice_items.reduce((acc, crtv)=>acc + crtv.quantity*crtv.unit_price*crtv.vat/100.0, 0),
        INVOICE_TOTAL: this.invoice_items.reduce((acc, crtv)=> acc + (1.0 + crtv.vat/100.0)*crtv.quantity*crtv.unit_price, 0),
        PAYMENTS: []
      }
      //console.log(payload);
      let invoice_doc = {
        payload: payload,
        template: draft,
        company_id: this.company._id,
        invoice_format: this.company.invoice_format
      }
      //Push data to server and create new invoice number
      
      axios.post('/newinvoice', invoice_doc)
           .then(response =>{
          console.log(response.data)
	        if (response.data.status = 'ok') {
            showToast(response.data.status == 'ok' ? response.data.message : response.data.error, 'Message from Server', response.data.status == 'ok' ? 'success' : 'error')
            this.serialnumber_data = response.data.dataset.serialnumbers
            this.company.invoice_number = this.company.invoice_format.replace('YYYY', (new Date(this.newdata.issue_date)).getUTCFullYear()) 
                                        .replace('MM', ((new Date(this.newdata.issue_date)).getUTCMonth() + 1).toString().padStart(2, '0'))
                                        .replace('XX',this.serialnumber_data[this.company._id][this.company.invoice_format].toString().padStart(2,'0'));
            this.newdata.payment_instructions = getCS(new Date(this.newdata.issue_date), this.serialnumber_data[this.company._id][this.company.invoice_format].toString())                
            this.invoice_items = []
          }
      })
      
    },

    generatePDF: function () {
      let draft = templates[this.newdata.template]
      let tmp = Handlebars.compile(draft)
      //Compile the full object with corresponding data
      this.newdata.payment_instructions = getCS(new Date(this.newdata.issue_date), this.serialnumber_data[this.company._id][this.company.invoice_format].toString())
      let payload = {
        DRAFT: true,
        INVOICE_NUMBER: this.company.invoice_number,
        INVOICE_DETAILS: this.newdata.payment_instructions,
        INVOICE_DATE: this.newdata.issue_date,
        INVOICE_DUE_DATE: this.newdata.due_date,
        INVOICE_DUE_TERM: this.invoice_due_term_list.find(({value})=> value === this.newdata.invoice_due_term).text || "See Due Date",
        VAT: this.invoice_items[0].vat,
        SUPPLIER: {
          name: this.company.name,
          NRNo: this.company.national_registration_number,
          vat: this.company.vat,
          address: this.company.address[0],
          bank_name: this.company.bank_accounts[0].bank_name,
          bank_iban: this.company.bank_accounts[0].iban,
          bank_swift: this.company.bank_accounts[0].swift,
          bank_bic: this.company.bank_accounts[0].bic,
          mobile: this.company.mobile,
          contact: this.company.email
        },
        CUSTOMER: {
          name: this.client.name,
          NRNo: this.client.national_registration_number,
          vat: this.client.vat,
          address: this.client.address[0],
          bank_name: this.client.bank_accounts[0].bank_name,
          bank_iban: this.client.bank_accounts[0].iban,
          bank_swift: this.client.bank_accounts[0].swift,
          bank_bic: this.client.bank_accounts[0].bic,
          contact: this.client.email,
          mobile: this.client.mobile
        },
        EXCHANGE_RATE: {
          from: this.newdata.currency,
          to: this.newdata.convert_to,
          conversion_rate: this.newdata.exchange_rate
        },
        INVOICE_LINE: this.invoice_items,
        INVOICE_SUM: this.invoice_items.reduce((acc, crtv)=>acc + crtv.unit_price*crtv.quantity, 0),
        INVOICE_VAT_SUM: this.invoice_items.reduce((acc, crtv)=>acc + crtv.quantity*crtv.unit_price*crtv.vat/100.0, 0),
        INVOICE_TOTAL: this.invoice_items.reduce((acc, crtv)=> acc + (1.0 + crtv.vat/100.0)*crtv.quantity*crtv.unit_price, 0)
      }
      //console.log(payload);
      let PDF_DOC = JSON.parse(tmp(payload))
      pdfMake.createPdf(PDF_DOC).open();
    }
  },

  computed: {
    minDate(){
      const t = new Date()
      return `${t.getFullYear().toString().padStart(4,'0')}-${(t.getMonth()+1).toString().padStart(2,'0')}-01`
    },
    minDueDate(){
      const t= new Date((new Date()).setDate(new Date(this.newdata.issue_date).getDate()+1))
      return t.toISOString().substring(0, 10)
    },
    lineTotal() {
      return ((1.00 + this.newitem.vat / 100.00) * this.newitem.quantity * this.newitem.unit_price).toFixed(2)
    },
    lineVATValue() {
      return (this.newitem.quantity * this.newitem.unit_price * this.newitem.vat / 100.00).toFixed(2)
    },
    formatInvoiceNumber(){
      return (this.company.invoice_format.replace('YYYY', (new Date(this.newdata.issue_date)).getUTCFullYear()) 
      .replace('MM', ((new Date(this.newdata.issue_date)).getUTCMonth() + 1).toString().padStart(2, '0'))
      .replace('XX',this.serialnumber_data[this.company._id][this.company.invoice_format].toString().padStart(2,'0')))
    }
  },

  created() {
    const dataURLs = ['/contracts', '/servicesproducts', '/serialnumber']

    const getData = async () => {
      try{
        const [ contracts, servicesproducts, serialnumbers ] = await Promise.all(dataURLs.map(url => axios.get(url).then(res => res.data))) 
        console.log(contracts, servicesproducts, serialnumbers)

        if (contracts.status == 'ok' && servicesproducts.status == 'ok' && serialnumbers.status == 'ok') {
          this.company_data = contracts.dataset.companies
          this.client_data = contracts.dataset.clients
          this.contract_data = contracts.dataset.contracts
          this.serviceproduct_data = servicesproducts.dataset.servicesproducts
          this.serialnumber_data = serialnumbers.dataset.serialnumbers

          this.company_list = this.company_data.map(item => {
            let tmp = {}
            tmp.value = item
            tmp.text = item.name
            return tmp
          })
          //we select by default the 1st company
          this.company = this.company_list[0].value
          this.vat_list = VAT_TABLE[this.company.country]

          //Create a list with all clients of the selected company
          this.client_list = this.client_data.map(item => {
            if (item.company_id == this.company._id) {
              let tmp = {}
              tmp.value = item
              tmp.text = item.name
              return tmp
            }
          })
          this.client = this.client_list[0].value

          //Create a list with all contract of the slected company and client
          this.contract_list = this.contract_data.map(item => {
            if (item.company_id == this.company._id && item.client_id == this.client._id) {
              return {
                value: item,
                text: item.registration_number
              }
            }
          })
          this.contract = this.contract_list[0].value

          this.serviceproduct_list = this.serviceproduct_data.map(item => {
            if (item.company_id == this.company._id){
              return {
                value: item,
                text: item.name
              }
            }
          })
          this.serviceproduct = this.serviceproduct_list[0].value
          this.newitem = {
            service_product: this.serviceproduct.name,
            description: '',
            unit: this.serviceproduct.unit,
            quantity: 1,
            unit_price: this.serviceproduct.unit_price,
            vat: this.serviceproduct.vat
          }
          //Get the current invoice number for the draft version
          this.company.invoice_number = this.company.invoice_format.replace('YYYY', (new Date(this.newdata.issue_date)).getUTCFullYear()) 
                                        .replace('MM', ((new Date(this.newdata.issue_date)).getUTCMonth() + 1).toString().padStart(2, '0'))
                                        .replace('XX',this.serialnumber_data[this.company._id][this.company.invoice_format].toString().padStart(2,'0'));
          this.newdata.payment_instructions = getCS(new Date(this.newdata.issue_date), this.serialnumber_data[this.company._id][this.company.invoice_format].toString())
          this.loading = false
        }
      }catch(err){
        console.log(err);
      }
    }
    getData()
   
  },

  template: `
    <div class="d-flex text-center justify-content-center m-3" v-if="loading">
      <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Create new invoice" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">Invoice</h6>
      </template>  
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
          <b-form-input id="invoice_number" v-model="formatInvoiceNumber" readonly></b-form-input>
        </b-form-group>
            
        <b-form-group :label='$t("invoices.issue_date")' label-for="invoice_issue_date" label-cols-sm="3">
          <b-form-input id="invoice_issue_date" type="date" v-model="newdata.issue_date" :min="minDate" @change="selectIssueDate($event)"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("invoices.due_term")' label-for="invoice_due_date" label-cols-sm="3">
        <b-form-select id="invoice_due_term" v-model="newdata.invoice_due_term" :options="invoice_due_term_list" @change="selectDueTerm($event)"></b-form-select>
        <b-form-text id="invoice_due_term-help">Select one of the Invoice due terms from the list.</b-form-text>
        </b-form-group>
        
        <b-form-group :label='$t("invoices.due_date")' label-for="invoice_due_date" label-cols-sm="3">
          <b-form-input id="invoice_due_date" type="date" v-model="newdata.due_date" :min="minDueDate" :readonly="newdata.invoice_due_term>1"></b-form-input>
        </b-form-group>
      
        <b-form-group :label='$t("invoices.currency")' label-for="invoice_currency" label-cols-sm="3">
            <b-form-select id="invoice_currency" v-model="newdata.currency" :options="currency_list"></b-form-select>
        </b-form-group>

        <b-form-group :label='$t("invoices.exchange_rate")' label-for="invoice_exchange_rate" label-cols-sm="3">
          <b-input-group>
            <template #prepend>
              <b-input-group-text >1 {{newdata.currency}} = </b-input-group-text>
            </template>
            <b-form-input type="number" id="invoice_exchange_rate" v-model="newdata.exchange_rate"></b-form-input>
            <template #append>
              <b-form-select v-model="newdata.convert_to" :options="currency_list"></b-form-select>
            </template>
          </b-input-group>
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
          <template #cell(price)="data">
            {{ (data.item.unit_price*data.item.quantity).toFixed(2) }}
          </template>
          <template #cell(vat_to_pay)="data">
            {{ (data.item.unit_price*data.item.quantity*data.item.vat/100.0).toFixed(2) }}
          </template>
          <template #cell(final_price)="data">
          {{ ((1.0 + data.item.vat/100.0)*data.item.unit_price*data.item.quantity).toFixed(2) }}
        </template>
          </b-table>
        </div>

        <b-form-group :label='$t("invoices.newitem")' label-for="newitem" label-cols-sm="3">
        <b-input-group>
         <template #prepend>
         <b-input-group-text >{{$t("invoices.item")}}</b-input-group-text>
         </template>
        <b-form-select v-model="serviceproduct" :options="serviceproduct_list" @change="selectServiceProduct($event)"></b-form-select>  
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
        <b-form-input v-model="serviceproduct.unit"></b-form-input>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.quantity")}}</b-input-group-text>
         </template>
        <b-form-input type="number" v-model="newitem.quantity"></b-form-input>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.unit_price")}}</b-input-group-text>
         </template>
        <b-form-input type="number" v-model="newitem.unit_price"></b-form-input>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.vat")}}</b-input-group-text>
         </template>
        <b-form-select v-model="newitem.vat" :options="vat_list"></b-form-select>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.vat_value")}}</b-input-group-text>
         </template>
        <b-form-input type="number" v-model="lineVATValue" readonly></b-form-input>
        </b-input-group>
        <b-input-group>
        <template #prepend>
         <b-input-group-text >{{$t("invoices.total")}}</b-input-group-text>
         </template>
        <b-form-input type="number" v-model="lineTotal" readonly></b-form-input>
        </b-input-group>

        <b-button variant="primary" @click="addItem">Add</b-button>
      </b-form-group>

      </b-card-text>

      <template #footer>
      <b-row>
        <b-col class="pb-2"><b-button pill variant="warning" @click="generatePDF">Preview</b-button></b-col>
        <b-col class="pb-2 text-right"><b-button variant="success" @click="createInvoice">Create</b-button></b-col>
      </b-row>
      </template>
	  
    </b-card>
    </div>
	`
});
