let indiceAtual = 0;
let listaQuestoes = [];
let pontos = 0;
let tempoRestante = 0;
let intervaloRelogio = null;

// Variável nova para guardar o nome do modo
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
        modoLabel: "Simulado",
        ...config
    };

    modoAtualLabel = cfg.modoLabel;

    // Preparar Questões
    let embaralhada = questoes.sort(() => Math.random() - 0.5);
    
    if (cfg.modoSimulado) {
        const qtd = Math.min(cfg.qtdQuestoes, embaralhada.length);
        listaQuestoes = embaralhada.slice(0, qtd);
    } else {
        listaQuestoes = embaralhada;
    }

    if(listaQuestoes.length === 0) { alert("Sem questões!"); return; }

    // Reset Variáveis
    indiceAtual = 0;
    pontos = 0;

    // --- CORREÇÃO DO BOTÃO SAIR (Mantendo o layout) ---
    // Garante que a barra superior (pai do timer) esteja visível
    if (elTimer.parentElement) {
        elTimer.parentElement.style.display = 'flex';
    }

    // Configurar Timer
    if (cfg.tempoMinutos > 0) {
        tempoRestante = cfg.tempoMinutos * 60;
        iniciarRelogio();
        elTimer.style.display = 'block'; // Mostra o relógio
    } else {
        clearInterval(intervaloRelogio);
        elTimer.style.display = 'none'; // Esconde APENAS o relógio, mantém o botão Sair
    }

    // Mostrar Tela
    document.getElementById('tela-resultado').classList.add('oculto');
    elContainer.classList.remove('oculto');
    mostrarQuestao();

    // Botões de Controle (Evita duplicar eventos)
    const btnProxima = document.getElementById('btn-proxima');
    const novoBtnProxima = btnProxima.cloneNode(true);
    btnProxima.parentNode.replaceChild(novoBtnProxima, btnProxima);
    novoBtnProxima.onclick = proximaQuestao;

    document.getElementById('btn-reiniciar').onclick = () => window.location.reload();

    // Compartilhar
    const btnShare = document.getElementById('btn-compartilhar');
    if (btnShare) {
        btnShare.onclick = async () => {
            const shareData = {
                title: 'CNH Fácil',
                text: `Acabei de fazer o simulado CNH Fácil! Acertei ${pontos} de ${listaQuestoes.length} questões. 🚗💨`,
                url: window.location.href
            };
            try {
                if (navigator.share) await navigator.share(shareData);
                else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert("Link copiado!");
                }
            } catch (err) { console.log('Cancelado'); }
        };
    }
    
    // Botão Sair
    const btnSair = document.getElementById('btn-sair-quiz');
    if (btnSair) {
        btnSair.onclick = () => { 
            if(confirm("Tem certeza que deseja sair do simulado?")) window.location.reload(); 
        };
    }
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
        // Se houver classe específica no seu CSS para imagem, ela já será aplicada pelo ID ou tag
        elPerg.parentNode.insertBefore(img, elPerg.nextSibling);
    }

    // Opções
    q.alternativas.forEach((texto, idx) => {
        const btn = document.createElement('button');
        // VOLTEI PARA O NOME ORIGINAL: 'botao-opcao'
        // Assim ele pega o estilo do seu CSS original
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
        // VOLTEI PARA A CLASSE ORIGINAL: 'correto'
        btns[idxEscolha].classList.add('correto');
        
        const tituloFeedback = document.getElementById('titulo-feedback');
        tituloFeedback.textContent = "✅ Correto!";
        tituloFeedback.style.color = "var(--success)"; // Mantendo variável CSS se existir, ou use cor fixa
        pontos++;
    } else {
        // VOLTEI PARA AS CLASSES ORIGINAIS: 'errado' e 'correto'
        btns[idxEscolha].classList.add('errado');
        btns[idxCorreto].classList.add('correto');
        
        const tituloFeedback = document.getElementById('titulo-feedback');
        tituloFeedback.textContent = "❌ Incorreto";
        tituloFeedback.style.color = "var(--error)";
    }

    document.getElementById('texto-explicacao').textContent = listaQuestoes[indiceAtual].explicacao;
    elFeedback.classList.remove('oculto');
    
    // Scroll suave
    elFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    
    if (tempoRestante < 60) elTimer.classList.add('perigo'); // Mantive a classe 'perigo' original se houver
    else elTimer.classList.remove('perigo');
}

function finalizarQuiz(timeout = false) {
    clearInterval(intervaloRelogio);
    // Esconde a barra do topo no final
    if(elTimer.parentElement) elTimer.parentElement.style.display = 'none';

    elContainer.classList.add('oculto');
    elResultado.classList.remove('oculto');

    const total = listaQuestoes.length;
    const perc = total > 0 ? (pontos / total) * 100 : 0;
    const msg = document.getElementById('mensagem-final');

    document.getElementById('pontuacao-final').textContent = pontos;
    document.getElementById('total-questoes').textContent = total;

    let aprovado = false;
    if (timeout) {
        msg.innerHTML = "⏰ <strong>Tempo Esgotado!</strong>";
        msg.style.color = "var(--error)"; // Usei var(--error) que estava no seu código
    } else if (perc >= 70) {
        msg.innerHTML = "🎉 <strong>PARABÉNS! Aprovado!</strong> 🚗💨";
        msg.style.color = "var(--success)";
        aprovado = true;
    } else {
        msg.innerHTML = "😕 <strong>Reprovado.</strong> Continue estudando! 🛑";
        msg.style.color = "var(--error)";
    }

    salvarHistorico(pontos, total, aprovado);
}

function salvarHistorico(pts, tot, apr) {
    const item = {
        data: new Date().toLocaleDateString('pt-BR'),
        modo: modoAtualLabel,
        pontos: pts,
        total: tot,
        aprovado: apr
    };
    const hist = JSON.parse(localStorage.getItem('cnh_facil_historico_v1') || '[]');
    hist.unshift(item);
    if (hist.length > 50) hist.pop();
    localStorage.setItem('cnh_facil_historico_v1', JSON.stringify(hist));
}