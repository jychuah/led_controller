define(['jquery', 'require', 'module', 'bootstrap'], function($, require, module) {
  PBDevicesModal = function(particleBaseInstance) {
    var pb = particleBaseInstance;
    this.$pbdevicesmodal = $('.pb-devices-modal');
    var htmlPath = require.toUrl(module.id);
    htmlPath = htmlPath.substring(0, htmlPath.lastIndexOf('/')) + '/html/pb-devices-modal.html';
    $('.pb-devices-modal').load(htmlPath, null, this.init);
  }

  PBDevicesModal.prototype = {
    constructor: PBDevicesModal,
    init : function() {
      console.log("PB Devices Modal Hello World");
    }
  }

  return PBDevicesModal;
});
