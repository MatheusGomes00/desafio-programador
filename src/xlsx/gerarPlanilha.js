import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
import { extrairRegistrosPonto } from "../pdf/extrairCartaoPonto.js";
import { extrairRegistrosHolerite } from '../pdf/extrairHolerite.js';
import PromptSync from "prompt-sync";

export async function gerarPlanilha(tipo) {
    try {
        const prompt = PromptSync();
        const caminhoPDF = prompt("Digite o caminho do arquivo pdf: ");
        
        let registros = [];
        if(tipo === "ponto"){
            registros = await extrairRegistrosPonto(caminhoPDF);
        } else {
            registros = await extrairRegistrosHolerite(caminhoPDF);
        }

        if(!registros || !Array.isArray(registros) || registros.length === 0) {
            console.error("Nenhum registro encontrado para gerar a planilha.");
            return;
        }

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

        console.clear;

        console.log("\n\nArquivo .XLSX gerado na pasta conteudo do diretorio raiz deste projeto");
    } catch (erro) {
        console.error("Erro ao gerar planilha:", erro );
    }
}