define(['jquery', 'particleconnection', 'firebaseconnection', 'bootstrap'], function($, ParticleConnection, FirebaseConnection) {
  function App() {
      this.particle = new ParticleConnection();
      this.firebase = new FirebaseConnection("https://lighting-controller.firebaseio.com");
      $(document).ready(this.initialize.apply(this));
  };
  App.prototype = {
      constructor: App,
      particle: new ParticleConnection(),
      login: function() {
          var username = $("#username").val();
          var password = $("#password").val();
          this.particle.login(username, password);
          this.firebase.login(username, password);
      },
      initialize: function() {
          $("#loginButton").click($.proxy(this.login, this));
      }
  };
  return App;
});
