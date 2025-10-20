import { jest } from '@jest/globals';
import fs from 'fs';

// Mock do pdf-parse-new (módulo externo)
jest.unstable_mockModule('pdf-parse-new', () => ({
    default: jest.fn()
}));

// Importa após definir o mock
const pdfModule = await import('pdf-parse-new');
const { recuperarTexto } = await import('../../../src/pdf/extrairCartaoPonto');

// Mock do fs usando spyOn (para módulos nativos)
jest.spyOn(fs, 'readFileSync');

describe('Função recuperarTexto', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('retorna o texto extraído com sucesso', async () => {
        const caminhoFake = '/caminho/fake/documento.pdf';
        const bufferFake = Buffer.from('PDF fake content');
        const textoEsperado = 'texto extraído do pdf';

        // Mock do fs.readFileSync com spyOn
        fs.readFileSync.mockReturnValue(bufferFake);

        // Mock do pdf-parse-new
        pdfModule.default.mockResolvedValue({
            text: textoEsperado,
            numpages: 5,
            info: {}
        });

        const resultado = await recuperarTexto(caminhoFake);

        // Assertions
        expect(fs.readFileSync).toHaveBeenCalledWith(caminhoFake);
        expect(pdfModule.default).toHaveBeenCalledWith(bufferFake);
        expect(resultado).toBe(textoEsperado);
    });

    test('lança erro quando o PDF está vazio', async () => {
        const caminhoFake = '/caminho/fake/vazio.pdf';
        const bufferFake = Buffer.from('');

        fs.readFileSync.mockReturnValue(bufferFake);
        pdfModule.default.mockResolvedValue({
            text: '',
            numpages: 0,
            info: {}
        });

        await expect(recuperarTexto(caminhoFake)).rejects.toThrow(
            'Não foi possível extrair registros do pdf.'
        );
    });
    
    test('retorna texto com conteúdo específico do PDF', async () => {
        const caminhoFake = '/caminho/documento.pdf';
        const bufferFake = Buffer.from('PDF com dados');
        const textoCompleto = "Mês/Ano: 10/2011, Dia Entrada Saida Intervalo 1...";

        fs.readFileSync.mockReturnValue(bufferFake);
        pdfModule.default.mockResolvedValue({
            text: textoCompleto,
            numpages: 1,
            info: {}
        });

        const resultado = await recuperarTexto(caminhoFake);

        expect(resultado).toContain('Mês/Ano: 10/2011');
        expect(resultado).toContain('Dia Entrada Saida Intervalo 1...');
    });
});


