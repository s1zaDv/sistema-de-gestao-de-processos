let processos = JSON.parse(localStorage.getItem("processos")) || [];
let processoEmEdicao = null;

const listaProcessos = document.getElementById("listaProcessos");
const formularioArea = document.getElementById("formularioArea");
const mensagemVazia = document.getElementById("mensagemVazia");

function salvarDados() {
    localStorage.setItem("processos", JSON.stringify(processos));
}

function abrirFormulario() {
    formularioArea.classList.remove("escondido");
    document.getElementById("avisoFormulario").innerHTML = "";
}

function fecharFormulario() {
    formularioArea.classList.add("escondido");
    limparFormulario();
}

function limparFormulario() {
    document.getElementById("nome").value = "";
    document.getElementById("responsavel").value = "";
    document.getElementById("setor").value = "";
    document.getElementById("prioridade").value = "Média";
    document.getElementById("prazo").value = "";
    document.getElementById("status").value = "Pendente";
    document.getElementById("descricao").value = "";
    processoEmEdicao = null;
    document.getElementById("tituloFormulario").innerHTML = "Novo processo";
}

function cadastrarOuAtualizar() {
    const nome = document.getElementById("nome").value.trim();
    const responsavel = document.getElementById("responsavel").value.trim();
    const setor = document.getElementById("setor").value.trim();
    const prioridade = document.getElementById("prioridade").value;
    const prazo = document.getElementById("prazo").value;
    const status = document.getElementById("status").value;
    const descricao = document.getElementById("descricao").value.trim();

    if (nome === "" || responsavel === "" || setor === "" || prazo === "") {
        document.getElementById("avisoFormulario").innerHTML = "Preencha nome, responsável, setor e prazo.";
    } else {
        if (processoEmEdicao === null) {
            const novoProcesso = {
                id: Date.now(),
                nome: nome,
                responsavel: responsavel,
                setor: setor,
                prioridade: prioridade,
                prazo: prazo,
                status: status,
                descricao: descricao
            };

            processos.push(novoProcesso);
        } else {
            const processo = processos.find(function(item) {
                return item.id === processoEmEdicao;
            });

            processo.nome = nome;
            processo.responsavel = responsavel;
            processo.setor = setor;
            processo.prioridade = prioridade;
            processo.prazo = prazo;
            processo.status = status;
            processo.descricao = descricao;
        }

        salvarDados();
        fecharFormulario();
        mostrarProcessos();
    }
}

function editarProcesso(id) {
    const processo = processos.find(function(item) {
        return item.id === id;
    });

    if (processo) {
        processoEmEdicao = id;
        document.getElementById("nome").value = processo.nome;
        document.getElementById("responsavel").value = processo.responsavel;
        document.getElementById("setor").value = processo.setor;
        document.getElementById("prioridade").value = processo.prioridade;
        document.getElementById("prazo").value = processo.prazo;
        document.getElementById("status").value = processo.status;
        document.getElementById("descricao").value = processo.descricao;
        document.getElementById("tituloFormulario").innerHTML = "Editar processo";
        abrirFormulario();
    }
}

function excluirProcesso(id) {
    const confirmacao = confirm("Deseja realmente excluir este processo?");

    if (confirmacao) {
        processos = processos.filter(function(item) {
            return item.id !== id;
        });

        salvarDados();
        mostrarProcessos();
    }
}

function mostrarProcessos() {
    const pesquisa = document.getElementById("pesquisa").value.toLowerCase();
    const filtroStatus = document.getElementById("filtroStatus").value;

    const processosFiltrados = processos.filter(function(processo) {
        const texto = processo.nome.toLowerCase() + " " + processo.responsavel.toLowerCase() + " " + processo.setor.toLowerCase();
        const correspondePesquisa = texto.includes(pesquisa);
        const correspondeStatus = filtroStatus === "" || processo.status === filtroStatus;

        return correspondePesquisa && correspondeStatus;
    });

    listaProcessos.innerHTML = "";

    processosFiltrados.forEach(function(processo) {
        const dataAtual = new Date();
        const prazoProcesso = new Date(processo.prazo + "T23:59:59");
        const estaAtrasado = prazoProcesso < dataAtual && processo.status !== "Concluído" && processo.status !== "Cancelado";

        let classeStatus = "pendente";

        if (processo.status === "Em andamento") {
            classeStatus = "andamento";
        } else if (processo.status === "Concluído") {
            classeStatus = "concluido";
        } else if (processo.status === "Cancelado") {
            classeStatus = "cancelado";
        }

        let prazoTexto = processo.prazo.split("-").reverse().join("/");
        if (estaAtrasado) {
            prazoTexto = prazoTexto + " • Atrasado";
        }

        listaProcessos.innerHTML += `
            <tr>
                <td><span class="nome-processo">${processo.nome}</span><span class="detalhe-processo">${processo.descricao}</span></td>
                <td>${processo.responsavel}</td>
                <td>${processo.setor}</td>
                <td>${processo.prioridade}</td>
                <td class="${estaAtrasado ? "atrasado" : ""}">${prazoTexto}</td>
                <td><span class="selo ${classeStatus}">${processo.status}</span></td>
                <td>
                    <button class="acao" type="button" onclick="editarProcesso(${processo.id})">Editar</button>
                    <button class="acao acao-excluir" type="button" onclick="excluirProcesso(${processo.id})">Excluir</button>
                </td>
            </tr>
        `;
    });

    if (processosFiltrados.length === 0) {
        mensagemVazia.style.display = "block";
    } else {
        mensagemVazia.style.display = "none";
    }

    atualizarResumo();
}

function atualizarResumo() {
    const total = processos.length;
    const andamento = processos.filter(function(item) {
        return item.status === "Em andamento";
    }).length;
    const concluidos = processos.filter(function(item) {
        return item.status === "Concluído";
    }).length;

    const atrasados = processos.filter(function(item) {
        const prazoProcesso = new Date(item.prazo + "T23:59:59");
        return prazoProcesso < new Date() && item.status !== "Concluído" && item.status !== "Cancelado";
    }).length;

    document.getElementById("totalProcessos").innerHTML = total;
    document.getElementById("emAndamento").innerHTML = andamento;
    document.getElementById("concluidos").innerHTML = concluidos;
    document.getElementById("atrasados").innerHTML = atrasados;
}

document.getElementById("novoProcesso").addEventListener("click", function() {
    limparFormulario();
    abrirFormulario();
});

document.getElementById("fecharFormulario").addEventListener("click", fecharFormulario);
document.getElementById("cancelarFormulario").addEventListener("click", fecharFormulario);
document.getElementById("salvarProcesso").addEventListener("click", cadastrarOuAtualizar);
document.getElementById("pesquisa").addEventListener("input", mostrarProcessos);
document.getElementById("filtroStatus").addEventListener("change", mostrarProcessos);

mostrarProcessos();
