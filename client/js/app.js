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
          this.particle.login(username, password, $.proxy(function(error, token){
            if (error) {
              console.log("Particle login error", error);
            } else {
              console.log("Particle login success", token);
              this.firebase.login(username, password, $.proxy(function(error, authData) {
                if (error) {
                  // console.log("Firebase login error", error);
                  if (error.message === "The specified user does not exist.") {
                    console.log("Matching Firebase username does not exist. Creating Firebase user.");
                    this.firebase.fb.createUser({
                      email: username,
                      password: password
                    }, $.proxy(function(error, userData) {
                      if (error) {
                        // console.log("Firebase create user callback error: ", error);
                      } else if (userData) {
                        // console.log("Firebase create user callback userData: ", userData);
                        this.username = username;
                        this.completeLogin(userData);
                      }
                    }, this));
                  } else if (error.message === "The specified password is incorrect.") {
                    console.log("Firebase password does not match.");
                    this.firebase.fb.resetPassword({
                      email: username
                    }, $.proxy(function(error) {
                      if (error) {
                        console.log("There was a problem resetting the Firebase password");
                      } else {
                        console.log("Password reset e-mail sent.");
                      }
                    }, this));
                  } else {
                    console.log("Unknown Firebase error");
                  }
                } else {
                  // console.log("Firebase login success", authData);
                  this.username = username;
                  this.completeLogin(authData);
                }
              }, this));
            }
          }, this));
      },
      completeLogin: function(authData) {
        console.log("Login complete: ", authData);
        console.log(this.username);
      },
      initialize: function() {
          $("#loginButton").click($.proxy(this.login, this));
      }
  };
  return App;
});
