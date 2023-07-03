Vue.component("company", {
  data() {
    return {
      loading: true,
      logofile: null,
      newdata: { address: '', bank_name:'', iban: '', swift: '', bic: '', currency: ''},
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

      <b-form-group v-for="item in company.address" :label='$t("company.address")' label-cols-sm="3" rows="5" max-rows="7">
         <b-form-textarea v-model="item"></b-form-textarea>
         <b-button variant="success">Save</b-button>
      </b-form-group>

      <b-form-group :label='$t("company.address")' label-cols-sm="3" rows="5">
        <b-form-textarea v-model="newdata.address"></b-form-textarea>
        <b-button variant="primary">Add</b-button>
      </b-form-group>

      <b-form-group v-for="item in company.bank_accounts" :label='$t("company.bank_accounts")' label-for="bank_name" label-cols-sm="3">
        <b-form-input id="bank_name" v-model="item.bank_name"></b-form-input>
        <b-form-input id="iban" v-model="item.iban"></b-form-input>
        <b-form-input id="swift" v-model="item.swift"></b-form-input>
        <b-form-input id="bic" v-model="item.bic"></b-form-input>
        <b-button variant="success">Save</b-button>
      </b-form-group>
      
      <b-form-group :label='$t("company.bank_accounts")' label-for="bank_name" label-cols-sm="3">
        <b-input-group prepend="Bank">
        <b-form-input v-model="newdata.bank_name"></b-form-input>  
        </b-input-group>
        <b-input-group prepend="IBAN"> 
        <b-form-input v-model="newdata.iban"></b-form-input>
        </b-input-group>
        <b-input-group prepend="SWIFT"> 
        <b-form-input v-model="newdata.swift"></b-form-input>
        </b-input-group>
        <b-input-group prepend="BIC">
        <b-form-input v-model="newdata.bic"></b-form-input>
        </b-input-group>
        <b-button variant="primary">Add</b-button>
      </b-form-group>

      <b-card-text>
      Mandatory Fields - Invoice number: year, series, number, format (standard format)
      </b-card-text>

      <b-card-text>
      Mandatory Fields - admin user, members users. Admin can manage admins and members. There is always one admin. The logged in user can not delete itself from the list if it is the only admin.
      </b-card-text>

      <template #footer>
        <em>Fill in all mandatory fields</em>
      </template>
    </b-card>

    <b-card title="Admin" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">User management</h6>
      </template>       
       <b-card-text>Member</b-card-text>
      <template #footer>
        <em>User notified via email.</em>
      </template> 
    </b-card>


    <b-card title="Visual identity" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">Logo</h6>
      </template>
        <b-form-file v-model="logofile" :state="Boolean(logofile)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
        <div class="mt-3">Selected file: {{ logofile ? logofile.name : '' }}</div>            
      <template #footer>
        <em>Upload file 300 x 300 px</em>
      </template>
    </b-card>

    </div>
	`
});
