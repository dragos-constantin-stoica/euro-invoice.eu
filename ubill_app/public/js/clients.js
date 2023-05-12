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
        Some quick example text to build on the <em>card title</em> and make up the bulk of the card's
        content.
        </b-card-text>

        <b-card-text>A second paragraph of text in the card.</b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
