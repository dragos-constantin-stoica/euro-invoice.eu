Vue.component("onboarding", {
    data: function () {
        return {
		      company_list: [
		        { value: null, text: 'Please select an option' }
		      ],
		      invoice_format: [
		      	{ value: 'YYYY.MM XX', text: 'YYYY.MM ##' },
		      	{ value: 'YYYY.MM/XX', text: 'YYYY.MM/##' },
		      	{ value: 'YYYY.MM-XX', text: 'YYYY.MM-##'}
		      ],
		      currency_list: CURRENCY_LIST,
            company: null,
            newdata_company: { 
		        address: '', 
		        bank_name:'', 
		        iban: '', 
		        swift: '', 
		        bic: '', 
		        currency: '', 
		        invoice_format:''
		    },
            vatRO: false,            
		    services: {},
		      newdata_service: {
		        name: '',
		        description: '',
		        type: '',
		        unit: '',
		        unit_price: 0.0,
		        vat: 0.0,
		        currency: ''
		      },
		      ps_list: [
		        { value: 'product', text: ' Product' },
		        { value: 'service', text: 'Service' }
		      ],
		      unit_list: {
		        product: [
		          { value: 'pcs', text: 'Pieces' },
		          { value: 'kg', text: 'Kilograms' },
		          { value: 'm', text: 'Meters' },
		          { value: 'l', text: 'Liters' },
		          { value: 'm2', text: 'Square meters' }
		        ],
		        service: [
		          { value: 'h', text: 'Hour' },
		          { value: 'day', text: 'Day' },
		          { value: 'mth', text: 'Month' }
		        ]
		      },
		      vat_list: [
		        { value: null, text: 'Please select an option' }
		      ],


      clients: {},
      newdata_client: {
        email: '',
        mobile: '',
        name: '',
        national_registration_number: null,
        country: null,
        vat: null,
        address: [],
        newaddress: '',
        bank_accounts: [],
        bank_name: '',
        iban: '',
        swift: '',
        bic: '',
        currency: 'EUR'
      },
      countries_list: COUNTRY_LIST,

			tabIndex: 0,
			value: 0,
			max: 100,
            show: true
        }
    },

    methods:{
	  	addAddressCompany: function(){
	  	    if(this.newdata_company.address.length > 0){
	  		//add the address to the corresponding company from the list
	  			this.company.address.unshift(this.newdata.address)
	  			this.newdata_company.address = null
	        }
	  	},
	  	addBankAccountCompany: function(){
	  		if(this.newdata_company.bank_name.length > 0 && this.newdata_company.iban.length > 0){
	  			let tmp = { 
	  				bank_name: this.newdata_company.bank_name,
	  				iban: this.newdata_company.iban,
	  				swift: this.newdata_company.swift,
	  				bic: this.newdata_company.bic,
	  				currency: this.newdata_company.currency
	  			}
	  			this.company.bank_accounts.unshift(tmp)
	  		}
	  	},
	    selectInvoiceFormat(event){
	      this.newdata_company.invoice_format = event
	    },
	    selectType(event) {
	      this.newdata_service.unit = this.unit_list[event][0].value
	    },
    nicePrintAddress: function(address){
      return address.join('\n____\n')
    },
    addAddressClient: function () {
      if (this.newdata_client.newaddress.length > 0) {
        //add the address to the corresponding company from the list
        this.newdata_client.address.unshift(this.newdata_client.newaddress)
        this.newdata_client.newaddress = null
      }
    },
    addBankAccountClient: function () {
      if (this.newdata_client.bank_name.length > 0 && this.newdata_client.iban.length > 0) {
        let tmp = {
          bank_name: this.newdata_client.bank_name,
          iban: this.newdata_client.iban,
          swift: this.newdata_client.swift,
          bic: this.newdata_client.bic,
          currency: this.newdata_client.currency
        }
        this.newdata_client.bank_accounts.unshift(tmp)
      }
    },
    	
    },

	computed: {
	    fullPrice() {
	      return Number.parseFloat(this.newdata_service.unit_price * (1.00 + this.newdata_service.vat / 100.00)).toFixed(2)
	    }
	  },    

	 created() {
	       axios.get('/servicesproducts')
	      .then(response => {
	        console.log(response.data)
	        if (response.data.status == 'ok') {
	          this.company_list = response.data.dataset.companies.map(item => {
	            this.services[item._id] = []
	            return {value: item, text: item.name}
	          })
	          response.data.dataset.servicesproducts.map(item => {
	            this.services[item.company_id].push(item)
	          })
	          //we select by default the 1st company
	          this.company = this.company_list[0].value
	          this.vat_list = VAT_TABLE[this.company.country]
	          this.services_items = this.services[this.company._id] || []
	          this.newdata_service.type = 'service'
	          this.newdata_service.currency = 'EUR'
	          this.newdata_service.unit = this.unit_list[this.newdata_service.type][0].value

	         this.newdata_company.invoice_format = this.company.invoice_format ?? this.invoice_format[0].value
	         this.company.invoice_format = this.company.invoice_format ?? ''
	         this.newdata_company.currency = 'EUR'
	         this.vatRO = this.company.vat.length > 0

	        }
	      })


    axios.get('/clients')
      .then(response => {
        console.log(response.data)
        if (response.data.status == 'ok') {
          //Load Clients for this Company
          response.data.dataset.clients.map(item => {
            this.clients[item.company_id].push(item)
          })
          this.newdata_client = {
            email: '',
            mobile: '',
            name: '',
            national_registration_number: null,
            country: null,
            vat: null,
            address: [],
            newaddress: '',
            bank_accounts: [],
            bank_name: '',
            iban: '',
            swift: '',
            bic: '',
            currency: 'EUR'
          }

        }
      })


	 },

    template: `
		<template>
		  <div>
			<!-- Tabs with card integration -->
			<b-card no-body>
			  <b-tabs v-model="tabIndex" content-class="mt-3" fill small card>
				<b-tab title="Step 1">
				
				  <b-card title="Complete Company setup">

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
				        <b-form-input id="vat" v-model="company.vat" :plaintext="vatRO"></b-form-input>
				      </b-form-group>

				      <b-form-group :label='$t("company.mobile")' label-for="mobile" label-cols-sm="3">
				        <b-form-input id="mobile" type="tel" v-model="company.mobile"></b-form-input>
				      </b-form-group>
				      <b-form-group :label='$t("company.email")' label-for="email" label-cols-sm="3">
				        <b-form-input id="email" type="email" v-model="company.email"></b-form-input>
				      </b-form-group>

				      <b-form-group v-for="item in company.address" :label='$t("company.address")' label-cols-sm="3">
				         <b-form-textarea v-model="item" rows="5" max-rows="7" plaintext="true"></b-form-textarea>
				      </b-form-group>

				      <b-form-group :label='$t("company.address")' label-cols-sm="3">
				        <b-form-textarea v-model="newdata_company.address" rows="5" max-rows="7"></b-form-textarea>
				        <b-button variant="primary" @click="addAddressCompany">Add</b-button>
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
				        <b-form-input v-model="newdata_company.bank_name"></b-form-input>  
				        </b-input-group>
				        <b-input-group prepend="IBAN"> 
				        <b-form-input v-model="newdata_company.iban"></b-form-input>
				        </b-input-group>
				        <b-input-group prepend="SWIFT"> 
				        <b-form-input v-model="newdata_company.swift"></b-form-input>
				        </b-input-group>
				        <b-input-group prepend="BIC">
				        <b-form-input v-model="newdata_company.bic"></b-form-input>
				        </b-input-group>
				        <b-input-group prepend="Currency">
				        <b-form-select v-model="newdata_company.currency" :options="currency_list"></b-form-select>
				        </b-input-group>
				        <b-button variant="primary" @click="addBankAccountCompany">Add</b-button>
				      </b-form-group>

				      <b-form-group label="Invoice format"  label-for="invoice" label-cols-sm="3">
				         <b-form-select id="invoice" v-model="newdata_company.invoice_format" :options="invoice_format" :disabled="company.invoice_format.length > 0" @change="selectInvoiceFormat($event)"></b-form-select>
				      </b-form-group>

				  </b-card>
				</b-tab>
				
				<b-tab title="Step 2">			
				  <b-card title="Service/Product setup">
				  
				        <b-form-group :label='$t("services.name")' label-for="services_name" label-cols-sm="3">
				          <b-form-input id="services_name" v-model="newdata_service.name"></b-form-input>
				        </b-form-group>

				        <b-form-group :label='$t("services.description")' label-for="services_description" label-cols-sm="3">
				          <b-form-textarea id="services_description" v-model="newdata_service.description" rows="3"></b-form-textarea>
				        </b-form-group>

				        <b-form-group :label='$t("services.type")' label-for="services_type" label-cols-sm="3">
				          <b-form-select id="services_type" v-model="newdata_service.type" :options="ps_list" @change="selectType($event)"></b-form-select>
				        </b-form-group>

				        <b-form-group :label='$t("services.unit")' label-for="services_unit" label-cols-sm="3">
				          <b-form-select id="services_unit" v-model="newdata_service.unit" :options="unit_list[newdata_service.type]"></b-form-select>
				        </b-form-group>

				        <b-form-group :label='$t("services.unit_price")' label-for="services_unit_price" label-cols-sm="3">
				          <b-form-input id="serivices_unit_price" v-model="newdata_service.unit_price"></b-form-input>
				        </b-form-group>

				        <b-form-group :label='$t("services.vat")' label-for="services_vat" label-cols-sm="3">
				          <b-form-select id="services_vat" v-model="newdata_service.vat" :options="vat_list"></b-form-select>
				        </b-form-group>

				        <b-form-group :label='$t("services.currency")' label-for="services_currency" label-cols-sm="3">
				          <b-form-select id="serivces_currency" v-model="newdata_service.currency" :options="currency_list"></b-form-select>
				        </b-form-group>

				        <b-form-group :label='$t("services.unit_price_vat")' label-for="services_unit_price_vat" label-cols-sm="3">
				          <b-form-input id="services_unit_price_vat" v-model="fullPrice"  plaintext='true'></b-form-input>
				        </b-form-group>

				  </b-card>
				</b-tab>
				
				<b-tab title="Step 3">
				  <b-card title="Client setup">

     <b-form-group :label='$t("company.name")' label-for="company_name" label-cols-sm="3">
        <b-form-input id="company_name" v-model="newdata_client.name"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.national_registration_number")' label-for="national_registration_number" label-cols-sm="3">
        <b-form-input id="national_registration_number" v-model="newdata_client.national_registration_number"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.country")' label-for="country" label-cols-sm="3">
        <b-form-select id="country" v-model="newdata_client.country" :options="countries_list"></b-form-select>
      </b-form-group>

      <b-form-group :label='$t("company.vat")' label-for="vat" label-cols-sm="3">
        <b-form-input id="vat" v-model="newdata_client.vat"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("clients.mobile")' label-for="mobile" label-cols-sm="3">
        <b-form-input id="mobile" type="tel" v-model="newdata_client.mobile"></b-form-input>
      </b-form-group>
      <b-form-group :label='$t("clients.email")' label-for="email" label-cols-sm="3">
        <b-form-input id="email" type="email" v-model="newdata_client.email"></b-form-input>
      </b-form-group>

      <b-form-group v-for="item in newdata_client.address" :label='$t("clients.address")' label-cols-sm="3">
         <b-form-textarea v-model="item" rows="5" max-rows="7" plaintext='true'></b-form-textarea>
      </b-form-group>

      <b-form-group :label='$t("clients.address")' label-cols-sm="3">
        <b-form-textarea v-model="newdata_client.newaddress" rows="5" max-rows="7"></b-form-textarea>
        <b-button variant="primary" @click="addAddressClient">Add</b-button>
      </b-form-group>

      <b-form-group v-for="item in newdata_client.bank_accounts" :label='$t("clients.bank_accounts")' label-for="bank_name" label-cols-sm="3">
        <b-form-input id="bank_name" v-model="item.bank_name" readonly="true"></b-form-input>
        <b-form-input id="iban" v-model="item.iban" readonly="true"></b-form-input>
        <b-form-input id="swift" v-model="item.swift" readonly="true"></b-form-input>
        <b-form-input id="bic" v-model="item.bic" readonly="true"></b-form-input>
        <b-form-input id="currency" v-model="item.currency" readonly="true"></b-form-input>
      </b-form-group>
      
      <b-form-group :label='$t("clients.bank_accounts")' label-for="bank_name" label-cols-sm="3">
        <b-input-group prepend="Bank">
        <b-form-input v-model="newdata_client.bank_name"></b-form-input>  
        </b-input-group>
        <b-input-group prepend="IBAN"> 
        <b-form-input v-model="newdata_client.iban"></b-form-input>
        </b-input-group>
        <b-input-group prepend="SWIFT"> 
        <b-form-input v-model="newdata_client.swift"></b-form-input>
        </b-input-group>
        <b-input-group prepend="BIC">
        <b-form-input v-model="newdata_client.bic"></b-form-input>
        </b-input-group>
        <b-input-group prepend="Currency">
        <b-form-select v-model="newdata_client.currency" :options="currency_list"></b-form-select>
        </b-input-group>
        <b-button variant="primary" @click="addBankAccountClient">Add</b-button>
      </b-form-group>

				  </b-card>
				
				</b-tab>

				<b-tab title="Step 4">
				  <b-card title="Contract setup">
				  </b-card>
				</b-tab>
				
			  </b-tabs>
			</b-card>

			<!-- Control buttons-->
			<div class="text-center m-2">
			  <b-row>
			     <b-col class="text-left"><b-button @click="tabIndex--">Previous</b-button></b-col>
			     <b-col class="text-right"><b-button @click="tabIndex++">Next</b-button></b-col>
			  </b-row>
			  <b-progress class="mt-2" :value="(tabIndex+1)/4*100" :max="max" show-progress animated></b-progress>
			</div>
		  </div>
		</template>
        `
});
