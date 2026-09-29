# La Bella Donna Pizzeria — Cardápio Digital (V1)

Site completo com cardápio interativo por tamanho de pizza, carrinho de
compras e finalização de pedido via WhatsApp. HTML5 + CSS3 + JavaScript
puro, sem frameworks e sem banco de dados nesta primeira versão.

## Como usar

1. Abra `index.html` num navegador (ou publique a pasta inteira em qualquer
   hospedagem estática: Hostinger, Vercel, Netlify, cPanel, etc.).
2. Não é necessário build nem instalação — é um site estático puro.

## Cardápio por tamanho de pizza

O cardápio é organizado em `data/cardapio.js` assim:

- **CATEGORIAS**: as abas do cardápio — `Pizza Grande` (35cm · 12 fatias),
  `Pizza Média`, `Pizza Broto`, `Porções`, `Bebidas`, `Sobremesas`. Edite o
  campo `detalhe` de cada tamanho para colocar o cm/fatias reais da Média e
  do Broto.
- **SABORES**: a lista de sabores de pizza (Calabresa, Muçarela, Portuguesa
  etc.), cada um com um preço por tamanho em `precos: { grande, media, broto }`.
  O site gera automaticamente um card para cada sabor dentro de cada aba de
  tamanho — não é preciso duplicar nada manualmente.
- **OUTROS**: os demais produtos (porções, bebidas, sobremesas), com preço
  único, sem tamanho.

Para adicionar um novo sabor, basta acrescentar um objeto em `SABORES`; ele
aparece automaticamente nas três abas (Grande, Média, Broto) com o preço
correspondente. Para um sabor exclusivo de um tamanho, ajuste a lógica em
`PIZZAS` (função que gera os produtos) ou remova o preço daquele tamanho.

## Onde trocar cada coisa

- **Fotos dos sabores** → salve em `img/produtos/` com o mesmo nome de
  arquivo referenciado no campo `imagem` de cada sabor em `SABORES`.
- **Foto de capa (hero)** → `img/banners/hero.jpg`. Foi recortada a partir da
  imagem de referência enviada; troque por uma foto em alta resolução quando
  tiver (recomendado ~1600×900, formato paisagem, com o assunto principal à
  direita, já que o texto fica à esquerda).
- **Foto da fachada (seção "Sobre")** → `img/banners/labelladona-image.jpg`.
- **WhatsApp, endereço, taxa de entrega** → objeto `CONFIGURACOES` no fim de
  `data/cardapio.js`.
- **Textos e seções** → `index.html`.
- **Cores, tipografia e espaçamentos** → `css/style.css` (tokens no topo do
  arquivo, em `:root`). A paleta segue a identidade real da loja: fundo teal
  profundo, turquesa de destaque, título serifado (Newsreader) + texto em
  Inter, no estilo da imagem de referência enviada.

## Estrutura

```
/
├── index.html
├── css/style.css
├── js/script.js          → cardápio, carrinho, checkout, envio ao WhatsApp
├── data/cardapio.js       → sabores, tamanhos, categorias e configurações
└── img/
    ├── logo/
    ├── produtos/
    └── banners/
```

## Preparado para a V2

O `data/cardapio.js` foi desenhado para ser substituído por uma chamada de
API sem alterar o resto do site: basta que o endpoint retorne os sabores no
mesmo formato de objeto. A partir daí, a V2 pode somar:

- painel administrativo (`/admin`) com login;
- CRUD de sabores, tamanhos, categorias e adicionais;
- controle de disponibilidade e pedidos;
- configurações de horário e taxa de entrega;
- backend em Node.js + Express com banco PostgreSQL.

## Observações importantes

- Todos os sabores, tamanhos e preços deste cardápio são **ilustrativos** —
  substitua pelos itens e valores reais antes de publicar.
- O número de WhatsApp usado é `(47) 98916-8682`, extraído das referências
  enviadas. Confirme se é o número correto de pedidos antes de divulgar.
- O envio do pedido usa o link `wa.me` (sem API oficial do WhatsApp), como
  pedido na V1.
