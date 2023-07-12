Vue.component("clients", {
    data() {
        return {
            loading: true,
            company:null,
            clients: null,
            newdata: { 
              email: '', 
              name:'',
              national_registration_number: null, 
              country: '',
              vat: null,
              address: '', 
              bank_name:'', 
              iban: '', 
              swift: '',
              bic: '', 
              currency: ''
            },
            company_list: [
        		  { value: null, text: 'Please select an option' }
             ], 
             currency_list:[
              { value: 'BGN', text: 'BGN' },
              { value: 'CZK', text: 'CZK' },
              { value: 'DKK', text: 'DKK' },
              { value: 'EUR', text: 'EUR' },
              { value: 'HUF', text: 'HUF' },
              { value: 'PLN', text: 'PLN' },
              { value: 'RON', text: 'RON' },
              { value: 'SKK', text: 'SKK' },
            ],          
            show: true
        }
    },

    methods:{
      addAddress: function(){
          if(this.newdata.address.length > 0){
        //add the address to the corresponding company from the list
          this.clients.address.unshift(this.newdata.address)
          this.newdata.address = null
          }
      },
      addBankAccount: function(){
        if(this.newdata.bank_name.length > 0 && this.newdata.iban.length > 0){
          let tmp = { 
            bank_name: this.newdata.bank_name,
            iban: this.newdata.iban,
            swift: this.newdata.swift,
            bic: this.newdata.bic,
            currency: this.newdata.currency
          }
          this.clients.bank_accounts.unshift(tmp)
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
          //TODO load Clients for this Company
          this.clients = {address:[], bank_accounts:[]}
          this.newdata.currency = 'EUR'
          this.loading = false
        }
      })
    },
    
    template: `
    <div class="d-flex justify-content-center mb-3" v-if="loading">
          <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Clients" sub-title="Manage Clients">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>

      <b-card-text>
      Display the list of existing Clients
      </b-card-text>

      <b-card-text>
          <b-form-input id="client_search" type="search"></b-form-input>
          <b-form-text id="client_search-help">Enter any information: company name, national registration number, VAT.</b-form-text>
      </b-card-text>
      
      <b-card-text>
       Create new Client
      </b-card-text>

      <b-form-group :label='$t("company.name")' label-for="company_name" label-cols-sm="3">
        <b-form-input id="company_name" v-model="newdata.name"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.national_registration_number")' label-for="national_registration_number" label-cols-sm="3">
        <b-form-input id="national_registration_number" v-model="newdata.national_registration_number"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.country")' label-for="country" label-cols-sm="3">
        <b-form-input id="country" v-model="newdata.country"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.vat")' label-for="vat" label-cols-sm="3">
        <b-form-input id="vat" v-model="newdata.vat"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("clients.email")' label-for="email" label-cols-sm="3">
        <b-form-input id="email" v-model="newdata.email"></b-form-input>
      </b-form-group>

      <b-form-group v-for="item in clients.address" :label='$t("clients.address")' label-cols-sm="3">
         <b-form-textarea v-model="item" rows="5" max-rows="7" plaintext='true'></b-form-textarea>
      </b-form-group>

      <b-form-group :label='$t("clients.address")' label-cols-sm="3">
        <b-form-textarea v-model="newdata.address" rows="5" max-rows="7"></b-form-textarea>
        <b-button variant="primary" @click="addAddress">Add</b-button>
      </b-form-group>

      <b-form-group v-for="item in clients.bank_accounts" :label='$t("clients.bank_accounts")' label-for="bank_name" label-cols-sm="3">
        <b-form-input id="bank_name" v-model="item.bank_name" readonly="true"></b-form-input>
        <b-form-input id="iban" v-model="item.iban" readonly="true"></b-form-input>
        <b-form-input id="swift" v-model="item.swift" readonly="true"></b-form-input>
        <b-form-input id="bic" v-model="item.bic" readonly="true"></b-form-input>
        <b-form-input id="currency" v-model="item.currency" readonly="true"></b-form-input>
      </b-form-group>
      
      <b-form-group :label='$t("clients.bank_accounts")' label-for="bank_name" label-cols-sm="3">
        <b-input-group prepend="Bank">
        <b-form-input v-model="newdata.bank_name"></b-form-input>  
        </b-input-group>
        <b-input-group prepend="IBAN"> 
        <b-form-input v-model="newdata.iban"></b-form-input>
        </b-input-group>
        <b-input-group prepend="SWIFT"> 
        <b-form-input v-model="newdata.swift"></b-form-input>
        </b-input-group>
        <b-input-group prepend="BIC">
        <b-form-input v-model="newdata.bic"></b-form-input>
        </b-input-group>
        <b-input-group prepend="Currency">
        <b-form-select v-model="newdata.currency" :options="currency_list"></b-form-select>
        </b-input-group>
        <b-button variant="primary" @click="addBankAccount">Add</b-button>
      </b-form-group>

    </b-card>
    </div>
	`
});
