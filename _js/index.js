var fec_ini = "";
var ingresos = 0;
var egresos = 0;
var registros = 0;
var regind = 0;
var regdiv = 0;
var TirAprox = 0;
var Tir = 0.00;
var vpn = 0;

function calc_TIR()
{
	$("#tb_salida tbody").html("");	
	$("#tir").val(0);
	var row = "";
	var desTipo = "";
	var strTipo = "";
	var datFecha = "";
	var datFechaAnt = "";
	var NumAcciones = "";
	var NumValor = "";
	var aux = 0;
	var arrayData = "";
	var acumcan = 0;
	
	var aumento = 0.0;
	
	var fecha1;
	var fecha2;
	var difDias;
	var TiempoAno;
	var vlr_total = 0;
	var datFechaCon = $("#fechaCon").val(); 
	
	for (i=1; i<=4; i++)
	{
		registros = registros + 1;
		desTipo = "";
		strTipo = "";
		datFecha = "";
		NumAcciones = 0;
		NumValor = 0;
		row = "";
		
		strTipo = $("#tipo"+i).val(); 
		datFecha = $("#fecha"+i).val(); 
		NumAcciones = $("#acciones"+i).val(); 
		NumValor = $("#valor"+i).val(); 
		arrayData = "";
		
		arrayData += "&strTipo="+strTipo;
		arrayData += "&datFecha="+datFecha;
		arrayData += "&datFechaAnt="+datFechaAnt;
		arrayData += "&NumAcciones="+NumAcciones;
		arrayData += "&NumValor="+NumValor;
		
		if (strTipo==="I"){
			desTipo = "Inversion";
		}
		else if (strTipo==="R"){
			desTipo = "Retiro";
		}					
		if (i === 1)
		{
			fec_ini = datFecha;
			vlr_total = NumAcciones * NumValor;
			ingresos = ingresos + Number(vlr_total);
			row = "<tr><td>"+desTipo+"</td>"
				+ "<td>"+datFecha+"</td>"
				+ "<td>"+NumAcciones+"</td>"
				+ "<td>"+NumValor+"</td>"
				+ "<td>"+vlr_total+"</td>";
				+ "<td >"+datFechaAnt+"</td></tr>";
			$("#tb_salida tbody").append(row);	
			datFechaAnt = datFecha;
		}
		else{
			dividendos(datFechaAnt, datFecha, -acumcan);
			fecha1 = moment(fec_ini);
			fecha2 = moment(datFecha);
			difDias = fecha2.diff(fecha1, 'days');
			TiempoAno = difDias / 365;
			vlr_total = NumAcciones * NumValor;
			IngresoEgreso(vlr_total);
			
			row = "<tr><td>"+desTipo+"</td>"
				+ "<td>"+datFecha+"</td>"
				+ "<td>"+NumAcciones+"</td>"
				+ "<td>"+NumValor+"</td>"
				+ "<td>"+vlr_total+"</td>"
				+ "<td style='visibility:collapse;'>"+TiempoAno+"</td></tr>";
			$("#tb_salida tbody").append(row);	
			
			datFechaAnt = datFecha;
		}
		acumcan = acumcan + Number(NumAcciones);
		if (i === 4){
			indicadores(datFechaAnt, datFechaCon, acumcan);
			registros = registros + regind + regdiv;
			TirAprox = ((ingresos/egresos)-1) / registros;
			
		}
	}
	
}

async function valida()
{
	var vpi = 0;
	var vpe = 0;
	vpn = 0;
	
	$("#tb_salida tbody tr").each(function (index) {
	var campo1, campo2, resultado;
	
	$(this).children("td").each(function (index2) {
		switch (index2) {
			case 4:
				campo1 = $(this).text();
			break;
			case 5:
				campo2 = $(this).text();
			break;
			
		}
	$(this).css("background-color", "#afe2ff");
	})
	if (index === 0){
		resultado = campo1;
		vpi = vpi + Number(resultado);
	}
	else
	{
		resultado = campo1/((1+TirAprox)**campo2);
		if (resultado > 0) {
			vpi = vpi + Number(resultado);
		}
		else{
			vpe = vpe + Number(resultado);
		}
	}
	});
	vpn = vpi + vpe;
}

async function IngresoEgreso( valor ){
	if (valor > 0){
		ingresos = ingresos + valor;
	}
	else{
		egresos = egresos + valor;
	}
}

async function indicadores(fechaAnt, fecha, acciones)
{
	//registros = registros + 1;
	dividendos(fechaAnt, fecha, -acciones);
	
	var arrayData = "";
	var row = "";
	var fecha1 = moment(fec_ini);
	var fecha2 = moment(fecha);
	var difDias = fecha2.diff(fecha1, 'days');
	var TiempoAno = difDias / 365;
	var vlr_total = 0;
	
	acciones = acciones * (-1);
	arrayData += "&strFecha="+fecha;
	$.ajax({
		url: '_php/indicadores.php',
		type: 'POST',
		data: arrayData,
		dataType : 'json',
		success: function(data) {
			$.each(data, function(i,fil){
				vlr_total = acciones * fil.VALOR;
				regind = regind + 1;
				IngresoEgreso(vlr_total);
				row = "<tr><td>Fecha de Consulta</td>"
				+ "<td>"+fecha+"</td>"
				+ "<td>"+acciones+"</td>"
				+ "<td>"+fil.VALOR+"</td>"
				+ "<td>"+ vlr_total +"</td>"
				+ "<td style='visibility:collapse;'>"+ TiempoAno +"</td></tr>";		
				$("#tb_salida tbody").append(row);	
			});	
			alert("La TIR Aproximada inicial es: "+TirAprox.toFixed(2)+", Ahora se buscara la TIR exacta mediante <Prueba & Error>");
			valida();
			while (vpn < 0.001)
			{
				if (vpn < 0) {
					TirAprox = TirAprox + 0.00001;
					valida();
				}
			}
			Tir = TirAprox * 100;
			$("#tir").val(Tir.toFixed(2));
			alert("Calculo Finalizado");	
			},
			error: function(error){
				alert("Error _php/indicadores.php");
			}
			
	});
}

function dividendos(fant, fecha, acc)
{
	var row = "";
	var arrayData = "";
	var fecha1 = moment(fec_ini);
	var fecha2;
	var difDias;
	var TiempoAno;
	var vlr_total = 0;
	desTipo = "";
	row = "";
	
	arrayData = "";
	
	arrayData += "&strTipo="+"D";
	arrayData += "&datFecha="+fecha;
	arrayData += "&datFechaAnt="+fant;
	arrayData += "&NumAcciones="+acc;
	arrayData += "&NumValor="+0;
	$.ajax({
		url: '_php/dividendos.php',
		type: 'POST',
		data: arrayData,
		dataType : 'json',
		success: function(data) {
			$.each(data, function(i,fil){
				fecha2 = moment(fil.FECHA);
				difDias = fecha2.diff(fecha1, 'days');
				TiempoAno = difDias / 365;
				regdiv = regdiv + 1;
				vlr_total = acc * fil.VALOR;
				IngresoEgreso(vlr_total);
				row = "<tr><td>Dividendos</td>"
				+ "<td>"+fil.FECHA+"</td>"
				+ "<td></td>"
				+ "<td>"+fil.VALOR+"</td>"
				+ "<td>"+ vlr_total+"</td>"
				+ "<td style='visibility:collapse;'>"+ TiempoAno+"</td></tr>";
				$("#tb_salida tbody").append(row);	
			});	
			
			},
			error: function(error){
				alert("Error _php/dividendos.php");
			}
			
	});
}

