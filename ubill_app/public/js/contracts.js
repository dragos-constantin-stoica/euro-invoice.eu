Vue.component("contracts", {
    data() {
        return {
            loading: true,
            company: null,
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

    <b-card title="Contracts" sub-title="Add significant sections">
        <b-card-text>
        Contracts are per own company and client. We are talking about B2B contracts.
        </b-card-text>

        <b-card-text>
        Select Company - if there are several companies<br/>
        Select Client - from the clients associated with the selected company
        </b-card-text>

        <b-card-text>
        Mandatory data for a contract: name, type (services, products), start date, end date, details (free text, add daily rates, quantities etc.)
        </b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
