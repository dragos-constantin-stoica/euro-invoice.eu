Vue.component("Invoices", {
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
    <b-card title="Invoices" sub-title="Add significant sections">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>    
          
      <b-card-text>
        This is where invoices are created. The core of the application :)
        An invoice is a form of formal contract established between Company and Client based on a Contract and contains a list of Products and Services.
        The invoice template contains standard elements and for those that pay for a subsctiption some other elements may be added.
        There is a standard template for free users and custom template for paying users.
        Watermark and DataStema publicity will be present on free version.
        </b-card-text>

        <b-card-text>
        Mandatatory fields: template language (this should correspond with the available languages in the application but not mandatory to be exact correspondence, at least one template EN), serial number, invoice currency
        creation date (default today), due date, instruction for payment, company data, client data, overall intstructions/comments, contract, product and services items (may change VAT, add the total item value)<br/>
        Optional fields: exchange rate from invoice currency
        </b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
