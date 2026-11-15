# Funcionalidades

Legenda de fase: **MVP**, **F2** (agente), **F3** (engajamento), **F4** (profundidade), **F5** (maturidade). Detalhes de fases em `roadmap.md`.

## 1. Rastreamento
| Função | Detalhe | Fase |
|---|---|---|
| Gravação por GPS | Pausa automática, serviço em segundo plano, tela bloqueada | MVP |
| Métricas ao vivo | Pace, distância, tempo, altimetria, cadência, FC | MVP |
| Parciais e voltas | Splits por km, voltas manuais | MVP |
| Altimetria | Perfil de elevação, ganho e perda, grade (%) | MVP |
| Mapa | Trajeto no mapa, pontos de parcial | MVP |
| Histórico offline | Lista e detalhe de atividades sem rede | MVP |
| Importação | Arquivos `.fit`, `.gpx`, `.tcx` | MVP |
| Recordes pessoais | Melhor 1k, 5k, 10k, 21k, 42k e mais longa | MVP |
| Zonas | Zonas de FC e de pace personalizadas | F4 |
| Treino estruturado | Intervalados, séries por tempo ou distância | F4 |
| Segmentos privados | Trecho marcado, comparado só com passagens do próprio usuário | F4 |
| Rotas | Criar, importar GPX, exportar para relógio | F4 |
| Equipamentos | Tênis e bike, contagem de km e alerta de desgaste | F4 |
| Integrações | Garmin, Apple Health, Health Connect | F4 |
| Voz durante o treino | Parciais e dicas faladas | F5 |

## 2. Esportes
Mesmos disponíveis no Strava. A lista exata deve ser conferida contra a documentação atual do Strava na hora da implementação, pois muda com o tempo. Referência inicial por grupo:

- **A pé (com GPS):** corrida, corrida em trilha, caminhada, caminhada de aventura (hike).
- **Ciclismo (com GPS):** pedal, mountain bike, gravel, e-bike, handcycle.
- **Esteira e ambiente interno:** corrida virtual, pedal virtual (rolo), elíptico, escada, remo indoor.
- **Água:** natação, remo, caiaque, canoa, stand up paddle, surfe, vela.
- **Força e funcionais:** musculação, treino funcional, HIIT, crossfit, yoga, pilates.
- **Outros:** esqui, snowboard, patinação, skate, escalada, golfe, futebol, tênis, e demais da lista do Strava.

**Modelo:** cada esporte pertence a uma de três famílias que definem o formulário e as métricas:
1. com percurso (GPS): distância, pace ou velocidade, altimetria;
2. sem percurso, com duração e esforço: tempo, FC, calorias estimadas;
3. força: exercícios, séries, repetições e carga.

Comece pelas famílias 1 e 2 e adicione a família 3 depois do MVP.

## 3. Comparação e análise
- Comparar qualquer atividade com: outra atividade, o melhor do usuário, a média das últimas 4 semanas, o mesmo percurso.
- Explicação causal pelo agente (sono, calor, carga, FC, cadência).
- Métricas derivadas: eficiência aeróbica, deriva cardíaca, queda de ritmo no final, carga aguda e crônica, estimativa de VO2, previsão de tempo para provas.
- Tendências por semana, mês e ano, com marcas de pausas e lesões.

## 4. Agente, notificações e conquistas
- Agente de IA, memória, check-in, dia difícil, notificações: `agente-ia.md`.
- Conquistas: `conquistas.md`.

## 5. Dados do usuário
- Tela "O que o Vybra sabe sobre mim": ver, editar e apagar cada memória.
- Exportação completa e exclusão total da conta e da memória.
- Zonas de ocultação (casa e trabalho).
- Biometria ou PIN para abrir o app.

## Requisitos de qualidade do rastreamento (critérios do MVP)
- 1 hora de corrida com app em segundo plano e tela bloqueada, sem perda de dados.
- Histórico acessível offline.
- Importação de um `.fit` real com métricas conferidas contra uma referência independente.
- Tratamento de GPS ruim: filtragem de ruído, saltos, e pausa por parada.
- Consumo de bateria medido e documentado.

## Estados de interface obrigatórios
Carregando, vazio, erro, sucesso, offline e sem permissão (localização, sensores, notificações). Cada um com mensagem acessível e ação de recuperação.
