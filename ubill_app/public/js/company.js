Vue.component("company", {
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

    <b-card title="Details" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">Company data</h6>
      </template>

      <b-card-text>
      Mandatory Fields: name, national registration number, vat number, address
      </b-card-text>
      
      <b-form-group :label='$t("company.name")' label-for="company_name" label-cols-sm="3">
        <b-form-input id="company_name" v-model="company.name"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.national_registration_number")' label-for="national_registration_number" label-cols-sm="3">
        <b-form-input id="national_registration_number" v-model="company.national_registration_number"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.country")' label-for="country" label-cols-sm="3">
        <b-form-input id="country" v-model="company.country"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.vat")' label-for="vat" label-cols-sm="3">
        <b-form-input id="vat" v-model="company.vat"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.address")' label-for="address" label-cols-sm="3">
        <b-form-input id="address" v-model="company.address"></b-form-input>
      </b-form-group>


      <b-form-group :label='$t("company.bank_accounts")' label-for="bank_accounts" label-cols-sm="3">
        <b-form-input id="bank_accounts" v-model="company.bank_accounts"></b-form-input>
      </b-form-group>
      
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

      <template #footer>
        <em>Fill in all mandatory fields</em>
      </template>
    </b-card>


    <b-card title="Visual identity" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">Logo</h6>
      </template>

      <template #footer>
        <em>Upload file 300 x 300 px</em>
      </template>
    </b-card>

    </div>
	`
});
