// === Registrando o Service Worker ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let reg = await navigator.serviceWorker.register('/sw.js', { type: 'module' });
      console.log('✅ Service Worker registrado com sucesso!', reg);
    } catch (err) {
      console.log('❌ Falha ao registrar o Service Worker:', err);
    }
  });
}

// === Variáveis e configurações iniciais ===
let facingMode = 'user'; // "user" = frontal | "environment" = traseira
const constraints = { video: { facingMode }, audio: false };
let photos = []; // armazenar as últimas 3 fotos

// === Capturando elementos ===
const cameraView = document.querySelector('#camera--view');
const cameraOutput = document.querySelector('#camera--output');
const cameraSensor = document.querySelector('#camera--sensor');
const cameraTrigger = document.querySelector('#camera--trigger');
const switchBtn = document.querySelector('#camera--switch');
const gallery = document.querySelector('#gallery');

// === Função que inicializa a câmera ===
function cameraStart() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode }, audio: false })
    .then(function (stream) {
      cameraView.srcObject = stream;
    })
    .catch(function (error) {
      console.error('Ocorreu um erro ao acessar a câmera:', error);
    });
}

// === Função para tirar foto ===
cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;

  cameraSensor
    .getContext('2d')
    .drawImage(cameraView, 0, 0, cameraSensor.width, cameraSensor.height);

  const imgData = cameraSensor.toDataURL('image/webp');
  cameraOutput.src = imgData;
  cameraOutput.classList.add('taken');

  // Armazena a foto no array (máximo 3)
  photos.unshift(imgData);
  if (photos.length > 3) photos.pop();

  mostrarGaleria();
};

// === Mostrar as 3 últimas fotos ===
function mostrarGaleria() {
  gallery.innerHTML = '';
  photos.forEach((foto) => {
    const img = document.createElement('img');
    img.src = foto;
    img.classList.add('mini');
    gallery.appendChild(img);
  });
}

// === Alternar entre câmeras ===
switchBtn.onclick = () => {
  facingMode = facingMode === 'user' ? 'environment' : 'user';
  cameraStart();
};

// === Inicia a câmera quando a página é carregada ===
window.addEventListener('load', cameraStart, false);