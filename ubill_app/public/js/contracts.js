Vue.component("contracts", {
  data() {
    return {
      loading: true,
      company: null,
      clients: null,
      contracts: null,
      newdata: { registration_number:'', type:'', start_date:'', end_date:'', details:'' },
      company_list: [
        { value: null, text: 'Please select an option' }
      ],
      client_list: [
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
          this.clients = null
          this.contracts = null
          this.loading = false
        }
      })
  },

  template: `
    <div class="d-flex justify-content-center mb-3" v-if="loading">
          <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
 
    <b-card title="Contracts" sub-title="Manage B2B Contracts">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
        <b-form-select id="client" v-model="clients" :options="client_list"></b-form-select>
        <b-form-text id="client-help">Select one of the Clients from the list.</b-form-text>
      </b-card-text>
    
      <b-card-text>
        Display the list of existing contracts 
      </b-card-text>

      <b-card-text>
      Create new Contract

      <b-form-group :label='$t("contracts.registration_number")' label-for="contracts_registration_number" label-cols-sm="3">
        <b-form-input id="contacts_registration_number" v-model="newdata.registration_number"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("contracts.type")' label-for="contracts_type" label-cols-sm="3">
        <b-form-input id="contacts_type" v-model="newdata.type"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("contracts.start_date")' label-for="contracts_start_date" label-cols-sm="3">
        <b-form-input id="contacts_start_date" type="date" v-model="newdata.start_date"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("contracts.end_date")' label-for="contracts_end_date" label-cols-sm="3">
        <b-form-input id="contacts_end_date" type="date" v-model="newdata.end_date"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("contracts.details")' label-for="contracts_details" label-cols-sm="3">
        <b-form-textarea id="contacts_details" v-model="newdata.details" rows="3"></b-form-textarea>
      </b-form-group>
      </b-card-text>

    </b-card>
    </div>
	`
});
