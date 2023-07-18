Vue.component("services", {
    data() {
        return {
            loading: true,
            company:null,
            services: null,
            newdata:{
              name: '', 
              description:'', 
              type:'', 
              unit:'', 
              unit_price: 0.0, 
              vat: 0.0,
              currency: ''
            },
            company_list: [
        		{ value: null, text: 'Please select an option' }
             ],
             ps_list:[
             	{ value: 'product', text: ' Product'},
             	{ value: 'service', text: 'Service'}
             ],
             unit_list:{
             	product:[ 
             		{ value: 'pcs', text: 'Pieces'},
             		{ value: 'kg', text: 'Kilograms'},
             		{ value: 'm', text: 'Meters'},
             		{ value: 'l', text: 'Liters'},
             		{ value: 'm2', text: 'Square meters'}
             	],
             	service:[
             	  	{ value: 'h', text: 'Hour'},
             	  	{ value: 'day', text: 'Day'},
             	  	{ value: 'mth', text: 'Month'}
             	]
             },
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

	computed: {
		fullPrice: function(){
			return this.newdata.unit_price * (1.00 + this.newdata.vat/100.00)
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
          this.services = null
          this.newdata.type = 'product'
          this.newdata.currency = 'EUR'
          this.newdata.unit = 'pcs' 
          this.loading = false
        }
      })
    },

    template: `
    <div class="d-flex justify-content-center mb-3" v-if="loading">
          <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Services and Products" sub-title="Add significant sections">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>

      <b-card-text>
        Display list of existing Products and Services
      </b-card-text>

      <b-card-text>
        Create new Products and Services
        <b-form-group :label='$t("services.name")' label-for="services_name" label-cols-sm="3">
          <b-form-input id="services_name" v-model="newdata.name"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.description")' label-for="services_description" label-cols-sm="3">
          <b-form-textarea id="services_description" v-model="newdata.description" rows="3"></b-form-textarea>
        </b-form-group>

        <b-form-group :label='$t("services.type")' label-for="services_type" label-cols-sm="3">
          <b-form-select id="services_type" v-model="newdata.type" :options="ps_list"></b-form-select>
        </b-form-group>

        <b-form-group :label='$t("services.unit")' label-for="services_unit" label-cols-sm="3">
          <b-form-select id="services_unit" v-model="newdata.unit" :options="unit_list[newdata.type]"></b-form-select>
        </b-form-group>

        <b-form-group :label='$t("services.unit_price")' label-for="services_unit_price" label-cols-sm="3">
          <b-form-input id="serivices_unit_price" v-model="newdata.unit_price"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.vat")' label-for="services_vat" label-cols-sm="3">
          <b-form-input id="services_vat" v-model="newdata.vat"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.currency")' label-for="services_currency" label-cols-sm="3">
          <b-form-select id="serivces_currency" v-model="newdata.currency" :options="currency_list"></b-form-select>
        </b-form-group>

        <b-form-group :label='$t("services.unit_price_vat")' label-for="services_unit_price_vat" label-cols-sm="3">
          <b-form-input id="services_unit_price_vat" v-model="fullPrice"  plaintext='true'></b-form-input>
        </b-form-group>

      </b-card-text>
    </b-card>
    </div>
	`
});
