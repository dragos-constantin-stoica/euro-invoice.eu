Vue.component("clients", {
  data: function () {
    return {
      loading: true,
      company: null,
      clients: {},
      newdata: {
        email: '',
        mobile: '',
        name: '',
        national_registration_number: null,
        country: null,
        vat: null,
        address: [],
        newaddress: '',
        bank_accounts: [],
        bank_name: '',
        iban: '',
        swift: '',
        bic: '',
        currency: 'EUR'
      },
      clients_fields: [
        { key: 'name', label: 'Client' },
        { key: 'country', label: 'Country' },
        'show_details'
      ],
      clients_items: [],
      company_list: [
        { value: null, text: 'Please select an option' }
      ],
      countries_list: COUNTRY_LIST,
      currency_list: CURRENCY_LIST,
      show: true
    }
  },

  methods: {
    nicePrintAddress: function (address) {
      return address.join('\n____\n')
    },
    addAddress: function () {
      if (this.newdata.newaddress.length > 0) {
        //add the address to the corresponding company from the list
        this.newdata.address.unshift(this.newdata.newaddress)
        this.newdata.newaddress = null
      }
    },
    addBankAccount: function () {
      if (this.newdata.bank_name.length > 0 && this.newdata.iban.length > 0) {
        let tmp = {
          bank_name: this.newdata.bank_name,
          iban: this.newdata.iban,
          swift: this.newdata.swift,
          bic: this.newdata.bic,
          currency: this.newdata.currency
        }
        this.newdata.bank_accounts.unshift(tmp)
      }
    },
    checkVIES: function(val = this.newdata.vat){
      const country = val.substring(0,2).trim().toUpperCase(), nr = val.substring(2).trim()
      axios.post('/vies', {country: country, number:nr})
      .then(response =>{
        if (response.data.isValid){
          showToast(`The Company ${response.data.name} is ${response.data.userError}. Address: ${response.data.address} `, 'VIES Response', 'success')
        }else{
          showToast(`The Company VAT is: ${response.data.userError}`, 'VIES Response', 'error')
        }
      }) 
    },
    createClient: function () {
      this.loading = true
      if (this.newdata.vat) this.newdata.vat= this.newdata.vat.replace(/[^a-z0-9]/gi, '').toUpperCase()
      this.newdata.national_registration_number = this.newdata.national_registration_number.replace(/[^a-z0-9]/gi, '').toUpperCase()
      let payload = {
        email: this.newdata.email,
        mobile: this.newdata.mobile,
        address: this.newdata.address,
        name: this.newdata.name,
        national_registration_number: this.newdata.national_registration_number,
        country: this.newdata.country,
        vat: this.newdata.vat,
        bank_accounts: this.newdata.bank_accounts,
        company_id: this.company._id
      };
      axios.post('/clients', payload)
        .then(response => {
          console.log(response.data)
          if (response.data.status = 'ok') {
            this.company_list = response.data.dataset.companies.map(item => {
              let tmp = {}
              tmp.value = item
              tmp.text = item.name
              this.clients[item._id] = []
              return tmp
            })
            response.data.dataset.clients.map(item => {
              this.clients[item.company_id].push(item)
            })
            //we select by default the 1st company
            this.company = this.company_list[0].value
            this.clients_items = this.clients[this.company._id]
            this.newdata = {
              email: '',
              mobile: '',
              name: '',
              national_registration_number: null,
              country: null,
              vat: null,
              address: [],
              newaddress: '',
              bank_accounts: [],
              bank_name: '',
              iban: '',
              swift: '',
              bic: '',
              currency: 'EUR'
            }
            this.loading = false
          }
        })
    }

  },

  created() {
    axios.get('/clients')
      .then(response => {
        console.log(response.data)
        if (response.data.status == 'ok') {
          this.company_list = response.data.dataset.companies.map(item => {
            let tmp = {}
            tmp.value = item
            tmp.text = item.name
            this.clients[item._id] = []
            return tmp
          })
          //we select by default the 1st company
          this.company = this.company_list[0].value
          //Load Clients for this Company
          response.data.dataset.clients.map(item => {
            this.clients[item.company_id].push(item)
          })
          this.clients_items = this.clients[this.company._id]
          this.newdata = {
            email: '',
            mobile: '',
            name: '',
            national_registration_number: null,
            country: null,
            vat: null,
            address: [],
            newaddress: '',
            bank_accounts: [],
            bank_name: '',
            iban: '',
            swift: '',
            bic: '',
            currency: 'EUR'
          }
          this.loading = false
        }
      })
  },

  template: `
    <div class="d-flex text-center justify-content-center m-3" v-if="loading">
      <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Clients" sub-title="Manage Clients">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>

        <div>
          <b-table responsive :items="clients_items" :fields="clients_fields" caption-top>
          <template #table-caption>Clients</template>
          <template #cell(show_details)="row">
            <b-button pill variant="warning" size="sm" @click="row.toggleDetails" class="mr-2">
              {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
            </b-button>
          </template>
          <template #row-details="row">
            <b-card>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Name:</b></b-col>
                <b-col>{{ row.item.name }}</b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>National Registration Number:</b></b-col>
                <b-col>{{ row.item.national_registration_number }}</b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Country:</b></b-col>
                <b-col>{{ row.item.country }}</b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>VAT:</b></b-col>
                <b-col>{{ row.item.vat }}
                <b-button size="sm" variant="outline-info" @click="checkVIES(row.item.vat)">VIES Check</b-button>
                </b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Mobile:</b></b-col>
                <b-col>{{ row.item.mobile }}</b-col>
              </b-row>  
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Contact:</b></b-col>
                <b-col>{{ row.item.email }}</b-col>
              </b-row>          
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Address:</b></b-col>
                <b-col style="white-space: pre-line;">{{ nicePrintAddress(row.item.address) }}</b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Bank Accounts:</b></b-col>
                <b-col v-for="ba in row.item.bank_accounts">
                    <b>Bank </b>{{ ba.bank_name }}<br/>
                    <b>IBAN </b>{{ ba.iban }}<br/>
                    <b>SWIFT </b>{{ ba.swift }}<br/>
                    <b>BIC </b>{{ ba.bic }}<br/>
                    <b>Currency </b> {{ba. currency}}
                </b-col>
              </b-row>          
              <b-button pill variant="warning" size="sm" @click="row.toggleDetails">Hide Details</b-button>
            </b-card>
          </template>
          </b-table>
        </div>
      </b-card-text>

      <!--
      <b-card-text>
          <b-form-input id="client_search" type="search"></b-form-input>
          <b-form-text id="client_search-help">Enter any information: company name, national registration number, VAT.</b-form-text>
      </b-card-text>
      -->
   </b-card>
   
   <b-card title="Manage Clients" head-tag="header" footer-tag="footer">      
  	  <template #header>
        <h6 class="mb-0">Add new Client</h6>
      </template>    
 
      <b-form-group :label='$t("company.name")' label-for="company_name" label-cols-sm="3">
        <b-form-input id="company_name" v-model="newdata.name"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.national_registration_number")' label-for="national_registration_number" label-cols-sm="3">
        <b-form-input id="national_registration_number" v-model="newdata.national_registration_number"></b-form-input>
      </b-form-group>

      <b-form-group :label='$t("company.country")' label-for="country" label-cols-sm="3">
        <b-form-select id="country" v-model="newdata.country" :options="countries_list"></b-form-select>
      </b-form-group>

      <b-form-group :label='$t("company.vat")' label-for="vat" label-cols-sm="3">
        <b-input-group>
        <b-form-input id="vat" v-model="newdata.vat"></b-form-input>
          <b-input-group-append>
            <b-button variant="outline-info" @click="checkVIES(newdata.vat)">VIES Check</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>

      <b-form-group :label='$t("clients.mobile")' label-for="mobile" label-cols-sm="3">
        <b-form-input id="mobile" type="tel" v-model="newdata.mobile"></b-form-input>
      </b-form-group>
      <b-form-group :label='$t("clients.email")' label-for="email" label-cols-sm="3">
        <b-form-input id="email" type="email" v-model="newdata.email"></b-form-input>
      </b-form-group>

      <b-form-group v-for="item in newdata.address" :label='$t("clients.address")' label-cols-sm="3">
         <b-form-textarea v-model="item" rows="5" max-rows="7" plaintext='true'></b-form-textarea>
      </b-form-group>

      <b-form-group :label='$t("clients.address")' label-cols-sm="3">
        <b-form-textarea v-model="newdata.newaddress" rows="5" max-rows="7"></b-form-textarea>
        <b-button variant="primary" @click="addAddress">Add</b-button>
      </b-form-group>

      <b-form-group v-for="item in newdata.bank_accounts" :label='$t("clients.bank_accounts")' label-for="bank_name" label-cols-sm="3">
        <b-form-input id="bank_name" v-model="item.bank_name" readonly="true"></b-form-input>
        <b-form-input id="iban" v-model="item.iban" readonly="true"></b-form-input>
        <b-form-input id="swift" v-model="item.swift" readonly="true"></b-form-input>
        <b-form-input id="bic" v-model="item.bic" readonly="true"></b-form-input>
        <b-form-input id="currency" v-model="item.currency" readonly="true"></b-form-input>
      </b-form-group>
      
      <b-form-group :label='$t("clients.bank_accounts")' label-for="bank_name" label-cols-sm="3">
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
        <b-input-group prepend="Currency">
        <b-form-select v-model="newdata.currency" :options="currency_list"></b-form-select>
        </b-input-group>
        <b-button variant="primary" @click="addBankAccount">Add</b-button>
      </b-form-group>

      <template #footer>
		<b-button variant="success" @click="createClient">Save</b-button>
      </template>

    </b-card>
    </div>
	`
});
