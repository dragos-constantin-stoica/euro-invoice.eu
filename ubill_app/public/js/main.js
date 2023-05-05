Vue.component("privateHeader",{
	data() {
		return {
			locales: ['gb', 'fr', 'ro'],
			show: true,
		}
	},
	methods: {
		getLocale(){
		return this.$i18n.locale.toUpperCase()
	  },
	  localeFlagClass(){
		return `fi fi-${this.$i18n.locale}`
	  },
	  buildFlagClass(lang){
		return `fi fi-${lang}`
	  },
	  changeLanguage(lang){
		//save user language
		this.$i18n.locale = lang
		localStorage.setItem("language", this.$i18n.locale)
		this.localFlagClass=`fi fi-${lang}`
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
        <b-nav-item href="#">Dashboard</b-nav-item>
        <b-nav-item href="#">Company</b-nav-item>
        <b-nav-item href="#">Clients</b-nav-item>
        <b-nav-item href="#">Contracts</b-nav-item>
        <b-nav-item href="#">Services</b-nav-item>
        <b-nav-item href="#">Invoice</b-nav-item>
        <b-nav-item href="#">Payments</b-nav-item>
        <b-nav-item href="#">Profile</b-nav-item>
        <b-nav-item href="#">Logout</b-nav-item>
	</b-navbar-nav>
			</b-collapse>
	</b-navbar>
	`
});


Vue.component("privateFooter",{
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
