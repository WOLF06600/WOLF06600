// ===================== CONFIG =====================
const SETTINGS_PASSWORD = "5555011389";
const STORAGE_KEY = "girlyDiaryData_v2";

// ===================== STATE =====================
/*
page = {
  text: string,
  lang: 'fa' | 'en',
  fontSize: number,
  image: { src, width, x, y } | null,
  audio: { src } | null
}
*/
let pages = [];
let currentIndex = 0;
let editingIndex = 0;

// ===================== DOM =====================
const pagesWrap   = document.getElementById('pagesWrap');
const pageIndicator = document.getElementById('pageIndicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const gearBtn = document.getElementById('gearBtn');
const lockOverlay = document.getElementById('lockOverlay');
const passInput = document.getElementById('passInput');
const passSubmit = document.getElementById('passSubmit');
const passCancel = document.getElementById('passCancel');
const lockError = document.getElementById('lockError');

const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettings = document.getElementById('closeSettings');
const pageSelect = document.getElementById('pageSelect');
const addPageBtn = document.getElementById('addPageBtn');
const removePageBtn = document.getElementById('removePageBtn');
const langBtns = document.querySelectorAll('.lang-btn');
const pageText = document.getElementById('pageText');
const fontSize = document.getElementById('fontSize');
const fontSizeVal = document.getElementById('fontSizeVal');

const audioInput = document.getElementById('audioInput');
const audioStatus = document.getElementById('audioStatus');
const audioPreviewPlayer = document.getElementById('audioPreviewPlayer');
const removeAudioBtn = document.getElementById('removeAudioBtn');

const imageInput = document.getElementById('imageInput');
const removeImageBtn = document.getElementById('removeImageBtn');
const imgWidth = document.getElementById('imgWidth');
const imgX = document.getElementById('imgX');
const imgY = document.getElementById('imgY');
const imgWidthVal = document.getElementById('imgWidthVal');
const imgXVal = document.getElementById('imgXVal');
const imgYVal = document.getElementById('imgYVal');
const saveBtn = document.getElementById('saveBtn');

const miniPage = document.getElementById('miniPage');
const miniText = document.getElementById('miniText');

let editingLang = 'fa';
let editingFontSize = 18;
let editingImage = null;
let editingAudio = null;

// ===================== INIT / PERSISTENCE =====================
function loadData(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{ pages = JSON.parse(raw); }catch(e){ pages = []; }
  }
  if(!pages || pages.length === 0){
    pages = [{
      text: "دفتر خاطرات کوچولوی من 🦄💕\n\nهر چی تو دلمه رو اینجا می‌نویسم...",
      lang: 'fa',
      fontSize: 20,
      image: null,
      audio: null
    }];
  }
}


function saveData(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    return true;
  }catch(e){
    alert('فایل صوتی یا تصویری خیلی حجیمه و جا نشد! 😔 لطفاً یه فایل کوچیک‌تر انتخاب کن.');
    return false;
  }
}

// ===================== RENDER BOOK =====================
function renderBook(){
  pagesWrap.innerHTML = '';
  pages.forEach((p, i) => {
    const pageEl = document.createElement('div');
    pageEl.className = 'page' + (i === 0 ? ' cover-page' : '');
    // توجه: z-index دیگه اینجا ست نمی‌شه، چون applyTurnState() که پایین‌تر
    // صدا زده می‌شه به‌صورت داینامیک و درست z-index رو محاسبه می‌کنه.
    pageEl.dataset.index = i;

    const washi = document.createElement('div');
    washi.className = 'washi';
    pageEl.appendChild(washi);

    if(i === 0){
      const decor = document.createElement('div');
      decor.className = 'cover-decor';
      decor.innerHTML = `
        <span class="cover-hearts h1">💗</span>
        <span class="cover-hearts h2">💕</span>
        <span class="cover-hearts h3">💖</span>
        <div class="cover-unicorn">🦄گوگوگلی❤️</div>
        <div class="cover-clouds">☁️ ☁️ ☁️</div>
      `;
      pageEl.appendChild(decor);
    }

    const textEl = document.createElement('div');
    textEl.className = `page-text lang-${p.lang}`;
    textEl.style.fontSize = (p.fontSize || 18) + 'px';
    textEl.textContent = p.text || '';
    pageEl.appendChild(textEl);

    if(p.image){
      const imgEl = document.createElement('img');
      imgEl.className = 'page-image';
      imgEl.src = p.image.src;
      imgEl.style.width = p.image.width + '%';
      imgEl.style.left = p.image.x + '%';
      imgEl.style.top = p.image.y + '%';
      pageEl.appendChild(imgEl);
    }

    if(p.audio){
      const audioEl = document.createElement('audio');
      audioEl.controls = true;
      audioEl.src = p.audio.src;
      pageEl.appendChild(audioEl);
    }

    const numEl = document.createElement('div');
    numEl.className = 'page-number';
    numEl.textContent = `${i+1} / ${pages.length}`;
    pageEl.appendChild(numEl);

    pagesWrap.appendChild(pageEl);
  });
  applyTurnState();
  updateIndicator();
  refreshPageSelect();
}




