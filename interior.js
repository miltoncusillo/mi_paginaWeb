var scene, camera, renderer, model;
var keys = {}; // 👈 guarda qué teclas están presionadas

function init(){   
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10.5, 5); // 👈 altura tipo "ojos de una persona" (~1.6) y un poco alejado

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.outputEncoding = THREE.sRGBEncoding;

  // Luz ambiental de base, pareja para toda la escena
    var ambientLight = new THREE.AmbientLight(0xffffff, -0.9);
    scene.add(ambientLight);

    var hemiLight = new THREE.HemisphereLight(0xffffff, 0x666666, 3.5);
    scene.add(hemiLight);

  loadModel();

  // Detectar teclas presionadas
  document.addEventListener('keydown', function(e){ keys[e.key.toLowerCase()] = true; });
  document.addEventListener('keyup', function(e){ keys[e.key.toLowerCase()] = false; });

  window.addEventListener('resize', onWindowResize);

  document.getElementById('boton-volver').addEventListener('click', function(){
  window.location.href = 'index.html';
  });

  document.getElementById('boton-ver-mas').addEventListener('click', function(){
  window.location.href = 'index.html?abrir=galeria'; // podés agregar algo como '#galeria' si querés hacer scroll/abrir directo
  });

  animate();
}

function loadModel(){
  var loader = new THREE.GLTFLoader();

  loader.load(
    'objetos/igle2.glb', // 👈 completá con el nombre real
    function(gltf){
      model = gltf.scene;
      scene.add(model);
      console.log('Modelo del interior cargado con éxito');

      var box = new THREE.Box3().setFromObject(model);
      var size = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());
      console.log('Tamaño del modelo: x=' + size.x + ' y=' + size.y + ' z=' + size.z);
      console.log('Centro del modelo: x=' + center.x + ' y=' + center.y + ' z=' + center.z);
      model.traverse(function(child){
      console.log('Nombre:', child.name, '| Tipo:', child.type);
      });
    },
    function(xhr){
      console.log('Cargando: ' + (xhr.loaded / xhr.total * 100).toFixed(0) + '%');
    },
    function(error){
      console.error('Error al cargar el modelo:', error);
    }
  );
}
    var santosInfo = [
    { nombreObjeto: 'santo01', nombreMostrar: 'Santo Candelaria' }, // 👈 ajustá según los nombres reales
    { nombreObjeto: 'santo02', nombreMostrar: 'Tata san Antonio' },
    { nombreObjeto: 'santo03', nombreMostrar: 'Santo San Benito' }
     ];
    var santoActualCercano = null;

    var infoBiblia = {
      nombreObjeto: 'biblia', // 👈 completá con el nombre exacto de la consola
      nombreMostrar: 'La Biblia',
      historia: 'La Biblia es como una pequeña biblioteca que contiene muchos libros escritos por diferentes autores. La palabra «Biblia» viene de la palabra griega biblia, que significa «libros». Pasaron 1100 años para que todos estos libros fueran escritos; y muchos años más, para que la lista de libros que ahora conocemos como la Biblia se reuniera en un solo libro.'
    };

function revisarSantosCercanos(){
  if (!model) return;

  var distanciaMinima = 8.5; // 👈 ajustá según qué tan cerca debe estar la cámara para activar el panel
  var santoCercano = null;

  santosInfo.forEach(function(info){
    var objeto = model.getObjectByName(info.nombreObjeto);
    if (objeto) {
      var posicionMundo = new THREE.Vector3();
      objeto.getWorldPosition(posicionMundo);
      var distancia = camera.position.distanceTo(posicionMundo);

      if (distancia < distanciaMinima) {
        santoCercano = info;
      }
    }
  });

  var panel = document.getElementById('panel-santo-cercano');

  if (santoCercano) {
    if (santoActualCercano !== santoCercano.nombreMostrar) {
      document.getElementById('nombre-santo-cercano').textContent = santoCercano.nombreMostrar;
      santoActualCercano = santoCercano.nombreMostrar;
    }
    panel.classList.add('visible');
  } else {
    panel.classList.remove('visible');
    santoActualCercano = null;
  }
}

function revisarBibliaCercana(){
  if (!model) return;

  var distanciaMinima = 5; // ajustá según necesites
  var objeto = model.getObjectByName(infoBiblia.nombreObjeto);
  var panel = document.getElementById('panel-biblia-cercana');

  if (!objeto) return;

  var posicionMundo = new THREE.Vector3();
  objeto.getWorldPosition(posicionMundo);
  var distancia = camera.position.distanceTo(posicionMundo);

  if (distancia < distanciaMinima) {
    document.getElementById('nombre-biblia').textContent = infoBiblia.nombreMostrar;
    document.getElementById('historia-biblia').textContent = infoBiblia.historia;
    panel.classList.add('visible');
  } else {
    panel.classList.remove('visible');
  }
}


function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
///////////////////////////////////
// Definí estos límites según el tamaño real de tu interior (usá los valores de tamaño/centro del log)
var limites = {
  minX: -24, maxX: 24,
  minZ: -63, maxZ: 23
};

function updateMovement(){
  var moveSpeed = 0.2;
  var turnSpeed = 0.04;

  if (keys['a'] || keys['arrowleft'])  camera.rotation.y += turnSpeed;
  if (keys['d'] || keys['arrowright']) camera.rotation.y -= turnSpeed;

  // Guardamos la posición actual antes de mover
  var prevX = camera.position.x;
  var prevZ = camera.position.z;

  if (keys['w'] || keys['arrowup'])   camera.translateZ(-moveSpeed);
  if (keys['s'] || keys['arrowdown']) camera.translateZ(moveSpeed);

  // Si se salió de los límites, revertimos la posición
  if (camera.position.x < limites.minX || camera.position.x > limites.maxX ||
      camera.position.z < limites.minZ || camera.position.z > limites.maxZ) {
    camera.position.x = prevX;
    camera.position.z = prevZ;
  }
}

function animate(){
  requestAnimationFrame(animate);
  updateMovement();
  revisarSantosCercanos();
  revisarBibliaCercana();
  renderer.render(scene, camera);
}



init();