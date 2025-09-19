const form = document.getElementById("pedidoForm");
const nombreInput = document.getElementById("nombre");
const direccionInput = document.getElementById("direccion");
const horaInput = document.getElementById("hora");
const cantidadInput = document.getElementById("cantidad");
const dineroInput = document.getElementById("dinero");
const diaSelect = document.getElementById("dia");
const envioCheckbox = document.getElementById("envio");
const detalleFactura = document.getElementById("detalleFactura");
const llamadaRapida = document.getElementById("llamadaRapida");

// ⚡ Números de WhatsApp para pedidos
const whatsappHoy = "75030033";        // <-- Cambia aquí
const whatsappAdelantado = "75030034"; // <-- Cambia aquí

// ⚡ Número para llamada rápida
const telefonoRapido = "tel:75030035";     // <-- Cambia aquí

// Función para calcular precio
function calcularPrecio(cantidad, envio) {
  let precio = 0;
  const paquetes = Math.floor(cantidad / 4);
  const sueltas = cantidad % 4;
  precio += paquetes * 0.25;
  precio += sueltas * 0.10;
  if (envio) precio += 0.10;
  return precio;
}

// Actualizar factura en tiempo real
function actualizarFactura() {
  const envio = envioCheckbox.checked;
  let cantidad = parseInt(cantidadInput.value) || 0;

  // Si modo de pedido es por dinero
  const modo = document.querySelector('input[name="modoPedido"]:checked').value;
  if (modo === "dinero") {
    const dinero = parseFloat(dineroInput.value) || 0;
    // Calcular cantidad de tortillas a partir del dinero
    // 4 tortillas = 0.25, 1 tortilla = 0.10
    const paquetes = Math.floor(dinero / 0.25);
    let resto = dinero - paquetes*0.25;
    const sueltas = Math.floor(resto / 0.10);
    cantidad = paquetes*4 + sueltas;
  }

  if (cantidad > 0) {
    const precio = calcularPrecio(cantidad, envio);
    detalleFactura.textContent = `Pedido de ${cantidad} tortillas. Total: $${precio.toFixed(2)} ${envio ? "(con envío)" : ""}`;
  } else {
    detalleFactura.textContent = "Seleccione cantidad o dinero...";
  }
}

cantidadInput.addEventListener("input", actualizarFactura);
dineroInput.addEventListener("input", actualizarFactura);
envioCheckbox.addEventListener("change", actualizarFactura);

// Mostrar/ocultar inputs según modo de pedido
document.querySelectorAll('input[name="modoPedido"]').forEach(radio => {
  radio.addEventListener("change", function() {
    if (this.value === "cantidad") {
      document.getElementById("cantidadTortillas").style.display = "block";
      document.getElementById("dineroTortillas").style.display = "none";
    } else {
      document.getElementById("cantidadTortillas").style.display = "none";
      document.getElementById("dineroTortillas").style.display = "block";
    }
    actualizarFactura();
  });
});

// Habilitar o deshabilitar selector de día según tipo de pedido
document.querySelectorAll('input[name="tipoPedido"]').forEach(radio => {
  radio.addEventListener("change", function() {
    if (this.value === "adelantado") {
      diaSelect.disabled = false;
    } else {
      diaSelect.disabled = true;
      diaSelect.value = "";
    }
    actualizarFactura();
  });
});

// Enviar pedido a WhatsApp
form.addEventListener("submit", function(e) {
  e.preventDefault();
  const nombre = nombreInput.value.trim();
  const direccion = direccionInput.value.trim();
  const hora = horaInput.value;
  const envio = envioCheckbox.checked;
  const tipoPedido = document.querySelector('input[name="tipoPedido"]:checked')?.value;
  const modo = document.querySelector('input[name="modoPedido"]:checked')?.value;

  // Validar campos obligatorios
  if (!nombre || !direccion || !hora || !tipoPedido || (tipoPedido === "adelantado" && !diaSelect.value) ||
      (modo === "cantidad" && !cantidadInput.value) || (modo === "dinero" && !dineroInput.value)) {
    alert("Por favor complete todos los campos");
    return;
  }

  // Validar hora máxima
  if (hora > "19:00") {
    alert("La hora máxima de entrega es 7:00 pm");
    return;
  }

  // Determinar cantidad final
  let cantidad = parseInt(cantidadInput.value) || 0;
  if (modo === "dinero") {
    const dinero = parseFloat(dineroInput.value);
    const paquetes = Math.floor(dinero / 0.25);
    const resto = dinero - paquetes*0.25;
    const sueltas = Math.floor(resto / 0.10);
    cantidad = paquetes*4 + sueltas;
  }

  const precio = calcularPrecio(cantidad, envio);

  // Hora en 12 horas
  let [h, m] = hora.split(":");
  h = parseInt(h);
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const hora12 = `${h}:${m} ${ampm}`;

  // Mensajes diferentes según tipo de pedido
  let mensaje = "";
  if (tipoPedido === "hoy") {
    mensaje = `Hola, soy ${nombre}. Quiero encargar ${cantidad} tortillas para HOY a las ${hora12}. Dirección: ${direccion}. Total: $${precio.toFixed(2)} ${envio ? "(con envío)" : ""}.`;
  } else {
    mensaje = `Hola, soy ${nombre}. Quiero programar un pedido de ${cantidad} tortillas para el día ${diaSelect.value} a las ${hora12}. Dirección: ${direccion}. Total: $${precio.toFixed(2)} ${envio ? "(con envío)" : ""}.`;
  }

  const numero = tipoPedido === "hoy" ? whatsappHoy : whatsappAdelantado;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
});

// Botón de llamada rápida
llamadaRapida.addEventListener("click", function() {
  window.location.href = telefonoRapido; // <-- Cambia el número aquí
});
