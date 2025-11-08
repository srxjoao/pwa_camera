// ================================
// 📦 IndexedDB: salvar fotos localmente
// ================================
const DB_NAME = "diario_fotografico";
const DB_VERSION = 1;
const STORE_NAME = "entries";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

async function saveEntry(entry) {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(entry);
  return tx.complete;
}

async function getAllEntries() {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ================================
// 📸 Captura de foto com câmera
// ================================
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureButton = document.getElementById("captureButton");
const saveButton = document.getElementById("savePhotoButton");
const cancelButton = document.getElementById("cancelButton");
const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");
const descriptionInput = document.getElementById("descriptionInput");

let currentBlob = null;

// Ativar câmera
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

// Capturar imagem do vídeo
captureButton.addEventListener("click", () => {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    currentBlob = blob;
    previewImage.src = URL.createObjectURL(blob);
    previewContainer.classList.remove("hidden");
  }, "image/jpeg");
});

// Salvar foto com descrição
saveButton.addEventListener("click", async () => {
  const description = descriptionInput.value.trim() || "Sem descrição";
  if (!currentBlob) return alert("Tire uma foto primeiro!");

  const entry = {
    id: Date.now(),
    photoBlob: currentBlob,
    description,
    date: new Date().toISOString(),
  };

  await saveEntry(entry);

  alert("📸 Foto salva com sucesso!");
  descriptionInput.value = "";
  previewContainer.classList.add("hidden");
  currentBlob = null;
  renderGallery();
});

// Cancelar preview
cancelButton.addEventListener("click", () => {
  previewContainer.classList.add("hidden");
  descriptionInput.value = "";
  currentBlob = null;
});

// ================================
// 🖼️ Galeria de fotos
// ================================
async function renderGallery() {
  const entries = await getAllEntries();
  const galleryContainer = document.getElementById("gallery");
  galleryContainer.innerHTML = "";

  entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  entries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(entry.photoBlob);

    const desc = document.createElement("p");
    desc.textContent = entry.description;

    const date = document.createElement("small");
    date.textContent = new Date(entry.date).toLocaleString("pt-BR");

    card.append(img, desc, date);
    galleryContainer.appendChild(card);
  });
}

// ================================
// 🔁 Navegação entre seções
// ================================
const cameraSection = document.getElementById("cameraSection");
const gallerySection = document.getElementById("gallerySection");

document.getElementById("btnCamera").addEventListener("click", () => {
  cameraSection.classList.remove("hidden");
  gallerySection.classList.add("hidden");
  startCamera();
});

document.getElementById("btnGallery").addEventListener("click", async () => {
  cameraSection.classList.add("hidden");
  gallerySection.classList.remove("hidden");
  renderGallery();
});

document.getElementById("backToCamera").addEventListener("click", () => {
  gallerySection.classList.add("hidden");
  cameraSection.classList.remove("hidden");
  startCamera();
});

// Iniciar câmera ao carregar
startCamera();
