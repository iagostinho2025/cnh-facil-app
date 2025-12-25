import { iniciarQuiz } from './modules/quiz.js';

// --- CONFIGURAÇÃO: TEXTOS DE BRIEFING ---
const DESCRICOES_TEMAS = {
    "Legislação": { icon: "⚖️", texto: "Regras do CTB, infrações, penalidades e deveres do condutor." },
    "Direção Defensiva": { icon: "🛡️", texto: "Técnicas para antecipar riscos e evitar acidentes no trânsito." },
    "Sinalização": { icon: "🛑", texto: "Placas de regulamentação, advertência e sinais luminosos." },
    "Mecânica Básica": { icon: "🔧", texto: "Funcionamento do veículo, manutenção preventiva e painel." },
    "Primeiros Socorros": { icon: "🚑", texto: "Como agir corretamente em caso de acidentes com vítimas." },
    "Meio Ambiente": { icon: "🌳", texto: "Condução econômica e preservação do meio ambiente." },
    "Cidadania": { icon: "🤝", texto: "Convívio social e respeito no trânsito." }
};

// --- ELEMENTOS DOM (Telas) ---
const telas = {
    inicial: document.getElementById('tela-inicial'),
    introSimulado: document.getElementById('tela-intro-simulado'),
    temas: document.getElementById('tela-temas'),
    briefing: document.getElementById('tela-briefing'),
    desafioSetup: document.getElementById('tela-desafio-setup'),
    historico: document.getElementById('tela-historico'),
    privacidade: document.getElementById('tela-privacidade'),
    headerQuiz: document.getElementById('header-quiz'),
    containerQuiz: document.getElementById('container-quiz'),
    resultado: document.getElementById('tela-resultado')
};

// --- BOTÕES ---
const btnSimulado = document.getElementById('btn-simulado');
const btnTemas = document.getElementById('btn-temas');
const btnHistorico = document.getElementById('btn-historico');
const btnModoDesafio = document.getElementById('btn-modo-desafio');
const btnAbrirPrivacidade = document.getElementById('btn-abrir-privacidade');

// Botões de Voltar
const btnVoltarIntroSimulado = document.getElementById('btn-voltar-intro-simulado');
const btnVoltarTemas = document.getElementById('btn-voltar-temas');
const btnVoltarBriefing = document.getElementById('btn-voltar-briefing');
const btnVoltarDesafio = document.getElementById('btn-voltar-desafio');
const btnVoltarHistorico = document.getElementById('btn-voltar-historico');
const btnVoltarPrivacidade = document.getElementById('btn-voltar-privacidade');

// Botões de Ação
const btnIniciarSimuladoReal = document.getElementById('btn-iniciar-simulado-real');
const btnIniciarTemaFocado = document.getElementById('btn-iniciar-tema-focado');
const btnIniciarDesafioCustom = document.getElementById('btn-iniciar-desafio-custom');

// <--- NOVO: BOTÃO SAIR DO QUIZ (GLOBAL) --->
const btnSairQuiz = document.getElementById('btn-sair-quiz'); 

// Setup do Desafio
const selectTema = document.getElementById('setup-tema');

// Variáveis de Estado
let bancoDeQuestoes = [];
let temaSelecionadoTemp = null;
let desafioQtd = 30;
let desafioTempo = 40;

// --- INICIALIZAÇÃO ---
async function init() {
    try {
        const resposta = await fetch('./data/questoes.json');
        bancoDeQuestoes = await resposta.json();
        console.log("Banco carregado: " + bancoDeQuestoes.length);

        // Preenche Select do Desafio
        const temasUnicos = [...new Set(bancoDeQuestoes.map(q => q.categoria))];
        temasUnicos.forEach(tema => {
            const option = document.createElement('option');
            option.value = tema;
            option.textContent = tema;
            selectTema.appendChild(option);
        });

        setupEventos();
        
        setupChips('setup-qtd-container', val => desafioQtd = parseInt(val));
        setupChips('setup-tempo-container', val => desafioTempo = parseInt(val));

    } catch (erro) {
        console.error(erro);
        alert("Erro ao carregar dados.");
    }
}

