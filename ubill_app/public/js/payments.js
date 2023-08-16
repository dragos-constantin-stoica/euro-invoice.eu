Vue.component("payments", {
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
    <b-card title="Payments" sub-title="Add significant sections">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>  
      <b-card-text>
      Manage invoice lifecycle: created, overdue, payed --- no strono, no overdue fees maybe in pro version
      </b-card-text>

      <b-card-text>
      select an invoice that is not fully payed and input the amount that was payed
      </b-card-text>

      <a href="#" class="card-link">Relevant link</a>
      <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
