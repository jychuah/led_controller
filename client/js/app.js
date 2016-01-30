define(['jquery', 'particlebase', 'bootstrap'], function($, ParticleBase) {
  function App() {
      this.data = new ParticleBase();
      $(document).ready(this.initialize.apply(this));
  };
  App.prototype = {
      constructor: App,
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
