<?php
include 'database.php';
if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    exit;
}
$sno = $_POST['s_no'];
$unique_no = $_POST['unique_no'];
$date = $_POST['date'];
$invoice_no = $_POST['invoiceNo'];
$dealer_name = $_POST['dealerName'];
$amount = $_POST['amount'];
$paidAmt = $_POST['paidAmt'];
$dueAmt = $_POST['dueAmt'];
$paymentMode = $_POST['paymentMode'];
$desc = $_POST['desc'];
$table_item_list = $_POST['itemList'];
$paymentData = $_POST['paymentData'];

$sql = "INSERT INTO ".$myDb.".invoive_list (sno, unique_no, invoice_no, date, delear_name, amount, paid_amt, due_amt, payment_mode, items, description, payment_data) VALUES ('".$sno."', '".$unique_no."', '".$invoice_no."', '".$date."','".$dealer_name."','".$amount."','".$paidAmt."','".$dueAmt."','".$paymentMode."','".$table_item_list."','".$desc."', '".$paymentData."')";

$stack = array();
$obj = new stdClass();

if ($link->query($sql) === TRUE) {
	$obj->status = 'success';
	$obj->status_msg = 'New record created successfully';
	$obj->options = $_POST;
	array_push($stack, $obj);
} else {
	$obj->status = 'error';
	$obj->status_msg = $link->error;
	$obj->options = $_POST;
	array_push($stack, $obj);
}
echo json_encode($stack);
mysqli_close($link);
?>