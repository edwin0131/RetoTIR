<?php

	$datFecha =  $_REQUEST["strFecha"];

	$a=require("conexion.php");

	$sql = "SELECT * FROM indicadores WHERE FECHA = '".$datFecha."'";

	if(!$result = mysqli_query($c, $sql)) die();
	$arr_indicadores = array(); 
		
	while($row = mysqli_fetch_array($result)) 
	{ 
		$FONDO=$row['FONDO'];
		$FECHA=$row['FECHA'];
		$VALOR=$row['VALOR'];
		$arr_indicadores[] = array('FONDO'=> $FONDO, 'FECHA'=> $FECHA, 'VALOR'=> $VALOR);
	}

	$close = mysqli_close($c) 
	or die("Ha sucedido un error inexperado en la desconexion de la base de datos");
	   
	$json_string = json_encode($arr_indicadores);
	echo $json_string;

?>