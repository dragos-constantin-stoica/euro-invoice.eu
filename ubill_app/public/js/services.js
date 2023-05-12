Vue.component("services", {
    data() {
        return {
            show: true
        }
    },
    template: `
    <div>
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
