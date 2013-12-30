(function($) {
  $.fn.inercia = function(options) {
    var defaults = {
      selectorAreaDatos: '#app-data-area',
      selectorAreaResultados: '#app-results-area',
      selectorContenedorFilas: '#app-data-area table tbody',
      selectorFilaVertice: 'tr',
      selectorBotonIniciar: '#inercia-boton-iniciar',
      selectorBotonCalcular: '#inercia-calculate-button',
      selectorCampoNumeroVertices: '#c_numero_vertices',
      selectorNumero: '.numero',
      selectorCampoX: '.campo-x',
      selectorCampoY: '.campo-y',
      selectorResultadoXg: '#resultado-xg',
      selectorResultadoYg: '#resultado-yg',
      selectorResultadoS: '#resultado-s',
      selectorResultadoYx: '#resultado-yx',
      selectorResultadoYy: '#resultado-yy',
      selectorMensajeErrorCamposListado: '#error-campos-numericos',
      claseError: 'erroneo',
      datosIdCampoVerticeX: 'c_campo_vertice_x_',
      datosIdCampoVerticeY: 'c_campo_vertice_y_',
      opcion2: ''
    },
      datos = {},
      op = $.extend(defaults, options);

    function esNumero(campo) {
      var caracterDecimal = '.',
        valorCampo = campo.val(),
        regex = new RegExp("^\\d+$|\\d*" + caracterDecimal + "\\d+");

      return regex.exec(valorCampo);
    }

    function calcularResultados() {
      if (comprobarCampos()) {

        var xOriginal = [],
          yOriginal = [],
          k = 1,
          n = datos.numeroVertices,
          tope = n - 1,
          St = 0,
          Ixt = 0,
          Iyt = 0,
          Xs = 0,
          Ys = 0,
          X1,
          Y1,
          x,
          y,
          i,
          l,
          Xg,
          Yg,
          Si,
          d,
          c,
          h,
          r3,
          r4,
          z,
          v,
          q,
          w,
          p,
          r1,
          r2,
          Ixi,
          Iyi,
          Xgt,
          Ygt,
          Ixg,
          Iyg;

        datos.contenedorFilas.find(op.selectorCampoX).each(function () {
          xOriginal.push(parseFloat($(this).val()));
        });
        datos.contenedorFilas.find(op.selectorCampoY).each(function () {
          yOriginal.push(parseFloat($(this).val()));
        });

        X1 = parseFloat(xOriginal[0]);
        Y1 = parseFloat(yOriginal[0]);

        // Paso de coordenadas de ejes generales a ejes locales
        i = 0;
        x = [];
        y = [];
        while (i < n) {
          x.push(xOriginal[i] - X1);
          y.push(yOriginal[i] - Y1);
          i += 1;
        }

        // Inicio de los cálculos
        while (k < tope) {
          l = k + 1;

          // Cálculo datos del triángulo
          Xg = (x[k] + x[l]) / 3;
          Yg = (y[k] + y[l]) / 3;

          Si = ((x[k] * y[l]) - (x[l] * y[k])) / 2;

          d = Math.sqrt(Math.pow(x[k], 2) + Math.pow(y[k], 2));
          c = Math.sqrt(Math.pow(x[l], 2) + Math.pow(y[l], 2));
          h = 2 * Si / d;

          r3 = y[k] / d;
          r4 = x[k] / d;

          z = x[l] * r4 + y[l] * r3;

          v = (d - (2 * z)) / (2 * h);
          q = (Math.pow(h, 3)) * d / 12;
          w = (Math.pow(d, 3) * h / 48) + (3 * q * Math.pow(v, 2));

          p = q * v;
          r1 = (q * Math.pow(r4, 2)) + (w * Math.pow(r3, 2)) + (2 * p * r3 * r4);
          r2 = (q * Math.pow(r3, 2)) + (w * Math.pow(r4, 2)) - (2 * p * r3 * r4);

          Ixi = r1 + (Si * Math.pow(Yg, 2)) - (Si * Math.pow((Yg - (z * r3)), 2));
          Iyi = r2 + (Si * Math.pow(Xg, 2)) - (Si * Math.pow((Xg - (z * r4)), 2));

          // Cálculo Sumatorios
          Ixt = Ixt + Ixi;
          Iyt = Iyt + Iyi;
          St = St + Si;
          Xs = Xs + Xg * Si;
          Ys = Ys + Yg * Si;

          k += 1;
        }

        // Cálculo c.d.g. del pol¡gono
        Xgt = Xs / St;
        Ygt = Ys / St;

        //Inercias referidas al centro de gravedad
        Ixg = Ixt - St * Math.pow(Ygt, 2);
        Iyg = Iyt - St * Math.pow(Xgt, 2);

        //Paso de coordenadas c.d.g. a ejes generales
        Xg = Xgt + X1;
        Yg = Ygt + Y1;

        // Impresión de resultados
        $(op.selectorResultadoXg).html(Xg);
        $(op.selectorResultadoYg).html(Yg);
        $(op.selectorResultadoS).html(St);
        $(op.selectorResultadoYx).html(Ixg);
        $(op.selectorResultadoYy).html(Iyg);

        $(op.selectorAreaResultados).eq(0).fadeIn(100);
      }
    }

    function rellenarListadoVertices() {
      datos.campos = datos.contenedorFilas.find('input');
      datos.campos.bind('blur', function () {
        var campo = $(this);
        if (!esNumero(campo)) {
          campo.val('').addClass(op.claseError);
        } else {
          campo.removeClass(op.claseError);
        }
      });

      $(op.selectorBotonCalcular).bind('click', calcularResultados);
    }

    function generarListadoVertices() {
      var i = 0,
        numero = 1,
        ultimaFila,
        etiqueta,
        campo;
      while (i < datos.numeroVertices) {
        datos.contenedorFilas.append(datos.htmlFila);
        ultimaFila = datos.contenedorFilas.find(op.selectorFilaVertice + ':last').eq(0);
        etiqueta = ultimaFila.find('label');
        etiqueta.eq(0).attr('for', op.datosIdCampoVerticeX + numero);
        etiqueta.eq(1).attr('for', op.datosIdCampoVerticeY + numero);

        campo = ultimaFila.find('input');
        campo.eq(0).attr('id', op.datosIdCampoVerticeX + numero);
        campo.eq(1).attr('id', op.datosIdCampoVerticeY + numero);

        ultimaFila.find(op.selectorNumero).html(numero);
        i += 1;
        numero += 1;
      }
      $(op.selectorAreaDatos).fadeIn(200, rellenarListadoVertices);
    }

    function comprobarCampos() {
      var error = 0,
        mensajeErrorCamposListado = $(op.selectorMensajeErrorCamposListado).eq(0),
        resultado;
      datos.campos.each(function () {
        var campo = $(this);
        if (!esNumero(campo)) {
          campo.val('').addClass(op.claseError);
          error += 1;
        } else {
          campo.removeClass(op.claseError);
        }
      });
      if (error > 0) {
        mensajeErrorCamposListado.show();
        resultado = false;
      } else {
        mensajeErrorCamposListado.hide();
        resultado = true;
      }
      return resultado;
    }

    function vaciarContenedorVertices() {
      datos.contenedorFilas.empty();
      datos.areaResultados.hide();
    }

    function definirVertices() {
      $(op.selectorBotonIniciar).bind('click', function (event) {
        event.preventDefault();
        datos.numeroVertices = $(op.selectorCampoNumeroVertices).val();
        vaciarContenedorVertices();
        generarListadoVertices();
      });
    }

    function iniciar() {
      datos.contenedorFilas = $(op.selectorContenedorFilas).eq(0);
      datos.areaResultados = $(op.selectorAreaResultados).eq(0);
      datos.htmlFila = datos.contenedorFilas.html();
      definirVertices();
    }

    iniciar();

  }
}(jQuery));