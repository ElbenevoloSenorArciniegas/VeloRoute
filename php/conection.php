<?php

// Manager Class
$manager = new MongoDB\Driver\Manager("mongodb://localhost:27017");
$collection = 'VeloRoute.VeloRoute';


header('Content-Type: application/json');

$aResult = array();

if( !isset($_POST['functionname']) ) { $aResult['error'] = 'No function name!'; }

if( !isset($aResult['error']) ) {

    switch($_POST['functionname']) {
        case 'insert':
            /*if( !is_array($_POST['arguments']) || (count($_POST['arguments']) < 2) ) {
                $aResult['error'] = 'Error in arguments!';
            }
            else {
                $aResult['result'] = add(floatval($_POST['arguments'][0]), floatval($_POST['arguments'][1]));
            }*/
            insert("jasdfjñalkdjf");
            break;
        case 'search':
            search("ñasjfdñakjf");
            break;
        case 'guardarRuta':
            if( !isset($_POST['arguments']) ) { 
                $aResult['error'] = 'No function arguments!'; 
            }else{
                guardarRuta($_POST['arguments']);
            }
            break;
        case 'guardarMarcador':
            if( !isset($_POST['arguments']) ) { 
                $aResult['error'] = 'No function arguments!'; 
            }else{
                guardarMarcador($_POST['arguments']);
            }
            break;
        case 'listarMarcadores':
            $aResult['result'] = listarMarcadores();
            break;
            

        default:
            $aResult['error'] = 'Not found function '.$_POST['functionname'].'!';
            break;
    }

}

echo json_encode($aResult);


function search($var){
    global $manager, $collection;

    // Query Class
    $query = new MongoDB\Driver\Query(array('age' => 30));

    // Output of the executeQuery will be object of MongoDB\Driver\Cursor class
    $result = $manager->executeQuery($collection, $query);

    foreach ($result as $document) {
        $document = json_decode(json_encode($document),true);
        echo $document['first_name'] . " " . $document['age'] . '</br>';
        //pr($document);
    }
}

function insert($var){
    global $manager, $collection;
    
    $bulk = new MongoDB\Driver\BulkWrite;

    $document1 = ['title' => 'one'];
    $document2 = ['_id' => 'custom ID', 'title' => 'two'];
    $document3 = ['_id' => new MongoDB\BSON\ObjectId, 'title' => 'three'];

    $_id1 = $bulk->insert($document1);
    $_id2 = $bulk->insert($document2);
    $_id3 = $bulk->insert($document3);

    var_dump($_id1, $_id2, $_id3);

    $result = $manager->executeBulkWrite($collection, $bulk);
}

function guardarRuta($stringRuta){
    global $manager;
    $collection = 'VeloRoute.rutas';
    $bulk = new MongoDB\Driver\BulkWrite;
    
    // Convert JSON to a PHP array
    $document = json_decode($stringRuta);

    $_id1 = $bulk->insert($document);
    $result = $manager->executeBulkWrite($collection, $bulk);
}

function guardarMarcador($stringMarcador){
    global $manager;
    $collection = 'VeloRoute.Marcadores';
    $bulk = new MongoDB\Driver\BulkWrite;
    
    // Convert JSON to a PHP array
    $document = json_decode($stringMarcador);

    $_id1 = $bulk->insert($document);
    $result = $manager->executeBulkWrite($collection, $bulk);
}

function listarMarcadores(){
    global $manager;
    $collection = 'VeloRoute.Marcadores';
    // Query Class
    $query = new MongoDB\Driver\Query([]);

    // Output of the executeQuery will be object of MongoDB\Driver\Cursor class
    $result = $manager->executeQuery($collection, $query);

    return $result->toArray();
}