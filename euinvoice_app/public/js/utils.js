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

//Auxiliary funciton for Bootsrap toast messages
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

//Global constants
const VAT_TABLE = {
  AT: [
    { value: 0.0, text: '0%' },
    { value: 10.0, text: '10%' },
    { value: 13.0, text: '13%' },
    { value: 20.0, text: '20%' }
  ],
  BE: [
    { value: 0.0, text: '0%' },
    { value: 6.0, text: '6%' },
    { value: 12.0, text: '12%' },
    { value: 21.0, text: '21%' },
  ],
  BG: [
    { value: 0.0, text: '0%' },
    { value: 9.0, text: '9%' },
    { value: 20.0, text: '20%' },
  ],
  HR: [
    { value: 0.0, text: '0%' },
    { value: 5.0, text: '5%' },
    { value: 13.0, text: '13%' },
    { value: 25.0, text: '25%' },
  ],
  CY: [    
    { value: 0.0, text: '0%' },
    { value: 5.0, text: '5%' },
    { value: 9.0, text: '9%' },
    { value: 19.0, text: '19%' },
  ],
  CZ: [
    { value: 0.0, text: '0%' },
    { value: 10.0, text: '10%' },
    { value: 15.0, text: '15%' },
    { value: 21.0, text: '21%' },
  ],
  DE: [
    { value: 0.0, text: '0%' },
    { value: 7.0, text: '7%' },
    { value: 19.0, text: '19%' },
  ],
  DK: [
    { value: 0.0, text: '0%' },
    { value: 25.0, text: '25%' },
  ],
  EE: [
    { value: 0.0, text: '0%' },
    { value: 9.0, text: '9%' },
    { value: 20.0, text: '20%' },
  ],
  GR: [
    { value: 0.0, text: '0%' },
    { value: 6.0, text: '6%' },
    { value: 13.0, text: '13%' },
    { value: 24.0, text: '24%' },
  ],
  FI: [
    { value: 0.0, text: '0%' },
    { value: 10.0, text: '10%' },
    { value: 14.0, text: '14%' },
    { value: 24.0, text: '24%' },
  ],
  FR: [
    { value: 0.0, text: '0%' },
    { value: 2.1, text: '2.1%' },
    { value: 5.5, text: '5.5%' },
    { value: 10.0, text: '10%' },
    { value: 20.0, text: '20%' },
  ],
  HU: [
    { value: 0.0, text: '0%' },
    { value: 5.0, text: '5%' },
    { value: 18.0, text: '18%' },
    { value: 27.0, text: '27%' },
  ],
  IE: [
    { value: 0.0, text: '0%' },
    { value: 4.8, text: '4.8%' },
    { value: 9.0, text: '9%' },
    { value: 13.5, text: '13.5%' },
    { value: 23.0, text: '23%' },
  ],
  IT: [
    { value: 0.0, text: '0%' },
    { value: 4.0, text: '4%' },
    { value: 5.0, text: '5%' },
    { value: 10.0, text: '10%' },
    { value: 22.0, text: '22%' },
  ],
  LV: [
    { value: 0.0, text: '0%' },
    { value: 5.0, text: '5%' },
    { value: 12.0, text: '12%' },
    { value: 21.0, text: '21%' },
  ],
  LT: [
    { value: 0.0, text: '0%' },
    { value: 5.0, text: '5%' },
    { value: 9.0, text: '9%' },
    { value: 21.0, text: '21%' },
  ],
  LU: [
    { value: 0.0, text: '0%' },
    { value: 3.0, text: '3%' },
    { value: 7.0, text: '7%' },
    { value: 13.0, text: '13%' },
    { value: 16.0, text: '16%' },
  ],
  MT: [
    { value: 0.0, text: '0%' },
    { value: 5.0, text: '5%' },
    { value: 7.0, text: '7%' },
    { value: 18.0, text: '18%' },
  ],
  NL: [
    { value: 0.0, text: '0%' },
    { value: 9.0, text: '9%' },
    { value: 21.0, text: '21%' },
  ],
  PL: [
    { value: 0.0, text: '0%' },
    { value: 5.0, text: '5%' },
    { value: 8.0, text: '8%' },
    { value: 23.0, text: '23%' },
  ],
  PT: [
    { value: 0.0, text: '0%' },
    { value: 6.0, text: '6%' },
    { value: 13.0, text: '13%' },
    { value: 23.0, text: '23%' },
  ],
  RO: [
    { value: 0.0, text: '0%' },
    { value: 5.0, text: '5%' },
    { value: 9.0, text: '9%' },
    { value: 19.0, text: '19%' },
  ],
  SK: [
    { value: 0.0, text: '0%' },
    { value: 10.0, text: '10%' },
    { value: 20.0, text: '20%' },
  ],
  SI: [
    { value: 0.0, text: '0%' },
    { value: 5.0, text: '5%' },
    { value: 9.5, text: '9.5%' },
    { value: 22.0, text: '22%' },
  ],
  ES: [
    { value: 0.0, text: '0%' },
    { value: 4.0, text: '4%' },
    { value: 10.0, text: '10%' },
    { value: 21.0, text: '21%' },
  ],
  SE: [
    { value: 0.0, text: '0%' },
    { value: 6.0, text: '6%' },
    { value: 12.0, text: '12%' },
    { value: 25.0, text: '25%' },
  ]

}

const CURRENCY_LIST = [
  { value: 'BGN', text: 'BGN' },
  { value: 'CZK', text: 'CZK' },
  { value: 'DKK', text: 'DKK' },
  { value: 'EUR', text: 'EUR' },
  { value: 'HUF', text: 'HUF' },
  { value: 'PLN', text: 'PLN' },
  { value: 'RON', text: 'RON' },
  { value: 'SKK', text: 'SKK' },
]

const COUNTRY_LIST = [
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
]

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

