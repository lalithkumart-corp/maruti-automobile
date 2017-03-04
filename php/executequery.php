<?php
include 'database.php';
if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    exit;
}

$sql = $_POST['aQuery'];
if( isset($_POST['multiQuery']) && ($_POST['multiQuery'] == true) ){
	$result = mysqli_multi_query($link, $sql);
}else{
	$result = $link->query($sql);	
}


$stack = array();
if(is_object($result)){
	$temp = property_exists($result, 'num_rows');
	if ($temp == 1 && $result->num_rows > 0) {
	    while($row = $result->fetch_assoc()) {
	        array_push($stack, $row);
	    }
	} else {
	    //echo "empty";
	}
}else{
	$obj = new stdClass();
	$obj->status = $result;
	array_push($stack, $obj);
}

echo json_encode($stack);
mysqli_close($link);

?>