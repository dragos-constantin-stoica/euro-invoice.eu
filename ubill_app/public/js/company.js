Vue.component("company", {
    data() {
        return {
            loading: true,
            company: null,
            company_list: [
              { value: null, text: 'Please select an option' },
              { value: 'a', text: 'This is First option' }
            ],
            show: true
        }
    },

    created () {
      axios
      .get('/companies')
      .then(response => {
         console.log(response.data)
         if(response.data.status = 'ok'){
            this.company_list = response.data.dataset.map(item => {
                let tmp = {}
                tmp.value = item
                tmp.text = item.name
                return tmp
            })
            this.company = this.company_list[0].value
            this.loading=false
         }
      })
    },

    template: `
    <div v-if="loading">
          <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    <div v-else>

    <b-card title="Company" sub-title="Select one of the companies from the list">
        <b-form-select v-model="company" :options="company_list"></b-form-select>

        <b-card-text>
        Normaly it should be one single company
        </b-card-text>
    </b-card>

    <b-card title="Details" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">Company data</h6>
      </template>
      <b-card-text>
      Mandatory Fields: name, national registration number, vat number, address
      </b-card-text>
      <b-card-text>
      Optional Fields: CUI, NORC EU ... specific to each country
      </b-card-text>
      <b-card-text>
      Mandatory Fields - Bank accounts: Bank name, IBAN, SWIFT, BIC, Currency
      </b-card-text>
      <b-card-text>
      Mandatory Fields - Invoice number: year, series, number, format (standard format)
      </b-card-text>
      <b-card-text>
      Optional Fields - company logo
      </b-card-text>
      <b-card-text>
      Mandatory Fields - admin user, members users. Admin can manage admins and members. There is always one admin. The logged in user can not delete itself from the list if it is the only admin.
      </b-card-text>
      <b-button href="#" variant="primary">Do something</b-button>

      <template #footer>
        <em>Fill in all mandatory fields</em>
      </template>
    </b-card>

    </div>
	`
});
