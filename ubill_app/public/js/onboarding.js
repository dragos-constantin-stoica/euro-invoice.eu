Vue.component("onboarding", {
	data: function () {
		return {
			company: {
				invoice_format: ''
			},
			newdata_company: {
				invoice_format: ''
			},
			vatRO: false,

			service: {
				name: '',
				description: '',
				type: '',
				unit: '',
				unit_price: 0.0,
				vat: 0.0,
				currency: ''
			},
			
			client: {
				email: '',
				mobile: '',
				name: '',
				national_registration_number: '',
				country: null,
				vat: '',
				address: [''],
				bank_accounts: [{
					bank_name: '',
					iban: '',
					swift: '',
					bic: '',
					currency: 'EUR'
				}]
			},

			contract: { 
				registration_number: '', 
				type: 'service', 
				start_date: '', 
				end_date: '', 
				details: '' 
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
			company_list: [
				{ value: null, text: 'Please select an option' }
			],
			invoice_format: [
				{ value: 'YYYY.MM XX', text: 'YYYY.MM ##' },
				{ value: 'YYYY.MM/XX', text: 'YYYY.MM/##' },
				{ value: 'YYYY.MM-XX', text: 'YYYY.MM-##' }
			],
			vat_list: [
				{ value: null, text: 'Please select an option' }
			],
			contract_type_list: [
				{ value: 'service', text: 'Services' },
				{ value: 'product', text: 'Products' },
				{ value: 'mixed', text: 'Products & Services' }
			],

			countries_list: COUNTRY_LIST,
			currency_list: CURRENCY_LIST,

			tabIndex: 0,
			max: 100,
			show: true
		}
	},

	methods: {
		selectInvoiceFormat(event) {
			this.newdata_company.invoice_format = event
		},
		selectType(event) {
			this.service.unit = this.unit_list[event][0].value
		}
	},

	computed: {
		fullPrice() {
			return Number.parseFloat(this.service.unit_price * (1.00 + this.service.vat / 100.00)).toFixed(2)
		}
	},

	created() {
		axios.get('/servicesproducts')
			.then(response => {
				console.log(response.data)
				if (response.data.status == 'ok') {
					this.company_list = response.data.dataset.companies.map(item => {
						return { value: item, text: item.name }
					})					
					//we select by default the 1st company
					this.company = this.company_list[0].value
					this.vat_list = VAT_TABLE[this.company.country]
					this.service.type = 'service'
					this.service.currency = 'EUR'
					this.service.unit = this.unit_list[this.service.type][0].value
					this.newdata_company.invoice_format = this.company.invoice_format ?? this.invoice_format[0].value
					this.company.invoice_format = this.company.invoice_format ?? ''
					this.vatRO = this.company.vat.length > 0
					if(! this.company.address) this.company.address = ['']
					if(! this.company.bank_accounts) this.company.bank_accounts[{
						bank_name: '',
						iban: '',
						swift: '',
						bic: '',
						currency: 'EUR'
					}]
				}
			})
	},

	template: `
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
					<b-form-textarea v-model="item" rows="5" max-rows="7"></b-form-textarea>
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
					<b-form-select id="currency" v-model="item.currency" :options="currency_list" disabled="true"></b-form-select>
				</b-input-group>
				</b-form-group>

				<b-form-group label="Invoice format"  label-for="invoice" label-cols-sm="3">
					<b-form-select id="invoice" v-model="newdata_company.invoice_format" :options="invoice_format" :disabled="company.invoice_format.length > 0" @change="selectInvoiceFormat($event)"></b-form-select>
				</b-form-group>

			</b-card>
		</b-tab>

		<b-tab title="Step 2">			
			<b-card title="Service/Product setup">
			
				<b-form-group :label='$t("services.name")' label-for="services_name" label-cols-sm="3">
					<b-form-input id="services_name" v-model="service.name"></b-form-input>
				</b-form-group>

				<b-form-group :label='$t("services.description")' label-for="services_description" label-cols-sm="3">
					<b-form-textarea id="services_description" v-model="service.description" rows="3"></b-form-textarea>
				</b-form-group>

				<b-form-group :label='$t("services.type")' label-for="services_type" label-cols-sm="3">
					<b-form-select id="services_type" v-model="service.type" :options="ps_list" @change="selectType($event)"></b-form-select>
				</b-form-group>

				<b-form-group :label='$t("services.unit")' label-for="services_unit" label-cols-sm="3">
					<b-form-select id="services_unit" v-model="service.unit" :options="unit_list[service.type]"></b-form-select>
				</b-form-group>

				<b-form-group :label='$t("services.unit_price")' label-for="services_unit_price" label-cols-sm="3">
					<b-form-input id="serivices_unit_price" v-model="service.unit_price"></b-form-input>
				</b-form-group>

				<b-form-group :label='$t("services.vat")' label-for="services_vat" label-cols-sm="3">
					<b-form-select id="services_vat" v-model="service.vat" :options="vat_list"></b-form-select>
				</b-form-group>

				<b-form-group :label='$t("services.currency")' label-for="services_currency" label-cols-sm="3">
					<b-form-select id="serivces_currency" v-model="service.currency" :options="currency_list"></b-form-select>
				</b-form-group>

				<b-form-group :label='$t("services.unit_price_vat")' label-for="services_unit_price_vat" label-cols-sm="3">
					<b-form-input id="services_unit_price_vat" v-model="fullPrice"  plaintext='true'></b-form-input>
				</b-form-group>

			</b-card>
		</b-tab>
			
		<b-tab title="Step 3">
			<b-card title="Client setup">

			<b-form-group :label='$t("company.name")' label-for="client_name" label-cols-sm="3">
				<b-form-input id="client_name" v-model="client.name"></b-form-input>
			</b-form-group>

			<b-form-group :label='$t("company.national_registration_number")' label-for="client_national_registration_number" label-cols-sm="3">
				<b-form-input id="client_national_registration_number" v-model="client.national_registration_number"></b-form-input>
			</b-form-group>

			<b-form-group :label='$t("company.country")' label-for="client_country" label-cols-sm="3">
				<b-form-select id="client_country" v-model="client.country" :options="countries_list"></b-form-select>
			</b-form-group>

			<b-form-group :label='$t("company.vat")' label-for="client_vat" label-cols-sm="3">
				<b-form-input id="client_vat" v-model="client.vat"></b-form-input>
			</b-form-group>

			<b-form-group :label='$t("clients.mobile")' label-for="client_mobile" label-cols-sm="3">
				<b-form-input id="client_mobile" type="tel" v-model="client.mobile"></b-form-input>
			</b-form-group>
			<b-form-group :label='$t("clients.email")' label-for="client_email" label-cols-sm="3">
				<b-form-input id="client_email" type="email" v-model="client.email"></b-form-input>
			</b-form-group>

			<b-form-group :label='$t("clients.address")' label-cols-sm="3">
				<b-form-textarea v-model="client.address[0]" rows="5" max-rows="7"></b-form-textarea>
			</b-form-group>

			<b-form-group :label='$t("clients.bank_accounts")' label-for="client_bank_name" label-cols-sm="3">
				<b-input-group prepend="Bank">
				<b-form-input id="client_bank_name" v-model="client.bank_accounts[0].bank_name"></b-form-input>  
				</b-input-group>
				<b-input-group prepend="IBAN"> 
				<b-form-input v-model="client.bank_accounts[0].iban"></b-form-input>
				</b-input-group>
				<b-input-group prepend="SWIFT"> 
				<b-form-input v-model="client.bank_accounts[0].swift"></b-form-input>
				</b-input-group>
				<b-input-group prepend="BIC">
				<b-form-input v-model="client.bank_accounts[0].bic"></b-form-input>
				</b-input-group>
				<b-input-group prepend="Currency">
				<b-form-select v-model="client.bank_accounts[0].currency" :options="currency_list"></b-form-select>
				</b-input-group>
			</b-form-group>
			
			</b-card>
		</b-tab>

		<b-tab title="Step 4">
			<b-card title="Contract setup">

			<b-form-group :label='$t("contracts.registration_number")' label-for="contracts_registration_number" label-cols-sm="3">
				<b-form-input id="contacts_registration_number" v-model="contract.registration_number"></b-form-input>
			</b-form-group>

			<b-form-group :label='$t("contracts.type")' label-for="contracts_type" label-cols-sm="3">
				<b-form-select id="contacts_type" v-model="contract.type" :options="contract_type_list"></b-form-select>
			</b-form-group>

			<b-form-group :label='$t("contracts.start_date")' label-for="contracts_start_date" label-cols-sm="3">
				<b-form-input id="contacts_start_date" type="date" v-model="contract.start_date"></b-form-input>
			</b-form-group>

			<b-form-group :label='$t("contracts.end_date")' label-for="contracts_end_date" label-cols-sm="3">
				<b-form-input id="contacts_end_date" type="date" v-model="contract.end_date"></b-form-input>
			</b-form-group>

			<b-form-group :label='$t("contracts.details")' label-for="contracts_details" label-cols-sm="3">
				<b-form-textarea id="contacts_details" v-model="contract.details" rows="3"></b-form-textarea>
			</b-form-group>

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
	`
});
