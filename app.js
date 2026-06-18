/* ==========================================================================
   Enterprise RAG Simulator - JavaScript Engine
   Simulates: Text chunking, Vector Embeddings, Semantic retrieval,
              Access Control (RBAC), Prompt synthesis, and LLM typing.
   ========================================================================== */

// --- Default Document Knowledge Base ---
const DEFAULT_DOCUMENTS = [
    {
        id: "doc-1",
        title: "Política de Férias e Licenças 2026",
        dept: "RH",
        access: "Public", // Public, HR Only, Confidential
        content: "O colaborador adquire o direito a férias após completar 12 meses de trabalho (período aquisitivo). O pedido de férias deve ser realizado com no mínimo 30 dias de antecedência através do portal de RH. Férias podem ser divididas em até 3 períodos, sendo que um deles não pode ser menor que 14 dias corridos. O saldo de férias não gozadas expira após 24 meses do período aquisitivo."
    },
    {
        id: "doc-2",
        title: "Acesso à VPN Corporativa e Segurança de TI",
        dept: "TI",
        access: "Public",
        content: "Para acessar os sistemas internos da empresa fora do escritório, utilize o cliente OpenVPN com suas credenciais de e-mail corporativo. A senha padrão fornecida para o primeiro acesso é 'Antigravity@2026' e deve ser alterada imediatamente no primeiro login. Nunca compartilhe suas chaves privadas .ovpn com terceiros. Em caso de perda de dispositivo, avise suporte-ti@empresa.com em até 2 horas."
    },
    {
        id: "doc-3",
        title: "Política de Reembolso de Viagens de Negócios",
        dept: "Financeiro",
        access: "Public",
        content: "Despesas com alimentação em viagens de negócios são reembolsadas até o limite de R$ 80 por refeição (café, almoço ou jantar). O reembolso de hospedagem exige aprovação prévia do gestor direto através do sistema SAP. O envio de todas as notas fiscais digitalizadas deve ser feito até o quinto dia útil do mês subsequente ao término da viagem."
    },
    {
        id: "doc-4",
        title: "Orçamento Estratégico - Projeto Phoenix (Confidencial)",
        dept: "Financeiro",
        access: "Confidential", // Restricted to C-Level
        content: "O orçamento total alocado para o Projeto Phoenix (nosso novo motor de IA secreto) em 2026 é de R$ 5.000.000. Desse montante, R$ 2.000.000 são destinados para contratação de engenheiros e consultores de IA, R$ 2.000.000 para infraestrutura de nuvem (AWS/GCP) e R$ 1.000.000 para marketing e captação de clientes. Esta informação é confidencial da diretoria."
    },
    {
        id: "doc-5",
        title: "Tabela Salarial e Remuneração Executiva (Restrito RH)",
        dept: "RH",
        access: "HR Only", // Restricted to HR
        content: "A tabela salarial dos cargos executivos (Diretores, Vice-Presidentes e C-Level) para o ano fiscal de 2026 define uma faixa salarial base de R$ 25.000 a R$ 45.000 mensais, acrescido de bônus por desempenho anual de até 40% do salário anual bruto. A aprovação desta tabela depende exclusivamente do conselho de administração e do Diretor de RH."
    },
    {
        id: "doc-6",
        title: "Política de Trabalho Híbrido e Home Office",
        dept: "RH",
        access: "Public",
        content: "A empresa opera em modelo híbrido. Colaboradores devem comparecer presencialmente ao escritório 2 vezes por semana (sendo terça e quinta-feira os dias recomendados). A empresa oferece um auxílio mensal de home office de R$ 120 para ajuda nos custos de internet e energia. O agendamento de mesas deve ser feito pelo aplicativo DeskBooking com 24h de antecedência."
    }
];

