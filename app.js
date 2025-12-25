import { iniciarQuiz } from './modules/quiz.js';

// Textos de Briefing (Mantido igual)
const DESCRICOES_TEMAS = {
    "Legislação": { icon: "⚖️", texto: "Regras do CTB, infrações, penalidades e deveres do condutor." },
    "Direção Defensiva": { icon: "🛡️", texto: "Técnicas para antecipar riscos e evitar acidentes no trânsito." },
    "Sinalização": { icon: "🛑", texto: "Placas de regulamentação, advertência e sinais luminosos." },
    "Mecânica Básica": { icon: "🔧", texto: "Funcionamento do veículo, manutenção preventiva e painel." },
    "Primeiros Socorros": { icon: "🚑", texto: "Como agir corretamente em caso de acidentes com vítimas." },
    "Meio Ambiente": { icon: "🌳", texto: "Condução econômica e preservação do meio ambiente." },
    "Cidadania": { icon: "🤝", texto: "Convívio social e respeito no trânsito." }
};

// Telas
const telas = {
    inicial: document.getElementById('tela-inicial'),
    introSimulado: document.getElementById('tela-intro-simulado'),
    temas: document.getElementById('tela-temas'),
    briefing: document.getElementById('tela-briefing'),
    desafioSetup: document.getElementById('tela-desafio-setup'),
    historico: document.getElementById('tela-historico'),
    detalhesHistorico: document.getElementById('tela-detalhes-historico'), // <--- NOVO
    privacidade: document.getElementById('tela-privacidade'),
    headerQuiz: document.getElementById('header-quiz'),
    containerQuiz: document.getElementById('container-quiz'),
    resultado: document.getElementById('tela-resultado')
};

// Botões
const btnSimulado = document.getElementById('btn-simulado');
const btnTemas = document.getElementById('btn-temas');
const btnHistorico = document.getElementById('btn-historico');
const btnModoDesafio = document.getElementById('btn-modo-desafio');
const btnAbrirPrivacidade = document.getElementById('btn-abrir-privacidade');

// Botões Voltar
const btnVoltarIntroSimulado = document.getElementById('btn-voltar-intro-simulado');
const btnVoltarTemas = document.getElementById('btn-voltar-temas');
const btnVoltarBriefing = document.getElementById('btn-voltar-briefing');
const btnVoltarDesafio = document.getElementById('btn-voltar-desafio');
const btnVoltarHistorico = document.getElementById('btn-voltar-historico');
const btnVoltarPrivacidade = document.getElementById('btn-voltar-privacidade');
const btnVoltarDetalhes = document.getElementById('btn-voltar-detalhes'); // <--- NOVO

// Ações
const btnIniciarSimuladoReal = document.getElementById('btn-iniciar-simulado-real');
const btnIniciarTemaFocado = document.getElementById('btn-iniciar-tema-focado');
const btnIniciarDesafioCustom = document.getElementById('btn-iniciar-desafio-custom');
const btnSairQuiz = document.getElementById('btn-sair-quiz');
const btnRefazerErros = document.getElementById('btn-refazer-erros'); // <--- NOVO

const selectTema = document.getElementById('setup-tema');
let bancoDeQuestoes = [];
let temaSelecionadoTemp = null;
let desafioQtd = 30;
let desafioTempo = 40;
let errosParaRefazer = []; // <--- Guarda temporariamente para o botão refazer

async function init() {
    try {
        const resposta = await fetch('./data/questoes.json');
        bancoDeQuestoes = await resposta.json();
        
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

    } catch (erro) { console.error(erro); alert("Erro ao carregar dados."); }
}

