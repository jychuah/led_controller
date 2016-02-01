require.config({
  baseUrl: "js/libs",
  shim : {
        "bootstrap" : { "deps" :['jquery'] },
        "firebase" : { exports: 'Firebase' }
    },
  paths: {
      jquery: "jquery-2.2.0.min",
      particlebase: "ParticleBase",
      app: "../app",
      "bootstrap" :  "bootstrap.min",
      firebase : "firebase",
      pbdevicesmodal : "pb-devices-modal/pb-devices-modal"
  }
});


require(['require'], function(require) {
  require(['app'], function(App) {
      var a = new App();
  });
});
