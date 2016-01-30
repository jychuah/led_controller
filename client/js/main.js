require.config({
  baseUrl: "js/libs",
  shim : {
        "bootstrap" : { "deps" :['jquery'] },
        "firebase" : { exports: 'Firebase' }
    },
  paths: {
      jquery: "jquery-2.2.0.min",
      particleconnection: "../ParticleConnection",
      firebaseconnection: "../FirebaseConnection",
      lightingcontrollerdata: "../LightingControllerData",
      app: "../app",
      "bootstrap" :  "bootstrap.min",
      firebase : "firebase"
  }
});


require(['require'], function(require) {
  require(['app'], function(App) {
      var a = new App();
  });
});
