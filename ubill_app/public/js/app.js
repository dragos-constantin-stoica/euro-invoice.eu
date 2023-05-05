// 1. Create a vue root instance
	window.app = new Vue({
	i18n,
	el: '#app',
	data: {
		currentHeader: 'publicHeader',
		currentFooter: 'publicFooter',
		mainComponent: 'login',
		locales: ['gb', 'fr', 'ro'],
		sse_listening: false,
		sse_source: null,
	},
	mounted() {
	   //register SSE listener
	   if (!this.sse_listening){

		this.sse_source = new EventSource('/events');
		this.sse_source.addEventListener('message', message => {
			console.log('Got', message.data);
			let payload = JSON.parse(message.data)
			// Display toaset with the message
			if (payload.status == "error"){
				showToast(`Message from server: ${payload.error}`, 'SSE Message', 'danger')
			}else{
			//ok, execute action
				showToast(`Message from server: ${payload.message}`, 'SSE Message', 'success')
				window.app[payload.action](payload.args)
			}
		});

		this.sse_listening=true
	   }
	},
	methods: {
	  showLayout(layout={currentHeader:'publicHeader', mainComponent:'login', currentFooter:'publicFooter'}){
		this.mainComponent = layout.mainComponent
                this.currentHeader = layout.currentHeader
                this.currentFooter = layout.currentFooter
	  },
	}
  })
