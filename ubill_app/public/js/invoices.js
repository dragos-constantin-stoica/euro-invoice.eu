Vue.component("Invoices", {
    data() {
        return {
            loading: true,
            company_data: null,
            client_data: null,
            contract_data: null,
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
              template: 'EN'
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
              { value: 'EN', text: 'English Template' },
              { value: 'RO', text: 'Romanian Template'}
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
      },
      generatePDF: function(){
        let tmp = Handlebars.compile(templates[this.newdata.template])
        //TODO - compile the full object with corresponding data
        let payload = {
          SERIA: "XXX",
          NUMARUL: "000",
          FURNIZOR: {
            nume: this.company.name,
            NORG: '0000',
            CUI: 'RO1234',
            adresa: this.company.address[0],
            banca: this.company.bank_accounts[0].bank_name,
            sucursala: 'none',
            IBAN: this.company.bank_accounts[0].iban,
          },
          BENEFICIAR: {
            nume: this.client.name,
            NORG: this.client.national_registry_number,
            CUI: 'LU0000',
            adresa: this.client.address[0],
            banca: this.client.bank_accounts[0].bank_name,
            sucursala: 'none',
            IBAN: this.client.bank_accounts[0].iban
          },
          TVA: 19.00,
          INVOICE_DATE: "01.10.2023",
          DUE_DATE: "01.11.2023",
          CURS_BNR: {
              data: "01.10.2023",
              eur_ron: 4.98
          },
          INVOICE_LINE: [
              {
                details: 'Sevicii IT',
                um: 'm2',
                qty: '22',
                up: '12,33',
                line_value: 22*12.33,
                line_tva: 22*12.33*0.19
              }
          ],
          INVOICE_SUM: 1234.9945,
          INVOICE_TVA_SUM: 11.998,
          INVOICE_TOTAL: 11223344.9876
      }
        let PDF_DOC = JSON.parse(tmp(payload))
        pdfMake.createPdf(PDF_DOC).getDataUrl(function(outDoc) {
          let pdfdoc0 = document.getElementById("pdfdocobj"), 
          pdfdoc1 = document.getElementById("pdfdocif")
          pdfdoc0.data = outDoc
          pdfdoc1.src = outDoc
        });
      }
    },

    computed: {
      lineTotal() {
        return Number.parseFloat(this.newitem.quantity * this.newitem.unit_price * (1.00 + this.newitem.vat / 100.00)).toFixed(2)
      }
    },

    created() {
      axios.get('/contracts')
      .then(response => {
        console.log(response.data)
        if (response.data.status == 'ok') {
          this.company_data = response.data.dataset.companies
          this.client_data = response.data.dataset.clients
          this.contract_data = response.data.dataset.contracts

          this.company_list = this.company_data.map(item => {
            let tmp = {}
            tmp.value = item
            tmp.text = item.name
            return tmp
          })
          //we select by default the 1st company
          this.company = this.company_list[0].value

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
          //TODO - Get the next invoice number
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

      <div class="embed-responsive embed-responsive-4by3">
        <object class="embed-responsive-item" id='pdfdocobj' data='' type="application/pdf" width="100%">
        <iframe id="pdfdocif" src="" width="100%" class="embed-responsive-item"  style="border: none;">
        This browser does not support PDFs. 
        </iframe>
        </object>
      </div>
      <b-button variant="warning" @click="generatePDF">Preview</b-button>
    </b-card>
    </div>
	`
});