// --- Pre-canned High-Quality Q&A Mapping for natural responses ---
const PRESET_ANSWERS = {
    "férias": {
        title: "Política de Férias e Licenças 2026",
        docId: "doc-1",
        text: "De acordo com a **Política de Férias e Licenças 2026**, você adquire o direito a tirar férias após completar 12 meses de trabalho (período aquisitivo). O pedido deve ser feito com pelo menos 30 dias de antecedência no portal de RH. Suas férias podem ser divididas em até 3 períodos, mas um deles precisa ter no mínimo 14 dias corridos."
    },
    "vpn": {
        title: "Acesso à VPN Corporativa e Segurança de TI",
        docId: "doc-2",
        text: "Conforme o manual de **Acesso à VPN Corporativa**, para conectar-se remotamente você deve usar o cliente OpenVPN. A senha padrão do seu primeiro acesso é `Antigravity@2026` (que precisa ser alterada imediatamente). Certifique-se de não compartilhar suas chaves .ovpn e, em caso de perda de dispositivo, avise suporte-ti@empresa.com em até 2 horas."
    },
    "reembolso": {
        title: "Política de Reembolso de Viagens de Negócios",
        docId: "doc-3",
        text: "Segundo a **Política de Reembolso de Viagens**, o limite para reembolso de despesas de alimentação é de R$ 80 por refeição. Despesas com hotel precisam de aprovação prévia do seu gestor via SAP. Todas as notas fiscais devem ser enviadas digitalizadas até o 5º dia útil do mês seguinte."
    },
    "phoenix": {
        title: "Orçamento Estratégico - Projeto Phoenix (Confidencial)",
        docId: "doc-4",
        text: "Com base no documento **Orçamento Estratégico - Projeto Phoenix**, o orçamento total para 2026 é de R$ 5.000.000. O valor está distribuído em R$ 2.000.000 para contratação de equipe de IA, R$ 2.000.000 para nuvem (AWS/GCP) e R$ 1.000.000 para marketing de lançamento."
    },
    "salarial": {
        title: "Tabela Salarial e Remuneração Executiva (Restrito RH)",
        docId: "doc-5",
        text: "A **Tabela Salarial Executiva 2026** indica que a remuneração base dos cargos de diretoria e C-Level varia entre R$ 25.000 e R$ 45.000 mensais. Além disso, há um bônus por desempenho anual que pode chegar a até 40% do salário bruto anual."
    },
    "home office": {
        title: "Política de Trabalho Híbrido e Home Office",
        docId: "doc-6",
        text: "A **Política de Trabalho Híbrido** prevê 2 dias de trabalho presencial por semana (preferencialmente terças e quintas-ferias). Há também um auxílio home office de R$ 120 mensais pagos em folha para custos extras de infraestrutura."
    }
};

// --- App State ---
let documents = [];
let queryCount = 0;
let blockedCount = 0;
let currentUserRole = "employee_sales"; // Default user

// --- Stopwords in Portuguese for Search Tokenization ---
const STOPWORDS = new Set([
    'de', 'a', 'o', 'que', 'para', 'em', 'um', 'uma', 'os', 'as', 'com', 'se', 'por', 
    'no', 'na', 'dos', 'das', 'do', 'da', 'como', 'qual', 'quais', 'eu', 'quando', 
    'posso', 'quanto', 'limite', 'valor', 'reais', 'e', 'ou', 'meu', 'minha'
]);

// --- Core Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    // Load documents from localStorage or defaults
    const storedDocs = localStorage.getItem("rag_docs");
    if (storedDocs) {
        documents = JSON.parse(storedDocs);
    } else {
        documents = [...DEFAULT_DOCUMENTS];
        saveDocsToStorage();
    }

    // Load stats
    queryCount = parseInt(localStorage.getItem("rag_query_count") || "0");
    blockedCount = parseInt(localStorage.getItem("rag_blocked_count") || "0");

    // Initialize UI elements
    updateStatsUI();
    renderDocsList();
    renderPresets();
    setupEventListeners();
    lucide.createIcons();
});

// --- Helper Functions ---
function saveDocsToStorage() {
    localStorage.setItem("rag_docs", JSON.stringify(documents));
}

function updateStatsUI() {
    document.getElementById("stat-docs-count").textContent = documents.length;
    document.getElementById("stat-queries-count").textContent = queryCount;
    document.getElementById("stat-blocked-count").textContent = blockedCount;
    
    localStorage.setItem("rag_query_count", queryCount);
    localStorage.setItem("rag_blocked_count", blockedCount);
}

