import PromptSync from "prompt-sync";
import { gerarPlanilhaPonto } from "../xlsx/gerarPlanilhaPonto.js";

const prompt = PromptSync();

export async function menu() {
    
    let opcao = "";
    while (true) {
        
        textoMenu();
        opcao = Number(prompt("Opção: "));
        switch (opcao) {
            case 1: 
                await gerarPlanilhaPonto();
                break;
            case 2: 
                console.log("Em desenvolvimento.");
                break;
            case 3:
                console.log("Saindo...")
                return;
            default:
                console.log("Opcao invalida, digite uma opção: 1 folha de ponto, 2 holerite.")
        }
    }
}

function textoMenu() {
    return console.log("\nConversor PDF -> XLSX \n"+
        "Digite uma opção abaixo: \n" +
        "1 - Cartão de Ponto \n" +
        "2 - Holerite \n" +
        "3 - Sair"
    );
}
