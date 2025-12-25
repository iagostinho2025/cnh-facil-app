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

    // Preparar Questões (Embaralha a ordem das perguntas)
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

    // --- CORREÇÃO DO BOTÃO SAIR ---
    if (elTimer.parentElement) {
        elTimer.parentElement.style.display = 'flex';
    }

    // Configurar Timer
    if (cfg.tempoMinutos > 0) {
        tempoRestante = cfg.tempoMinutos * 60;
        iniciarRelogio();
        elTimer.style.display = 'block'; 
    } else {
        clearInterval(intervaloRelogio);
        elTimer.style.display = 'none'; 
    }

    // Mostrar Tela
    document.getElementById('tela-resultado').classList.add('oculto');
    elContainer.classList.remove('oculto');
    mostrarQuestao();

    // Botões de Controle
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
        elPerg.parentNode.insertBefore(img, elPerg.nextSibling);
    }

    // --- A MÁGICA DO EMBARALHAMENTO ACONTECE AQUI ---
    
    // 1. Criamos um array de objetos guardando o texto e o índice original
    // Ex: [{texto: "Resp A", id: 0}, {texto: "Resp B", id: 1}, ...]
    let opcoesMapeadas = q.alternativas.map((texto, index) => {
        return { texto: texto, indexOriginal: index };
    });

    // 2. Misturamos esse array
    opcoesMapeadas.sort(() => Math.random() - 0.5);

    // 3. Criamos os botões baseados nessa mistura
    opcoesMapeadas.forEach((item) => {
        const btn = document.createElement('button');
        btn.className = 'botao-opcao'; // Mantém seu CSS original
        btn.textContent = item.texto;
        
        // Guardamos o ID original no botão para checar depois
        btn.dataset.originalId = item.indexOriginal;

        // Ao clicar, mandamos o ID original (que veio do JSON) para verificar
        btn.onclick = () => verificarResposta(item.indexOriginal, q.correta, btn);
        
        elOpcoes.appendChild(btn);
    });
}

function verificarResposta(indexOriginalEscolha, indexCorreto, btnClicado) {
    // Trava todos os botões
    const btns = elOpcoes.querySelectorAll('button');
    btns.forEach(b => {
        b.disabled = true;
        
        // --- NOVA LÓGICA VISUAL ---
        // Como embaralhamos, não podemos usar o índice do array [i].
        // Temos que olhar o "data-original-id" que guardamos no botão.
        const idDoBotao = parseInt(b.dataset.originalId);

        // Se este botão for a resposta certa (mesmo que não tenha clicado nele), marca de verde
        if (idDoBotao === indexCorreto) {
            b.classList.add('correto');
        }
    });

    // Feedback Visual e Texto
    const tituloFeedback = document.getElementById('titulo-feedback');
    
    if (indexOriginalEscolha === indexCorreto) {
        // O botão clicado já ficou verde pelo loop acima, só atualizamos o texto
        tituloFeedback.textContent = "✅ Correto!";
        tituloFeedback.style.color = "var(--success)"; 
        pontos++;
    } else {
        // Se errou, pinta o clicado de vermelho
        btnClicado.classList.add('errado');
        
        tituloFeedback.textContent = "❌ Incorreto";
        tituloFeedback.style.color = "var(--error)";
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
        msg.style.color = "var(--error)"; 
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
