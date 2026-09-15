# O blog

Um post a cada 10 a 14 dias, sobre competição e novidades da academia.

Ainda não está decidido quem vai publicar. Por isso o conteúdo foi montado como
**dados**, não como página: hoje um post é um arquivo neste repo, e o dia que a
publicação passar para um CMS, **só um arquivo muda**. Nenhuma página precisa ser
tocada.

---

## Publicar um post hoje

1. Crie um arquivo em `posts/`, no formato `AAAA-MM-DD-slug.ts`.
2. Copie o post mais recente como molde e troque o conteúdo.
3. Coloque a foto em `public/site/blog/` já em **WebP**
   (`cwebp -q 82 -m 6 foto.jpg -o public/site/blog/slug.webp`).
4. Commit e push. Pronto.

Não existe índice para atualizar: o `index.ts` varre a pasta `posts/` sozinho.
Criar o arquivo **é** publicar.

O build faz o resto: gera o documento HTML do post com título, descrição,
canonical, card do Open Graph e JSON-LD próprios, e acrescenta a URL ao
`sitemap.xml`.

### O que cada campo faz

| Campo | Para que serve |
|---|---|
| `slug` | A URL (`/blog/<slug>`). **Permanente**: mudar depois quebra os links já compartilhados. |
| `title` | Título do post, da aba do navegador e do card de compartilhamento. |
| `date` | `AAAA-MM-DD`. Ordena a listagem e aparece na data do post. |
| `category` | `competition`, `academy` ou `guide`. Alimenta o filtro. |
| `excerpt` | Uma ou duas frases. Vai para a listagem, para a meta description e para o card do WhatsApp e do Facebook. |
| `cover` | A foto: `src`, `alt`, `w`, `h`. Largura e altura são obrigatórias, é o que reserva a caixa e evita o pulo de layout. `focus` (opcional) reenquadra quando o assunto não está no centro. |
| `body` | O texto, em blocos: `p('...')`, `h('...')`, `list([...])`. |
| `draft: true` | Segura o post: fica fora da listagem, do sitemap e do build. |

Dentro de `p()`, `h()` e `list()` valem dois atalhos: `**negrito**` e
`[texto](https://link)`. Nada de HTML, e isso é de propósito (veja `types.ts`).

### Antes de publicar

- ⛔ **Zero travessão (—)** em qualquer texto. O build **falha** se encontrar um
  em `title` ou `excerpt`. No corpo, reescreva a pontuação: vírgula, ponto ou
  dois-pontos. En dash (–) só em intervalo de número (`3–6 months`).
- ⛔ **Nada de imagem gerada por IA.** A capa do post `gi-vs-no-gi` foi trocada
  por foto real justamente por isso: a original do site antigo era de IA.
- Foto sempre em **WebP**, e o `alt` descrevendo o que está na foto.

---

## Trocar para um CMS depois

Todas as páginas leem posts por quatro funções do `index.ts`: `allPosts()`,
`postBySlug()`, `usedCategories()` e `relatedPosts()`. Elas são a costura.

Para plugar um CMS (Supabase, Sanity, Contentful, o que for), mexa em **dois
lugares**:

1. **`index.ts`** — trocar a função `load()`, que hoje lê os arquivos por
   `import.meta.glob`, por uma leitura da API do CMS. O contrato de saída
   continua o mesmo: uma lista de `Post` ordenada por data, sem rascunho.
2. **`scripts/blog-entries.mjs`** — trocar a função `loadPosts()` pela mesma
   leitura, para que os documentos HTML continuem sendo gerados no build.

O `Post` e o `Block` de `types.ts` são propositalmente o formato que um CMS
headless devolve (blocos tipados), então o trabalho de verdade é um `switch`
mapeando o bloco de lá para o daqui.

⚠️ **Se o conteúdo passar a vir de fora, a geração precisa rodar a cada
publicação.** Hoje o gatilho é o push. Com um CMS, o post novo só aparece depois
de um build, então o CMS precisa disparar um deploy hook da Vercel. Sem isso, o
cliente publica e não vê nada mudar.

⚠️ **Renderizar por HTML cru continua proibido.** O `PostBody` monta elementos
React a partir dos blocos, sem `dangerouslySetInnerHTML`. Quando a copy passar a
ser digitada por alguém de fora do repo, é isso que impede uma colagem virar
script rodando na página.

---

## Por que um documento HTML por post

O scraper do Meta e do WhatsApp **não roda JavaScript**: o que está no HTML
servido é o que aparece no card do link. Post é justamente o conteúdo que as
pessoas compartilham, então cada um sai do build com o seu próprio `title`,
`description` e `og:image`. Uma rota só, resolvida no cliente, daria a todos os
posts o mesmo título e a mesma imagem.

É o mesmo motivo pelo qual `/home`, `/about` e as outras são documentos
separados. Detalhes em `scripts/blog-entries.mjs`.

Os arquivos gerados ficam em `/blog` na raiz do repo e estão no `.gitignore`:
são resultado de build, não fonte. A fonte é a pasta `posts/`.