function setupEventos() {
    // 1. MENU: SIMULADO
    btnSimulado.addEventListener('click', () => {
        esconderTelas();
        telas.introSimulado.classList.remove('oculto');
    });

    btnIniciarSimuladoReal.addEventListener('click', () => {
        esconderTelas();
        telas.headerQuiz.classList.remove('oculto');
        iniciarQuiz(bancoDeQuestoes, { 
            modoSimulado: true, 
            qtdQuestoes: 30, 
            tempoMinutos: 40,
            modoLabel: "Simulado" 
        });
    });

    // 2. MENU: TEMAS
    btnTemas.addEventListener('click', () => {
        carregarListaDeTemas();
        esconderTelas();
        telas.temas.classList.remove('oculto');
    });

    // 3. MENU: DESAFIO
    btnModoDesafio.addEventListener('click', () => {
        esconderTelas();
        telas.desafioSetup.classList.remove('oculto');
    });

    // 4. MENU: HISTÓRICO
    btnHistorico.addEventListener('click', () => {
        carregarHistorico();
        esconderTelas();
        telas.historico.classList.remove('oculto');
    });

    // 5. RODAPÉ: PRIVACIDADE
    btnAbrirPrivacidade.addEventListener('click', () => {
        esconderTelas();
        telas.privacidade.classList.remove('oculto');
    });

    // --- AÇÕES INTERNAS ---
    
    // Iniciar Quiz por TEMA
    btnIniciarTemaFocado.onclick = () => {
        if (temaSelecionadoTemp) {
            const questoesDoTema = bancoDeQuestoes.filter(q => q.categoria === temaSelecionadoTemp);
            esconderTelas();
            telas.headerQuiz.classList.remove('oculto'); // <--- Garante que o Header (e o botão sair) apareçam
            
            iniciarQuiz(questoesDoTema, { 
                modoSimulado: false, 
                tempoMinutos: 0,
                modoLabel: "Estudo: " + temaSelecionadoTemp 
            }); 
        }
    };

    // Iniciar Quiz DESAFIO
    btnIniciarDesafioCustom.onclick = () => {
        const temaEscolhido = selectTema.value;
        let pool = (temaEscolhido === 'todos') ? bancoDeQuestoes : bancoDeQuestoes.filter(q => q.categoria === temaEscolhido);
        
        esconderTelas();
        telas.headerQuiz.classList.remove('oculto');
        
        iniciarQuiz(pool, { 
            modoSimulado: true, 
            qtdQuestoes: desafioQtd, 
            tempoMinutos: desafioTempo,
            modoLabel: "Desafio"
        });
    };

    // <--- NOVO: LÓGICA DO BOTÃO SAIR (FUNCIONAL EM TODOS OS MODOS) --->
    btnSairQuiz.onclick = () => {
        if (confirm("Tem certeza que deseja sair? Seu progresso atual será perdido.")) {
            // A forma mais segura de limpar o quiz (timer, variáveis) é recarregar
            window.location.reload(); 
        }
    };

    // --- BOTÕES VOLTAR (MENUS) ---
    btnVoltarIntroSimulado.onclick = voltarMenu;
    btnVoltarTemas.onclick = voltarMenu;
    btnVoltarDesafio.onclick = voltarMenu;
    btnVoltarHistorico.onclick = voltarMenu;
    btnVoltarPrivacidade.onclick = voltarMenu;
    
    btnVoltarBriefing.onclick = () => { 
        esconderTelas(); 
        telas.temas.classList.remove('oculto'); 
    };
}

// --- FUNÇÕES AUXILIARES ---

function esconderTelas() {
    Object.values(telas).forEach(el => el.classList.add('oculto'));
}

function voltarMenu() {
    esconderTelas();
    telas.inicial.classList.remove('oculto');
}

function carregarListaDeTemas() {
    const container = document.getElementById('lista-temas');
    container.innerHTML = '';
    const temas = [...new Set(bancoDeQuestoes.map(q => q.categoria))];

    temas.forEach(tema => {
        const btn = document.createElement('button');
        btn.className = 'btn-tema-escolha';
        const qtd = bancoDeQuestoes.filter(q => q.categoria === tema).length;
        const info = DESCRICOES_TEMAS[tema] || { icon: '📘' };
        
        btn.innerHTML = `<span>${info.icon} ${tema}</span> <small>${qtd} questões</small>`;
        btn.onclick = () => abrirBriefing(tema, qtd, info);
        container.appendChild(btn);
    });
}

function abrirBriefing(tema, qtd, info) {
    temaSelecionadoTemp = tema;
    document.getElementById('briefing-icon').textContent = info.icon;
    document.getElementById('briefing-titulo').textContent = tema;
    document.getElementById('briefing-desc').textContent = info.texto || "Estude este tema.";
    document.getElementById('briefing-qtd').textContent = qtd + " questões";
    
    esconderTelas();
    telas.briefing.classList.remove('oculto');
}

function carregarHistorico() {
    const container = document.getElementById('lista-historico');
    const hist = JSON.parse(localStorage.getItem('cnh_facil_historico_v1') || '[]');
    container.innerHTML = '';

    if (hist.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; margin-top:20px;">Nenhum simulado realizado.</p>';
        return;
    }

    hist.forEach(item => {
        const div = document.createElement('div');
        div.className = `item-historico ${item.aprovado ? 'aprovado' : 'reprovado'}`;
        const modoDisplay = item.modo || "Simulado";
        
        div.innerHTML = `
            <div>
                <div class="nota-historico">${item.pontos}/${item.total}</div>
                <div class="data-historico">${item.data} • ${modoDisplay}</div>
            </div>
            <div class="icone-status">${item.aprovado ? '🤩' : '🤔'}</div>
        `;
        container.appendChild(div);
    });
}

function setupChips(id, callback) {
    const btns = document.querySelectorAll(`#${id} .chip-option`);
    btns.forEach(btn => {
        btn.onclick = () => {
            btns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            callback(btn.dataset.value);
        };
    });
}

init();