// galeria.js - Maneja los mini-visores 3D de la galería de santos

var visores = []; // guardamos cada mini-escena acá

function crearVisorSanto(canvasId, modeloUrl){
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;

  var ancho = canvas.clientWidth;
  var alto = canvas.clientHeight;

  var escena = new THREE.Scene();
  escena.background = new THREE.Color(0x111111);

  var camara = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 100);
  camara.position.set(0, 1, 4);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(ancho, alto);

  var luzAmbiental = new THREE.AmbientLight(0xffffff, 1);
  escena.add(luzAmbiental);

  var luzDireccional = new THREE.DirectionalLight(0xffffff, 1);
  luzDireccional.position.set(3, 5, 3);
  escena.add(luzDireccional);

  var modeloActual = null;

  var loader = new THREE.GLTFLoader();
  loader.load(modeloUrl, function(gltf){
      console.log('Santo cargado con éxito:', modeloUrl);
    modeloActual = gltf.scene;

    // Centramos y escalamos automáticamente para que quepa bien en el mini-visor
    var box = new THREE.Box3().setFromObject(modeloActual);
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());

    var maxDim = Math.max(size.x, size.y, size.z);
    var escala = 2 / maxDim; // ajustá el "2" si querés que se vea más grande/chico
    modeloActual.scale.set(escala, escala, escala);

    modeloActual.position.set(
      -center.x * escala,
      -center.y * escala + 1,
      -center.z * escala
    );

    escena.add(modeloActual);
  },
    function(xhr){
    console.log('Cargando ' + modeloUrl + ': ' + (xhr.loaded / xhr.total * 100).toFixed(0) + '%'); // 👈 agregar
  },
  function(error){
    console.error('Error al cargar ' + modeloUrl + ':', error); // 👈 agregar - esto es clave
  }

);

  // Guardamos esta mini-escena en la lista general
  visores.push({
    escena: escena,
    camara: camara,
    renderer: renderer,
    getModelo: function(){ return modeloActual; }
  });
}

// Loop de animación compartido para todos los mini-visores
function animarGaleria(){
  requestAnimationFrame(animarGaleria);

  visores.forEach(function(v){
    var modelo = v.getModelo();
    if (modelo) {
      modelo.rotation.y += 0.008; // rotación lenta y constante
    }
    v.renderer.render(v.escena, v.camara);
  });
}

animarGaleria();