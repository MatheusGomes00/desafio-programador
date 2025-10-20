import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
import { extrairRegistrosPonto } from "../pdf/extrairCartaoPonto.js";
import { extrairRegistrosHolerite } from '../pdf/extrairHolerite.js';
import PromptSync from "prompt-sync";

export async function gerarPlanilha(tipo) {
    try {
        const prompt = PromptSync();
        const caminhoPDF = prompt("Digite o caminho do arquivo pdf: ");
        if(!fs.existsSync(caminhoPDF) || !caminhoPDF.endsWith(".pdf")) {
            throw new Error(`\n\nArquivo não localizado ou com extensão errada: ${caminhoPDF}`);
        }
        
        let registros = [];
        if(tipo === "ponto"){
            registros = await extrairRegistrosPonto(caminhoPDF);
        } else {
            registros = await extrairRegistrosHolerite(caminhoPDF);
        }

        if(!registros || !Array.isArray(registros) || registros.length === 0) {
            throw new Error("\n\nErro ao processar pdf. Nenhum registro encontrado para gerar a planilha.");
        }

        try {
            XLSX.set_fs(fs);
            const workSheet = XLSX.utils.json_to_sheet(registros);
            const workBook = XLSX.utils.book_new();

            if(tipo === "ponto"){
                XLSX.utils.book_append_sheet(workBook, workSheet, "Cartao-Ponto");
                XLSX.writeFileXLSX(workBook, "./conteudo/Cartao-Ponto-01.xlsx");
            } else if (tipo === "holerite") {
                XLSX.utils.book_append_sheet(workBook, workSheet, "Holerite");
                XLSX.writeFileXLSX(workBook, "./conteudo/Holerite-01.xlsx");
            }
        } catch (erro) {
            throw new Error("\n\nErro ao gerar planilha XLSX.\n", erro.message);
        }

        console.log("\n\nArquivo .XLSX gerado na pasta conteudo/ do diretorio raiz deste projeto.");
    } catch (erro) {
        console.log(erro.message);
    }
}