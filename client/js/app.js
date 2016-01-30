define(['jquery', 'particlebase', 'bootstrap'], function($, ParticleBase) {
  function App() {
      this.data = new ParticleBase("https://lighting-controller.firebaseio.com");
      $(document).ready(this.initialize.apply(this));
  };
  App.prototype = {
      constructor: App,
      token: function() {
        var particle_username = $("#username").val();
        var particle_password = $("#password").val();
        this.data.bindToParticle(particle_username, particle_password, function(status) {
          console.log(status);
        });
      },
      login: function() {
          var username = $("#username").val();
          var password = $("#password").val();
          this.data.login(username, password, function(status) {
            console.log(status);
          });
      },
      initialize: function() {
          $("#loginButton").click($.proxy(this.login, this));
          $("#setAuthToken").click($.proxy(this.token, this));
      }
  };
  return App;
});
