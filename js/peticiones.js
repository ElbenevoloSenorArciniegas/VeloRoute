function peticion(){
    jQuery.ajax({
        type: "POST",
        url: 'php/conection.php',
        dataType: 'json',
        data: {functionname: 'search', arguments: [1, 2]},
    
        success: function (obj, textstatus) {
            if( !('error' in obj) ) {
                yourVariable = obj.result;
            }
            else {
                console.log(obj.error);
            }
        }
    });
} 

function peticionGuardarRuta(stringRuta){
    jQuery.ajax({
        type: "POST",
        url: 'php/conection.php',
        dataType: 'json',
        data: {functionname: 'guardarRuta', arguments: stringRuta},
    
        success: function (obj, textstatus) {
            if( !('error' in obj) ) {
                yourVariable = obj.result;
            }
            else {
                console.log(obj.error);
            }
        }
    });
}

function peticionGuardarMarcador(stringMarcador){
    jQuery.ajax({
        type: "POST",
        url: 'php/conection.php',
        dataType: 'json',
        data: {functionname: 'guardarMarcador', arguments: stringMarcador},
    
        success: function (obj, textstatus) {
            if( !('error' in obj) ) {
                yourVariable = obj.result;
            }
            else {
                console.log(obj.error);
            }
        }
    });
}

function peticionConsultarMarcadoresEstaticos(){
    jQuery.ajax({
        type: "POST",
        url: 'php/conection.php',
        dataType: 'json',
        data: {functionname: 'listarMarcadores'},
    
        success: function (obj, textstatus) {
            if( !('error' in obj) ) {
                colocarMarcadoresEstaticos(obj.result);
            }
            else {
                console.log(obj.error);
            }
        }
    });
}