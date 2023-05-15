Vue.component("profile", {
    data() {
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
     changePassword(){
	//TODO - check values for all fields/validate form before sending it to server
        axios.post('/changepassword', this.form)
           .then(function (response) {
            console.log(response);
                showToast(response.data.status=='ok'?response.data.message:response.data.error, 'Message from Server', response.data.status=='ok'?'success':'error')
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
    <b-card title="User profile" sub-title="Manage your personal information">
        <b-card-text>Change password</b-card-text>

        <b-form-group :label='$t("profile.oldpassword")' label-for="oldpassword" label-cols-sm="3">
          <b-form-input id="oldpassword" v-model="form.oldpassword"></b-form-input>
        </b-form-group>

        <b-form-group :label='$t("profile.newpassword")' label-for="newpassword" label-cols-sm="3">
	  <b-form-input id="newpassword" v-model="form.newpassword"></b-form-input>
	</b-form-group>

	<b-form-group :label='$t("profile.newpassword")' label-for="newpassword_bis" label-cols-sm="3">
 	  <b-form-input id="newpassword_bis" v-model="form.newpassword_bis"></b-form-input>
	</b-form-group>

	<b-button variant="success" @click="changePassword">{{$t("profile.btn_changepassword")}}</b-button>

        <b-card-text>
        setup 2FA --- TODO
        add phone number, mobile, fax, alternative email --- TODO
        </b-card-text>

    </b-card>
    </div>
	`
});
