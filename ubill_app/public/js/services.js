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
              unit_price:0.0, 
              vat:0.0,
              currency: ''
            },
            company_list: [
        		{ value: null, text: 'Please select an option' }
             ],           
            show: true
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
          <b-form-input id="contacts_name" v-model="newdata.name"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.description")' label-for="services_description" label-cols-sm="3">
          <b-form-textarea id="contacts_description" v-model="newdata.description" rows="3"></b-form-textarea>
        </b-form-group>

        <b-form-group :label='$t("services.type")' label-for="services_type" label-cols-sm="3">
          <b-form-input id="contacts_type" v-model="newdata.type"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.unit")' label-for="services_unit" label-cols-sm="3">
          <b-form-input id="contacts_unit" v-model="newdata.unit"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.unit_price")' label-for="services_unit_price" label-cols-sm="3">
          <b-form-input id="contacts_unit_price" v-model="newdata.unit_price"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.vat")' label-for="services_vat" label-cols-sm="3">
          <b-form-input id="contacts_vat" v-model="newdata.vat"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.currency")' label-for="services_currency" label-cols-sm="3">
          <b-form-input id="contacts_currency" v-model="newdata.currency"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("services.unit_price_vat")' label-for="services_unit_price_vat" label-cols-sm="3">
          <b-form-input id="contacts_unit_price_vat" v-model="newdata.unit_price*newdata.vat" plaintext='true'></b-form-input>
        </b-form-group>


      </b-card-text>



      <b-card-text>
      Mandatory data: description, unit (hours, days, weeks, months, kg, pcs etc.), unit price, currency, VAT(optional maybe)
      </b-card-text>

    </b-card>
    </div>
	`
});
