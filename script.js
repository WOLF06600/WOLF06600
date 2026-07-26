// ===================== PAGES (ثابت) =====================
const pages = [
  {
    text: "بزن برگه بعدی💕🫠",
    lang: 'fa',
    fontSize: 22,
    image: { src: "IMG_20260604_192823_086.jpg", width: 55, x: 50, y: 55 }
  },
  {
    text: "سلام تولدت مبارک🫠💕\n\nخیلی شرمنده‌ام که نتوانستم هدیه‌ای در خورِ تو بخرم، اما بدان که تمام آرزوهای قشنگم را در یک کلام برایت هدیه می‌کنم.
آرزو می‌کنم همیشه سرشار از سلامتی باشی، لبخندت هرگز از لبت نرود و خدا را شکر که تویی تا کنار هم بمانیم و عاشق‌ترین روزهای عمرمان را بسازیم.
دوستت دارم بیش از آنچه که کلمات توان بیانش را داشته باشند... به اندازه تمام دنیا و حتی فراتر از آن:kiss:♥️",
    lang: 'fa',
    fontSize: 19,
    image: { src: "IMG_20260620_015105_532.jpg", width: 45, x: 50, y: 80 }
  }
];

let currentIndex = 0;

// ===================== DOM =====================
const pagesWrap = document.getElementById('pagesWrap');
const pageIndicator = document.getElementById('pageIndicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// ===================== RENDER BOOK =====================
function renderBook(){
  pagesWrap.innerHTML = '';
  pages.forEach((p, i) => {
    const pageEl = document.createElement('div');
    pageEl.className = 'page' + (i === 0 ? ' cover-page' : '');
    pageEl.style.zIndex = pages.length - i;
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
        <div class="cover-unicorn">🦄   </div>
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

    const numEl = document.createElement('div');
    numEl.className = 'page-number';
    numEl.textContent = `${i+1} / ${pages.length}`;
    pageEl.appendChild(numEl);

    pagesWrap.appendChild(pageEl);
  });
  applyTurnState();
  updateIndicator();
}

function applyTurnState(){
  const pageEls = pagesWrap.querySelectorAll('.page');
  pageEls.forEach((el, i) => {
    el.classList.add('flipping');
    if(i < currentIndex){ el.classList.add('turned'); }
    else{ el.classList.remove('turned'); }
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

// ===================== START =====================
renderBook();
