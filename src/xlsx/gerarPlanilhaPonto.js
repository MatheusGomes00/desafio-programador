import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
import { extrairRegistros } from "../pdf/extrairCartaoPonto.js";
import PromptSync from "prompt-sync";

export async function gerarPlanilhaPonto() {
    try {
        const prompt = PromptSync();
        const caminhoPDF = prompt("Digite o caminho/diretorio do pdf da folha de ponto: ");

        const registros = await extrairRegistros(caminhoPDF);
        if(!registros || !Array.isArray(registros) || registros.length === 0) {
            console.error("Nenhum registro encontrado para gerar a planilha.");
            return;
        }

        XLSX.set_fs(fs);
        const workSheet = XLSX.utils.json_to_sheet(registros, {
            header: ["Data", "Entrada1", "Saida1", "Entrada2", "Saida2"]
        });
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "Cartao-Ponto");
        XLSX.writeFileXLSX(workBook, "./conteudo/Cartao-Ponto-01.xlsx");
        console.log("\n\nArquivo gerado na pasta conteudo do diretorio raiz deste projeto");
    } catch (erro) {
        console.error("Erro ao gerar planilha:", erro );
    }
}