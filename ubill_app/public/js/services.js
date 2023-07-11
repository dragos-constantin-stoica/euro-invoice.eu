Vue.component("services", {
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
    <b-card title="Services and Products" sub-title="Add significant sections">
        <b-card-text>
        Those items are generic but they can be also specific to one sigle or a couple of contracts.
        Try to have services and products as generic as possible in order to be able to build analytics, reports and graphs.
        </b-card-text>

        <b-card-text>
        We have a list of products and services.
        Mandatory data: description, unit (hours, days, weeks, months, kg, pcs etc.), unit price, currency, VAT(optional maybe)
        </b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
