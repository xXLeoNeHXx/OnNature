(() => {
  "use strict";

  const REPOSITORY = "xXLeoNeHXx/OnNature";
  const BRANCH = "site-novo-blog-teste";
  const CONTENTS_API = "https://api.github.com/repos/" + REPOSITORY +
    "/contents/content/blog?ref=" + encodeURIComponent(BRANCH);

  const page = document.querySelector(".blog-page");
  const grid = document.querySelector(".blog-grid-modern");
  if (!page || !grid) return;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function parseFrontMatter(markdown, filename) {
    const match = String(markdown).match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
    if (!match) return null;

    let fields = {};
    if (window.jsyaml && typeof window.jsyaml.load === "function") {
      try {
        fields = window.jsyaml.load(match[1]) || {};
      } catch (error) {
        console.error("Não foi possível interpretar os metadados do artigo:", filename, error);
        return null;
      }
    } else {
      match[1].split(/\r?\n/).forEach(line => {
        const field = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
        if (!field) return;
        let value = field[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        fields[field[1]] = value;
      });
    }

    const rawDate = fields.date;
    const date = rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : String(rawDate ?? "").slice(0, 10);

    return {
      slug: filename.replace(/\.md$/i, ""),
      title: String(fields.title ?? "").trim(),
      description: String(fields.description ?? "").trim(),
      image: String(fields.image ?? "").trim(),
      category: String(fields.category ?? "Outros").trim(),
      date,
      seoTitle: String(fields.seo_title ?? "").trim(),
      seoDescription: String(fields.seo_description ?? "").trim(),
      body: match[2] ?? ""
    };
  }

  function imageUrl(path, category) {
    const value = String(path ?? "").trim();
    if (value) {
      if (/^https?:\/\//i.test(value)) return value;
      const normalized = value.replace(/\\/g, "/");
      return new URL(normalized.startsWith("/") ? normalized : "/" + normalized, location.origin).href;
    }

    const key = String(category ?? "").toLocaleLowerCase("pt-BR");
    if (key.includes("resíduo")) {
      return "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80";
    }
    if (key.includes("sustentabilidade")) {
      return "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=900&q=80";
    }
    if (key.includes("educação")) {
      return "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80";
    }
    return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80";
  }

  function formatDate(value) {
    if (!value) return "";
    const parts = String(value).slice(0, 10).split("-");
    return parts.length === 3 ? parts.reverse().join("/") : String(value);
  }

  async function fetchPublishedArticles() {
    const response = await fetch(CONTENTS_API, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error("GitHub retornou " + response.status + " ao consultar os artigos.");
    }

    const files = await response.json();
    const markdownFiles = files.filter(file =>
      file.type === "file" && /\.md$/i.test(file.name) && file.download_url
    );

    const posts = await Promise.all(markdownFiles.map(async file => {
      try {
        const articleResponse = await fetch(file.download_url, { cache: "no-store" });
        if (!articleResponse.ok) return null;
        return parseFrontMatter(await articleResponse.text(), file.name);
      } catch (error) {
        console.warn("Não foi possível carregar o artigo:", file.name, error);
        return null;
      }
    }));

    return posts
      .filter(post => post && post.title)
      .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "pt-BR"));
  }

  function makeCard(post) {
    const card = document.createElement("article");
    const cover = imageUrl(post.image, post.category);
    card.className = "blog-card-modern blog-card-modern--cms";
    card.dataset.category = post.category;
    card.dataset.cmsSlug = post.slug;

    const link = document.createElement("a");
    link.href = "blog.html?artigo=" + encodeURIComponent(post.slug);
    link.setAttribute("aria-label", "Ler artigo: " + post.title);

    const image = document.createElement("img");
    image.src = cover;
    image.alt = post.title;
    image.loading = "lazy";
    image.onerror = () => {
      image.onerror = null;
      image.src = imageUrl("", post.category);
    };
    link.appendChild(image);

    const body = document.createElement("div");
    body.className = "blog-card-modern__body";
    body.innerHTML =
      '<span class="blog-category">' + esc(post.category) + '</span>' +
      '<h2>' + esc(post.title) + '</h2>' +
      '<p>' + esc(post.description) + '</p>' +
      '<small>' + esc(formatDate(post.date)) + '</small>' +
      '<span class="blog-card-link">Ler artigo →</span>';
    link.appendChild(body);
    card.appendChild(link);
    return card;
  }

  function applyFilters() {
    const buttons = Array.from(document.querySelectorAll(".blog-filter"));
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(item => item.classList.toggle("active", item === button));
        const filter = button.dataset.filter || "Todos";
        grid.querySelectorAll(".blog-card-modern").forEach(card => {
          card.hidden = filter !== "Todos" && card.dataset.category !== filter;
        });
      });
    });
  }

  function removeDuplicateTitle(markdown, title) {
    return String(markdown ?? "").replace(/^\s*#\s+([^\r\n]+)\s*\r?\n+/, (whole, heading) => {
      const normalize = value => String(value).trim().toLocaleLowerCase("pt-BR");
      return normalize(heading) === normalize(title) ? "" : whole;
    });
  }

  function renderMarkdown(markdown) {
    if (!window.marked || !window.DOMPurify) {
      throw new Error("As bibliotecas de formatação do artigo não foram carregadas.");
    }
    const source = window.marked.parse(markdown, { gfm: true, breaks: false });
    return window.DOMPurify.sanitize(source, { USE_PROFILES: { html: true } });
  }

  function addArticleStyles() {
    if (document.getElementById("cms-article-styles")) return;
    const style = document.createElement("style");
    style.id = "cms-article-styles";
    style.textContent = [
      ".cms-article{width:min(900px,100%);margin:0 auto;padding:3.5rem 1rem 4rem;color:var(--header,#303746)}",
      ".cms-article h1{font-size:clamp(2rem,4.2vw,3.1rem);line-height:1.14;margin:1.1rem 0 .8rem;color:var(--header)}",
      ".cms-article .cms-article-date{color:#777;margin:0 0 1.5rem}",
      ".cms-article .cms-article-cover{display:block;width:100%;max-height:520px;object-fit:cover;border-radius:18px;margin:1.5rem 0 2rem}",
      ".cms-article .cms-article-description{font-size:1.1rem;line-height:1.75;margin-bottom:2rem}",
      ".cms-article-body{font-size:1.03rem;line-height:1.85;overflow-wrap:anywhere}",
      ".cms-article-body p{margin:0 0 1.15rem}",
      ".cms-article-body h2,.cms-article-body h3{color:var(--header);line-height:1.25;margin:2.1rem 0 .8rem}",
      ".cms-article-body ul,.cms-article-body ol{padding-left:1.5rem;margin:0 0 1.3rem}",
      ".cms-article-body li{margin:.4rem 0}",
      ".cms-article-body img{display:block;max-width:100%;height:auto;margin:1.5rem auto;border-radius:12px}",
      ".cms-article-body blockquote{border-left:4px solid var(--header);padding:.2rem 1rem;margin:1.5rem 0;color:#555}",
      ".cms-article-body a{color:var(--header);text-decoration:underline}",
      "@media(max-width:768px){.cms-article{padding:2.5rem 1rem 3rem}.cms-article .cms-article-cover{max-height:320px}}"
    ].join("");
    document.head.appendChild(style);
  }

  async function renderArticle(post) {
    const response = await fetch(post.downloadUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Não foi possível abrir o arquivo do artigo.");
    const fullPost = parseFrontMatter(await response.text(), post.fileName);
    if (!fullPost) throw new Error("O conteúdo do artigo está em um formato inválido.");

    const cover = imageUrl(fullPost.image, fullPost.category);
    const article = document.createElement("article");
    article.className = "cms-article";
    article.innerHTML =
      '<a href="blog.html" class="blog-read-more">← Voltar ao blog</a>' +
      '<span class="blog-category">' + esc(fullPost.category) + '</span>' +
      '<h1>' + esc(fullPost.title) + '</h1>' +
      '<p class="cms-article-date">' + esc(formatDate(fullPost.date)) + '</p>';

    const image = document.createElement("img");
    image.className = "cms-article-cover";
    image.src = cover;
    image.alt = fullPost.title;
    image.onerror = () => {
      image.onerror = null;
      image.src = imageUrl("", fullPost.category);
    };
    article.appendChild(image);

    if (fullPost.description) {
      const description = document.createElement("p");
      description.className = "cms-article-description";
      description.textContent = fullPost.description;
      article.appendChild(description);
    }

    const body = document.createElement("div");
    body.className = "cms-article-body";
    body.innerHTML = renderMarkdown(removeDuplicateTitle(fullPost.body, fullPost.title));
    article.appendChild(body);

    page.replaceChildren(article);
    addArticleStyles();

    document.title = fullPost.seoTitle || (fullPost.title + " | On Nature");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = fullPost.seoDescription || fullPost.description;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = "https://www.onnature.com.br/blog.html?artigo=" + encodeURIComponent(fullPost.slug);
  }

  function renderFeatured(post) {
    const box = document.querySelector(".blog-featured");
    if (!box || !post) return;

    const picture = box.querySelector(".blog-featured__image");
    const content = box.querySelector(".blog-featured__content");
    const cover = imageUrl(post.image, post.category);

    if (picture) {
      picture.style.backgroundImage = "url(" + JSON.stringify(cover) + ")";
      picture.setAttribute("role", "img");
      picture.setAttribute("aria-label", post.title);
    }
    if (content) {
      content.innerHTML =
        '<span class="blog-category">' + esc(post.category) + '</span>' +
        '<h2>' + esc(post.title) + '</h2>' +
        '<p>' + esc(post.description) + '</p>' +
        '<a href="blog.html?artigo=' + encodeURIComponent(post.slug) + '" class="blog-read-more">Ler conteúdo →</a>';
    }
  }

  async function init() {
    const posts = await fetchPublishedArticles();
    const params = new URLSearchParams(location.search);
    const slug = params.get("artigo");

    if (slug) {
      const post = posts.find(item => item.slug === slug);
      if (!post) {
        page.innerHTML = '<section class="cms-article"><p>Este artigo não foi encontrado ou ainda não foi publicado.</p><a href="blog.html" class="blog-read-more">← Voltar ao blog</a></section>';
        return;
      }
      await renderArticle(post);
      return;
    }

    if (posts.length) {
      const featured = posts.find(item => item.slug === "licenciamento-ambiental-guia-empresa") || posts[0];
      renderFeatured(featured);

      const fragment = document.createDocumentFragment();
      posts.forEach(post => {
        if (!grid.querySelector('[data-cms-slug="' + CSS.escape(post.slug) + '"]')) {
          fragment.appendChild(makeCard(post));
        }
      });
      grid.insertBefore(fragment, grid.firstChild);
    }

    applyFilters();
  }

  init().catch(error => {
    console.error("Erro ao carregar o blog do CMS:", error);
    const notice = document.createElement("p");
    notice.className = "blog-cms-notice";
    notice.textContent = "Não foi possível atualizar os artigos agora. Os conteúdos já disponíveis continuam acessíveis.";
    const toolbar = document.querySelector(".blog-toolbar");
    if (toolbar && !document.querySelector(".blog-cms-notice")) toolbar.after(notice);
  });
})();