// 0. Create i18n instance with options
const i18n = new VueI18n({
	locale: 'gb', // set locale
	fallbackLocale: 'gb', // set fallback locale
	messages, // set locale messages
	// If you need to specify other options, you can set other options
})

if (localStorage.getItem("language")) {
	i18n.locale = localStorage.getItem("language");
} else {
	sessionStorage.setItem("language", i18n.feedbackLocale);
}


function showToast(message, title='Message from server', type='info'){
 window.app.$bvToast.toast(message,
   {
    title: title,
    toaster: 'b-toaster-bottom-center',
    solid: true,
    variant: type,
    appendToast: true
   })
}
