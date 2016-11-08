
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
      window.open = cordova.InAppBrowser.open
      var inAppBrowser = cordova.InAppBrowser.open('http://bitetracker.herokuapp.com', '_self', 'location=no,zoom=no');
      inAppBrowser.addEventListener("exit", function(){
        navigator.app.exitApp();
      })
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

	navigator.app.loadUrl('http://bitetracker.herokuapp.com', {openExternal:false});
	console.log('Received Event: ' + id);
    }
};

app.initialize();