// ===================== TURN STATE (FIXED) =====================
// نکته‌ی مهم رفع‌شده:
// وقتی یه المان z-index عددی صریح داره، مرورگر پینت رو بر اساس همون
// z-index انجام می‌ده، نه بر اساس عمق واقعی‌ش توی preserve-3d.
// قبلاً z-index فقط یه بار توی renderBook ست می‌شد و هیچ‌وقت آپدیت
// نمی‌شد، پس صفحه‌ی جلد/قبلی همیشه z-index بالاتری داشت و حتی بعد از
// چرخیدن (rotateY) روی صفحه‌ی جدید می‌موند. حالا هر بار ورق می‌خوره،
// z-index دوباره محاسبه می‌شه: صفحات ورق‌خورده می‌رن ته پشته.
function applyTurnState(){
  const pageEls = pagesWrap.querySelectorAll('.page');
  const total = pages.length;
  pageEls.forEach((el, i) => {
    el.classList.add('flipping');
    if(i < currentIndex){
      // ورق خورده -> باید بره پشت (z-index پایین)
      el.classList.add('turned');
      el.style.zIndex = i + 1;
    } else {
      // هنوز ورق نخورده -> هرچی به جلو نزدیک‌تر (i کوچیک‌تر) بالاتر بمونه
      el.classList.remove('turned');
      el.style.zIndex = (total - i) + total;
    }
    setTimeout(() => el.classList.remove('flipping'), 1100);
  });
}

function updateIndicator(){
  pageIndicator.textContent = `صفحه ${currentIndex+1} از ${pages.length}`;
}

function goNext(){
  if(currentIndex < pages.length - 1){
    currentIndex++;
    applyTurnState();
    updateIndicator();
  }
}
function goPrev(){
  if(currentIndex > 0){
    currentIndex--;
    applyTurnState();
    updateIndicator();
  }
}

function goNext(){
  if(currentIndex < pages.length - 1){
    currentIndex++;
    applyTurnState();
    updateIndicator();
  }
}
function goPrev(){
  if(currentIndex > 0){
    currentIndex--;
    applyTurnState();
    updateIndicator();
  }
}

nextBtn.addEventListener('click', goNext);
prevBtn.addEventListener('click', goPrev);

// swipe support
let touchStartX = null;
pagesWrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
pagesWrap.addEventListener('touchend', e => {
  if(touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if(Math.abs(dx) > 40){
    if(dx < 0) goNext(); else goPrev();
  }
  touchStartX = null;
});

// ===================== LOCK / GEAR =====================
gearBtn.addEventListener('click', () => {
  passInput.value = '';
  lockError.classList.remove('show');
  lockOverlay.classList.remove('hidden');
  setTimeout(() => passInput.focus(), 100);
});

passCancel.addEventListener('click', () => lockOverlay.classList.add('hidden'));

function checkPassword(){
  if(passInput.value.trim() === SETTINGS_PASSWORD){
    lockOverlay.classList.add('hidden');
    openSettings();
  } else {
    lockError.classList.add('show');
    passInput.value = '';
    passInput.focus();
  }
}
passSubmit.addEventListener('click', checkPassword);
passInput.addEventListener('keydown', e => { if(e.key === 'Enter') checkPassword(); });

// ===================== SETTINGS PANEL =====================
function refreshPageSelect(){
  pageSelect.innerHTML = '';
  pages.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i === 0 ? 'برگه ۱ (جلد)' : `برگه ${i+1}`;
    pageSelect.appendChild(opt);
  });
  pageSelect.value = editingIndex;
}

