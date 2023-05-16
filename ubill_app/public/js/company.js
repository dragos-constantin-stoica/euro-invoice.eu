Vue.component("company", {
    data() {
        return {
            show: true
        }
    },
    template: `
    <div>

    <b-card title="Company" sub-title="Add significant sections">
        <b-card-text>
        Select one of the companies from the list
        </b-card-text>

        <b-card-text>
        Normaly it should be one single company
        </b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>

    <b-card title="Company data" header-tag="header" footer-tag="footer">
      <template #header>
        <h6 class="mb-0">Mandatory</h6>
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
        <em>Per company</em>
      </template>
    </b-card>

    </div>
	`
});
