# Conquistas

Sem social, as conquistas funcionam só entre o usuário e ele mesmo. Premiam **consistência e evolução**, não apenas distância ou velocidade. Ninguém vê as conquistas de outra pessoa.

## Princípios
- Recompensar esforço e regularidade, não só desempenho.
- Descanso planejado e dia difícil acolhido não quebram sequências.
- Conquistas devem ser possíveis para iniciantes e para experientes.
- Nunca usar vergonha ou perda como motivador (sem "você perdeu sua sequência!").
- Cada conquista tem regra objetiva e calculada por código determinístico, não pelo LLM.

## Categorias
**Consistência**
- Semanas seguidas treinando, com descanso programado permitido.
- Treinar em estações diferentes do ano.
- "Retorno": voltar após uma pausa longa.

**Evolução**
- Novo recorde pessoal em 1k, 5k, 10k, 21k, 42k.
- Eficiência aeróbica melhorada em 5% em 2 meses.
- Negative split (segunda metade mais rápida).
- Deriva cardíaca baixa em treino longo.

**Marcos**
- Primeira corrida de cada distância.
- 100, 500 e 1.000 km acumulados.
- Volta ao mundo (40.000 km acumulados, somando esportes elegíveis).
- Altimetria acumulada equivalente ao Everest.

**Exploração**
- Rota nova, nunca feita antes.
- Cidades ou países diferentes.
- Nascer do sol e treino noturno, marcas por horário.

**Inteligência e cuidado**
- "Ouviu o corpo": descansou quando o aviso de sobrecarga apareceu.
- "Cabeça fria": seguiu o treino leve recomendado.
- Plano de objetivo cumprido acima de 90%.

**Personalizadas (geradas pela IA)**
Criadas a partir do histórico. Exemplo: "Você nunca correu mais de 8 km. Que tal 10 km?". O agente propõe e o usuário aceita ou recusa. A regra de desbloqueio é gravada em dados e verificada por código.

## Implementação sugerida
- Tabela `achievement` com regra declarativa (tipo, métrica, limiar, janela).
- Tabela `achievement_unlock` com data, atividade de origem e valor atingido.
- Avaliação por job assíncrono após cada atividade sincronizada.
- Idempotência: reprocessar não duplica desbloqueios.
- Notificação de celebração passa pelo motor de notificações (respeita cota e silêncio).
- Testes unitários cobrindo bordas: sequência com descanso, mudança de fuso, atividade editada, atividade importada duplicada.
