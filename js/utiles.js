const colores = [
    {r:110, g: 10, b: 160}, //morado 
    {r:50, g: 50, b: 255}, //azul 
    {r:20, g: 170, b: 60}, //verde 
    {r:200, g: 200, b: 200}, //gris 
    {r:250, g: 250, b: 50}, //amarillo 
    {r:232, g: 9, b: 26}, //rojo 
    {r:102, g: 8, b: 8}, //vinotinto 
    {r:1, g: 1, b: 1} //negro
  ];
  
const R = 6371; // Radius of the earth in km
var iconosTramoMapa = {};
//========================================================      UTILES     ===================================================================================

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }
  
  function interpolateColor(start, end, steps, count) {
    var s = start,
        e = end,
        final = s + (((e - s) / steps) * count);
    return Math.floor(final);
  }
  
  function getColorInRange(val){
    //Recordar que el último color es el tope y no corresponde a un rango.
    var step = 1/(colores.length-1);
    //Se normaliza el value entre el rango de pendientes permitidas (los valores que típicamente llegarán)
    val = (val - (-25)) / (30 - -25);
    //Si val < 0 entonces val = 0... Se truncan los datos mpas atípicos que se salgan del rangos
    val = (val<0? 0 : (val>1? 1 : val));
  
    var cociente = Math.floor(val/step);
    var start = colores[cociente];
    if(cociente == colores.length-1){
      //El caso del último tope. Es comienzo y fin a la vez
      var end = start;
    }else{
      var end = colores[cociente + 1 ];
    }
    
    val = (val % step);

    var r = interpolateColor(start.r, end.r, step, val);
    var g = interpolateColor(start.g, end.g, step, val);
    var b = interpolateColor(start.b, end.b, step, val);
  
    return "rgb(" + r + "," + g + "," + b + ")";
  }
  
  function toMMSS(duration) {
    return Math.floor(duration / 60) + ' minutes ' + (duration % 60) + ' seconds.';
  }
  
  function crearMarcadorTramoMapa(color, lat, lng, elevacion, dist, pendiente){
      // create or re-use icon
      var icon;
      if (iconosTramoMapa[color]) {
          icon = iconosTramoMapa[color];
      } else {
          icon = crearIconTramoMapa(color, elevacion);
          iconosTramoMapa[color] = icon;
      }

      var marker = new H.map.Marker({ lat: lat, lng: lng, alt: elevacion }, {icon: icon});
      marker.detalles = "Distancia: "+dist.toFixed(2)+"m <br> Pendiente: "+pendiente.toFixed(2)+"%";
     return marker;
  }

  function crearIconTramoMapa(color){
    var canvas = document.createElement('canvas');
    canvas.width = 15;
    canvas.height = 15;

    var ctx = canvas.getContext('2d');

    let x = canvas.width/2;
    let y = 2*canvas.height/4;
    // Create gradient
    var grd = ctx.createRadialGradient(x, y, x/2, x, y, x);
    grd.addColorStop(0,color);
    grd.addColorStop(1,"#777");
    // Fill with gradient
    ctx.fillStyle = grd;

    ctx.strokeStyle = "#777";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(x, y, x -2 , 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    
    return new H.map.Icon(canvas);
  }

  function crearIconMarcador(numero){

    var canvas = document.createElement('canvas');
    canvas.width = 30;
    canvas.height = 60;

    var ctx = canvas.getContext('2d'); 

    let x = canvas.width/2;
    let y = 2*canvas.height/4;
    // Create gradient
    var grd = ctx.createRadialGradient(x, y, x/2, x, y, x);
    grd.addColorStop(0,"#eee");
    grd.addColorStop(1,"#555");
    // Fill with gradient
    ctx.fillStyle = grd;

    ctx.strokeStyle = "#555";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(x, y, x -2 , 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, 3*canvas.height/4);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();

    ctx.font = x+"px Arial";
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    ctx.strokeText(numero, x, y+4);
    return new H.map.Icon(canvas);
  } 

  function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}