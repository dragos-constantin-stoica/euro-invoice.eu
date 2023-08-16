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
			//TODO - check values for all fields
			axios.post('/login', this.form)
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
			console.log('user login')
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
		companyRegister() {
			//TODO - check values for all fields
			axios.post('/register', this.form)
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

			console.log('company register')
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
			<b-form-input id="password_check" type="password" placeholder="the same password as above"  required></b-form-input>
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
	</b-container>
	`
});

Vue.component("publicHeader", {
	data() {
		return {
			locales: ['gb', 'fr', 'ro'],
			show: true,
		}
	},
	methods: {
		getLocale() {
			return this.$i18n.locale.toUpperCase()
		},
		localeFlagClass() {
			return `fi fi-${this.$i18n.locale}`
		},
		buildFlagClass(lang) {
			return `fi fi-${lang}`
		},
		changeLanguage(lang) {
			//save user language
			this.$i18n.locale = lang
			localStorage.setItem("language", this.$i18n.locale)
			this.localFlagClass = `fi fi-${lang}`
			console.log(lang)
		},
	},
	template: `
	<b-navbar toggleable="lg" type="light" variant="light">
			<b-navbar-brand href="/">UnityBill</b-navbar-brand>
			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
			<b-collapse id="nav-collapse" is-nav>

	<!-- Right aligned nav items -->
	<b-navbar-nav class="ml-auto">

	<b-dropdown right size="lg"  variant="link" toggle-class="text-decoration-none" no-caret>
			<template #button-content>
				<span :class="localeFlagClass()"></span>&nbsp;{{ getLocale() }}&nbsp;<b-icon icon="translate" aria-hidden="true"></b-icon>
			</template>

			<b-dropdown-item v-for="item in locales" v-bind:key="item.id"
					 @click="changeLanguage(item)"><span :class="buildFlagClass(item)"></span>&nbsp; {{item.toUpperCase()}}</b-dropdown-item>
	</b-dropdown>
	</b-navbar-nav>
			</b-collapse>
	</b-navbar>
	`
});


Vue.component("publicFooter", {
	data() {
		return {
			show: true
		}
	},
	template: `
	<div class="footercontainer">
        <span class="text-muted">&copy;DataStema 2023</span>
    </div>
	`
});