// --- Render Functions ---
function renderDocsList(filterText = "") {
    const container = document.getElementById("docs-container");
    container.innerHTML = "";
    
    const filtered = documents.filter(doc => 
        doc.title.toLowerCase().includes(filterText.toLowerCase()) ||
        doc.content.toLowerCase().includes(filterText.toLowerCase()) ||
        doc.dept.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
        container.innerHTML = `<div class="section-desc text-center" style="grid-column: 1/-1; padding: 20px;">Nenhum documento encontrado.</div>`;
        return;
    }

    filtered.forEach(doc => {
        const card = document.createElement("div");
        card.className = `doc-card dept-${doc.dept}`;
        card.dataset.id = doc.id;
        
        // Security Badge styling
        let securityClass = "badge-public";
        let securityLabel = "Público";
        if (doc.access === "HR Only") {
            securityClass = "badge-hr";
            securityLabel = "Acesso RH";
        } else if (doc.access === "Confidential") {
            securityClass = "badge-confidential";
            securityLabel = "Confidencial";
        }

        card.innerHTML = `
            <div class="doc-card-header">
                <div class="doc-card-title" title="${doc.title}">${doc.title}</div>
                <div class="doc-card-actions">
                    <button class="btn-delete-doc" data-id="${doc.id}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            <div class="doc-card-dept">${doc.dept}</div>
            <div class="doc-card-body">${doc.content}</div>
            <span class="doc-security-badge badge ${securityClass}">${securityLabel}</span>
        `;
        
        // Delete document event
        card.querySelector(".btn-delete-doc").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteDocument(doc.id);
        });

        // Click to view modal/details
        card.addEventListener("click", () => {
            openViewDocModal(doc);
        });

        container.appendChild(card);
    });
    
    lucide.createIcons();
}

function renderPresets() {
    const container = document.getElementById("presets-container");
    container.innerHTML = "";
    
    const presets = [
        { label: "Quando posso tirar férias? 🏖️", query: "Quando posso tirar férias?" },
        { label: "Qual a senha da VPN? 🔑", query: "Qual a senha padrão da VPN?" },
        { label: "Qual o limite de reembolso? 💰", query: "Qual o limite de reembolso de almoço?" },
        { label: "Orçamento do Projeto Phoenix 🚀", query: "Qual o orçamento secreto do Projeto Phoenix?" },
        { label: "Tabela Salarial da Diretoria 📊", query: "Qual a tabela salarial dos Diretores C-Level?" }
    ];

    presets.forEach(p => {
        const btn = document.createElement("button");
        btn.className = "btn-preset";
        btn.textContent = p.label;
        btn.addEventListener("click", () => {
            document.getElementById("chat-input").value = p.query;
            document.getElementById("btn-send-message").click();
        });
        container.appendChild(btn);
    });
}

// --- Document CRUD Operations ---
function deleteDocument(id) {
    if (confirm("Deseja realmente remover este documento da base de conhecimento?")) {
        documents = documents.filter(doc => doc.id !== id);
        saveDocsToStorage();
        renderDocsList();
        updateStatsUI();
    }
}

