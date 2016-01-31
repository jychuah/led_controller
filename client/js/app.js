define(['jquery', 'particlebase', 'firebase', 'bootstrap'], function($, ParticleBase) {
  function App() {
      var Firebase = require('firebase');
      this.firebase = new Firebase("https://lighting-controller.firebaseio.com");
      this.pb = new ParticleBase(this.firebase);
      this.pb.setAccessTokenCallback($.proxy(this.accessTokenCallback, this));
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
        var ref = this;
        if (status === ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN) {
          ref.pb.listDevices(function(status, data) {
            console.log("List devices status: ", status);
            console.log("Device list: ", data);
            for (var key in data) {
              ref.pb.saveDevice(data[key], function(error) {
                if (!error) {
                  ref.pb.getSavedDevices(function(error, data) {
                    if (!error) {
                      console.log("Saved devices: ", data);
                    } else {
                      console.log("Error retrieving saved devices: ", error);
                    }
                  });
                } else {
                  console.log("Error saving device: ", error);
                }
              });
            }
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
        this.pb.bindAccessToken(username, password, function(status) {
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
