Vue.component("contracts", {
  data: function () {
    return {
      loading: true,
      company_data: null,
      client_data: null,
      contract_data: null,
      company: null,
      clients: null,
      contracts: null,
      newdata: { 
        registration_number: '', 
        type: 'service', 
        start_date: '', 
        end_date: '', 
        details: '' 
      },
      company_list: [
        { value: null, text: 'Please select an option' }
      ],
      client_list: [
        { value: null, text: 'Please select an option' }
      ],
      contract_type_list: [
        { value: 'service', text: 'Services' },
        { value: 'product', text: 'Products' },
        { value: 'mixed', text: 'Products & Services' }
      ],
      contract_fields: [
        { key: 'registration_number', label: 'Number' }, 
        { key: 'start_date', label: 'Start' }, 
        { key: 'type', label: 'Type' },
        'show_details'
      ],
      contract_items: [],
      show: true
    }
  },

  methods: {
    rowRG(item, type){
      if (!item || type != 'row') return
      //Contract expired
      if (Date.parse(item.end_date) <= Date.now()) return 'table-danger'
    },

    createContract: function () {
      let payload = {
        company_id: this.company._id,
        client_id: this.clients._id,
        registration_number: this.newdata.registration_number,
        type: this.newdata.type,
        start_date: this.newdata.start_date,
        end_date: this.newdata.end_date,
        details: this.newdata.details
      }
      axios.post('/contracts', payload)
        .then(response => {
          console.log(response.data)
          this.loading = true
          if (response.data.status == 'ok') {
            this.company_data = response.data.dataset.companies
            this.client_data = response.data.dataset.clients
            this.contract_data = response.data.dataset.contracts

            //Create a list with all companies
            this.company_list = this.company_data.map(item => {
              let tmp = {}
              tmp.value = item
              tmp.text = item.name
              return tmp
            })

            //Create a list with all clients of the selected company
            this.client_list = this.client_data.map(item => {
              if (item.company_id == this.company._id) {
                let tmp = {}
                tmp.value = item
                tmp.text = item.name
                return tmp
              }
            })

            //Create a list with all contract of the slected company and client
            this.contract_items = this.contract_data.map(item => {
              if (item.company_id == this.company._id && item.client_id == this.clients._id) {
                return item
              }
            })

            this.newdata = { registration_number: '', type: 'service', start_date: '', end_date: '', details: '' }
            this.loading = false

          }
        })
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

          //Create a list with all companies
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
          this.clients = this.client_list[0].value || null

          //Create a list with all contract of the slected company and client
          this.contract_items = []
          this.contract_data.map(item => {
            if (item.company_id == this.company._id && item.client_id == this.clients._id) {
              this.contract_items.push(item)
            }
          })

          this.newdata = { registration_number: '', type: 'service', start_date: '', end_date: '', details: '' }
          this.loading = false
        }
      })
  },

  template: `
    <div class="d-flex text-center justify-content-center m-3" v-if="loading">
      <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
 
    <b-card title="Contracts" sub-title="Manage B2B Contracts">
       <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
        <b-form-select id="client" v-model="clients" :options="client_list"></b-form-select>
        <b-form-text id="client-help">Select one of the Clients from the list.</b-form-text>

        <div>
          <b-table responsive :items="contract_items" :fields="contract_fields" :tbody-tr-class="rowRG" caption-top>
          <template #table-caption>Contracts</template>
          <template #cell(show_details)="row">
            <b-button pill variant="warning" size="sm" @click="row.toggleDetails" class="mr-2">
              {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
            </b-button>
          </template>

          <template #row-details="row">
            <b-card>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Registration number:</b></b-col>
                <b-col>{{ row.item.registration_number }}</b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Type:</b></b-col>
                <b-col>{{ row.item.type }}</b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Start date:</b></b-col>
                <b-col>{{ row.item.start_date }}</b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>End date:</b></b-col>
                <b-col>{{ row.item.end_date }}</b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Details:</b></b-col>
                <b-col style="white-space: pre-line;">{{ row.item.details }}</b-col>
              </b-row>           
            </b-card>
          </template>          

          </b-table>
        </div>
      </b-card-text>
    </b-card>

    <b-card title="Manage Contracts" head-tag="header" footer-tag="footer">      
  	  <template #header>
        <h6 class="mb-0">Add new Contract</h6>
      </template>    

      <b-form-group :label='$t("contracts.registration_number")' label-for="contracts_registration_number" label-cols-sm="3">
        <b-form-input id="contacts_registration_number" v-model="newdata.registration_number"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("contracts.type")' label-for="contracts_type" label-cols-sm="3">
        <b-form-select id="contacts_type" v-model="newdata.type" :options="contract_type_list"></b-form-select>
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

      <template #footer>
		<b-button variant="success" @click="createContract">Save</b-button>
      </template>

    </b-card>
    </div>
	`
});
