/* PROBREFLIX — JavaScript puro. A API utilizada é a TMDB API v3. */
"use strict";

// 1. Configurações e referências aos elementos HTML.
const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const LANGUAGE = "pt-BR";

const elements = {
  formToken: document.querySelector("#formToken"),
  campoToken: document.querySelector("#campoToken"),
  formBusca: document.querySelector("#formBusca"),
  campoBusca: document.querySelector("#campoBusca"),
  filtroTipo: document.querySelector("#filtroTipo"),
  btnInicio: document.querySelector("#btnInicio"),
  navFavoritos: document.querySelector("#navFavoritos"),
  titulo: document.querySelector("#tituloCatalogo"),
  mensagem: document.querySelector("#mensagem"),
  indicador: document.querySelector("#indicador"),
  grade: document.querySelector("#gradeCatalogo"),
  modal: document.querySelector("#modalDetalhes"),
  modalTitulo: document.querySelector("#modalTitulo"),
  conteudoDetalhes: document.querySelector("#conteudoDetalhes")
};

// 2. Estado da aplicação: token, lista atual e favoritos.
let apiToken = localStorage.getItem("probreflix_tmdb_token") || "";
let itensAtuais = [];
let modoAtual = "trending";
let mostrandoFavoritos = false;
const favoritos = new Set(JSON.parse(localStorage.getItem("probreflix_favoritos") || "[]"));
const modalDetalhes = new bootstrap.Modal(elements.modal);

if (apiToken) elements.campoToken.value = apiToken;

// 3. Funções auxiliares de interface.
function mostrarMensagem(texto, tipo = "info") {
  elements.mensagem.className = `alert alert-${tipo} status-message mt-4`;
  elements.mensagem.textContent = texto;
  elements.mensagem.classList.remove("d-none");
}
function esconderMensagem() {
  elements.mensagem.classList.add("d-none");
}
function definirCarregamento(ativo) {
  elements.indicador.classList.toggle("d-none", !ativo);
  elements.grade.classList.toggle("d-none", ativo);
}
function tituloDoItem(item) {
  return item.title || item.name || "Título sem nome";
}
function tipoDoItem(item) {
  return item.media_type || (item.first_air_date ? "tv" : "movie");
}
function anoDoItem(item) {
  const data = item.release_date || item.first_air_date || "";
  return data ? data.slice(0, 4) : "Ano indisponível";
}
function urlImagem(caminho) {
  return caminho ? `${IMAGE_BASE}${caminho}` : "";
}

