
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
      window.open = cordova.InAppBrowser.open
      var appContainer = cordova.InAppBrowser.open('http://bitetracker.herokuapp.com', '_self', 'location=no,zoom=no,hidden=yes');
      appContainer.addEventListener("backbutton", function (e) {
        e.preventDefault()
      , false});
      appContainer.addEventListener("loadstop", function() {
        appContainer.show();
      });
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
