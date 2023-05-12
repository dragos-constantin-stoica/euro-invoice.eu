Vue.component("payments", {
    data() {
        return {
            show: true
        }
    },
    template: `
    <div>
    <b-card title="Payments" sub-title="Add significant sections">
        <b-card-text>
        Manage invoice lifecycle: created, overdue, payed --- no strono, no overdue fees :(
        </b-card-text>

        <b-card-text>
        select and invoice that is not fully payed and input the amount that way payed
        </b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
