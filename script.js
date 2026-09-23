var scene, camera, renderer, model;
var mouseX=0;
var raycaster = new THREE.Raycaster();
var mouseClick = new THREE.Vector2();
var ubicacionAbierta = false;

var galeriaInicializada = false;

var galeriaInicializada = false;




function init(){
  // Escena
  scene = new THREE.Scene();
  var textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load('imagenes/fondo1.jpeg');
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;

  // Cámara
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z =7;

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Luces (sin esto, el modelo se ve negro)
  var ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);
  // Luz ambiental con tono azulado (simula luz de luna/noche)
  var ambientLight = new THREE.AmbientLight(0x4444aa, 0.6); // 👈 azul tenue en vez de blanco puro
  scene.add(ambientLight);

  // Luz direccional más fría, simulando luz de luna
  var directionalLight = new THREE.DirectionalLight(0xaaccff, 1.2); // 👈 blanco azulado
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);
  scene.fog = new THREE.Fog(0x1a1a3a, 20, 100); // color oscuro similar al cielo, distancia inicio/fin

  // Cargar el modelo
  loadModel();
  document.addEventListener('mousemove', onMouseMove);
  // Loop de animación (esto faltaba en tu código original)
  animate();

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onModelClick);


  var botonGaleria = document.querySelectorAll('.menu-item')[2];
  botonGaleria.addEventListener('click', function(e){
    e.preventDefault();

    var panelGaleria = document.getElementById('panel-galeria');
    var abriendo = !panelGaleria.classList.contains('visible');

    ocultarTodosLosPaneles();

    if (abriendo) {
      panelGaleria.classList.add('visible');
    }

    renderer.domElement.style.display = abriendo ? 'none' : 'block'; // 👈 esto se queda solo acá
    document.getElementById('texto-clic').style.display = abriendo ? 'none' : 'block';
    ubicacionAbierta = abriendo;

    if (!galeriaInicializada && abriendo) {
      crearVisorSanto('canvas-santo1', 'objetos/santo1.glb');
      crearVisorSanto('canvas-santo2', 'objetos/santo2.glb');
      crearVisorSanto('canvas-santo3', 'objetos/santo3.glb');
      galeriaInicializada = true;
    }
  });

  var botonUbicacion = document.querySelectorAll('.menu-item')[3];
  botonUbicacion.addEventListener('click', function(e){
    e.preventDefault();

    var panelUbicacion = document.getElementById('panel-ubicacion');
    var abriendo = !panelUbicacion.classList.contains('visible');

    ocultarTodosLosPaneles();

    if (abriendo) {
      panelUbicacion.classList.add('visible');
    }

    renderer.domElement.style.display = 'block'; // 👈 agregamos esto, para asegurar que la iglesia siempre se muestre acá
    document.getElementById('texto-clic').style.display = 'block'; // 👈 también esto, por consistencia

    ubicacionAbierta = abriendo;
  });

  var botonInicio = document.querySelectorAll('.menu-item')[0];
  botonInicio.addEventListener('click', function(e){
    e.preventDefault();
    ocultarTodosLosPaneles();
    ubicacionAbierta = false;
    renderer.domElement.style.display = 'block'; // asegura que vuelva a mostrarse
    document.getElementById('texto-clic').style.display = 'block';
  });

  var botonGaleria = document.querySelectorAll('.menu-item')[2];
  botonGaleria.addEventListener('click', function(e){
    e.preventDefault();
    // ... todo el código que ya tenés de mostrar/ocultar paneles
  });

  var parametros = new URLSearchParams(window.location.search);
  if (parametros.get('abrir') === 'galeria') {
    botonGaleria.click();
  }


  // Modal para agrandar fotos
  var modalFoto = document.getElementById('modal-foto');
  var modalImg = document.getElementById('modal-foto-img');
  var cerrarModal = document.getElementById('cerrar-modal');

  // Seleccionamos todas las imágenes dentro del panel de fotos
  var fotosClickeables = document.querySelectorAll('.panel-fotos img');

  fotosClickeables.forEach(function(foto){
    foto.addEventListener('click', function(){
      modalImg.src = this.src; // usa la misma imagen en la que se hizo clic
      modalFoto.classList.add('abierto');
    });
  });

  cerrarModal.addEventListener('click', function(){
    modalFoto.classList.remove('abierto');
  });

  // También cerrar el modal si se hace clic fuera de la imagen (en el fondo oscuro)
  modalFoto.addEventListener('click', function(e){
    if (e.target === modalFoto) {
      modalFoto.classList.remove('abierto');
    }
  });
  }
function onMouseMove(event){
  // Normalizamos la posición del mouse entre -1 y 1
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  if (ubicacionAbierta) return;
  var panelIglesia = document.getElementById('panel-iglesia');
  var panelCalaCala = document.getElementById('panel-calacala');

  if (mouseX < -0.15) {
    panelIglesia.classList.add('visible');
    panelCalaCala.classList.remove('visible');
  } else if (mouseX > 0.15) {
    panelCalaCala.classList.add('visible');
    panelIglesia.classList.remove('visible');
  } else {
    // Zona "neutral" en el centro, sin panel visible
    panelIglesia.classList.remove('visible');
    panelCalaCala.classList.remove('visible');
  }
}
function onModelClick(event){
  if (ubicacionAbierta) return; 
  mouseClick.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseClick.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouseClick, camera);

  if (model) {
    var intersects = raycaster.intersectObject(model, true);

    if (intersects.length > 0) {
      console.log('¡Clic en el modelo! Navegando al interior...');
      window.location.href = 'interior.html';
    }
  }
}

function loadModel(){
  var loader = new THREE.GLTFLoader();

  loader.load(
    'objetos/igleORI.glb', // 👈 verificá que esta ruta sea exacta
    function(gltf){
      model = gltf.scene;
      scene.add(model);
      model.scale.set(7,7,7);
      model.position.set(-1,-2,-2);
      console.log('Modelo cargado con éxito');
      ocultarLoading();

      // Ver tamaño y posición del modelo (para saber si la cámara lo está viendo)
      var box = new THREE.Box3().setFromObject(model);
      var size = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());
      console.log('Tamaño del modelo:', size);
      console.log('Centro del modelo:', center);
    },
    function(xhr){
      var porcentaje = (xhr.loaded / xhr.total * 100).toFixed(0);
      console.log('Cargando: ' + porcentaje + '%');
      actualizarProgreso(porcentaje);
    },
    function(error){
      console.error('Error al cargar el modelo:', error);
      mostrarErrorCarga();
    }
  );
}

function ocultarTodosLosPaneles(){
  document.getElementById('panel-iglesia').classList.remove('visible');
  document.getElementById('panel-calacala').classList.remove('visible');
  document.getElementById('panel-ubicacion').classList.remove('visible');
  document.getElementById('panel-galeria').classList.remove('visible');
}


function animate(){
  requestAnimationFrame(animate);
    if (model) {
    var targetRotation = mouseX * Math.PI * 0.5; // hasta 90° hacia cada lado
    model.rotation.y += (targetRotation - model.rotation.y) * 0.05; // suavizado
  }
  renderer.render(scene, camera);

}

init();
