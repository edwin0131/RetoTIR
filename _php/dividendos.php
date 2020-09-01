<?php

	$datFecha =  $_REQUEST["datFecha"];
	$datFechaAnt =  $_REQUEST["datFechaAnt"];
	$NumValor = $_REQUEST["NumValor"];

	$a=require("conexion.php");

	$sql = "SELECT * FROM dividendos WHERE FECHA <= '".$datFecha."' and FECHA > '".$datFechaAnt."'";

	if(!$result = mysqli_query($c, $sql)) die();
	$arr_dividendos = array(); 
		
	while($row = mysqli_fetch_array($result)) 
	{ 
		$FONDO=$row['FONDO'];
		$FECHA=$row['FECHA'];
		$VALOR=$row['VALOR'];
		$arr_dividendos[] = array('FONDO'=> $FONDO, 'FECHA'=> $FECHA, 'VALOR'=> $VALOR);
	}

	$close = mysqli_close($c) 
	or die("Ha sucedido un error inexperado en la desconexion de la base de datos");
	   
	$json_string = json_encode($arr_dividendos);
	echo $json_string;

?>