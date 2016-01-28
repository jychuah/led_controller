define(['jquery', 'particleconnection', 'bootstrap'], function($, ParticleConnection) {
  function App() {
      this.particle = new ParticleConnection();
      $(document).ready(this.initialize.apply(this));
  };
  App.prototype = {
      constructor: App,
      particle: new ParticleConnection(),
      login: function() {
          this.particle.login($("#username").val(), $("#password").val());
      },
      initialize: function() {
          $("#loginButton").click($.proxy(this.login, this));
      }
  };
  return App;
});