function openSettings(){
  editingIndex = currentIndex;
  loadEditingPage(editingIndex);
  settingsOverlay.classList.remove('hidden');
}

closeSettings.addEventListener('click', () => settingsOverlay.classList.add('hidden'));

pageSelect.addEventListener('change', () => {
  editingIndex = parseInt(pageSelect.value, 10);
  loadEditingPage(editingIndex);
});

function loadEditingPage(i){
  const p = pages[i];
  if(!p) return;
  editingLang = p.lang || 'fa';
  editingFontSize = p.fontSize || 18;
  editingImage = p.image ? {...p.image} : null;
  editingAudio = p.audio ? {...p.audio} : null;

  pageText.value = p.text || '';
  setLangButtons(editingLang);
  fontSize.value = editingFontSize;
  fontSizeVal.textContent = editingFontSize;

  if(editingImage){
    imgWidth.value = editingImage.width;
    imgX.value = editingImage.x;
    imgY.value = editingImage.y;
  } else {
    imgWidth.value = 40; imgX.value = 50; imgY.value = 50;
  }
  updateRangeLabels();
  updateAudioStatusUI();
  updateMiniPreview();
}

function setLangButtons(lang){
  langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
}

langBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    editingLang = btn.dataset.lang;
    setLangButtons(editingLang);
    updateMiniPreview();
  });
});

pageText.addEventListener('input', updateMiniPreview);

fontSize.addEventListener('input', () => {
  fontSizeVal.textContent = fontSize.value;
  updateMiniPreview();
});

function updateRangeLabels(){
  imgWidthVal.textContent = imgWidth.value + '%';
  imgXVal.textContent = imgX.value + '%';
  imgYVal.textContent = imgY.value + '%';
}
[imgWidth, imgX, imgY].forEach(r => r.addEventListener('input', () => {
  updateRangeLabels();
  updateMiniPreview();
}));

// ---- image upload ----
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    editingImage = {
      src: e.target.result,
      width: parseInt(imgWidth.value, 10),
      x: parseInt(imgX.value, 10),
      y: parseInt(imgY.value, 10)
    };
    updateMiniPreview();
  };
  reader.readAsDataURL(file);
});
removeImageBtn.addEventListener('click', () => {
  editingImage = null;
  imageInput.value = '';
  updateMiniPreview();
});

// ---- audio upload ----
audioInput.addEventListener('change', () => {
  const file = audioInput.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    editingAudio = { src: e.target.result, name: file.name };
    updateAudioStatusUI();
    updateMiniPreview();
  };
  reader.readAsDataURL(file);
});
removeAudioBtn.addEventListener('click', () => {
  editingAudio = null;
  audioInput.value = '';
  updateAudioStatusUI();
  updateMiniPreview();
});

function updateAudioStatusUI(){
  if(editingAudio && editingAudio.src){
    audioStatus.textContent = '🎧 یک صدا برای این برگه ذخیره شده — می‌تونی پایین گوش کنی';
    audioPreviewPlayer.src = editingAudio.src;
    audioPreviewPlayer.style.display = 'block';
  } else {
    audioStatus.textContent = 'صدایی انتخاب نشده';
    audioPreviewPlayer.style.display = 'none';
    audioPreviewPlayer.removeAttribute('src');
  }
}