function setupEventos() {
    // Navegação Básica
    btnSimulado.onclick = () => { esconderTelas(); telas.introSimulado.classList.remove('oculto'); };
    btnTemas.onclick = () => { carregarListaDeTemas(); esconderTelas(); telas.temas.classList.remove('oculto'); };
    btnModoDesafio.onclick = () => { esconderTelas(); telas.desafioSetup.classList.remove('oculto'); };
    btnHistorico.onclick = () => { carregarHistorico(); esconderTelas(); telas.historico.classList.remove('oculto'); };
    btnAbrirPrivacidade.onclick = () => { esconderTelas(); telas.privacidade.classList.remove('oculto'); };

    // Iniciar Quiz
    btnIniciarSimuladoReal.onclick = () => {
        esconderTelas();
        telas.headerQuiz.classList.remove('oculto');
        iniciarQuiz(bancoDeQuestoes, { modoSimulado: true, qtdQuestoes: 30, tempoMinutos: 40, modoLabel: "Simulado" });
    };

    btnIniciarTemaFocado.onclick = () => {
        if (temaSelecionadoTemp) {
            const questoesDoTema = bancoDeQuestoes.filter(q => q.categoria === temaSelecionadoTemp);
            esconderTelas();
            telas.headerQuiz.classList.remove('oculto');
            iniciarQuiz(questoesDoTema, { modoSimulado: false, tempoMinutos: 0, modoLabel: "Estudo: " + temaSelecionadoTemp }); 
        }
    };

    btnIniciarDesafioCustom.onclick = () => {
        const temaEscolhido = selectTema.value;
        let pool = (temaEscolhido === 'todos') ? bancoDeQuestoes : bancoDeQuestoes.filter(q => q.categoria === temaEscolhido);
        esconderTelas();
        telas.headerQuiz.classList.remove('oculto');
        iniciarQuiz(pool, { modoSimulado: true, qtdQuestoes: desafioQtd, tempoMinutos: desafioTempo, modoLabel: "Desafio" });
    };

    // <--- AÇÃO DO BOTÃO REFAZER ERROS --->
    btnRefazerErros.onclick = () => {
        if(errosParaRefazer.length > 0) {
            esconderTelas();
            telas.headerQuiz.classList.remove('oculto');
            iniciarQuiz(errosParaRefazer, { 
                modoSimulado: false, // Sem sortear
                tempoMinutos: 0, // Sem tempo
                modoLabel: "Revisão de Erros" 
            });
        }
    };

    btnSairQuiz.onclick = () => { if(confirm("Sair?")) window.location.reload(); };

    // Voltar
    btnVoltarIntroSimulado.onclick = voltarMenu;
    btnVoltarTemas.onclick = voltarMenu;
    btnVoltarDesafio.onclick = voltarMenu;
    btnVoltarHistorico.onclick = voltarMenu;
    btnVoltarPrivacidade.onclick = voltarMenu;
    btnVoltarBriefing.onclick = () => { esconderTelas(); telas.temas.classList.remove('oculto'); };
    btnVoltarDetalhes.onclick = () => { esconderTelas(); telas.historico.classList.remove('oculto'); }; // Volta pra lista
}

function esconderTelas() { Object.values(telas).forEach(el => el.classList.add('oculto')); }
function voltarMenu() { esconderTelas(); telas.inicial.classList.remove('oculto'); }

// ... (Funções carregarListaDeTemas, abrirBriefing, setupChips mantidas iguais) ...
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

// <--- CARREGAR HISTÓRICO COM CLIQUE --->
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
        div.style.cursor = 'pointer'; // Indica clique
        
        // Formata data e hora se existir
        const dataDisplay = item.hora ? `${item.data} - ${item.hora}` : item.data;
        const modoDisplay = item.modo || "Simulado";

        div.innerHTML = `
            <div>
                <div class="nota-historico">${item.pontos}/${item.total}</div>
                <div class="data-historico">${dataDisplay} • ${modoDisplay}</div>
            </div>
            <div class="icone-status">
                ${item.aprovado ? '🤩' : '🤔'} 
                <span style="font-size:0.7rem; display:block; margin-top:5px;">Ver Detalhes</span>
            </div>
        `;
        
        // CLIQUE NO CARD: Abre detalhes
        div.onclick = () => abrirDetalhesHistorico(item);
        
        container.appendChild(div);
    });
}

// <--- NOVA FUNÇÃO: DETALHES DO HISTÓRICO --->
function abrirDetalhesHistorico(item) {
    const titulo = document.getElementById('detalhe-titulo');
    const nota = document.getElementById('detalhe-nota');
    const lista = document.getElementById('lista-erros-detalhe');
    const btnRefazer = document.getElementById('btn-refazer-erros');
    const msgSemErros = document.getElementById('msg-sem-erros');

    titulo.textContent = `${item.modo || 'Simulado'} - ${item.data}`;
    nota.textContent = `${item.pontos} / ${item.total}`;
    
    // Atualiza a cor da nota
    nota.style.color = item.aprovado ? 'var(--success)' : 'var(--error)';

    lista.innerHTML = '';
    
    // Verifica se tem erros salvos
    if (item.listaErros && item.listaErros.length > 0) {
        errosParaRefazer = item.listaErros;
        msgSemErros.classList.add('oculto');
        btnRefazer.style.display = 'flex'; // Mostra botão
        
        item.listaErros.forEach(erro => {
            const divErro = document.createElement('div');
            divErro.className = 'item-erro-card';
            divErro.innerHTML = `
                <strong style="color: var(--primary); font-size: 0.8rem;">${erro.categoria}</strong>
                <p>${erro.enunciado}</p>
                <div class="resposta-correta">Resposta: ${erro.alternativas[erro.correta]}</div>
            `;
            lista.appendChild(divErro);
        });

    } else {
        errosParaRefazer = [];
        btnRefazer.style.display = 'none'; // Esconde botão
        msgSemErros.classList.remove('oculto');
    }

    esconderTelas();
    telas.detalhesHistorico.classList.remove('oculto');
}

init();