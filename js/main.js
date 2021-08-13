//var waypoints = ['7.8784,-72.5209', '7.9084,-72.4872', '7.913,-72.5323'];
var waypoints = [];
var arregloPuntosRutaAndada = [];
var grupoMarcadoresRuta = new H.map.Group();
var grupoRuta = new H.map.Group();
var grupoMarcadores3D = new H.map.Group();
var grupoMarcadoresEstaticos = new H.map.Group();
var ruta;
var graficoElevacion;
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
        procesarRuta(route);
      },
      function(error) {
        alert('Can\'t reach the remote server');
        console.log(error);
      }
    );
  }
  
  function procesarRuta(route) {
    var avance = 0;
    var coeficienteDureza = 0;
    var coeficienteDurezaConCansancio = 0;
    var listaTramos = [];
    var indexMarcador = 1;
    var elevacionInicial;
    var elevacionFinal;
    var colorResultante;

    route.sections.forEach((section) => {
      // decode LineString from the flexible polyline
      let lineString = H.geo.LineString.fromFlexiblePolyline(section.polyline);
      
      let coords = lineString.getLatLngAltArray();
      
      var pendiente = 0, distancia = 0, elevacion = 0;
  
      for (let i = 2; i < coords.length; i += 3) {
        let lat = coords[i-2];
        let long = coords[i-1];
        elevacion = coords[i];

        if( elevacionInicial == undefined){
          elevacionInicial = elevacion;
        }
        // Calcula las pendientes para ajustar los colores
        if(i+3 < coords.length){
          var latSiguiente = coords[i-2+3];
          var longSiguiente = coords[i-1+3];
          var elevacionSiguiente = coords[i+3];
  
          var distanciaHorizontal = getDistanceFromLatLonInKm(lat, long, latSiguiente, longSiguiente) * 1000 //metros;
          var diferenciaAltura = elevacionSiguiente - elevacion;

          if(distanciaHorizontal > 0){
            pendiente = diferenciaAltura/distanciaHorizontal *100;
            distancia = Math.hypot(distanciaHorizontal, diferenciaAltura);
          }else{
            //Muestra lo mismo del punto anterior
          }

          colorResultante = getColorInRange(pendiente);
          
          let line = new H.geo.LineString();
          line.pushLatLngAlt(lat, long, elevacion);
          line.pushLatLngAlt(latSiguiente, longSiguiente, elevacionSiguiente);
          grupoRuta.addObject(new H.map.Polyline(line, {style:  {lineWidth: 6, strokeColor: colorResultante }  })    );

          
          grupoMarcadores3D.addObject(crearMarcadorTramoMapa(colorResultante, lat, long, elevacion, distancia, pendiente ));

          listaTramos.push({x: avance, y: elevacion, lineColor: colorResultante, 
                          pendiente: pendiente, pendienteFormat: pendiente.toFixed(2)+"%", 
                          distancia: distancia, distanciaFormat: distancia.toFixed(2)+"m"});
          
          avance += distanciaHorizontal;
          coeficienteDureza += calcularCoeficienteDureza(distancia, pendiente);
          //coeficienteDurezaConCansancio += calcularCoeficienteDureza(distancia, pendiente) + coeficienteDureza*10/avance;
        }else{
          //se editará con el fin de cada sección, al final sólo importará la que quede, ya que es la última.
          elevacionFinal = elevacion;
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
                          indexLabel: ""+(indexMarcador+1)+"\n", indexLabelFontWeight: "bold", indexLabelFontSize: "24", markerImageUrl: "img/svg/marker-circle.svg"});
      indexMarcador++;
    });

    let marcadorDeComienzo = JSON.parse(JSON.stringify(listaTramos[0]));
    marcadorDeComienzo.indexLabel = "1";
    marcadorDeComienzo.indexLabelFontWeight = "bold";
    marcadorDeComienzo.indexLabelFontSize = "24";
    marcadorDeComienzo.markerImageUrl = 'img/svg/start.svg';

    listaTramos.unshift(marcadorDeComienzo);

    listaTramos[listaTramos.length-1].markerImageUrl = 'img/svg/finish.svg';

    //Hacemos zoom a los objetos de la ruta
    map.getViewModel().setLookAtData({
      bounds: grupoRuta.getBoundingBox()
    });

    var pendienteMedia = (elevacionFinal-elevacionInicial)/avance *100;

    //Dibujamos el perfil de elevación
    //console.log(coeficienteDureza, coeficienteDurezaConCansancio);
    mostrarPerfilElevacionRuta(listaTramos, avance, coeficienteDureza);

    ruta.listaTramos = listaTramos;
    ruta.distanciaTotal = avance;
    ruta.pendienteMedia = pendienteMedia;
    ruta.coeficienteDureza = coeficienteDureza;
  }
  
  function mostrarPerfilElevacionRuta(puntos, distanciaTotal, coeficienteDureza){
    graficoElevacion = new CanvasJS.Chart("canvasdiv",
        {
            zoomEnabled: true,
            animationEnabled: true, 
            animationDuration: 3000,
            exportEnabled: true,
            title:{
                text: "Perfil de elevación"
            },
            subtitles:[
                {text: `Distancia: ${(distanciaTotal/1000).toFixed(2)} Km
                        Coeficiente: ${coeficienteDureza.toFixed(2)}`}
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
            data: construirDataSetGrafico(puntos),
            rangeChanging: function(e){
              var distanciaRango = distanciaTotal;
              var coeficienteRango = coeficienteDureza;
              if(e.trigger != "reset"){
                let datosRango = calcularDatosRangoRuta(e.axisX[0].viewportMinimum || 0, e.axisX[0].viewportMaximum, puntos);
                distanciaRango = datosRango.distancia;
                coeficienteRango = datosRango.coeficienteDureza;
              }
              graficoElevacion.subtitles[0].set("text", 
                  `Distancia: ${(distanciaRango/1000).toFixed(2)} Km
                  Coeficiente: ${coeficienteRango.toFixed(2)}`, false);
            },
            rangeChanged: function(e){
              reajustarImagenesMarcadoresChart(graficoElevacion);
            }
        });
    
    graficoElevacion.render();
    addMarkerImages(graficoElevacion);
  }

  function construirDataSetGrafico(puntos){
    let data = [{ 
      markerType: "none",
      lineThickness: 15,
      type: "splineArea",
      dataPoints: puntos
    }];

    var listaPuntosSubidas = obtenerClustersSubidas(puntos);

    for (let i = 0; i < listaPuntosSubidas.length; i++) {
      const punto = listaPuntosSubidas[i];
      if(punto.cluster > 0){
        let indexData = punto.cluster;
        if(data[indexData] != undefined){
          data[indexData].dataPoints.push(punto);
        }else{
          data[indexData] = {
            markerType: "none",
            type: "splineArea",
            lineThickness: 1,
            dataPoints : []
          };
        }
      }
    }

    for (let i = 1; i < data.length; i++) {
      let clusterSubida = data[i].dataPoints;
      var ultimoPunto = clusterSubida[clusterSubida.length-1];
      

      if(ultimoPunto.markerImageUrl == undefined){
        ultimoPunto = JSON.parse(JSON.stringify(ultimoPunto)); //clonarlo
        let pendienteCuadrado = ultimoPunto.pendiente/100 * ultimoPunto.pendiente/100;
        let distanciaHorizontal = Math.sqrt(ultimoPunto.distancia * ultimoPunto.distancia / (pendienteCuadrado + 1));
        let diferenciaAltura = ultimoPunto.pendiente/100 * distanciaHorizontal;
        
        ultimoPunto.x += distanciaHorizontal;
        ultimoPunto.y += diferenciaAltura;

        clusterSubida.push(ultimoPunto);//agregar el clonado
      }
      
      let pendienteMediaCluster = (ultimoPunto.y - clusterSubida[0].y) / (ultimoPunto.x - clusterSubida[0].y) * 100
      data[i].color = getColorInRange(pendienteMediaCluster);
    }

    return data;
  }
  
  function obtenerClustersSubidas(listaTramos){
    var listaPuntosSubidas = listaTramos.filter(function(punto) { return calcularCoeficienteDureza(punto.distancia, punto.pendiente) > 0.1 && punto.pendiente > 2  });

    // Configure a DBSCAN instance.
    var dbscanner = jDBSCAN().eps(200).minPts(2).distance('EUCLIDEAN').data(listaPuntosSubidas);
    var clusters = dbscanner();
    for (let i = 0; i < listaPuntosSubidas.length; i++) {
      listaPuntosSubidas[i].cluster = clusters[i];
    }
    return listaPuntosSubidas;
  }

  function crearMarcadorRuta(){
    waypoints.push(coordsUltimoClick.lat+","+coordsUltimoClick.lng);
    var marcador = new H.map.Marker(coordsUltimoClick, {icon: crearIconMarcadorByText(waypoints.length)});
    grupoMarcadoresRuta.addObject(marcador);
    map.addObject(grupoMarcadoresRuta);
  }

  function crearMarcadorEstatico(elementoImagen){
    
    var indexMarcador =  grupoMarcadoresEstaticos.getObjects().length;
    const antiguoMarcador = grupoMarcadoresEstaticos.getObjects()[indexMarcador-1];
    if(antiguoMarcador != undefined){
      grupoMarcadoresEstaticos.removeObject(antiguoMarcador);
    }

    $(".selected").removeClass("selected");
    elementoImagen.className ="selected";

    var marcador = new H.map.Marker(coordsUltimoClick, {icon: crearIconMarcadorByIcono(elementoImagen.src)});
    grupoMarcadoresEstaticos.addObject(marcador);
    map.addObject(grupoMarcadoresEstaticos);
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
          break;
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
    return distancia/1000* Math.abs((pendiente > 0 ? pendiente : (pendiente < 0 ? pendiente/3 : 0.1)));
  }

  function quitarRuta(){
    if(grupoRuta != null && grupoRuta != undefined){
      //map.removeObject(grupoRuta);
      grupoRuta.removeAll();
    }
    if(grupoMarcadoresRuta != null && grupoMarcadoresRuta != undefined){
      //map.removeObject(marcadores);
      grupoMarcadoresRuta.removeAll();
    }
    if(grupoMarcadores3D != null && grupoMarcadores3D != undefined){
      //map.removeObject(grupoMarcadores3D);
      grupoMarcadores3D.removeAll();
    }
  }

  function quitarUltimoMarcador(){
    if(grupoMarcadoresRuta != null && grupoMarcadoresRuta != undefined){
      var ultimo = grupoMarcadoresRuta.getObjects().pop();
      if(ultimo != null && ultimo != undefined){
        grupoMarcadoresRuta.removeObject(ultimo);
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

  function colocarMarcadoresEstaticos(marcadores){
    for (let i = 0; i < marcadores.length; i++) {
      const marcador = marcadores[i];
      grupoMarcadoresEstaticos.addObject(new H.map.Marker({lat:marcador.coords.lat,lng:marcador.coords.lng}, {icon: crearIconMarcadorByIcono("img/svg/"+marcador.icono)}));
    }
    map.addObject(grupoMarcadoresEstaticos);
  }

  function guardarRuta(){
    var nombreRuta = $("#inputBarraSuperior").val();
    graficoElevacion.title.set("text", nombreRuta);
    ruta.nombre = nombreRuta;

    peticionGuardarRuta(JSON.stringify(ruta));
  }

  function guardarMarcador(){
    var nombreMarcador = $("#inputBarraSuperior").val();
    var marcador = {
      nombre: nombreMarcador,
      coords: coordsUltimoClick,
      icono: $(".selected")[0].src.split("/svg/")[1]
    }

    peticionGuardarMarcador(JSON.stringify(marcador));
  }

  function leerArchivo(){
    var fr=new FileReader();
    fr.onload=function(){
      arregloPuntosRutaAndada = JSON.parse("[" + fr.result.slice(0, -1) +"]") ; //remueve la última coma
      console.log(arregloPuntosRutaAndada);
      waypoints = [];
      arregloPuntosRutaAndada.forEach(punto => {
        if(punto[0] != 0 && punto[1] != 0){
          let waypoint = punto[0]+","+punto[1];
          if(!waypoints.includes(waypoint)){
            waypoints.push(waypoint);
          }
        }
      });
      console.log(waypoints);
      calculateRouteFromAtoB();
    }

    fr.readAsText(document.getElementById("inputfile").files[0]);
  }