# 🤖 Enterprise RAG Simulator

Simulador interativo de **RAG Corporativo** (Retrieval-Augmented Generation) com Controle de Acesso e Inspetor de Pipeline. Inclui também uma apresentação em slides sobre IA Corporativa.

---

## 📁 Arquivos do Projeto

| Arquivo | Descrição |
|---|---|
| `index.html` | Simulador principal do RAG com pipeline interativo |
| `slides.html` | Apresentação em slides: IA Corporativa com RAG |
| `style.css` | Estilos compartilhados da aplicação |
| `app.js` | Lógica principal do simulador |

---

## 🚀 Como Executar

### ✅ Opção 1 — Servidor Local via npm (Recomendado)

> Evita problemas de CORS e garante o carregamento correto de todos os recursos.

**Pré-requisito:** ter o [Node.js](https://nodejs.org/) instalado.

```bash
# 1. Acesse a pasta do projeto
cd enterprise-rag-simulator

# 2. Inicie o servidor de desenvolvimento
npm run dev
```

Depois abra no navegador:
- **Simulador:** [http://localhost:3000/index.html](http://localhost:3000/index.html)
- **Slides:** [http://localhost:3000/slides.html](http://localhost:3000/slides.html)

---

### ✅ Opção 2 — Abrir diretamente no navegador

Sem precisar instalar nada:

1. Navegue até a pasta `enterprise-rag-simulator`
2. Dê **duplo clique** em `index.html` ou `slides.html`
3. O arquivo abrirá diretamente no seu navegador padrão

> ⚠️ Alguns navegadores podem bloquear recursos externos (fontes, ícones) ao abrir arquivos localmente. Se isso acontecer, use a **Opção 1** ou a **Opção 3**.

---

### ✅ Opção 3 — Servidor Python (alternativa sem Node.js)

Se você tiver o [Python](https://python.org) instalado:

```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

Depois acesse: [http://localhost:3000](http://localhost:3000)

---

### ✅ Opção 4 — VS Code com Live Server

1. Instale a extensão **[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)** no VS Code
2. Abra a pasta do projeto no VS Code
3. Clique com botão direito em `index.html` → **"Open with Live Server"**

---

## 🗺️ Navegando pelo Simulador

### `index.html` — Simulador RAG
- **Painel de Controle de Acesso:** selecione o perfil do usuário (Analista, Gerente, TI, etc.)
- **Inspetor de Pipeline:** visualize em tempo real as etapas do RAG (Retrieval → Augmentation → Generation)
- **Simulação de Queries:** envie perguntas e observe como o sistema filtra e responde com base no perfil

### `slides.html` — Apresentação
- Navegue pelos slides com as **setas do teclado** (`←` `→`) ou clicando nos botões na tela
- Use `F` para tela cheia (fullscreen)
- A apresentação cobre: conceitos de RAG, arquitetura corporativa, casos de uso e demonstrações

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** + **CSS3** — estrutura e estilos
- **Vanilla JavaScript** — lógica do simulador, sem frameworks
- **Google Fonts** — tipografia (Inter, Outfit, Fira Code)
- **Lucide Icons** — ícones via CDN

---

## 📋 Requisitos

- Navegador moderno: Chrome, Firefox, Edge ou Safari (versões recentes)
- Conexão com internet (para carregar fontes e ícones do CDN)
- Node.js `>=14` (apenas para a Opção 1 com `npm run dev`)
