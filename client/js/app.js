define(['jquery', 'lightingcontrollerdata', 'bootstrap'], function($, LightingControllerData) {
  function App() {
      this.data = new LightingControllerData();
      $(document).ready(this.initialize.apply(this));
  };
  App.prototype = {
      constructor: App,
      particle: new ParticleConnection(),
      token: function() {
        var username = $("#username").val();
        var password = $("#password").val();
        this.data.setAuthToken(username, password, function(status) {
          console.log(status);
        });
      },
      login: function() {
          var username = $("#username").val();
          var password = $("#password").val();
          this.data.login(username, password function(status) {
            console.log(status);
          });
      },
      initialize: function() {
          $("#loginButton").click($.proxy(this.token, this));
      }
  };
  return App;
});
