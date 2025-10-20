const { recuperarLinhas } = await import('../../../src/pdf/extrairCartaoPonto.js');
describe('Função recuperarLinhas', () => {

    test('classifica corretamente cabeçalho e dias com horário', () => {
        const textoEntrada = `Mês/Ano: Janeiro/2025
01 Seg
02 Ter 08:00 - 17:00
03 Qua`;

        const resultado = recuperarLinhas(textoEntrada);
        expect(resultado).toEqual([
            {tipo: 'cabecalho', conteudo: 'Mês/Ano: Janeiro/2025'},
            {tipo: 'diaSemHorario', conteudo: '01 Seg'},
            {tipo: 'diaComHorario', conteudo: '02 Ter 08:00 - 17:00'},
            {tipo: 'diaSemHorario', conteudo: '03 Qua'},
        ]);
    });

    test('filtra e ignora linhas que não começam com Mês/Ano ou dois dígitos', () => {
        const textoEntrada = `Mês/Ano: 10/2011
Dia Entrada Saida Intervalo 1 Intervalo 2 Intervalo 3
02 DOM Descanso Semanal 610 100 N
03 SEG 09:50 - 16:06 13:45 - 14:00 610 100 S
04 TER 09:59 - 16:14 13:45 - 14:00 610 100 S`;

        const resultado = recuperarLinhas(textoEntrada);

        expect(resultado).toHaveLength(4);
        expect(resultado.every(item => item.tipo && item.conteudo)).toBe(true);
        expect(resultado[0].tipo).toBe('cabecalho');
    });

    test('classifica múltiplos dias com e sem horário corretamente', () => {
        const textoEntrada = `Mês/Ano: 11/2011
Dia Entrada Saida Intervalo 1 Intervalo 2 Intervalo 3 ATN Funç Situaç HE
Diurno
HE
Noturno Insalub Conc
01 TER 09:52 - 16:07 13:45 - 14:00 610 100 S
02 QUA Feriado 610 100 N
03 QUI 09:57 - 16:54 13:45 - 14:00 0,7 610 100 S
04 SEX 09:54 - 16:43 13:45 - 14:00 0,5 610 100 S
05 SAB Descanso Semanal 610 100 N`;

        const resultado = recuperarLinhas(textoEntrada);
        const diasComHorario = resultado.filter(l => l.tipo === 'diaComHorario');
        const diasSemHorario = resultado.filter(l => l.tipo === 'diaSemHorario');

        expect(diasComHorario).toHaveLength(3);
        expect(diasSemHorario).toHaveLength(2);
        expect(diasComHorario[0].conteudo).toContain('09:52');
        expect(diasSemHorario[0].conteudo).toBe('02 QUA Feriado 610 100 N');
    });
});
