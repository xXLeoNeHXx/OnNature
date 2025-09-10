// -----------------------------
// Menu hamburguer mobile
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    toggle.classList.toggle('open');
  });
});

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
      // fecha o menu mobile após clicar
      const navLinks = document.getElementById('nav-links');
      const toggle = document.getElementById('menu-toggle');
      if(navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
      }
    }
  });
});

// -----------------------------
// Botão "Voltar ao topo"
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  const btnTopo = document.getElementById("btn-topo");
  const heroSection = document.querySelector(".hero");

  if (btnTopo && heroSection) {
    btnTopo.style.display = "none";
    btnTopo.style.borderRadius = "50%";
    btnTopo.style.width = "50px";
    btnTopo.style.height = "50px";
    btnTopo.style.fontSize = "1.5rem";
    btnTopo.style.padding = "0";

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
// Cabeçalho que desaparece ao rolar
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
  let delay = 5000;
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
    interval = setInterval(nextImage, 3000);
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
