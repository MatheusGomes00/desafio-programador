const { gerarRegistros } = await import('../../../src/pdf/extrairCartaoPonto.js');

describe('Função gerarRegistro', () => {

   test('ordena horários corretamente independente da ordem de entrada', () => {
        const linhasClassificadas = [
            {
                tipo: 'cabecalho',
                conteudo: 'Mês/Ano: 01/2025'
            },
            {
                tipo: 'diaComHorario',
                conteudo: '05 Sex 17:00 08:30 12:00 13:30'
            }
        ];

        const resultado = gerarRegistros(linhasClassificadas);

        expect(resultado).toHaveLength(1);

        expect(resultado[0]).toEqual({
            Data: '05/01/2025',
            Entrada1: '08:30',
            Saida1: '12:00',
            Entrada2: '13:30',
            Saida2: '17:00'
        });

        expect(resultado[0].Entrada1).toBe('08:30');
        expect(resultado[0].Saida1).toBe('12:00');
        expect(resultado[0].Entrada2).toBe('13:30');
        expect(resultado[0].Saida2).toBe('17:00');
    });

    test('ordena horários em ordem completamente invertida', () => {
        const linhasClassificadas = [
            {
                tipo: 'cabecalho',
                conteudo: 'Mês/Ano: 02/2025'
            },
            {
                tipo: 'diaComHorario',
                conteudo: '10 Seg 18:00 17:00 09:00 08:00'
            }
        ];

        const resultado = gerarRegistros(linhasClassificadas);

        expect(resultado).toHaveLength(1);
        
        expect(resultado[0]).toEqual({
            Data: '10/02/2025',
            Entrada1: '08:00',
            Saida1: '09:00',
            Entrada2: '17:00',
            Saida2: '18:00'
        });
    });

    test('ordena horários com minutos variados', () => {
        const linhasClassificadas = [
            {
                tipo: 'cabecalho',
                conteudo: 'Mês/Ano: 03/2025'
            },
            {
                tipo: 'diaComHorario',
                conteudo: '15 Ter 17:45 08:15 12:30 13:20'
            }
        ];

        const resultado = gerarRegistros(linhasClassificadas);

        expect(resultado).toHaveLength(1);
        
        expect(resultado[0]).toEqual({
            Data: '15/03/2025',
            Entrada1: '08:15',
            Saida1: '12:30',
            Entrada2: '13:20',
            Saida2: '17:45'
        });
    });
});

