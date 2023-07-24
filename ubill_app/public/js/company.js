Vue.component("company", {
  data() {
    return {
      loading: true,
      logofile: null,
      newdata: { address: '', bank_name:'', iban: '', swift: '', bic: '', currency: ''},
      company: null,
      company_list: [
        { value: null, text: 'Please select an option' }
      ],
      invoice_format: [
      	{ value: 'YYYY.MM XX', text: 'YYYY.MM ##' },
      	{ value: 'YYYY.MM/XX', text: 'YYYY.MM/##' },
      	{ value: 'YYYY.MM.DD-XX', text: 'YYYY.MM.DD-##'}
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
  			this.company.address.unshift(this.newdata.address)
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
  			this.company.bank_accounts.unshift(tmp)
  		}
  	},
  	saveCompany: function(){
  	    this.loading = true
  		axios.put('/companies', this.company)
  		.then(response =>{
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
	          this.company.invoice_format = this.company.invoice_format ?? this.invoice_format[0].value
	          this.newdata.currency = 'EUR'
	          this.loading = false
	        }  			
  		})
  	}
  	
  },

  created() {
    axios
      .get('/companies')
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
          this.company.invoice_format = this.company.invoice_format ?? this.invoice_format[0].value
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

    <b-card title="Details" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">Company data</h6>
      </template>

      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>
      
      <b-form-group :label='$t("company.name")' label-for="company_name" label-cols-sm="3">
        <b-form-input id="company_name" v-model="company.name" plaintext="true"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.national_registration_number")' label-for="national_registration_number" label-cols-sm="3">
        <b-form-input id="national_registration_number" v-model="company.national_registration_number" plaintext="true"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.country")' label-for="country" label-cols-sm="3">
        <b-form-input id="country" v-model="company.country" plaintext="true"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.vat")' label-for="vat" label-cols-sm="3">
        <b-form-input id="vat" v-model="company.vat"></b-form-input>
      </b-form-group>

      <b-form-group v-for="item in company.address" :label='$t("company.address")' label-cols-sm="3">
         <b-form-textarea v-model="item" rows="5" max-rows="7" plaintext="true"></b-form-textarea>
      </b-form-group>

      <b-form-group :label='$t("company.address")' label-cols-sm="3">
        <b-form-textarea v-model="newdata.address" rows="5" max-rows="7"></b-form-textarea>
        <b-button variant="primary" @click="addAddress">Add</b-button>
      </b-form-group>

      <b-form-group v-for="item in company.bank_accounts" :label='$t("company.bank_accounts")' label-for="bank_name" label-cols-sm="3">
		<b-input-group prepend="Bank">
        	<b-form-input id="bank_name" v-model="item.bank_name" readonly="true"></b-form-input>
        </b-input-group>
        <b-input-group prepend="IBAN">
        	<b-form-input id="iban" v-model="item.iban" readonly="true"></b-form-input>
        </b-input-group>
        <b-input-group prepend="SWIFT">
        	<b-form-input id="swift" v-model="item.swift" readonly="true"></b-form-input>
        </b-input-group>
        <b-input-group prepend="BIC">
        	<b-form-input id="bic" v-model="item.bic" readonly="true"></b-form-input>
        </b-input-group>
        <b-input-group prepend="Currency">
        	<b-form-input id="currency" v-model="item.currency" readonly="true"></b-form-input>
        </b-input-group>
      </b-form-group>
      
      <b-form-group :label='$t("company.bank_accounts")' label-for="bank_name" label-cols-sm="3">
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

      <b-form-group label="Invoice format"  label-for="invoice" label-cols-sm="3">
         <b-form-select id="invoice" v-model="company.invoice_format" :options="invoice_format"></b-form-select>
      </b-form-group>

      <template #footer>
        <b-button  variant="success" @click="saveCompany">Save</b-button>
      </template>
    </b-card>

    <b-card title="Admin" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">User management</h6>
      </template>       
       <b-card-text>Member</b-card-text>

      <b-card-text>
      Mandatory Fields - admin user, members users. Admin can manage admins and members. There is always one admin. The logged in user can not delete itself from the list if it is the only admin.
      </b-card-text>

      <template #footer>
        <em>User will be notified via email.</em>
      </template> 
    </b-card>


    <b-card title="Logo" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">Visual identity</h6>
      </template>
        <b-input-group>
          <b-input-group-prepend>
             <b-button @click="logofile = null" variant="danger">Reset</b-button>
          </b-input-group-prepend>
        <b-form-file v-model="logofile" accept=".jpg, .png, .svg" :state="Boolean(logofile)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
        </b-input-group>
        <div class="mt-3">Selected file: {{ logofile ? logofile.name : '' }}</div>
      <template #footer>
        <b-button  variant="success">Upload</b-button>
      </template>
    </b-card>

    </div>
	`
});
