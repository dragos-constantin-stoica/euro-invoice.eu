Vue.component("login", {

	//props: ["form"],
	data() {
		return {
			form: {
				username: '',
				password: '',
			},
			show: true
		}
	},
	methods: {
		showRegister() {
			window.app.showLayout({ currentHeader: 'publicHeader', mainComponent: 'register', currentFooter: 'publicFooter' })
			console.log('show register')
		},
		userLogin() {
			//check values for all fields
			//check email
			let emailregex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
			if (!emailregex.test(this.form.username)){
				showToast('The username must be your email', 'Login validation', 'danger')
				return
			}
			//check password
			let passwordregex = /^(?=.*[0-9])(?=.*[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~])[a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~*]{8,}$/;
			if (!passwordregex.test(this.form.password)){
				showToast('The password should match the one from registration', 'Login validation', 'danger')
				return
			}

			axios.post('/login', this.form)
				.then(function (response) {
					//console.log(response);
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
			//console.log('user login')
		},
	},
	template: `
	<b-container fluid class="w-100 m-auto" style="max-width: 530px;padding: 1rem;">
	<b-card  title="Login">
		<b-form-group :label='$t("login.username")' label-for="username" label-cols-sm="3">
		  <b-form-input id="username" v-model="form.username"></b-form-input>
		</b-form-group>

		<b-form-group :label='$t("login.password")' label-for="password" label-cols-sm="3">
			<b-form-input id="password" v-model="form.password" type="password"></b-form-input>
		</b-form-group>

		<b-button variant="success" @click="userLogin">{{$t("login.btn_login")}}</b-button>
	</b-card>
    <b-button variant="link" @click="showRegister">{{$t("login.btn_register")}}</b-button>
	</b-container>
	`
});

Vue.component("register", {

	//props: ["form"],
	data() {
		return {
			form: {
				username: '',
				password: '',
				name: '',
				country: null,
				national_registration_number: ''
			},
			password_bis:'',
			countries: [
				{ value: null, text: 'Please select an option' },
				{ value: 'AT', text: 'Austria' },
				{ value: 'BE', text: 'Belgium' },
				{ value: 'BG', text: 'Bulgaria' },
				{ value: 'HR', text: 'Croatia' },
				{ value: 'CY', text: 'Cyprus' },
				{ value: 'CZ', text: 'Czechia' },
				{ value: 'DK', text: 'Denmark' },
				{ value: 'EE', text: 'Estonia' },
				{ value: 'FI', text: 'Finland' },
				{ value: 'FR', text: 'France' },
				{ value: 'DE', text: 'Germany' },
				{ value: 'GR', text: 'Greece' },
				{ value: 'HU', text: 'Hungary' },
				{ value: 'IE', text: 'Ireland' },
				{ value: 'IT', text: 'Italy' },
				{ value: 'LV', text: 'Latvia' },
				{ value: 'LT', text: 'Lithuania' },
				{ value: 'LU', text: 'Luxembourg' },
				{ value: 'MT', text: 'Malta' },
				{ value: 'NL', text: 'Netherlands' },
				{ value: 'PL', text: 'Poland' },
				{ value: 'PT', text: 'Portugal' },
				{ value: 'RO', text: 'Romania' },
				{ value: 'SK', text: 'Slovakia' },
				{ value: 'SI', text: 'Slovenia' },
				{ value: 'ES', text: 'Spain' },
				{ value: 'SE', text: 'Sweden' },
			],
			show: true
		}
	},
	methods: {
		showLogin(){
			window.app.showLayout({ currentHeader: 'publicHeader', mainComponent: 'login', currentFooter: 'publicFooter' })
			console.log('show login')
		},

		companyRegister() {
			//check values for all fields
			//check email
			let emailregex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
			if (!emailregex.test(this.form.username)){
				showToast('The username must be your email', 'Form validation', 'danger')
				return
			}
			//check password
			let passwordregex = /^(?=.*[0-9])(?=.*[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~])[a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~*]{8,}$/;
			if (!passwordregex.test(this.form.password)){
				showToast('Password must contain at least one lower case letter, upper case letter, digit and special symbol. Password length is minimum 8 characters.', 'Form validation', 'danger')
				return
			}
			//passwords must match
			if (this.password_bis != this.form.password){
				showToast('The two passwords must be identical.', 'Form validation', 'danger')
				return
			}
			if (this.form.name.length == 0){
				showToast('Please input your Company.', 'Form validation', 'danger')
				return
			}
			if (this.form.national_registration_number.length == 0){
				showToast('Please input National Registration Number of your Company.', 'Form validation', 'danger')
				return
			}
			if (!this.form.country){
				showToast('Please select a country from the list', 'Form validation', 'danger')
				return
			}
			
			//It seems that we got some valid data
			this.form.national_registration_number = this.form.national_registration_number.replace(/[^a-z0-9]/gi, '').toUpperCase()
			axios.post('/register', this.form)
				.then(function (response) {
					//console.log(response);
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

			//console.log('company register')
		},
	},
	template: `
	<b-container fluid>
	<b-card>

	<b-form-group label-cols-lg="3" :label='$t("register.grp_user")' label-size="lg" label-class="font-weight-bold pt-0" class="mb-0">
		<b-form-group :label='$t("login.username")' label-for="username" label-cols-sm="3" label-align-sm="right">
			<b-form-input id="username" v-model="form.username" type="email" placeholder="email address" required></b-form-input>
		</b-form-group>

		<b-form-group :label='$t("login.password")' label-for="password" label-cols-sm="3" label-align-sm="right">
			<b-form-input id="password" v-model="form.password" type="password" placeholder="strong password" required></b-form-input>
		</b-form-group>

		<b-form-group :label='$t("login.password")' label-for="password_check" label-cols-sm="3" label-align-sm="right">
			<b-form-input id="password_check" v-model="password_bis" type="password" placeholder="the same password as above"  required></b-form-input>
		</b-form-group>
	</b-form-group>

	<b-form-group label-cols-lg="3" :label='$t("register.grp_company")' label-size="lg" label-class="font-weight-bold pt-0" class="mb-0">
		<b-form-group :label='$t("register.name")' label-for="company-name" label-cols-sm="3" label-align-sm="right">
			<b-form-input id="company-name" v-model="form.name" placeholder="full company name" required></b-form-input>
		</b-form-group>
		<b-form-group :label='$t("register.number")' label-for="company-number" label-cols-sm="3" label-align-sm="right">
			<b-form-input id="company-number" v-model="form.national_registration_number" placeholder="national registration number" required></b-form-input>
		</b-form-group>
		<b-form-group :label='$t("register.country")' label-for="company-country" label-cols-sm="3" label-align-sm="right">
			<b-form-select id="company-country" v-model="form.country" :options="countries" required></b-form-select>
		</b-form-group>
	</b-form-group>

	<b-button variant="success" @click="companyRegister">{{$t("register.btn_register")}}</b-button>
	</b-card>
	<b-button variant="link" @click="showLogin">{{$t("login.btn_login")}}</b-button>
	</b-container>
	`
});