function addNewDocument(title, dept, access, content) {
    const newDoc = {
        id: "doc-" + Date.now(),
        title,
        dept,
        access,
        content
    };
    
    documents.push(newDoc);
    saveDocsToStorage();
    renderDocsList();
    updateStatsUI();
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // User Role radios
    const radioLabels = document.querySelectorAll(".user-option");
    radioLabels.forEach(label => {
        label.addEventListener("click", () => {
            radioLabels.forEach(l => l.classList.remove("active"));
            label.classList.add("active");
            currentUserRole = label.querySelector("input").value;
        });
    });

    // Doc Search
    document.getElementById("doc-search").addEventListener("input", (e) => {
        renderDocsList(e.target.value);
    });

    // Add Doc Modal toggle
    const modal = document.getElementById("add-doc-modal");
    document.getElementById("btn-add-doc").addEventListener("click", () => {
        modal.classList.add("active");
    });
    
    document.getElementById("modal-close-btn").addEventListener("click", () => {
        modal.classList.remove("active");
    });
    
    document.getElementById("btn-cancel-doc").addEventListener("click", () => {
        modal.classList.remove("active");
    });

    // Add Doc Form submit
    document.getElementById("add-doc-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("doc-title").value;
        const dept = document.getElementById("doc-dept").value;
        const access = document.getElementById("doc-access").value;
        const content = document.getElementById("doc-content").value;
        
        addNewDocument(title, dept, access, content);
        
        // Reset form & close modal
        e.target.reset();
        modal.classList.remove("active");
    });

    // Clear Inspector
    document.getElementById("btn-clear-inspector").addEventListener("click", () => {
        document.getElementById("inspector-empty").style.display = "flex";
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step-${i}`).style.display = "none";
        }
    });

    // Chat submit
    document.getElementById("chat-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("chat-input");
        const query = input.value.trim();
        if (!query) return;

        input.value = "";
        handleUserQuery(query);
    });
}

// --- View Document Details Modal (Extra utility for UX) ---
function openViewDocModal(doc) {
    const modal = document.createElement("div");
    modal.className = "modal active";
    
    let securityClass = "badge-public";
    let securityLabel = "Público";
    if (doc.access === "HR Only") {
        securityClass = "badge-hr";
        securityLabel = "Acesso RH";
    } else if (doc.access === "Confidential") {
        securityClass = "badge-confidential";
        securityLabel = "Confidencial";
    }

    modal.innerHTML = `
        <div class="modal-content" style="width: 500px;">
            <div class="modal-header">
                <h2>Visualizar Documento</h2>
                <button class="modal-close" id="view-modal-close">&times;</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                <h3 style="font-family: var(--font-display); font-size: 1.1rem;">${doc.title}</h3>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span class="badge badge-public" style="background: rgba(255,255,255,0.05); color:#fff; border: 1px solid var(--border)">Dept: ${doc.dept}</span>
                    <span class="badge ${securityClass}">${securityLabel}</span>
                </div>
                <div style="background: rgba(0,0,0,0.2); padding: 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.82rem; line-height: 1.5; color: var(--text-main); white-space: pre-wrap;">${doc.content}</div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector("#view-modal-close");
    const closeModal = () => {
        modal.classList.remove("active");
        setTimeout(() => modal.remove(), 300);
    };
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
}

// --- RAG Processing Engine (Simulated Embeddings & Matcher) ---
function tokeniseAndClean(text) {
    return text.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 1 && !STOPWORDS.has(word));
}

function calculateMatchScore(queryTokens, docText) {
    const docTokens = tokeniseAndClean(docText);
    if (docTokens.length === 0 || queryTokens.length === 0) return 0;

    let matchCount = 0;
    // Calculate overlap
    queryTokens.forEach(qToken => {
        if (docTokens.includes(qToken)) {
            matchCount += 1;
        }
    });

    // Score is proportional to matched terms
    return parseFloat((matchCount / queryTokens.length).toFixed(3));
}

// Check RBAC Permissions
function checkAccessPermission(docAccess, userRole) {
    // Permission matrix
    if (docAccess === "Public") return true;
    if (docAccess === "HR Only") {
        return userRole === "hr_manager" || userRole === "director";
    }
    if (docAccess === "Confidential") {
        return userRole === "director";
    }
    return false;
}

