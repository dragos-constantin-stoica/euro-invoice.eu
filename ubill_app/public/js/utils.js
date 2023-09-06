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

//Get the day of the year
function getDay(date = new Date()) {
  return Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
}

//Get Communication Structuree
function getCS(date=new Date(), invoice_number) {
  //The format is +++DDD/YYYY/####CC+++
  const fy = date.getFullYear(), ddd = getDay(date), magic_number = parseInt("".concat(ddd, fy, invoice_number.toString()).padStart(4,'0'), 10)
  let cc = (magic_number%97 == 0)? 97:(magic_number%97)
  return `+++${ddd.toString().padStart(3,'0')}/${fy.toString().padStart(4,'0')}/${invoice_number.toString().padStart(4,'0')}${cc.toString().padStart(2,'0')}+++`  
}
