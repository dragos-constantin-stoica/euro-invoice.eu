Vue.component("profile", {
    data: function () {
        return {
            form: {
                oldpassword: '',
                newpassword: '',
                newpassword_bis: ''
            },
            show: true
        }
    },

    methods: {
        changePassword: function () {
            //TODO - check values for all fields/validate form before sending it to server
            //TODO - check password strength
            axios.post('/changepassword', this.form)
                .then(function (response) {
                    console.log(response);
                    showToast(response.data.status == 'ok' ? response.data.message : response.data.error, 'Message from Server', response.data.status == 'ok' ? 'success' : 'error')
                    //if password successfully changed then logout
                    if (response.data.status == 'ok') {
                        axios.post('/logout')
                            .then(function (response) {
                                console.log(response);
                                showToast(response.data.status == 'ok' ? response.data.message : response.data.error, 'Message from Server', response.data.status == 'ok' ? 'success' : 'error')
                                if (response.data.action) {
                                    window.app[response.data.action](response.data.args)
                                }
                            })
                            .catch(function (error) {
                                console.log(error);
                                showToast(error.data.error, 'Message from Server', 'danger')
                            })
                            .finally(function () {
                                // always executed
                            });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    showToast(error.data.error, 'Message from Server', 'danger')
                })
                .finally(function () {
                    // always executed
                });
            console.log('change password')
        }
    },

    template: `
    <div>
    <b-card title="Change password" header-tag="header" footer-tag="footer">
	  <template #header>
        <h6 class="mb-0">User profile</h6>
      </template>    
    
        <b-form-group :label='$t("profile.oldpassword")' label-for="oldpassword" label-cols-sm="3">
          <b-form-input id="oldpassword" v-model="form.oldpassword" type="password"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("profile.newpassword")' label-for="newpassword" label-cols-sm="3">
	  <b-form-input id="newpassword" v-model="form.newpassword" type="password"></b-form-input>
	</b-form-group>

	<b-form-group :label='$t("profile.newpassword")' label-for="newpassword_bis" label-cols-sm="3">
 	  <b-form-input id="newpassword_bis" v-model="form.newpassword_bis" type="password"></b-form-input>
	</b-form-group>
    <template #footer>
	<b-button variant="success" @click="changePassword">{{$t("profile.btn_changepassword")}}</b-button>
    </template>
    </b-card>
    </div>
	`
});
