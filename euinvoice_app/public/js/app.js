// 1. Create a vue root instance
window.app = new Vue({
	i18n,
	el: '#app',
	data: {
		currentHeader: 'publicHeader',
		currentFooter: 'publicFooter',
		mainComponent: 'login',
		locales: ['gb', 'fr', 'ro'],
	},

	methods: {
		showLayout(layout = { currentHeader: 'publicHeader', mainComponent: 'login', currentFooter: 'publicFooter' }) {
			this.mainComponent = layout.mainComponent
			this.currentHeader = layout.currentHeader
			this.currentFooter = layout.currentFooter
		},
	}

})
