$client = new MongoDB\Client(
    'mongodb+srv://fredyyamidarciniegas@gmail.com:<password>@cluster0.lesxt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
$db = $client->test;