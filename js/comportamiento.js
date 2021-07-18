// Hold a reference to any infobubble opened
var bubble;
var map;
var platform;
var ui;

var modo3D = false;
var modoColocarMarcador = false;

//================================================== COMPORTAMIENTO GENERAL HereMaps  ========================================================================

function init(){
    /**
   * Boilerplate map initialization code starts below:
   */

  // set up containers for the map + panel
  var mapContainer = document.getElementById('map');

  // Step 1: initialize communication with the platform
  // In your own code, replace variable window.apikey with your own apikey
  platform = new H.service.Platform({
    apikey: window.apikey
  });

  var defaultLayers = platform.createDefaultLayers();

  // Step 2: initialize a map - this map is centered over Berlin
  map = new H.Map(mapContainer,
    defaultLayers.vector.normal.map, {
    center: {lat: 7.8784, lng: -72.5209},
    zoom: 14,
    pixelRatio: window.devicePixelRatio || 1
  });

  // add a resize listener to make sure that the map occupies the whole container
  window.addEventListener('resize', () => map.getViewPort().resize());

  // Step 3: make the map interactive
  // MapEvents enables the event system
  // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
  var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

  // Create the default UI components
  ui = H.ui.UI.createDefault(map, defaultLayers, 'es-ES');

  colocarMarcadoresEstaticos();
}

function crearListenerMap(tipoEvento, funcionAEjecutar){
  map.addEventListener(tipoEvento, funcionAEjecutar);
}

function removerListenerMap(tipoEvento,funcionAEjecutar){
  map.removeEventListener(tipoEvento, funcionAEjecutar );
}

function crearBoton(opt_options, funciones){
  inherits = function (childCtor, parentCtor) {
    function tempCtor() { } tempCtor.prototype = parentCtor.prototype; childCtor.superClass_ = parentCtor.prototype; childCtor.prototype = new tempCtor(); childCtor.prototype.constructor = childCtor; childCtor.base = function (me, methodName, var_args) {
        var args = new Array(arguments.length - 2);
        for (var i = 2; i < arguments.length; i++) {
            args[i - 2] = arguments[i];
        }
        return parentCtor.prototype[methodName].apply(me, args);
    };
  };
  var customUI = function (opt_options) {
    'use strict'; 
    var options = opt_options || {};
    H.ui.Control.call(this);
    this.onButtonClick = this.onButtonClick.bind(this);

    // create a button element   
    this.nuevoBtn = new H.ui.base.Button({
        'label': iconosSVG[options.icono],
        'onStateChange': this.onButtonClick
    });

    //add the buttons as this control's children   
    this.addChild(this.nuevoBtn);

    this.setAlignment(options['alignment'] || 'left-top');
    this.setDisabled(options['disabled']);

    this.options_ = options;
  };
  inherits(customUI, H.ui.Control);

  customUI.prototype.onButtonClick = function (evt) {
    'use strict'; 
    if (evt.currentTarget.getState() === 'down') { funciones.onClick(evt); }
  };
  return new customUI(opt_options);
}

function crearBotones(){

  var botonCrearMarcador = crearBoton({
    icono: "insertarMarcador"
  }, 
    { onClick : function(evt){
        modoColocarMarcador = !modoColocarMarcador;
        if(modoColocarMarcador){
          waypoints = [];
          if(grupoMarcadores != null && grupoMarcadores != undefined){
            grupoMarcadores.removeAll();
          }
          crearListenerMap('tap', tapListener);
          ui.getControl('btnCrearRuta').setDisabled(false);
          ui.getControl('btnDeshacer').setDisabled(false);
        }
      }
    }
  );
  ui.addControl('btnCrearMarcador', botonCrearMarcador);

  var botonDeshacer = crearBoton({
    icono : "deshacer",
    disabled : true
  }, 
    { onClick : function(evt){quitarUltimoMarcador()} }
  );
  ui.addControl('btnDeshacer', botonDeshacer);

  var botonModo3D = crearBoton({
    icono : "modo3D",
    alignment: "left-middle"
  }, 
    { onClick : function(evt){
        modo3D = !modo3D;
        if(modo3D){
          colocarMarcadores3D();
        }else{
          quitarMarcadores3D();
        }
      } 
    }
  );
  ui.addControl('btnModo3D', botonModo3D);

  var botonCrearRuta = crearBoton({
    icono : "consultarRuta",
    disabled : true,
    alignment: "left-middle"
  }, 
    { onClick : function(evt){
        calculateRouteFromAtoB(); 
        removerListenerMap('tap',tapListener); 
        ui.getControl('btnDeshacer').setDisabled(true);
      } 
    }
  );
  ui.addControl('btnCrearRuta', botonCrearRuta);

  var botonLimpiarMapa = crearBoton({
    icono : "limpiarMapa",
    alignment: "left-bottom"
  }, 
    { onClick : function(evt){
        quitarRuta(); 
        removerListenerMap('tap',tapListener); 
        ui.getControl('btnCrearRuta').setDisabled(true); 
        ui.getControl('btnDeshacer').setDisabled(true);
      } 
    }
  );
  ui.addControl('btnLimpiarMapa', botonLimpiarMapa);

}

function openBubble(position, text) {
  if (!bubble) {
    bubble = new H.ui.InfoBubble(
      position,
      // The FO property holds the province name.
      {content: text});
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}

function tapListener(evt){
  var coords = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
  crearMarcador(coords);
}
//========================================================================================================================================================
init();
crearBotones();