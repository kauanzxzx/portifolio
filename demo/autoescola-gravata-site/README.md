# Autoescola Gravatá — site

Site institucional da Autoescola Gravatá (CFC, Navegantes/SC). HTML, CSS e JavaScript puros, sem build.

## Estrutura

```
autoescola-gravata-site/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── style.css        # todos os estilos (tokens no :root, seções comentadas, responsivo no fim)
    ├── js/
    │   ├── config.js        # chaves e dados editáveis (API do Google, WhatsApp, endereço, link ALAZO)
    │   └── main.js          # header, parallax, faróis, contadores, mapa e avaliações
    └── img/
        ├── carro-autoescola-gravata.webp   # carro da hero (recortado, com a faixa AUTOESCOLA)
        ├── carro-autoescola-gravata.png    # fallback do carro / imagem de compartilhamento
        └── favicon.svg
```

## Configuração (assets/js/config.js)

| Campo | Para que serve |
|---|---|
| `GOOGLE_API_KEY` | Chave da Google Maps Platform com **Maps JavaScript API** e **Places API (New)** ativadas. Restrinja ao domínio do site. Sem chave, o site mostra só a nota e o total. |
| `PLACE_ID` | Opcional. Sem ele, a busca é feita por `PLACE_QUERY`. |
| `WHATSAPP` | Link usado em todos os botões de WhatsApp. |
| `FALLBACK_RATING` / `FALLBACK_COUNT` | Nota e total exibidos enquanto a API não responde. |
| `ALAZO_URL` | Link da assinatura "Desenvolvido por ALAZO" no rodapé. |

## Observações

- Abra pelo servidor (Live Server, hospedagem etc.). Pelo `file://` o navegador bloqueia a máscara do reflexo do carro.
- O mapa usa o embed do Google Maps (sem chave).
- Faróis: acendem em sequência após o carro entrar e piscam ao passar o mouse em "Comece sua CNH". Ajuste em `style.css`, bloco do carro (`.car-lights`).
