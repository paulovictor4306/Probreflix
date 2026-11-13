# Probreflix

Catálogo acadêmico de filmes e séries que consome a API pública do **The Movie Database (TMDB)**. O projeto permite visualizar títulos em alta, pesquisar filmes e séries, consultar detalhes e guardar favoritos no navegador.

## Tecnologias
- HTML5, CSS3 e JavaScript puro (sem React, Vue, jQuery ou Axios).
- Bootstrap 5.3.3 (framework CSS e componentes/grid).
- `fetch`, `async/await` e `localStorage`.
- API TMDB v3.

## Como executar
1. Descompacte o ZIP.
2. Abra `index.html` no navegador. Para melhor experiência, também pode abrir a pasta no VS Code e usar uma extensão de servidor estático.
3. Crie uma conta no [TMDB](https://www.themoviedb.org/signup).
4. No TMDB, entre em Configurações > API e solicite uma chave para desenvolvedor.
5. Copie o **API Read Access Token** (não a chave curta v3) e cole no campo "Conectar à API do TMDB" no site.
6. Clique em **Conectar**. A aplicação carrega os títulos em alta.
7. Codigo criado por mim:  eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZTg5YWU3NzFmMDUyOTFhOWEyMWNlMzA4ODc0YTE3MCIsIm5iZiI6MTc5NDU4OTE1OC41NjQ5OTk4LCJzdWIiOiI2YWY3NDFlNmViMDY0ZGVhODI2MzQ4ZGEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.cD16HZOZyvloSuIAJW33Z4E2y1ybHLNXuk3XYqBNGas.


> 

## Funcionalidades
- Lista de filmes e séries em alta na semana.
- Pesquisa textual de filmes e séries.
- Filtro por filmes, séries ou ambos.
- Modal com sinopse, gêneros, nota, ano e duração/temporadas.
- Favoritos salvos localmente no navegador.
- Mensagens para token ausente/inválido, erros HTTP, falhas de conexão, pesquisa vazia e resultados sem correspondência.
- Indicador visual de carregamento.

## APIs e endpoints consumidos

| Método | Endpoint | Uso na interface |
|---|---|---|
| GET | `https://api.themoviedb.org/3/trending/all/week?language=pt-BR` | Lista inicial de filmes e séries em alta |
| GET | `https://api.themoviedb.org/3/search/multi?query={termo}&language=pt-BR` | Busca textual de filmes e séries |
| GET | `https://api.themoviedb.org/3/movie/{id}?language=pt-BR` | Detalhes de um filme |
| GET | `https://api.themoviedb.org/3/tv/{id}?language=pt-BR` | Detalhes de uma série |

Os quatro caminhos de recurso são distintos e os dados retornados são exibidos na interface. O filtro por tipo atua sobre os resultados recebidos, sem fingir ser um endpoint adicional.

## Estrutura de pastas

```text
Probreflix/
├── index.html
├── css/
│   └── estilo.css
├── js/
│   └── app.js
├── README.md

```

## Informações — 
- Integrante: Paulo Victor Gomes Da Silva
- Matrícula(s): 202411461
- Professor: Renan Costa.
- Disciplina: Aplicações Frontend
- Repositório GitHub: 
- GitHub Pages: 
- Vídeo (até 5 minutos): 



