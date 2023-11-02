Vue.component("services", {
  data: function() {
    return {
      loading: true,
      company: null,
      services: {},
      newdata: {
        name: '',
        description: '',
        type: '',
        unit: '',
        unit_price: 0.0,
        vat: 0.0,
        currency: ''
      },
      services_fields: [
        { key: 'name', label: 'Item' }, 
        { key: 'unit_price', label: 'Price' },
        'show_details'
      ],
      services_items: [],
      company_list: [
        { value: null, text: 'Please select an option' }
      ],
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
      currency_list: CURRENCY_LIST,
      vat_list: [
        { value: null, text: 'Please select an option' }
      ],
      show: true
    }
  },

  computed: {
    fullPrice() {
      return Number.parseFloat(this.newdata.unit_price * (1.00 + this.newdata.vat / 100.00)).toFixed(2)
    }
  },

  methods: {
    selectType(event) {
      this.newdata.unit = this.unit_list[event][0].value
    },
    createServiceProduct() {
      this.loading = true
      let payload = this.newdata
      payload.company_id = this.company._id
      axios.post('/servicesproducts', payload)
        .then(response =>{
          console.log(response.data)
          if (response.data.status = 'ok') {
            this.company_list = response.data.dataset.companies.map(item => {
              let tmp = {}
              tmp.value = item
              tmp.text = item.name
              this.services[item._id] = []
              return tmp
            })
            response.data.dataset.servicesproducts.map(item => {
              this.services[item.company_id].push(item)
            })
            //we select by default the 1st company
            this.company = this.company_list[0].value
            this.services_items = this.services[this.company._id]
            this.newdata.name = ''
            this.newdata.description = ''
            this.newdata.unit_price = 0.0
            this.newdata.vat = 0.0
            this.newdata.type = 'service'
            this.newdata.currency = 'EUR'
            this.newdata.unit = this.unit_list[this.newdata.type][0].value
            this.loading = false
          }
        })

    }
  },

  created() {
    axios.get('/servicesproducts')
      .then(response => {
        console.log(response.data)
        if (response.data.status == 'ok') {
          this.company_list = response.data.dataset.companies.map(item => {
            let tmp = {}
            tmp.value = item
            tmp.text = item.name
            this.services[item._id] = []
            return tmp
          })
          response.data.dataset.servicesproducts.map(item => {
            this.services[item.company_id].push(item)
          })
          //we select by default the 1st company
          this.company = this.company_list[0].value
          this.vat_list = VAT_TABLE[this.company.country]
          this.services_items = this.services[this.company._id] || []
          this.newdata.type = 'service'
          this.newdata.currency = 'EUR'
          this.newdata.unit = this.unit_list[this.newdata.type][0].value
          this.loading = false
        }
      })
  },

  template: `
    <div class="d-flex text-center justify-content-center m-3" v-if="loading">
      <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Services and Products">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>

      <b-table responsive :items="services_items" :fields="services_fields" caption-top>
      <template #table-caption>Services and Products</template>
      <template #cell(unit_price)="row">
        {{ Number.parseFloat(row.item.unit_price).toFixed(2) }} {{row.item.currency}}
      </template>
      <template #cell(show_details)="row">
        <b-button pill variant="warning" size="sm" @click="row.toggleDetails" class="mr-2">
          {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
        </b-button>
      </template>
      <template #row-details="row">
        <b-card>
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Label:</b></b-col>
            <b-col>{{ row.item.name }}</b-col>
          </b-row>
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Desription:</b></b-col>
            <b-col style="white-space: pre-line;">{{ row.item.description }}</b-col>
          </b-row>
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Type:</b></b-col>
            <b-col>{{ row.item.type }}</b-col>
          </b-row>
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Unit:</b></b-col>
            <b-col>{{ row.item.unit }}</b-col>
          </b-row>
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Price:</b></b-col>
            <b-col>{{ Number.parseFloat(row.item.unit_price).toFixed(2) }} {{row.item.currency}}</b-col>
          </b-row>  
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>VAT:</b></b-col>
            <b-col>{{ row.item.vat }}%</b-col>
          </b-row>          
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Price with Tax:</b></b-col>
            <b-col>{{ Number.parseFloat(row.item.unit_price * (1.00 + row.item.vat / 100.00)).toFixed(2) }} {{row.item.currency}}</b-col>
          </b-row>          
          <b-button pill variant="warning" size="sm" @click="row.toggleDetails">Hide Details</b-button>
        </b-card>
      </template>
      </b-table>
       
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
