<?php
include 'database.php';
if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    exit;
}

$sql = "SELECT * FROM ".$myDb.".stock;";

$stack = array();
$stock_bucket = array();
$response = new stdClass();
$result = $link->query($sql);

if(is_object($result)){
	$temp = property_exists($result, 'num_rows');
	if ($temp == 1 && $result->num_rows > 0) {
	    while($row = $result->fetch_assoc()) {
	        array_push($stock_bucket, $row);
	    }
		$response->STATUS = 'success';
		$response->STOCK_BUCKET = $stock_bucket;
	} else {
	    //echo "empty";
	}
}else{
	$response->STATUS = $result;
	$response->STATUS_MSG = '----';
}


// if ($res === TRUE) {
// 	$obj->status = 'success';
// 	$obj->status_msg = 'Stock details retreived successfully';
// 	$obj->options = $_POST;
// 	array_push($stack, $obj);
// } else {
// 	$obj->status = 'error';
// 	$obj->status_msg = $link->error;
//     $obj->executed_query = $sql;
// 	$obj->options = $_POST;
//     $obj->result = $res;
// 	array_push($stack, $obj);
// }
echo json_encode($response);
mysqli_close($link);
?>