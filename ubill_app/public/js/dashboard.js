Vue.component("dashboard", {
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
    axios
      .get('/companies')
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
    <b-card title="Main dashboard" sub-title="Add significant sections">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>

      <b-card-text>
      Invoice situation: due, outstanding
      Top 10 products/services
      Top 10 clients by invoiced
      Top 10 client by payed
      </b-card-text>

      <b-card-text>Graphs with: y2d invoiced vs payed, monthly payed, monthly invoiced, multianual invoiced vs. payed</b-card-text>

      <b-card-text>
      Export to JSON
      Export to Excel
      Export to CSV
      Export for Accounting company --- see with Iulian Suhanea
      Export to PouchDB in browser and replicate to your own CouchDB/PouchDB instance ;)
      </b-card-text>

      <a href="#" class="card-link">Relevant link</a>
      <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
