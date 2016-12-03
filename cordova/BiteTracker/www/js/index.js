
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.



    onDeviceReady: function() {
      document.addEventListener("deviceready", onDeviceReady, false);
      function onDeviceReady() {
        document.addEventListener("backbutton", function (e) {
          e.preventDefault();
        }, false );}
      window.open = cordova.InAppBrowser.open;

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
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
