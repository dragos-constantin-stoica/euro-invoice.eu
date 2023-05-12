Vue.component("clients", {
    data() {
        return {
            show: true
        }
    },
    template: `
    <div>
    <b-card title="Clients" sub-title="Add significant sections">
        <b-card-text>
        We have a list of clients. Ideally they are registered as Companies in the database so that we can naturally invite them to join the platform.
        For each Company there is a separate list of Clients.
        </b-card-text>

        <b-card-text>
        Select company or default select the only company.
        </b-card-text>

	<b-card-text>
        Mandatory data: full name, national registration number, vat code, address.
        Contact person email ;-) to send  marketing messages.
        Check if the company already exists in our database and use that data.
        </b-card-text>

        <b-card-text>
        Optional data: bank name, iban, swift, bic, currency (multiple accounts should be possible)
        </b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