// ---- mini live preview (click/drag to position image) ----
function updateMiniPreview(){
  miniPage.querySelectorAll('.mini-image, .mini-audio-badge').forEach(el => el.remove());

  miniText.className = `mini-text lang-${editingLang}`;
  miniText.style.fontSize = Math.max(10, Math.round(editingFontSize * 0.6)) + 'px';
  miniText.textContent = pageText.value;

  if(editingImage){
    const img = document.createElement('img');
    img.className = 'mini-image';
    img.src = editingImage.src;
    img.style.width = editingImage.width + '%';
    img.style.left = editingImage.x + '%';
    img.style.top = editingImage.y + '%';
    miniPage.appendChild(img);
  }
  if(editingAudio){
    const badge = document.createElement('div');
    badge.className = 'mini-audio-badge';
    badge.textContent = '🎵';
    miniPage.appendChild(badge);
  }
}

function setImagePosFromEvent(clientX, clientY){
  const rect = miniPage.getBoundingClientRect();
  let x = ((clientX - rect.left) / rect.width) * 100;
  let y = ((clientY - rect.top) / rect.height) * 100;
  x = Math.min(100, Math.max(0, Math.round(x)));
  y = Math.min(100, Math.max(0, Math.round(y)));
  imgX.value = x; imgY.value = y;
  if(editingImage){ editingImage.x = x; editingImage.y = y; }
  updateRangeLabels();
  updateMiniPreview();
}

miniPage.addEventListener('click', (e) => {
  if(!editingImage) return;
  setImagePosFromEvent(e.clientX, e.clientY);
});

let dragging = false;
miniPage.addEventListener('mousedown', e => { if(editingImage) dragging = true; });
window.addEventListener('mousemove', e => { if(dragging) setImagePosFromEvent(e.clientX, e.clientY); });
window.addEventListener('mouseup', () => dragging = false);

miniPage.addEventListener('touchstart', e => { if(editingImage) dragging = true; });
miniPage.addEventListener('touchmove', e => {
  if(dragging && e.touches[0]){ setImagePosFromEvent(e.touches[0].clientX, e.touches[0].clientY); }
});
window.addEventListener('touchend', () => dragging = false);

// ---- add / remove page ----
addPageBtn.addEventListener('click', () => {
  pages.push({ text: '', lang: 'fa', fontSize: 18, image: null, audio: null });
  editingIndex = pages.length - 1;
  if(!saveData()) { pages.pop(); return; }
  renderBook();
  currentIndex = editingIndex;
  applyTurnState();
  updateIndicator();
  loadEditingPage(editingIndex);
});

removePageBtn.addEventListener('click', () => {
  if(pages.length <= 1){
    alert('حداقل باید یه برگه تو دفتر بمونه 🌷');
    return;
  }
  pages.splice(editingIndex, 1);
  editingIndex = Math.max(0, editingIndex - 1);
  if(currentIndex >= pages.length) currentIndex = pages.length - 1;
  saveData();
  renderBook();
  applyTurnState();
  updateIndicator();
  loadEditingPage(editingIndex);
});

// ---- save current editing page ----
saveBtn.addEventListener('click', () => {
  if(editingIndex == null || !pages[editingIndex]) return;

  const backup = pages[editingIndex];
  pages[editingIndex] = {
    text: pageText.value,
    lang: editingLang,
    fontSize: parseInt(fontSize.value, 10),
    image: editingImage ? {
      src: editingImage.src,
      width: parseInt(imgWidth.value, 10),
      x: parseInt(imgX.value, 10),
      y: parseInt(imgY.value, 10)
    } : null,
    audio: editingAudio ? { src: editingAudio.src } : null
  };

  if(!saveData()){
    pages[editingIndex] = backup; // revert if storage failed
    return;
  }

  renderBook();
  currentIndex = editingIndex;
  applyTurnState();
  updateIndicator();
  saveBtn.textContent = '✓ ذخیره شد!';
  setTimeout(() => saveBtn.textContent = '💾 ذخیره این صفحه', 1200);
});

// close overlays by clicking backdrop
[lockOverlay, settingsOverlay].forEach(ov => {
  ov.addEventListener('click', e => {
    if(e.target === ov) ov.classList.add('hidden');
  });
});

// ===================== START =====================
loadData();
renderBook();