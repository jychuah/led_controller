define(['jquery', 'particlebase', 'firebase', 'bootstrap'], function($, ParticleBase) {
  function App() {
      var Firebase = require('firebase');
      this.firebase = new Firebase("https://lighting-controller.firebaseio.com");
      this.data = new ParticleBase(this.firebase);
      this.data.setAccessTokenCallback($.proxy(this.accessTokenCallback, this));
      $(document).ready(this.initialize.apply(this));
  };
  App.prototype = {
      constructor: App,
      fb_login : function() {
        var fb_email = $("#fb_email").val();
        var fb_password = $("#fb_password").val();
        this.firebase.authWithPassword({
          email: fb_email, password: fb_password
        }, function(error, authData) {
          if (error) {
            console.log("Firebase login error", error);
          } else {
            console.log("Firebase login success", authData);
          }
        });
      },
      accessTokenCallback : function(status) {
        console.log("Access token callback: ", status);
        if (status === ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN) {
          this.data.listDevices(function(status, data) {
            console.log("List devices status: ", status);
            console.log("Device list: ", data);
          });
        }
      },
      fb_logout : function() {
        this.firebase.unauth();
      },
      particle_login: function() {
        console.log("Particle Login");
        var username = $("#particle_username").val();
        var password = $("#particle_password").val();
        this.data.bindAccessToken(username, password, function(status) {
          console.log(status);
        });
      },
      initialize: function() {
          $("#fb_login").click($.proxy(this.fb_login, this));
          $("#fb_logout").click($.proxy(this.fb_logout, this));
          $("#particle_login").click($.proxy(this.particle_login, this));
      }
  };
  return App;
});
