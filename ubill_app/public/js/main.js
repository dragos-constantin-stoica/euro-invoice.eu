Vue.component("privateHeader", {
	data: function() {
		return {
			locales: ['gb', 'fr', 'ro'],
			show: true,
		}
	},
	methods: {
		doShow(component) {
			window.app.showLayout({ currentHeader: 'privateHeader', mainComponent: component, currentFooter: 'privateFooter' })
			console.log(`show ${component}`)
		},
		doLogout() {
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
			console.log('logout')
		},
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
        <b-nav-item href="#" @click="doShow('dashboard')">{{$t("mainmenu.dashboard")}}</b-nav-item>
        <b-nav-item href="#" @click="doShow('invoices')">{{$t("mainmenu.invoice")}}</b-nav-item>
        <b-nav-item href="#" @click="doShow('payments')">{{$t("mainmenu.payments")}}</b-nav-item>
        <b-nav-item href="#" @click="doShow('company')">{{$t("mainmenu.company")}}</b-nav-item>
        <b-nav-item href="#" @click="doShow('services')">{{$t("mainmenu.services")}}</b-nav-item>
        <b-nav-item href="#" @click="doShow('clients')">{{$t("mainmenu.clients")}}</b-nav-item>
        <b-nav-item href="#" @click="doShow('contracts')">{{$t("mainmenu.contracts")}}</b-nav-item>
        <b-nav-item href="#" @click="doShow('profile')">{{$t("mainmenu.profile")}}</b-nav-item>
        <b-nav-item href="#" @click="doShow('onboarding')">Onboarding</b-nav-item>
        <b-nav-item href="#" @click="doLogout">{{$t("mainmenu.logout")}}</b-nav-item>
	</b-navbar-nav>
			</b-collapse>
	</b-navbar>
	`
});


Vue.component("privateFooter", {
	data() {
		return {
			show: true
		}
	},
	template: `
	<div class="footercontainer">
        <span class="text-muted">&copy; <a href="https://datastema.io">DataStema</a> 2023</span>
    </div>
	`
});
