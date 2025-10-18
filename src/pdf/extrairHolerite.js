import fs from "fs";
import pdf from "pdf-parse-new";

export async function extrairRegistrosHolerite(caminhoPDF) {
    const texto = await recuperarTexto(caminhoPDF);
    const linhasFiltradas = recuperarLinhas(texto);
    const registros = extrairBlocos(linhasFiltradas);
    
    //console.log(registros);
    return registros;
}

async function recuperarTexto(caminhoPDF) {
    const dataBuffer = fs.readFileSync(caminhoPDF);
    const data = await pdf(dataBuffer);
    return data.text
            .replace(/\n{2}/g, "\n")
            .trim();
}

function recuperarLinhas(texto) {
    const linhas = texto.split("\n");
    const linhasFiltradas = linhas
            .filter((linha) => {
                return (
                /^\d{2}\/\d{4}$/.test(linha) ||
                /^[\//A-Za-z0-9]{4}\s.+/.test(linha) && !/Base C/.test(linha) ||
                /^(\d{1,3}(\.\d{3})*,\d{2})(\s+\d{1,3}(\.\d{3})*,\d{2})+$/.test(linha)
            )});
            
    return linhasFiltradas;
}

function extrairBlocos(linhasFiltradas) {
    let blocos = [];
    let itensBloco = [];

    for (const linha of linhasFiltradas) {
        if (/^\d{2}\/\d{4}$/.test(linha)){
            blocos.push({data: linha, linhas: itensBloco})
            itensBloco = [];
        } else {
            itensBloco.push(linha);
        }
    }
    let registros = [];
    for (const bloco of blocos) {
        const { data, linhas } = bloco;
        registros.push(gerarRegistros(data, linhas));
    }
    return registros;    
}

function gerarRegistros(data, linhas) {
    let registroMensal = {};
    const [mes, ano] = data.split("/");
    const mesAtual = mes;
    const anoAtual = ano;
    registroMensal["Ano"] = anoAtual;
    registroMensal["Mês"] = mesAtual;
    let [valores1, valores2] = [];
    
    for (const linha of linhas) {
        if (/^[\//A-Za-z]?\d{3,4}\s.+/.test(linha)) {
            if (!mesAtual || !anoAtual) continue;
            const codigo = linha.match(/^([\//A-Za-z]?\d{3,4})/)?.[0];
            const codigoFmt = `(${codigo})`;

            let descricao = linha.match(/^[\//A-Za-z]?\d{3,4}\s+(.*?)(?=\s*\d{1,3}(\.\d{3})*,\d{2})/)?.[1].trim();
            const valores = linha.match(/\d{1,3}(?:\.\d{3})*,\d{2}/g) || [];
            
            if (valores.length === 2) {
                registroMensal[`${codigoFmt} ${descricao} QUANTIDADE`] = valores[0];
                registroMensal[`${codigoFmt} ${descricao} VALOR`] = valores[1];
            } else if (valores.length === 1) {
                registroMensal[`${codigoFmt} ${descricao} VALOR`] = valores[0];
            }
        }        
        if(/^(\d{1,3}(\.\d{3})*,\d{2})(\s+\d{1,3}(\.\d{3})*,\d{2})+$/.test(linha)) {
            if(!valores1) {
                valores1 = linha.split(" ");
                registroMensal["13. Salário Antecipado em Férias"] = valores1[0];
                registroMensal["Saldo Devedor"] = valores1[1];
                registroMensal["Base Cálculo INSS"] = valores1[2];
                registroMensal["Líquido a Receber"] = valores1[3];
                continue;
            }
            if(!valores2) {
                valores2 = linha.split(" ");
                registroMensal["Base Cálculo IRRF"] = valores2[0];
                registroMensal["Base Cálculo FGTS"] = valores2[1];
                registroMensal["FGTS a ser Depositado"] = valores2[2];
                continue
            }
        }
    } 
    return registroMensal;
}
