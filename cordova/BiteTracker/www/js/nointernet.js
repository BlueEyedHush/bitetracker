function handleClick() {
  var inAppBrowser = cordova.InAppBrowser.open('http://bitetracker.herokuapp.com', '_self', 'location=no,zoom=no, hidden=yes');
  inAppBrowser.addEventListener("exit", function(){
    navigator.app.exitApp();
  });
  inAppBrowser.addEventListener("loaderror", function(event){
    if(event.message.includes("ERR")){
      // alert("cannot connect to the server")
      cordova.InAppBrowser.open('./no_internet.html', '_self', 'location=no,zoom=no,hidden=no')
    }
  });
  inAppBrowser.addEventListener("loadstop", function(){
    appContainer.show();
  })
}
