Vue.component("profile", {
    data() {
        return {
            show: true
        }
    },
    template: `
    <div>
    <b-card title="User profile" sub-title="Add significant sections">
        <b-card-text>
        Mange your personal information.
        </b-card-text>

        <b-card-text>
        Change password
        setup 2FA --- TODO
        add phone number, mobile, fax, alternative email
        </b-card-text>

        <a href="#" class="card-link">Relevant link</a>
        <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
