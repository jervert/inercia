$(document).ready(function() {
	$.fn.inercia();
});

(function($){
$.fn.inercia = function(options) {
	
	var defaults = { // Opciones por defecto
		selectorAreaDatos: '#aplicacion-datos'
		,selectorAreaResultados: '#aplicacion-resultados'
		,selectorContenedorFilas: '#aplicacion-datos table tbody'
		,selectorFilaVertice: 'tr'
		,selectorBotonIniciar: '#inercia-boton-iniciar'
		,selectorBotonCalcular: '#inercia-boton-calcular'
		,selectorCampoNumeroVertices: '#c_numero_vertices'
		,selectorNumero: '.numero'
		,selectorCampoX: '.campo-x'
		,selectorCampoY: '.campo-y'
		,selectorResultadoXg: '#resultado-xg'
		,selectorResultadoYg: '#resultado-yg'
		,selectorResultadoS: '#resultado-s'
		,selectorResultadoYx: '#resultado-yx'
		,selectorResultadoYy: '#resultado-yy'
		,selectorMensajeErrorCamposListado: '#error-campos-numericos'
		,claseError: 'erroneo'
		,datosIdCampoVerticeX: 'c_campo_vertice_x_'
		,datosIdCampoVerticeY: 'c_campo_vertice_y_'
		,opcion2: ''
	}
	var datos = {}
	var op = $.extend(defaults, options);
	iniciar();
	
	function iniciar () {
		datos.contenedorFilas = $(op.selectorContenedorFilas).eq(0);
		datos.areaResultados = $(op.selectorAreaResultados).eq(0);
		datos.resultados
		datos.htmlFila = datos.contenedorFilas.html();
		definirVertices();
	}
	
	function definirVertices () {
		$(op.selectorBotonIniciar).bind('click',function (event) {
			event.preventDefault();
			datos.numeroVertices = $(op.selectorCampoNumeroVertices).val();
			vaciarContenedorVertices();
			generarListadoVertices();
		});
	}
	
	function generarListadoVertices () {
		var i = 0; numero = 1;
		while (i<datos.numeroVertices) {
			datos.contenedorFilas.append(datos.htmlFila);
			var ultimaFila = datos.contenedorFilas.find(op.selectorFilaVertice+':last').eq(0);
			
			var etiqueta = ultimaFila.find('label');
			etiqueta.eq(0).attr('for',op.datosIdCampoVerticeX+numero);
			etiqueta.eq(1).attr('for',op.datosIdCampoVerticeY+numero);
			
			var campo = ultimaFila.find('input');
			campo.eq(0).attr('id',op.datosIdCampoVerticeX+numero);
			campo.eq(1).attr('id',op.datosIdCampoVerticeY+numero);
			
			ultimaFila.find(op.selectorNumero).html(numero);
			i++;numero++;
		}
		$(op.selectorAreaDatos).fadeIn(200,rellenarListadoVertices);
	}
	
	function rellenarListadoVertices () {
		datos.campos = datos.contenedorFilas.find('input');
		datos.campos.bind('blur',function () {
			var campo = $(this);
			if (!esNumero(campo)) {
				campo.val('').addClass(op.claseError);
			} else {
				campo.removeClass(op.claseError);
			}
		});
		
		$(op.selectorBotonCalcular).bind('click',calcularResultados);
	}
	
	function calcularResultados () {
		if (comprobarCampos()) {
			
			var xOriginal = new Array();
			datos.contenedorFilas.find(op.selectorCampoX).each(function () {
				xOriginal.push(parseFloat($(this).val()));
			});
			var yOriginal = new Array();
			datos.contenedorFilas.find(op.selectorCampoY).each(function () {
				yOriginal.push(parseFloat($(this).val()));
			});
			
			var X1 = parseFloat(xOriginal[0]);
			var Y1 = parseFloat(yOriginal[0]);
			
			var k = 1;
			var n = datos.numeroVertices;
			var tope = n-1;
			var St = 0;
			var Ixt = 0;
			var Iyt = 0;
			var Xs = 0;
			var Ys = 0;
			
			
			// Paso de coordenadas de ejes generales a ejes locales
			var i=0;
			var x = new Array();
			var y = new Array();
			while (i<n) {
				x.push(xOriginal[i]-X1);
				y.push(yOriginal[i]-Y1);
				i++;
			}
			
			// Inicio de los cálculos
			
			while (k<tope) {
				var l = k+1;
				
				// Cálculo datos del triángulo
				
				var Xg = (x[k] + x[l]) / 3;
				var Yg = (y[k] + y[l]) / 3;
				
				var Si = ((x[k] * y[l]) - (x[l] * y[k])) / 2;
				
				var d = Math.sqrt(Math.pow(x[k],2)+ Math.pow(y[k],2));
				var c = Math.sqrt(Math.pow(x[l],2) + Math.pow(y[l],2));
				var h = 2 * Si / d;
				
				var r3 = y[k] / d;
				var r4 = x[k] / d;
				
				var z = x[l] * r4 + y[l] * r3;
				  
				var v = (d - (2 * z)) / (2 * h);
				var q = (Math.pow(h,3)) * d / 12;
				var w = (Math.pow(d,3) * h / 48) + (3 * q * Math.pow(v,2));
				
				var p = q * v;
				var r1 = (q * Math.pow(r4,2)) + (w * Math.pow(r3,2)) + (2 * p * r3 * r4);
				var r2 = (q * Math.pow(r3,2)) + (w * Math.pow(r4,2)) - (2 * p * r3 * r4);
				
				var Ixi = r1 + (Si * Math.pow(Yg,2)) - (Si * Math.pow((Yg - (z * r3)),2));
				var Iyi = r2 + (Si * Math.pow(Xg,2)) - (Si * Math.pow((Xg - (z * r4)),2));
				
				
				// Cálculo Sumatorios
				
				var Ixt = Ixt + Ixi;
				var Iyt = Iyt + Iyi;
				var St = St + Si;
				var Xs = Xs + Xg * Si;
				var Ys = Ys + Yg * Si;
				
				k++;
			}
			
			// Cálculo c.d.g. del pol¡gono
			var Xgt = Xs / St;
			var Ygt = Ys / St;
			
			//Inercias referidas al centro de gravedad
			var Ixg = Ixt - St * Math.pow(Ygt,2);console.log(Ixg+' = '+Ixt+' - '+St+' * '+Math.pow(Ygt,2))
			var Iyg = Iyt - St * Math.pow(Xgt,2);
			
			//Paso de coordenadas c.d.g. a ejes generales
			var Xg = Xgt + X1;
			var Yg = Ygt + Y1;
			
			
			// Impresión de resultados
			
			$(op.selectorResultadoXg).html(Xg);
			$(op.selectorResultadoYg).html(Yg);
			$(op.selectorResultadoS).html(St);
			$(op.selectorResultadoYx).html(Ixg);
			$(op.selectorResultadoYy).html(Iyg);
			
			$(op.selectorAreaResultados).eq(0).fadeIn(200);
			
			
		}
	}
	
	function comprobarCampos () {
		var error = 0;
		var mensajeErrorCamposListado = $(op.selectorMensajeErrorCamposListado).eq(0);
		datos.campos.each(function () {
			var campo = $(this);
			if (!esNumero(campo)) {
				campo.val('').addClass(op.claseError);
				error++;
			} else {
				campo.removeClass(op.claseError);
			}
		});
		if (error>0) {
			mensajeErrorCamposListado.show();
			return false;
		} else {
			mensajeErrorCamposListado.hide();
			return true;
		}
	}
	
	function esNumero(campo) {
		var caracterDecimal = '.';
		var valorCampo = campo.val()
		var regex = new RegExp("^\\d+$|\\d*" + caracterDecimal + "\\d+");
		
		if(!regex.exec(valorCampo)){
			return false;
		} else {
			return true;
		} 
	}
	
	function vaciarContenedorVertices () {
		datos.contenedorFilas.empty();
		datos.areaResultados.hide();
	}
	
	
}
})(jQuery);