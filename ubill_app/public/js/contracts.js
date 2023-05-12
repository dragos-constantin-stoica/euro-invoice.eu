Vue.component("contracts", {
    data() {
        return {
            show: true
        }
    },
    template: `
    <div>
    <b-card title="Contracts" sub-title="Add significant sections">
        <b-card-text>
        Contracts are per own company and client. We are talking about B2B contracts.
        </b-card-text>

        <b-card-text>
        Select Company - if there are several companies<br/>
        Select Client - from the clients associated with the selected company
        </b-card-text>

        <b-card-text>
        Mandatory data for a contract: name, type (services, products), start date, end date, details (free text, add daily rates, quantities etc.)
        </b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
