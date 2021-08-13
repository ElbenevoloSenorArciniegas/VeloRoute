// Hold a reference to any infobubble opened
var bubble;
var map;
var platform;
var ui;

var modo3D = false;
var modoColocarMarcadorRuta = false;
var modoColocarMarcadorEstatico = false;

var coordsUltimoClick;

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
        'label': '<i class="btnIcon fas fa-'+options.icono+'"></i>',
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

  var botonCrearMarcadorRuta = crearBoton({
    icono: "map-marker-alt"
  }, 
    { 
      onClick : function(evt){
        if(!modoColocarMarcadorEstatico){
          modoColocarMarcadorRuta = !modoColocarMarcadorRuta;
          if(modoColocarMarcadorRuta){
            waypoints = [];
            if(grupoMarcadoresRuta != null && grupoMarcadoresRuta != undefined){
              grupoMarcadoresRuta.removeAll();
            }
            crearListenerMap('tap', crearMarcadorRutaOnTap);
            ui.getControl('btnCrearRuta').setDisabled(false);
            ui.getControl('btnDeshacer').setDisabled(false);
          }
        }
      }
    }
  );
  ui.addControl('btnCrearMarcadorRuta', botonCrearMarcadorRuta);

  var botonDeshacer = crearBoton({
    icono : "undo",
    disabled : true
  }, 
    { onClick : function(evt){quitarUltimoMarcador()} }
  );
  ui.addControl('btnDeshacer', botonDeshacer);

  var botonModo3D = crearBoton({
    icono : "wave-square",
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
    icono : "route",
    disabled : true,
    alignment: "left-middle"
  }, 
    { onClick : function(evt){
        calculateRouteFromAtoB(); 
        removerListenerMap('tap',crearMarcadorRutaOnTap);
        abrirBarraSuperior('save', "guardarRuta");
        ui.getControl('btnDeshacer').setDisabled(true);
      } 
    }
  );
  ui.addControl('btnCrearRuta', botonCrearRuta);

  var botonLimpiarMapa = crearBoton({
    icono : "eraser",
    alignment: "left-bottom"
  }, 
    { onClick : function(evt){
        quitarRuta(); 
        removerListenerMap('tap',crearMarcadorRutaOnTap); 
        ui.getControl('btnCrearRuta').setDisabled(true); 
        ui.getControl('btnDeshacer').setDisabled(true);
      } 
    }
  );
  ui.addControl('btnLimpiarMapa', botonLimpiarMapa);

  var botonCrearMarcadorEstatico = crearBoton({
    icono : "map-marked",
    alignment: "top-right"
  }, 
    { onClick : function(evt){
        crearListenerMap('tap', crearMarcadorEstaticoOnTap);
        abrirBarraSuperiorComplementoIconos('marcador');
      } 
    }
  );
  ui.addControl('btnCrearMarcadorEstatico', botonCrearMarcadorEstatico);

  var botoncargarRutas = crearBoton({
    icono : "search-location",
    alignment: "top-right"
  }, 
    { onClick : function(evt){
        mostrarBarraLateral();
      } 
    }
  );
  ui.addControl('btncargarRutas', botoncargarRutas);

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

function crearMarcadorRutaOnTap(evt){
  coordsUltimoClick = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
  crearMarcadorRuta();
}

function crearMarcadorEstaticoOnTap(evt){
  coordsUltimoClick = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
  var img = $("#galeriaIconosBarraSuperior").find("img")[0];
  crearMarcadorEstatico(img);
}

function crearBarraSuperior(){
  var tapSuperior = document.createElement('div');
  tapSuperior.display ='none';
  tapSuperior.id ='tapSuperior';
  map.getElement().appendChild(tapSuperior);
}

function abrirBarraSuperior(iconoBoton, funcionAEjecutar){
  var tapSuperior = $('#tapSuperior');
  tapSuperior.addClass('tapSuperior');
  tapSuperior.html('<input id="inputBarraSuperior" placeholder="Nombre" class="inputBarraSuperior"/><button class="btnBarraSuperior" onclick="'+funcionAEjecutar+'()"><i class="fas fa-'+iconoBoton+'"></i></button>');
}

function abrirBarraSuperiorComplementoIconos(tipoIconos){
  abrirBarraSuperior('save', "guardarMarcador");
  var tapSuperior = $('#tapSuperior');
  var onclick = "crearMarcadorEstatico(this)";
  var html = `
  <div>
    <table id="galeriaIconosBarraSuperior">
      <tr>
        <td><img src="img/svg/flag-blue.svg" onclick="${onclick}"/></td>
        <td><img src="img/svg/flag-green.svg" onclick="${onclick}"/></td>
        <td><img src="img/svg/flag.svg" onclick="${onclick}"/></td>
        <td><img src="img/svg/house.svg" onclick="${onclick}"/></td>
        <td><img src="img/svg/marker-stick.svg" onclick="${onclick}"/></td>
        <td><img src="img/svg/favorite.svg" onclick="${onclick}"/></td>
      </tr>
    </table>
  </div>`;
  tapSuperior.append(html);
}

function crearBarraLateral(listaRutas){
  var barraLateral = document.createElement('div');
  //barraLateral.display ='none';
  barraLateral.id ='barraLateral';
  map.getElement().appendChild(barraLateral);

  let lista = "";
  for (let i = 0; i < listaRutas.length; i++) {
    lista += `<li><a onclick="peticionCargarRuta('${listaRutas[i]._id["$oid"]}')"><i class="far fa-eye"></i></a>&nbsp${listaRutas[i].nombre}</li>`;
  }
  $("#barraLateral").html(`
    <h4 style="margin: 0px; margin-left: 5px;">
      <a onclick="ocultarBarraLateral()"><i class="fas fa-times"></i></a>
      &nbspRutas guardadas:
    </h4>
    <ul>${lista}</ul>`);
}

function mostrarBarraLateral(){
  $("#barraLateral").css({"right":"0%"});
}

function ocultarBarraLateral(){
  $("#barraLateral").css({"right":"-30%"});
}

//========================================================================================================================================================
init();
crearBotones();
crearBarraSuperior();
peticionConsultarMarcadoresEstaticos();
peticionListarRutas();