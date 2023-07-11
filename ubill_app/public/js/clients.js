Vue.component("clients", {
    data() {
        return {
            loading: true,
            company:null,
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
          this.loading = false
        }
      })
    },
    
    template: `
    <div class="d-flex justify-content-center mb-3" v-if="loading">
          <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Company" sub-title="Select one of the companies from the list">
        <b-form-select v-model="company" :options="company_list"></b-form-select>
    </b-card>

    <b-card title="Clients" sub-title="Add significant sections">
        <b-card-text>
        We have a list of clients. Ideally they are registered as Companies in the database so that we can naturally invite them to join the platform.
        For each Company there is a separate list of Clients.
        </b-card-text>

        <b-card-text>
        Select company or default select the only company.
        </b-card-text>

	<b-card-text>
        Mandatory data: full name, national registration number, vat code, address.
        Contact person email ;-) to send  marketing messages.
        Check if the company already exists in our database and use that data.
        </b-card-text>

        <b-card-text>
        Optional data: bank name, iban, swift, bic, currency (multiple accounts should be possible)
        </b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
