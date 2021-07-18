//var waypoints = ['7.8784,-72.5209', '7.9084,-72.4872', '7.913,-72.5323'];
var waypoints = [];
var grupoMarcadores = new H.map.Group();
var grupoRuta = new H.map.Group();
var grupoMarcadores3D = new H.map.Group();
var marcadoresEstaticos = new H.map.Group();
var ruta;
/**
 * Calculates and displays a car route between the waypoints
 */
 function calculateRouteFromAtoB() {

    var router = platform.getRoutingService(null, 8),
        routeRequestParams = {
          
          transportMode: 'car',
          origin: waypoints.shift(),
          via: new H.service.Url.MultiValueQueryParameter( waypoints ),
          destination: waypoints.pop(),
          return: 'polyline,elevation'
        };
  
    router.calculateRoute(
      routeRequestParams,
      function (result) {
        var route = result.routes[0];
        ruta = route;
        dibujarRutaPlano(route);
      },
      function(error) {
        alert('Can\'t reach the remote server');
        console.log(error);
      }
    );
  }
  
  function dibujarRutaPlano(route) {
    var avance = 0;
    var coeficienteDureza = 0;
    var listaTramos = [];
    var indexMarcador = 1;
    route.sections.forEach((section) => {
      // decode LineString from the flexible polyline
      let lineString = H.geo.LineString.fromFlexiblePolyline(section.polyline);
      
      let coords = lineString.getLatLngAltArray();
      
      var pendiente, distancia, elevacion;
  
      for (let i = 2; i < coords.length; i += 3) {
        let lat = coords[i-2];
        let long = coords[i-1];
        elevacion = coords[i];
        // Calcula las pendientes para ajustar los colores
        if(i+3 < coords.length){
          var latSiguiente = coords[i-2+3];
          var longSiguiente = coords[i-1+3];
          var elevacionSiguiente = coords[i+3];
  
          var distanciaHorizontal = getDistanceFromLatLonInKm(lat, long, latSiguiente, longSiguiente) * 1000 //metros;
          var diferenciaAltura = elevacionSiguiente - elevacion;
          pendiente = diferenciaAltura/distanciaHorizontal *100;
          distancia = Math.hypot(distanciaHorizontal, diferenciaAltura);
        }else{
          distancia = 0;
          var distanciaHorizontal = 0;
          pendiente = 0;
          var diferenciaAltura = 0;
        }

        if(distanciaHorizontal > 0){
            var colorResultante = getColorInRange(pendiente);
            let line = new H.geo.LineString();
            line.pushLatLngAlt(lat, long, elevacion);
            line.pushLatLngAlt(latSiguiente, longSiguiente, elevacionSiguiente);
            let polylineTramo = new H.map.Polyline(line, {
                style:  {
                  lineWidth: 6,
                  strokeColor: colorResultante
              }
            });
            grupoRuta.addObject(polylineTramo);

            grupoMarcadores3D.addObject(crearMarcadorTramoMapa(colorResultante, coords[i - 2], coords[i - 1], elevacion, distancia, pendiente ));

            listaTramos.push({x: avance, y: elevacion, lineColor: colorResultante, 
                            pendiente: pendiente, pendienteFormat: pendiente.toFixed(2)+"%", 
                            distancia: distancia, distanciaFormat: distancia.toFixed(2)+"m"});
            
            avance += distanciaHorizontal;
            coeficienteDureza += calcularCoeficienteDureza(distancia, pendiente);
        }
      }
  
      grupoRuta.addEventListener('tap', function (evt) {
        map.setCenter(evt.target.getGeometry());
        openBubble(evt.target.getGeometry(), evt.target.detalles);
      }, false);
  
      // Add markers to the map
      map.addObject(grupoRuta);
      // Añade también las x en el gráfico del perfil
      listaTramos.push({x: avance, y: elevacion, lineColor: colorResultante, 
                          pendiente: pendiente, pendienteFormat: pendiente.toFixed(2)+"%", 
                          distancia: distancia, distanciaFormat: distancia.toFixed(2)+"m", 
                          indexLabel: ""+(indexMarcador+1)+"", markerType: "cross",markerColor: "#333", markerSize: 10, indexLabelFontWeight: "bold", indexLabelFontSize: "24"});
      indexMarcador++;
    });
    //Hacemos zoom a los objetos de la ruta
    map.getViewModel().setLookAtData({
      bounds: grupoRuta.getBoundingBox()
    });
    //Dibujamos el perfil de elevación
    mostrarPerfilElevacionRuta(listaTramos, avance,coeficienteDureza);
  }
  
  function mostrarPerfilElevacionRuta(puntos, distanciaTotal, coeficienteDureza){
    var chart = new CanvasJS.Chart("canvasdiv",
        {
            zoomEnabled: true,
            animationEnabled: true, 
            animationDuration: 3000,
            title:{
                text: "Perfil de elevación"
            },
            subtitles:[
                {
                    text: "Distancia: "+(distanciaTotal/1000).toFixed(2)+" Km"+" - Coeficiente: "+coeficienteDureza.toFixed(2)
                }
            ],
            toolTip:{
                enabled: true,       //disable here
                animationEnabled: true, //disable here
                cornerRadius: 10,
                content: "Distancia: {distanciaFormat}<br/> Pendiente: <span class='badge' style='\"'background: {lineColor};'\"'>{pendienteFormat}</span>",
            },
            axisY: {
                title: "m.s.n.m.",
                valueFormatString: "#0",
                suffix: " m",
                includeZero: true
            },
            axisX: {
                title: "Distancia",
                valueFormatString: "#0,.00",
                suffix: " Km"
            },
            data: [
            { 
                markerType: "none",
                lineThickness: 15,  
                type: "splineArea",
                dataPoints: puntos
            }
            ],
            rangeChanging: function(e){
              var distanciaRango = distanciaTotal;
              var coeficienteRango = coeficienteDureza;
              if(e.trigger != "reset"){
                let datosRango = calcularDatosRangoRuta(e.axisX[0].viewportMinimum || 0, e.axisX[0].viewportMaximum, puntos);
                distanciaRango = datosRango.distancia;
                coeficienteRango = datosRango.coeficienteDureza;
              }
              chart.subtitles[0].set("text", "Distancia: "+(distanciaRango/1000).toFixed(2)+" Km"+" - Coeficiente: "+coeficienteRango.toFixed(2), false);
            }
        });
    
    chart.render();
  }
  
  function crearMarcador(coords){
    waypoints.push(coords.lat+","+coords.lng);
    var marcador = new H.map.Marker(coords, {icon: crearIconMarcador(waypoints.length)});
    grupoMarcadores.addObject(marcador);
    map.addObject(grupoMarcadores);
  }

  function calcularDatosRangoRuta(comienzo, fin, puntos){
    var avance = 0;
    var distancia = 0;
    var coeficienteDureza = 0;
    var yaEnRango = false;
    for(let i = 0; i < puntos.length; i++ ){
      let punto = puntos[i];
      let distanciaASumar = 0;
      avance = punto.x;
      if(yaEnRango){
        if(avance + punto.distancia > fin){
          let distanciaHorizontal = fin - avance;
          let diferenciaAltura = punto.pendiente * distanciaHorizontal / 100;
          distanciaASumar = Math.hypot(distanciaHorizontal, diferenciaAltura);
          yaEnRango = false;
        }else{
          distanciaASumar = punto.distancia;
        }
      }else if(avance > comienzo && avance < fin){
        let distanciaHorizontal = avance - comienzo;
        let diferenciaAltura = punto.pendiente * distanciaHorizontal / 100;
        distanciaASumar = Math.hypot(distanciaHorizontal, diferenciaAltura) + punto.distancia;
        yaEnRango = true;
      }
      distancia += distanciaASumar;
      coeficienteDureza += calcularCoeficienteDureza(distanciaASumar, punto.pendiente);
    }
    return {distancia: distancia, coeficienteDureza: coeficienteDureza};
  }

  function calcularCoeficienteDureza(distancia,pendiente){
    return distancia/1000* (pendiente > 0 ? pendiente : (pendiente < 0 ? -1*pendiente/3 : 0.1));
  }

  function quitarRuta(){
    if(grupoRuta != null && grupoRuta != undefined){
      //map.removeObject(grupoRuta);
      grupoRuta.removeAll();
    }
    if(grupoMarcadores != null && grupoMarcadores != undefined){
      //map.removeObject(marcadores);
      grupoMarcadores.removeAll();
    }
    if(grupoMarcadores3D != null && grupoMarcadores3D != undefined){
      //map.removeObject(grupoMarcadores3D);
      grupoMarcadores3D.removeAll();
    }
  }

  function quitarUltimoMarcador(){
    if(grupoMarcadores != null && grupoMarcadores != undefined){
      var ultimo = grupoMarcadores.getObjects().pop();
      if(ultimo != null && ultimo != undefined){
        grupoMarcadores.removeObject(ultimo);
        waypoints.pop();
      }
    }
  }

  function colocarMarcadores3D(){
    map.addObject(grupoMarcadores3D);
  }

  function quitarMarcadores3D(){
    map.removeObject(grupoMarcadores3D);
  }

  function colocarMarcadoresEstaticos(){
    marcadoresEstaticos.addObject(new H.map.Marker({lat:'7.8784',lng:'-72.5209'}, {icon: crearIconMarcador("C")}));
    map.addObject(marcadoresEstaticos);
  }