// --- Chat & Inspector Workflow ---
function handleUserQuery(query) {
    // 1. Insert User bubble in Chat
    appendChatMessage("user", query);
    
    // Increment query count
    queryCount++;
    updateStatsUI();

    // 2. Insert bot typing indicator
    const typingIndicator = appendTypingIndicator();
    
    // 3. Clear and show Inspector
    document.getElementById("inspector-empty").style.display = "none";
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`step-${i}`).style.display = "none";
    }

    // Process matching logic immediately
    const queryTokens = tokeniseAndClean(query);
    
    // Simulate Vector database retrieval evaluation
    const retrievalEvaluations = documents.map(doc => {
        const score = calculateMatchScore(queryTokens, doc.content + " " + doc.title);
        const authorized = checkAccessPermission(doc.access, currentUserRole);
        return {
            id: doc.id,
            title: doc.title,
            access: doc.access,
            score,
            authorized
        };
    }).sort((a, b) => b.score - a.score); // Sort by relevancy

    // Select the best match (or matches above threshold)
    const matches = retrievalEvaluations.filter(evalDoc => evalDoc.score > 0);
    const primaryMatch = matches.length > 0 ? matches[0] : null;

    let isBlockedAttempt = false;
    let finalAuthorizedContext = "";
    let finalResponseText = "";
    let finalCitations = [];

    if (primaryMatch) {
        if (primaryMatch.authorized) {
            // Find full doc
            const fullDoc = documents.find(d => d.id === primaryMatch.id);
            finalAuthorizedContext = fullDoc.content;
            finalCitations.push({ id: fullDoc.id, title: fullDoc.title });
            
            // Try to fetch custom response or generate from tokens
            finalResponseText = generateResponseText(query, fullDoc);
        } else {
            isBlockedAttempt = true;
            blockedCount++;
            updateStatsUI();
            
            finalResponseText = `Acesso Negado. Desculpe, mas as regras de segurança corporativa (LGPD/RBAC) não permitem que colaboradores com o perfil de **${getUserRoleLabel(currentUserRole)}** acessem informações contidas no documento restrito *" ${primaryMatch.title} "*.`;
        }
    } else {
        // No match found
        finalResponseText = "Não encontrei informações nos manuais da empresa sobre isso. Por favor, reformule sua pergunta ou verifique se o documento correspondente está indexado na base de dados.";
    }

    // --- STEP-BY-STEP RUN OF VISUAL INSPECTOR (with timeouts to simulate pipeline) ---
    
    // Step 1: Embedding Vector Visualization
    setTimeout(() => {
        const step1 = document.getElementById("step-1");
        step1.style.display = "flex";
        
        // Generate random vector array
        const vectorValues = Array.from({ length: 12 }, () => (Math.random() * 2 - 1).toFixed(4));
        document.getElementById("step1-vector").textContent = `[ ${vectorValues.join(", ")}, ... ]`;
        
        step1.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 400);

    // Step 2: Vector Search & Access Control
    setTimeout(() => {
        const step2 = document.getElementById("step-2");
        step2.style.display = "flex";
        
        const resultsContainer = document.getElementById("step2-results");
        resultsContainer.innerHTML = "";
        
        retrievalEvaluations.slice(0, 4).forEach(item => {
            const row = document.createElement("div");
            row.className = "retrieval-item";
            
            let statusBadge = "";
            if (item.score > 0) {
                if (item.authorized) {
                    statusBadge = `<span class="status-badge allowed">AUTORIZADO</span>`;
                } else {
                    statusBadge = `<span class="status-badge blocked">BLOQUEADO</span>`;
                }
            } else {
                statusBadge = `<span class="status-badge" style="color:var(--text-dark)">IGNORADO</span>`;
            }

            const scoreClass = item.score > 0 ? "match" : "low";

            row.innerHTML = `
                <div class="retrieval-item-info">
                    <span class="retrieval-item-title">${item.title}</span>
                    <span class="retrieval-item-details">Classe: ${item.access} | Score Semântico: <strong class="score-tag ${scoreClass}">${item.score}</strong></span>
                </div>
                <div class="retrieval-item-status">
                    ${statusBadge}
                </div>
            `;
            resultsContainer.appendChild(row);
        });

        step2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1000);

    // Step 3: Prompt Construction
    setTimeout(() => {
        const step3 = document.getElementById("step-3");
        step3.style.display = "flex";
        
        const promptContent = document.getElementById("step3-prompt-content");
        
        if (primaryMatch && primaryMatch.authorized) {
            promptContent.textContent = `SYSTEM INSTRUCTION: Você é o assistente inteligente corporativo da empresa. Responda à pergunta do usuário de forma amigável e concisa, baseando-se EXCLUSIVAMENTE nas fontes fornecidas abaixo. Se a resposta não estiver nas fontes, diga que não sabe.

CONTEXT DATA:
[Documento: ${primaryMatch.title}]
"${finalAuthorizedContext}"

USER QUESTION:
"${query}"

ASSISTANT RESPONSE:`;
        } else if (isBlockedAttempt) {
            promptContent.textContent = `SYSTEM INSTRUCTION: O usuário está tentando acessar uma informação para a qual não possui credenciais suficientes.
DOCUMENTO ALVO: "${primaryMatch.title}" (Requer nível: ${primaryMatch.access})
PERFIL USUÁRIO: "${currentUserRole}"

Gere uma mensagem amigável explicando o bloqueio de segurança corporativa.`;
        } else {
            promptContent.textContent = `SYSTEM INSTRUCTION: Responda que não encontrou informações na base de dados para a pergunta: "${query}".`;
        }

        step3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1600);

    // Step 4: Generation & Answer Delivery
    setTimeout(() => {
        const step4 = document.getElementById("step-4");
        step4.style.display = "flex";
        
        const responsePreview = document.getElementById("step4-llm-response");
        responsePreview.textContent = finalResponseText;
        
        // Remove typing indicator from Chat
        typingIndicator.remove();
        
        // Append response to Chat
        appendChatMessage("bot", finalResponseText, finalCitations);
        
        step4.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 2400);
}

// --- Text Synthesis Engine (Dynamic fallback generator) ---
function generateResponseText(query, doc) {
    // Check if we have preset high-quality replies
    const cleanedQuery = query.toLowerCase();
    for (const key in PRESET_ANSWERS) {
        if (cleanedQuery.includes(key) && PRESET_ANSWERS[key].docId === doc.id) {
            return PRESET_ANSWERS[key].text;
        }
    }
    
    // Dynamic sentence matcher if it's a custom text uploaded by the user!
    const sentences = doc.content.split(/[.!?]\s+/);
    const queryTokens = tokeniseAndClean(query);
    
    let bestSentences = [];
    sentences.forEach(sentence => {
        const score = calculateMatchScore(queryTokens, sentence);
        if (score > 0) {
            bestSentences.push({ text: sentence, score });
        }
    });
    
    bestSentences.sort((a, b) => b.score - a.score);
    
    if (bestSentences.length > 0) {
        const combinedText = bestSentences.slice(0, 2).map(s => s.text).join(". ") + ".";
        return `Com base nas informações do documento **${doc.title}**, foi localizado o seguinte trecho relevante:\n\n*"${combinedText}"*`;
    }
    
    // Default fallback
    return `De acordo com o documento **${doc.title}**:\n\n${doc.content}`;
}

// --- Chat DOM Helpers ---
function appendChatMessage(sender, text, citations = []) {
    const container = document.getElementById("chat-messages-container");
    const message = document.createElement("div");
    message.className = `message ${sender}-message`;
    
    let avatarIcon = "";
    if (sender === "user") {
        avatarIcon = `<i data-lucide="user"></i>`;
    } else {
        avatarIcon = `<i data-lucide="bot"></i>`;
    }
    
    let citationHTML = "";
    if (citations && citations.length > 0) {
        citationHTML = `
            <div class="message-citations">
                ${citations.map(c => `
                    <a href="#" class="citation-tag" onclick="return false;">
                        <i data-lucide="file-text"></i>
                        <span>${c.title}</span>
                    </a>
                `).join("")}
            </div>
        `;
    }

    message.innerHTML = `
        <div class="message-avatar">
            ${avatarIcon}
        </div>
        <div class="message-content">
            <p>${text.replace(/\n/g, "<br>")}</p>
            ${citationHTML}
        </div>
    `;

    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
    lucide.createIcons();
    
    return message;
}

function appendTypingIndicator() {
    const container = document.getElementById("chat-messages-container");
    const indicator = document.createElement("div");
    indicator.className = "typing-indicator";
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
    return indicator;
}

function getUserRoleLabel(role) {
    switch (role) {
        case "employee_sales": return "Analista de Vendas (Colaborador)";
        case "hr_manager": return "Gerente de RH";
        case "director": return "Diretor C-Level";
        default: return "Usuário Comum";
    }
}
