// cargar.js - Funciones reutilizables para el loading screen

function actualizarProgreso(porcentaje){
  var barra = document.getElementById('loading-bar');
  var texto = document.getElementById('loading-text');

  if (barra) barra.style.width = porcentaje + '%';
  if (texto) texto.textContent = 'Cargando... ' + porcentaje + '%';
}

function ocultarLoading(){
  var loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('oculto');
  }
}

function mostrarErrorCarga(mensaje){
  var texto = document.getElementById('loading-text');
  if (texto) {
    texto.textContent = mensaje || 'Error al cargar el modelo';
  }
}