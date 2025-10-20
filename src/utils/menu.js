import { gerarPlanilha } from "../xlsx/gerarPlanilha.js";
import { prompt, fecharReadLine } from "./readlineFunc.js"


export async function menu() {
    
    let opcao = "";
    while (true) {
        
        textoMenu();
        opcao = Number(await prompt("\nOpção: "));
        switch (opcao) {
            case 1: 
                await gerarPlanilha("ponto");
                break;
            case 2: 
                await gerarPlanilha("holerite");
                break;
            case 3:
                console.log("\n\nSaindo...")
                fecharReadLine();
                return;
            default:
                console.log("\n\nOpcao invalida, digite uma opção: 1 folha de ponto, 2 holerite.")
        }
    }
}

export function textoMenu() {
    return console.log("\nConversor PDF -> XLSX \n"+
        "Digite uma opção abaixo: \n" +
        "1 - Cartão de Ponto \n" +
        "2 - Holerite \n" +
        "3 - Sair"
    );
}