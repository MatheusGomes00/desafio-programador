import fs from "fs";
import pdf from "pdf-parse-new";

export async function extrairRegistrosPonto(caminhoPDF) {
    try {
        const texto = await recuperarTexto(caminhoPDF);
        const linhasClassificadas = recuperarLinhas(texto);
        const registros = gerarRegistros(linhasClassificadas);
        //console.log(linhasClassificadas);
        return registros;
    } catch (erro) {
        throw new Error("\n\nErro ao extrair registros do pdf.")
    }
}

export async function recuperarTexto(caminhoPDF) {
    const dataBuffer = fs.readFileSync(caminhoPDF);
    const data = await pdf(dataBuffer);
    return data.text;
}

function recuperarLinhas(texto) {
    const linhas = texto.split("\n");
    const linhasClassificadas = linhas
        .filter((linha) => /^Mês\/Ano/.test(linha) || /^\d{2}\s/.test(linha))
        .map((linha) => {
            if (/^Mês\/Ano/.test(linha)) {
                return {tipo: "cabecalho", conteudo: linha};
            }
            if (/\d{2}:\d{2}/.test(linha)) {
                return {tipo: "diaComHorario", conteudo: linha}
            } else {
                return {tipo: "diaSemHorario", conteudo: linha}
            }
        });
    return linhasClassificadas;
}

function gerarRegistros(linhasClassificadas) {
    let mesAtual = null;
    let anoAtual = null;
    const registros = [];

    for (const item of linhasClassificadas) {
        const linha = item.conteudo;
        if (item.tipo === "cabecalho") {
            const match = linha.match(/Mês\/Ano:\s*(\d{2})\/(\d{4})/);
            if (match) {
                mesAtual = match[1];
                anoAtual = match[2];
            }
            continue;
        }
        if (item.tipo === "diaSemHorario") {
            const matchDia = linha.match(/^(\d{2})\s/);
            if (!matchDia || !mesAtual || !anoAtual) continue;

            const dia = matchDia[1];
            const dataCompleta = `${dia}/${mesAtual}/${anoAtual}`;
            registros.push({
                Data: dataCompleta,
                Entrada1: "",
                Saida1: "",
                Entrada2: "",
                Saida2: ""
            });
            continue
        }
        if(item.tipo === "diaComHorario") {
            const matchDia = linha.match(/^(\d{2})\s/);
            if (!matchDia || !mesAtual || !anoAtual) continue;

            const dia = matchDia[1];
            const dataCompleta = `${dia}/${mesAtual}/${anoAtual}`;

            const horarios = (linha.match(/\d{2}:\d{2}/g) || [])
                .map((horario) => {
                    const [hh, mm] = horario.split(":");
                    return { 
                        horario,
                        minutos: parseInt(hh) * 60 + parseInt(mm)};
                })
                .sort((a, b) => a.minutos - b.minutos)
                .map((h) => h.horario);

            const [entrada1, saida1, entrada2, saida2] = [
                horarios[0] || "",
                horarios[1] || "",
                horarios[2] || "",
                horarios[3] || "",
            ];
            registros.push({
                Data: dataCompleta,
                Entrada1: entrada1,
                Saida1: saida1,
                Entrada2: entrada2,
                Saida2: saida2,
            });
        }
    }
    return registros;
}