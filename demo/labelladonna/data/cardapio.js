/**
 * data/cardapio.js
 * -----------------------------------------------------------------------
 * Fonte de dados do cardápio — La Bella Donna Pizzeria (V1).
 *
 * Nesta primeira versão os produtos ficam centralizados aqui, sem banco
 * de dados. Na V2, este arquivo pode ser substituído por uma chamada a
 * uma API (ex: GET /api/produtos) mantendo o mesmo formato de objeto,
 * de forma que o restante do frontend não precise ser alterado.
 * -----------------------------------------------------------------------
 */

// Categorias exibidas na navegação do cardápio, na ordem em que aparecem.
// As pizzas são organizadas por TAMANHO; dentro de cada tamanho ficam os sabores.
const CATEGORIAS = [
  { id: "pizza-grande", nome: "Pizza Grande", detalhe: "35cm · 12 fatias", pizza: true },
  { id: "pizza-media", nome: "Pizza Média", detalhe: "", pizza: true }, // preencha cm/fatias reais
  { id: "pizza-broto", nome: "Pizza Broto", detalhe: "", pizza: true }, // preencha cm/fatias reais
  { id: "porcoes", nome: "Porções" },
  { id: "bebidas", nome: "Bebidas" },
  { id: "sobremesas", nome: "Sobremesas" },
];

// Adicionais reutilizáveis para as pizzas.
const ADICIONAIS_PIZZA = [
  { id: "bacon", nome: "Bacon", preco: 5.0 },
  { id: "cheddar", nome: "Cheddar", preco: 4.0 },
  { id: "catupiry", nome: "Catupiry extra", preco: 5.0 },
  { id: "borda-recheada", nome: "Borda recheada", preco: 8.0 },
];

// Sabores de pizza. Cada sabor tem um preço por tamanho (grande / media / broto).
// Para trocar preço, nome, descrição ou foto, edite aqui — o site gera os cards sozinho.
const SABORES = [
  { id: "calabresa", grupo: "Salgadas", nome: "Calabresa", descricao: "Molho de tomate, muçarela, calabresa fatiada e cebola.", imagem: "img/produtos/calabresa.jpg", precos: { grande: 49.9, media: 41.9, broto: 29.9 } },
  { id: "mucarela", grupo: "Salgadas", nome: "Muçarela", descricao: "Molho de tomate, muçarela e orégano.", imagem: "img/produtos/mucarela.jpg", precos: { grande: 44.9, media: 37.9, broto: 26.9 } },
  { id: "marguerita", grupo: "Salgadas", nome: "Marguerita", descricao: "Muçarela, tomate fatiado, manjericão e parmesão.", imagem: "img/produtos/marguerita.jpg", precos: { grande: 49.9, media: 41.9, broto: 29.9 } },
  { id: "frango-catupiry", grupo: "Salgadas", nome: "Frango com Catupiry", descricao: "Frango desfiado, muçarela e Catupiry.", imagem: "img/produtos/frango-catupiry.jpg", precos: { grande: 54.9, media: 45.9, broto: 32.9 } },
  { id: "quatro-queijos", grupo: "Salgadas", nome: "Quatro Queijos", descricao: "Muçarela, provolone, parmesão e Catupiry.", imagem: "img/produtos/quatro-queijos.jpg", precos: { grande: 56.9, media: 47.9, broto: 34.9 } },
  { id: "portuguesa", grupo: "Salgadas", nome: "Portuguesa", descricao: "Presunto, queijo, ovo, cebola, ervilha e azeitona.", imagem: "img/produtos/portuguesa.jpg", precos: { grande: 54.9, media: 45.9, broto: 32.9 } },
  { id: "lombo-catupiry", grupo: "Salgadas", nome: "Lombo com Catupiry", descricao: "Lombo canadense, muçarela e Catupiry.", imagem: "img/produtos/lombo-catupiry.jpg", precos: { grande: 55.9, media: 46.9, broto: 33.9 } },
  { id: "pepperoni", grupo: "Salgadas", nome: "Pepperoni", descricao: "Muçarela, pepperoni e molho especial.", imagem: "img/produtos/pepperoni.jpg", precos: { grande: 57.9, media: 48.9, broto: 35.9 } },
  { id: "nutella-morango", grupo: "Doces", nome: "Nutella com Morango", descricao: "Nutella e morangos frescos.", imagem: "img/produtos/nutella-morango.jpg", precos: { grande: 49.9, media: 41.9, broto: 29.9 } },
  { id: "chocolate-mm", grupo: "Doces", nome: "Chocolate com M&M's", descricao: "Chocolate ao leite coberto com M&M's.", imagem: "img/produtos/chocolate-mm.jpg", precos: { grande: 52.9, media: 43.9, broto: 31.9 } },
  { id: "romeu-julieta", grupo: "Doces", nome: "Romeu e Julieta", descricao: "Muçarela e goiabada.", imagem: "img/produtos/romeu-julieta.jpg", precos: { grande: 46.9, media: 39.9, broto: 27.9 } },
];

