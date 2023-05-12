Vue.component("dashboard", {
    data() {
        return {
            show: true
        }
    },
    template: `
    <div>
    <b-card title="Main dashboard" sub-title="Add significant sections">
        <b-card-text>
        Invoice situation: due, outstanding
        Top 10 products/services
        Top 10 clients by invoiced
        Top 10 client by payed
        </b-card-text>

        <b-card-text>Graphs with: y2d invoiced vs payed, monthly payed, monthly invoiced, multianual invoiced vs. payed</b-card-text>

        <b-card-text>
        Export to JSON
        Export to Excel
        Export to CSV
        Export for Accounting company --- see with Iulian Suhanea
        Export to PouchDB in browser and replicate to your own CouchDB/PouchDB instance ;)
        </b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
