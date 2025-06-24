// Scroll suave para navegação dos links do menu
document.querySelectorAll('.nav-links a, .cta-btn').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btnTopo = document.getElementById("btn-topo");
  const secaoOrcamento = document.getElementById("orcamento");

  if (btnTopo && secaoOrcamento) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const secaoFim = secaoOrcamento.offsetTop + secaoOrcamento.offsetHeight;

      // Verifica se o scroll passou o final da seção "orcamento"
      if (scrollY + windowHeight >= secaoFim + 50) {
        btnTopo.style.display = "block";
      } else {
        btnTopo.style.display = "none";
      }
    });

    btnTopo.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    if (scrollY === 0) {
      // Está no topo → mostra o cabeçalho
      header.classList.remove('header-hidden');
    } else {
      // Qualquer rolagem → esconde o cabeçalho
      header.classList.add('header-hidden');
    }
  });
});

const modal = document.getElementById('modal-sucesso');
const btnFechar = document.getElementById('fechar-modal');
let timeoutId;

function abrirModal() {
  modal.style.display = 'block';

  // Fecha automaticamente após 3 segundos
  timeoutId = setTimeout(() => {
    modal.style.display = 'none';
  }, 3000);
}

function fecharModal() {
  modal.style.display = 'none';
  clearTimeout(timeoutId);
}

btnFechar.addEventListener('click', fecharModal);

// No seu evento de sucesso do EmailJS, chame abrirModal()
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

// topo.js
document.addEventListener('DOMContentLoaded', () => {
const btnTopo = document.getElementById("btnTopo");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY || window.pageYOffset;
  const alturaTotal = document.documentElement.scrollHeight;
  const alturaJanela = window.innerHeight;

  if (scrollY + alturaJanela >= alturaTotal * 0.8) {
    btnTopo.classList.add("show");
  } else {
    btnTopo.classList.remove("show");
  }
});


  btnTopo.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
  });

  document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".hero-img");
    const prevBtn = document.querySelector(".hero-nav.prev");
    const nextBtn = document.querySelector(".hero-nav.next");
    let current = 0;

    function showImage(index) {
      images.forEach((img, i) => {
        img.classList.toggle("active", i === index);
      });
    }

    prevBtn.addEventListener("click", () => {
      current = (current - 1 + images.length) % images.length;
      showImage(current);
    });

    nextBtn.addEventListener("click", () => {
      current = (current + 1) % images.length;
      showImage(current);
    });

    // Inicial
    showImage(current);
  });

  function startAutoSlide() {
  interval = setInterval(nextImage, 5000); // 3000 ms = 3 segundos
}
