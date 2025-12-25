let indiceAtual = 0;
let listaQuestoes = [];
let questoesErradas = []; // <--- NOVO: Lista para guardar os erros
let pontos = 0;
let tempoRestante = 0;
let intervaloRelogio = null;

let modoAtualLabel = "Simulado"; 

const elContainer = document.getElementById('container-quiz');
const elOpcoes = document.getElementById('opcoes');
const elFeedback = document.getElementById('feedback');
const elTimer = document.getElementById('timer');
const elResultado = document.getElementById('tela-resultado');

export function iniciarQuiz(questoes, config = {}) {
    const cfg = {
        modoSimulado: true, 
        qtdQuestoes: 30, 
        tempoMinutos: 40,
        modoLabel: "Simulado",
        ...config
    };

    modoAtualLabel = cfg.modoLabel;

    // Se NÃO for revisão de erros, embaralha. Se for revisão, mantém a ordem que veio.
    let listaFinal = [];
    if (cfg.modoLabel.includes("Revisão")) {
        listaFinal = questoes; // Já vem filtrada
    } else {
        let embaralhada = questoes.sort(() => Math.random() - 0.5);
        if (cfg.modoSimulado) {
            const qtd = Math.min(cfg.qtdQuestoes, embaralhada.length);
            listaFinal = embaralhada.slice(0, qtd);
        } else {
            listaFinal = embaralhada;
        }
    }
    
    listaQuestoes = listaFinal;

    if(listaQuestoes.length === 0) { alert("Sem questões!"); return; }

    // Reset Variáveis
    indiceAtual = 0;
    pontos = 0;
    questoesErradas = []; // <--- Zera a lista de erros

    if (elTimer.parentElement) {
        elTimer.parentElement.style.display = 'flex';
    }

    if (cfg.tempoMinutos > 0) {
        tempoRestante = cfg.tempoMinutos * 60;
        iniciarRelogio();
        elTimer.style.display = 'block'; 
    } else {
        clearInterval(intervaloRelogio);
        elTimer.style.display = 'none'; 
    }

    document.getElementById('tela-resultado').classList.add('oculto');
    elContainer.classList.remove('oculto');
    mostrarQuestao();

    const btnProxima = document.getElementById('btn-proxima');
    const novoBtnProxima = btnProxima.cloneNode(true);
    btnProxima.parentNode.replaceChild(novoBtnProxima, btnProxima);
    novoBtnProxima.onclick = proximaQuestao;

    document.getElementById('btn-reiniciar').onclick = () => window.location.reload();

    // Lógica Compartilhar e Sair (mantida igual)
    const btnShare = document.getElementById('btn-compartilhar');
    if (btnShare) {
        btnShare.onclick = async () => { /* ... lógica de share ... */ };
    }
    const btnSair = document.getElementById('btn-sair-quiz');
    if (btnSair) {
        btnSair.onclick = () => { if(confirm("Sair do simulado?")) window.location.reload(); };
    }
}

function mostrarQuestao() {
    const q = listaQuestoes[indiceAtual];
    elOpcoes.innerHTML = '';
    elFeedback.classList.add('oculto');
    document.getElementById('num-atual').textContent = indiceAtual + 1;
    document.getElementById('categoria-tag').textContent = q.categoria;
    
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

    // Embaralha alternativas
    let opcoesMapeadas = q.alternativas.map((texto, index) => {
        return { texto: texto, indexOriginal: index };
    });
    opcoesMapeadas.sort(() => Math.random() - 0.5);

    opcoesMapeadas.forEach((item) => {
        const btn = document.createElement('button');
        btn.className = 'botao-opcao'; 
        btn.textContent = item.texto;
        btn.dataset.originalId = item.indexOriginal;
        btn.onclick = () => verificarResposta(item.indexOriginal, q.correta, btn, q); // Passamos a questão 'q'
        elOpcoes.appendChild(btn);
    });
}

function verificarResposta(indexOriginalEscolha, indexCorreto, btnClicado, questaoObjeto) {
    const btns = elOpcoes.querySelectorAll('button');
    btns.forEach(b => {
        b.disabled = true;
        const idDoBotao = parseInt(b.dataset.originalId);
        if (idDoBotao === indexCorreto) b.classList.add('correto');
    });

    const tituloFeedback = document.getElementById('titulo-feedback');
    
    if (indexOriginalEscolha === indexCorreto) {
        tituloFeedback.textContent = "✅ Correto!";
        tituloFeedback.style.color = "var(--success)"; 
        pontos++;
    } else {
        btnClicado.classList.add('errado');
        tituloFeedback.textContent = "❌ Incorreto";
        tituloFeedback.style.color = "var(--error)";
        
        // <--- SALVA O ERRO PARA O HISTÓRICO
        questoesErradas.push(questaoObjeto);
    }

    document.getElementById('texto-explicacao').textContent = listaQuestoes[indiceAtual].explicacao;
    elFeedback.classList.remove('oculto');
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

function iniciarRelogio() { /* ... igual ... */ 
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

function atualizarDisplay() { /* ... igual ... */ 
    const min = Math.floor(tempoRestante / 60).toString().padStart(2, '0');
    const seg = (tempoRestante % 60).toString().padStart(2, '0');
    elTimer.textContent = `${min}:${seg}`;
    if (tempoRestante < 60) elTimer.classList.add('perigo'); 
    else elTimer.classList.remove('perigo');
}

function finalizarQuiz(timeout = false) {
    clearInterval(intervaloRelogio);
    if(elTimer.parentElement) elTimer.parentElement.style.display = 'none';

    elContainer.classList.add('oculto');
    elResultado.classList.remove('oculto');

    const total = listaQuestoes.length;
    const perc = total > 0 ? (pontos / total) * 100 : 0;
    const msg = document.getElementById('mensagem-final');

    document.getElementById('pontuacao-final').textContent = pontos;
    document.getElementById('total-questoes').textContent = total;

    let aprovado = false;
    // Se for modo revisão, a mensagem é diferente
    if (modoAtualLabel.includes("Revisão")) {
        msg.innerHTML = "📝 <strong>Revisão Concluída!</strong>";
        msg.style.color = "var(--primary)";
        aprovado = true; // Revisão não reprova
    } else if (timeout) {
        msg.innerHTML = "⏰ <strong>Tempo Esgotado!</strong>";
        msg.style.color = "var(--error)";
    } else if (perc >= 70) {
        msg.innerHTML = "🎉 <strong>PARABÉNS! Aprovado!</strong> 🚗💨";
        msg.style.color = "var(--success)";
        aprovado = true;
    } else {
        msg.innerHTML = "😕 <strong>Reprovado.</strong> Continue estudando! 🛑";
        msg.style.color = "var(--error)";
    }

    // Só salva histórico se NÃO for revisão de erros (para não poluir)
    if (!modoAtualLabel.includes("Revisão")) {
        salvarHistorico(pontos, total, aprovado);
    }
}

function salvarHistorico(pts, tot, apr) {
    const item = {
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        modo: modoAtualLabel,
        pontos: pts,
        total: tot,
        aprovado: apr,
        listaErros: questoesErradas // <--- AQUI ESTÁ O OURO! Salvamos os erros.
    };
    const hist = JSON.parse(localStorage.getItem('cnh_facil_historico_v1') || '[]');
    hist.unshift(item);
    if (hist.length > 50) hist.pop();
    localStorage.setItem('cnh_facil_historico_v1', JSON.stringify(hist));
}