// Gera um produto para cada sabor em cada tamanho (sem repetir dados à mão).
const PIZZAS = [];
CATEGORIAS.filter((c) => c.pizza).forEach((cat) => {
  const chave = cat.id.replace("pizza-", ""); // grande | media | broto
  SABORES.forEach((s) => {
    PIZZAS.push({
      id: `${cat.id}-${s.id}`,
      categoria: cat.id,
      grupo: s.grupo,
      nome: s.nome,
      nomeCarrinho: `Pizza ${s.nome}`,
      tamanhoNome: cat.nome.replace("Pizza ", "") + (cat.detalhe ? ` (${cat.detalhe})` : ""),
      descricao: s.descricao,
      preco: s.precos[chave],
      imagem: s.imagem,
      tamanhos: null,
      adicionais: s.grupo === "Salgadas" ? ADICIONAIS_PIZZA : ADICIONAIS_PIZZA.filter((a) => a.id === "borda-recheada"),
      disponivel: true,
    });
  });
});

// Demais produtos (valores ilustrativos — substitua pelos reais).
const OUTROS = [
  { id: "batata-cheddar", categoria: "porcoes", nome: "Batata Frita com Cheddar", descricao: "Porção generosa de batatas fritas cobertas com cheddar.", preco: 34.9, imagem: "img/produtos/batata-cheddar.jpg" },
  { id: "frango-passarinho", categoria: "porcoes", nome: "Frango à Passarinho", descricao: "Pedaços de frango temperados e fritos, crocantes por fora.", preco: 39.9, imagem: "img/produtos/frango-passarinho.jpg" },
  { id: "coca-350", categoria: "bebidas", nome: "Coca-Cola 350ml", descricao: "Lata gelada, 350ml.", preco: 6.0, imagem: "img/produtos/coca-lata.jpg" },
  { id: "coca-2l", categoria: "bebidas", nome: "Coca-Cola 2L", descricao: "Garrafa 2 litros, ideal para compartilhar.", preco: 14.0, imagem: "img/produtos/coca-2l.jpg" },
  { id: "guarana-2l", categoria: "bebidas", nome: "Guaraná 2L", descricao: "Garrafa 2 litros gelada.", preco: 12.0, imagem: "img/produtos/guarana-2l.jpg" },
  { id: "agua", categoria: "bebidas", nome: "Água Mineral", descricao: "Água mineral sem gás, 500ml.", preco: 4.0, imagem: "img/produtos/agua.jpg" },
  { id: "petit-gateau", categoria: "sobremesas", nome: "Petit Gateau", descricao: "Bolinho de chocolate quente com recheio cremoso e sorvete.", preco: 24.9, imagem: "img/produtos/petit-gateau.jpg" },
].map((p) => ({ tamanhos: null, adicionais: [], disponivel: true, ...p }));

const PRODUTOS = [...PIZZAS, ...OUTROS];

// Taxa de entrega padrão (ilustrativa) e limite de troco.
const CONFIGURACOES = {
  nomeLoja: "La Bella Donna Pizzeria",
  whatsapp: "5547989168682", // (47) 98916-8682 em formato internacional
  endereco: "R. Brusque, 598 — Itajaí - SC",
  instagram: "@labelladonnaitajaisc",
  taxaEntrega: 5.0,
};

// Exporta para uso em script.js (mesmo escopo global nesta V1 sem bundler).
window.LBD_DATA = { CATEGORIAS, PRODUTOS, CONFIGURACOES };