// 4. Função central de consumo da API. Todas as chamadas passam por aqui.
// O token é enviado no cabeçalho Authorization. response.ok identifica erros HTTP.
async function requisitarAPI(endpoint) {
  if (!apiToken) throw new Error("TOKEN_AUSENTE");
  const resposta = await fetch(`${API_BASE}${endpoint}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "accept": "application/json"
    }
  });

  if (!resposta.ok) {
    if (resposta.status === 401) throw new Error("Token inválido ou não autorizado. Confira sua credencial do TMDB.");
    if (resposta.status === 404) throw new Error("O conteúdo solicitado não foi encontrado (erro 404).");
    throw new Error(`A API respondeu com erro HTTP ${resposta.status}. Tente novamente.`);
  }
  return resposta.json();
}

// 5. Renderização dos cartões. Cada cartão mostra dados recebidos da API.
function renderizarCatalogo(lista) {
  itensAtuais = lista;
  elements.grade.innerHTML = "";

  if (!lista.length) {
    mostrarMensagem("Nenhum resultado encontrado. Tente outro termo ou altere o filtro.", "warning");
    return;
  }
  esconderMensagem();

  lista.forEach(item => {
    const tipo = tipoDoItem(item);
    const id = Number(item.id);
    const favorito = favoritos.has(`${tipo}-${id}`);
    const poster = urlImagem(item.poster_path);
    const coluna = document.createElement("div");
    coluna.className = "col";
    coluna.innerHTML = `
      <article class="movie-card">
        <div class="poster-wrap">
          ${poster ? `<img src="${poster}" alt="Pôster de ${escaparHTML(tituloDoItem(item))}" loading="lazy">` : `<div class="poster-placeholder">Imagem não disponível</div>`}
          <span class="rating">★ ${Number(item.vote_average || 0).toFixed(1)}</span>
          <button class="favorite-btn ${favorito ? "is-favorite" : ""}" type="button"
            aria-label="${favorito ? "Remover dos" : "Adicionar aos"} favoritos"
            data-fav="${tipo}-${id}">${favorito ? "♥" : "♡"}</button>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${escaparHTML(tituloDoItem(item))}</h3>
          <p class="movie-meta mb-0">${tipo === "tv" ? "Série" : "Filme"} • ${anoDoItem(item)}</p>
          <button class="btn btn-outline-light details-btn" type="button" data-detail="${id}" data-type="${tipo}">Ver detalhes</button>
        </div>
      </article>`;
    elements.grade.appendChild(coluna);
  });
}

// Protege os textos inseridos no HTML contra caracteres especiais.
function escaparHTML(valor) {
  return String(valor).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[caractere]);
}

// 6. Endpoint 1 — GET /trending/all/week: carrega filmes e séries em alta.
async function carregarEmAlta() {
  modoAtual = "trending";
  mostrandoFavoritos = false;
  elements.titulo.textContent = "Em alta esta semana";
  await executarBusca(async () => {
    const dados = await requisitarAPI(`/trending/all/week?language=${LANGUAGE}`);
    return filtrarPorTipo(dados.results || []);
  });
}

// 7. Endpoint 2 — GET /search/multi: pesquisa filmes e séries pelo texto digitado.
async function pesquisarTitulos(termo) {
  modoAtual = "search";
  mostrandoFavoritos = false;
  elements.titulo.textContent = `Resultados para: ${termo}`;
  await executarBusca(async () => {
    const dados = await requisitarAPI(`/search/multi?query=${encodeURIComponent(termo)}&language=${LANGUAGE}`);
    return filtrarPorTipo((dados.results || []).filter(item => item.media_type === "movie" || item.media_type === "tv"));
  });
}

// Filtra os resultados sem precisar fazer uma nova chamada à API.
function filtrarPorTipo(lista) {
  const tipo = elements.filtroTipo.value;
  return tipo === "all" ? lista : lista.filter(item => tipoDoItem(item) === tipo);
}

// Executa uma operação mostrando carregamento e capturando erros.
async function executarBusca(operacao) {
  definirCarregamento(true);
  esconderMensagem();
  try {
    const resultados = await operacao();
    renderizarCatalogo(resultados);
  } catch (erro) {
    console.error(erro);
    if (erro.message === "TOKEN_AUSENTE") {
      mostrarMensagem("Conecte sua chave de leitura do TMDB no campo acima para começar.", "warning");
    } else {
      mostrarMensagem(erro.message || "Não foi possível conectar à API. Verifique sua internet e tente novamente.", "danger");
    }
    elements.grade.innerHTML = "";
  } finally {
    definirCarregamento(false);
  }
}

// 8. Endpoints 3 e 4 — GET /movie/{id} ou GET /tv/{id}: detalhes completos.
async function abrirDetalhes(id, tipo) {
  elements.modalTitulo.textContent = "Carregando detalhes...";
  elements.conteudoDetalhes.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-danger"></div></div>';
  modalDetalhes.show();

  try {
    const dados = await requisitarAPI(`/${tipo}/${id}?language=${LANGUAGE}`);
    elements.modalTitulo.textContent = tituloDoItem(dados);
    const backdrop = urlImagem(dados.backdrop_path);
    const poster = urlImagem(dados.poster_path);
    const generos = (dados.genres || []).map(genero => genero.name).join(", ") || "Não informado";
    const sinopse = dados.overview || "Sinopse não disponível em português.";
    const duracao = tipo === "movie" ? `${dados.runtime || "?"} minutos` : `${dados.number_of_seasons || "?"} temporada(s)`;
    elements.conteudoDetalhes.innerHTML = `
      ${backdrop ? `<img class="detail-backdrop" src="${backdrop}" alt="">` : ""}
      <div class="d-flex gap-3 flex-wrap">
        ${poster ? `<img class="detail-poster" src="${poster}" alt="Pôster de ${escaparHTML(tituloDoItem(dados))}">` : ""}
        <div class="flex-grow-1">
          <p class="eyebrow mb-2">${tipo === "tv" ? "SÉRIE" : "FILME"} • ${anoDoItem(dados)}</p>
          <p><strong>Nota:</strong> ★ ${Number(dados.vote_average || 0).toFixed(1)} / 10</p>
          <p><strong>Gêneros:</strong> ${escaparHTML(generos)}</p>
          <p><strong>${tipo === "tv" ? "Temporadas" : "Duração"}:</strong> ${duracao}</p>
          <p class="detail-copy">${escaparHTML(sinopse)}</p>
        </div>
      </div>`;
  } catch (erro) {
    elements.modalTitulo.textContent = "Não foi possível carregar";
    elements.conteudoDetalhes.innerHTML = `<p class="text-danger">${escaparHTML(erro.message)}</p>`;
  }
}

// 9. Favoritos locais: persistem neste navegador via localStorage.
function alternarFavorito(chave) {
  if (favoritos.has(chave)) favoritos.delete(chave);
  else favoritos.add(chave);
  localStorage.setItem("probreflix_favoritos", JSON.stringify([...favoritos]));

  if (mostrandoFavoritos) mostrarFavoritos();
  else renderizarCatalogo(itensAtuais);
}
function mostrarFavoritos() {
  mostrandoFavoritos = true;
  modoAtual = "favorites";
  elements.titulo.textContent = "Minha lista de favoritos";
  const salvos = JSON.parse(localStorage.getItem("probreflix_itens_favoritos") || "{}");
  const lista = [...favoritos].map(chave => salvos[chave]).filter(Boolean);
  renderizarCatalogo(lista);
}

// Guarda o objeto de cada título favoritado para reconstruir a lista após atualizar a página.
function salvarItemFavorito(item) {
  const chave = `${tipoDoItem(item)}-${item.id}`;
  const salvos = JSON.parse(localStorage.getItem("probreflix_itens_favoritos") || "{}");
  salvos[chave] = item;
  localStorage.setItem("probreflix_itens_favoritos", JSON.stringify(salvos));
}

// 10. Eventos: conectam ações do usuário às funções acima.
elements.formToken.addEventListener("submit", async evento => {
  evento.preventDefault();
  const token = elements.campoToken.value.trim();
  if (!token) {
    mostrarMensagem("Digite seu token antes de conectar.", "warning");
    return;
  }
  apiToken = token;
  localStorage.setItem("probreflix_tmdb_token", apiToken);
  await carregarEmAlta();
});

elements.formBusca.addEventListener("submit", async evento => {
  evento.preventDefault();
  const termo = elements.campoBusca.value.trim();
  if (!termo) {
    mostrarMensagem("Digite o nome de um filme ou série para pesquisar.", "warning");
    elements.campoBusca.focus();
    return;
  }
  if (!apiToken) {
    mostrarMensagem("Primeiro conecte seu token do TMDB.", "warning");
    return;
  }
  await pesquisarTitulos(termo);
});

elements.filtroTipo.addEventListener("change", async () => {
  if (modoAtual === "search" && elements.campoBusca.value.trim()) {
    await pesquisarTitulos(elements.campoBusca.value.trim());
  } else if (modoAtual === "trending") {
    await carregarEmAlta();
  } else if (modoAtual === "favorites") {
    mostrarFavoritos();
  }
});

elements.btnInicio.addEventListener("click", carregarEmAlta);
elements.navFavoritos.addEventListener("click", mostrarFavoritos);
document.querySelector("#logoLink").addEventListener("click", evento => {
  evento.preventDefault();
  carregarEmAlta();
});

elements.grade.addEventListener("click", evento => {
  const botaoFavorito = evento.target.closest("[data-fav]");
  const botaoDetalhe = evento.target.closest("[data-detail]");
  if (botaoFavorito) {
    const chave = botaoFavorito.dataset.fav;
    const item = itensAtuais.find(titulo => `${tipoDoItem(titulo)}-${titulo.id}` === chave);
    if (item) salvarItemFavorito(item);
    alternarFavorito(chave);
  }
  if (botaoDetalhe) abrirDetalhes(botaoDetalhe.dataset.detail, botaoDetalhe.dataset.type);
});

// 11. Inicialização: mostra instrução se ainda não existe token salvo.
if (apiToken) carregarEmAlta();
else mostrarMensagem("Bem-vindo ao Probreflix! Insira seu token do TMDB acima para carregar filmes e séries.", "info");
