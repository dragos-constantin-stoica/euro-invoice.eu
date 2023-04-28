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
