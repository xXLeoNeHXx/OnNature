// -----------------------------
// Scroll suave para links do menu e CTA
// -----------------------------
document.querySelectorAll('.nav-links a, .cta-btn').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// -----------------------------
// Botão "Voltar ao topo" após ultrapassar o slider
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  const btnTopo = document.getElementById("btn-topo");
  const heroSection = document.querySelector(".hero"); // seção das imagens

  if (btnTopo && heroSection) {
    btnTopo.style.display = "none";           // inicia escondido
    btnTopo.style.borderRadius = "50%";       // redondo
    btnTopo.style.width = "50px";             // tamanho
    btnTopo.style.height = "50px";
    btnTopo.style.fontSize = "1.5rem";        // seta
    btnTopo.style.padding = "0";              // remove padding extra

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

      btnTopo.style.display = (scrollY > heroBottom) ? "block" : "none";
    });

    btnTopo.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// -----------------------------
// Cabeçalho que some ao rolar
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY === 0) {
      header.classList.remove('header-hidden');
    } else {
      header.classList.add('header-hidden');
    }
  });
});

// -----------------------------
// Slider Hero com fade
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".hero-img");
  const prevBtn = document.querySelector(".hero-nav.prev");
  const nextBtn = document.querySelector(".hero-nav.next");
  let current = 0;
  let delay = 5000; // primeira imagem 5s
  let interval;

  function showImage(index) {
    images.forEach((img, i) => {
      img.classList.toggle("active", i === index);
    });
  }

  function nextImage() {
    current = (current + 1) % images.length;
    showImage(current);
    clearInterval(interval);
    interval = setInterval(nextImage, 3000); // depois da primeira, 3s
  }

  function prevImage() {
    current = (current - 1 + images.length) % images.length;
    showImage(current);
    clearInterval(interval);
    interval = setInterval(nextImage, 3000);
  }

  nextBtn.addEventListener("click", nextImage);
  prevBtn.addEventListener("click", prevImage);

  showImage(current);
  interval = setInterval(nextImage, delay);
});

// -----------------------------
// Modal de sucesso para formulário
// -----------------------------
const modalSucesso = document.getElementById('modal-sucesso');
const btnFechar = document.getElementById('fechar-modal');
let timeoutId;

function abrirModal() {
  if(modalSucesso){
    modalSucesso.style.display = 'block';
    timeoutId = setTimeout(() => {
      modalSucesso.style.display = 'none';
    }, 3000);
  }
}

function fecharModal() {
  if(modalSucesso){
    modalSucesso.style.display = 'none';
    clearTimeout(timeoutId);
  }
}

if(btnFechar) btnFechar.addEventListener('click', fecharModal);

// -----------------------------
// Envio de formulário via EmailJS
// -----------------------------
const form = document.querySelector('.form-orcamento');
if(form){
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    emailjs.sendForm('SEU_SERVICE_ID', 'SEU_TEMPLATE_ID', this)
      .then(() => {
        abrirModal();
        form.reset();
      }, (error) => {
        alert('Erro ao enviar a mensagem, tente novamente.');
        console.error('Erro EmailJS:', error);
      });
  });
}
