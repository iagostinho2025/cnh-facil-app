let indiceAtual = 0;
let listaQuestoes = [];
let pontos = 0;
let tempoRestante = 0;
let intervaloRelogio = null;

// Variável nova para guardar o nome do modo (ex: "Simulado", "Desafio", "Estudo: Mecânica")
let modoAtualLabel = "Simulado"; 

// Elementos DOM
const elContainer = document.getElementById('container-quiz');
const elOpcoes = document.getElementById('opcoes');
const elFeedback = document.getElementById('feedback');
const elTimer = document.getElementById('timer');
const elResultado = document.getElementById('tela-resultado');

export function iniciarQuiz(questoes, config = {}) {
    // Configuração Padrão
    const cfg = {
        modoSimulado: true, 
        qtdQuestoes: 30, 
        tempoMinutos: 40,
        modoLabel: "Simulado", // Valor padrão novo
        ...config
    };

    // Guarda o nome do modo para usar no final
    modoAtualLabel = cfg.modoLabel;

    // Preparar Questões
    let embaralhada = questoes.sort(() => Math.random() - 0.5);
    
    if (cfg.modoSimulado) {
        // Pega X questões
        const qtd = Math.min(cfg.qtdQuestoes, embaralhada.length);
        listaQuestoes = embaralhada.slice(0, qtd);
    } else {
        // Pega todas (Modo Estudo)
        listaQuestoes = embaralhada;
    }

    if(listaQuestoes.length === 0) { alert("Sem questões!"); return; }

    // Reset Variáveis
    indiceAtual = 0;
    pontos = 0;

    // Configurar Timer
    if (cfg.tempoMinutos > 0) {
        tempoRestante = cfg.tempoMinutos * 60;
        iniciarRelogio();
        elTimer.parentElement.style.display = 'flex'; 
    } else {
        clearInterval(intervaloRelogio);
        elTimer.parentElement.style.display = 'none'; 
    }

    // Mostrar Tela
    document.getElementById('tela-resultado').classList.add('oculto');
    elContainer.classList.remove('oculto');
    mostrarQuestao();

    // Botões de Controle
    document.getElementById('btn-proxima').onclick = proximaQuestao;
    document.getElementById('btn-reiniciar').onclick = () => window.location.reload();
    
    const btnSair = document.getElementById('btn-sair-quiz');
    btnSair.onclick = () => { if(confirm("Sair do simulado?")) window.location.reload(); };
}

function mostrarQuestao() {
    const q = listaQuestoes[indiceAtual];
    
    // Limpeza
    elOpcoes.innerHTML = '';
    elFeedback.classList.add('oculto');
    document.getElementById('num-atual').textContent = indiceAtual + 1;
    document.getElementById('categoria-tag').textContent = q.categoria;
    
    // Pergunta e Imagem
    const elPerg = document.getElementById('pergunta');
    elPerg.textContent = q.enunciado;
    
    const imgAntiga = document.getElementById('imagem-quiz');
    if (imgAntiga) imgAntiga.remove();
    
    if (q.imagem) {
        const img = document.createElement('img');
        img.id = 'imagem-quiz';
        img.src = './assets/images/' + q.imagem;
        elPerg.parentNode.insertBefore(img, elPerg.nextSibling);
    }

    // Opções
    q.alternativas.forEach((texto, idx) => {
        const btn = document.createElement('button');
        btn.className = 'botao-opcao';
        btn.textContent = texto;
        btn.onclick = () => verificarResposta(idx, q.correta);
        elOpcoes.appendChild(btn);
    });
}

function verificarResposta(idxEscolha, idxCorreto) {
    const btns = elOpcoes.querySelectorAll('button');
    btns.forEach(b => b.disabled = true);

    if (idxEscolha === idxCorreto) {
        btns[idxEscolha].classList.add('correto');
        document.getElementById('titulo-feedback').textContent = "✅ Correto!";
        document.getElementById('titulo-feedback').style.color = "var(--success)";
        pontos++;
    } else {
        btns[idxEscolha].classList.add('errado');
        btns[idxCorreto].classList.add('correto');
        document.getElementById('titulo-feedback').textContent = "❌ Incorreto";
        document.getElementById('titulo-feedback').style.color = "var(--error)";
    }

    document.getElementById('texto-explicacao').textContent = listaQuestoes[indiceAtual].explicacao;
    elFeedback.classList.remove('oculto');
}

function proximaQuestao() {
    if (indiceAtual < listaQuestoes.length - 1) {
        indiceAtual++;
        mostrarQuestao();
    } else {
        finalizarQuiz();
    }
}

function iniciarRelogio() {
    atualizarDisplay();
    if(intervaloRelogio) clearInterval(intervaloRelogio);
    intervaloRelogio = setInterval(() => {
        tempoRestante--;
        atualizarDisplay();
        if (tempoRestante <= 0) {
            clearInterval(intervaloRelogio);
            finalizarQuiz(true);
        }
    }, 1000);
}

function atualizarDisplay() {
    const min = Math.floor(tempoRestante / 60).toString().padStart(2, '0');
    const seg = (tempoRestante % 60).toString().padStart(2, '0');
    elTimer.textContent = `${min}:${seg}`;
    if (tempoRestante < 60) elTimer.classList.add('perigo');
    else elTimer.classList.remove('perigo');
}

function finalizarQuiz(timeout = false) {
    clearInterval(intervaloRelogio);
    elContainer.classList.add('oculto');
    elResultado.classList.remove('oculto');

    const total = listaQuestoes.length;
    const perc = (pontos / total) * 100;
    const msg = document.getElementById('mensagem-final');

    document.getElementById('pontuacao-final').textContent = pontos;
    document.getElementById('total-questoes').textContent = total;

    let aprovado = false;
    if (timeout) {
        msg.textContent = "⏰ Tempo Esgotado!";
        msg.style.color = "var(--error)";
    } else if (perc >= 70) {
        msg.textContent = "PARABÉNS! Aprovado! 🚗💨";
        msg.style.color = "var(--success)";
        aprovado = true;
    } else {
        msg.textContent = "Reprovado. Estude mais! 🛑";
        msg.style.color = "var(--error)";
    }

    salvarHistorico(pontos, total, aprovado);
}

function salvarHistorico(pts, tot, apr) {
    const item = {
        data: new Date().toLocaleDateString('pt-BR'),
        // AQUI ESTÁ A CORREÇÃO: Usa o nome real do modo
        modo: modoAtualLabel, 
        pontos: pts,
        total: tot,
        aprovado: apr
    };
    const hist = JSON.parse(localStorage.getItem('cnh_facil_historico_v1') || '[]');
    hist.unshift(item);
    localStorage.setItem('cnh_facil_historico_v1', JSON.stringify(hist));
}