Vue.component("services", {
    data() {
        return {
            loading: true,
            company:null,
            services: {},
            newdata:{
              name: '', 
              description:'', 
              type:'', 
              unit:'', 
              unit_price: 0.0, 
              vat: 0.0,
              currency: ''
            },
            services_fields: [ {key: 'name', label:'Item'}, {key: 'unit_price', label:'Price'} ],    
            services_items:[ ],
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
		      vat_list: [
		        { value: 0.0,  text: '0%' },
		      	{ value: 2.1 , text: '2.1%' },
		      	{ value: 3.0,  text: '3%' },
		      	{ value: 4.0,  text: '4%' },
		      	{ value: 4.8,  text: '4.8%' },
		      	{ value: 5.0,  text: '5%' },
		      	{ value: 5.5,  text: '5.5%' },
		      	{ value: 6.0,  text: '6%' },
		      	{ value: 7.0,  text: '7%' },
		      	{ value: 8.0,  text: '8%' },
		      	{ value: 9.0,  text: '9%' },
		      	{ value: 9.5,  text: '9.5%' },
		      	{ value: 10.0, text: '10%' },
		      	{ value: 12.0, text: '12%' },
		      	{ value: 13.0, text: '13%' },
		      	{ value: 13.5, text: '13.5%' },
		      	{ value: 14.0, text: '14%' },
		      	{ value: 15.0, text: '15%' },
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
            show: true
        }
    },

	computed: {
		fullPrice(){
			return Number.parseFloat(this.newdata.unit_price * (1.00 + this.newdata.vat/100.00)).toFixed(2)
		}
	},

	methods:{
	    selectType(event){
	    	this.newdata.unit = this.unit_list[event][0].value
	    },
		createServiceProduct(){
			
		}
	},

    created() {
      axios.get('/servicesproducts')
      .then(response => {
        console.log(response.data)
        if (response.data.status = 'ok') {
          this.company_list = response.data.dataset.companies.map(item => {
            let tmp = {}
            tmp.value = item
            tmp.text = item.name
            this.services[item._id] = []
            return tmp
          })
          this.services = response.data.dataset.servicesproducts.map(item => {
          	this.services[item.company_id].push(item)
          })
          //we select by default the 1st company
          this.company = this.company_list[0].value
          this.services_items = this.services[this.company._id] || []
          this.newdata.type = 'service'
          this.newdata.currency = 'EUR'
          this.newdata.unit = this.unit_list[this.newdata.type][0].value 
          this.loading = false
        }
      })
    },

    template: `
    <div class="d-flex justify-content-center mb-3" v-if="loading">
          <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Services and Products">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>

      <div>
          <b-table responsive :items="services_items" :fields="services_fields" caption-top>
          <template #table-caption>Services and Products</template>
          </b-table>
       </div>
    </b-card>

    <b-card title="Add Services and Products"  header-tag="header" footer-tag="footer">
   	  <template #header>
        <h6 class="mb-0">Manage services and products</h6>
      </template>    
    
      <b-card-text>
        <b-form-group :label='$t("services.name")' label-for="services_name" label-cols-sm="3">
          <b-form-input id="services_name" v-model="newdata.name"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.description")' label-for="services_description" label-cols-sm="3">
          <b-form-textarea id="services_description" v-model="newdata.description" rows="3"></b-form-textarea>
        </b-form-group>

        <b-form-group :label='$t("services.type")' label-for="services_type" label-cols-sm="3">
          <b-form-select id="services_type" v-model="newdata.type" :options="ps_list" @change="selectType($event)"></b-form-select>
        </b-form-group>

        <b-form-group :label='$t("services.unit")' label-for="services_unit" label-cols-sm="3">
          <b-form-select id="services_unit" v-model="newdata.unit" :options="unit_list[newdata.type]"></b-form-select>
        </b-form-group>

        <b-form-group :label='$t("services.unit_price")' label-for="services_unit_price" label-cols-sm="3">
          <b-form-input id="serivices_unit_price" v-model="newdata.unit_price"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.vat")' label-for="services_vat" label-cols-sm="3">
          <b-form-select id="services_vat" v-model="newdata.vat" :options="vat_list"></b-form-select>
        </b-form-group>

        <b-form-group :label='$t("services.currency")' label-for="services_currency" label-cols-sm="3">
          <b-form-select id="serivces_currency" v-model="newdata.currency" :options="currency_list"></b-form-select>
        </b-form-group>

        <b-form-group :label='$t("services.unit_price_vat")' label-for="services_unit_price_vat" label-cols-sm="3">
          <b-form-input id="services_unit_price_vat" v-model="fullPrice"  plaintext='true'></b-form-input>
        </b-form-group>
      </b-card-text>

      <template #footer>
		<b-button variant="success" @click="createServiceProduct">{{$t("services.btn_createserviceproduct")}}</b-button>
      </template>
    </b-card>
    </div>
	`
});
