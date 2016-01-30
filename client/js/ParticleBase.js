define(['jquery']['particleconnection'], ['firebaseconnection'], function($, ParticleConnection, FirebaseConnection) {
  function ParticleBase() {
    this.particle = new ParticleConnection();
    this.firebase = new FirebaseConnection("https://lighting-controller.firebaseio.com");
  },
  ParticleBase.prototype = {
    constructor: LightingControllerData,
    ERROR_PARTICLE_CONNECTION = "Hmm... Something's wrong with the website. Report a bug: ERROR_PARTICLE_CONNECTION",

    bindToParticle : function(username, password, callback) {
      this.particle.createToken(username, password, function(status, data) {
        if (status === ParticleConnection.SUCCESS_PARTICLE_TOKEN_RETURNED) {
          if (data == null) {
            callback(ERROR_PARTICLE_CONNECTION);
          } else {
            this.firebase.setAuthToken(data.accessToken, callback);
          }
        }
      });
    },
    login : function(username, password, callback) {
      this.firebase.login(username, password, callback);
    }
  }
});
