# Roadmap

Estimativas iniciais para um desenvolvedor ou pequena equipe. Revisar quando o time e o ambiente estiverem definidos.

| Fase | Entrega | Prazo estimado |
|---|---|---|
| **0. Fundação** | Contas, banco, CI, design system, política de privacidade | 2 a 3 semanas |
| **1. MVP** | Gravação GPS offline, histórico, pace, parciais, altimetria, mapa, importação `.fit` e `.gpx`, recordes pessoais | 6 a 8 semanas |
| **2. Agente** | Chat com memória, tom ajustável, check-in diário, resumo pós-corrida, comparação entre corridas | 6 a 8 semanas |
| **3. Engajamento** | Notificações proativas, conquistas, plano de objetivo adaptativo, dia difícil | 4 a 6 semanas |
| **4. Profundidade** | Previsão de provas, carga e recuperação, Garmin, Apple Health e Health Connect, equipamentos, segmentos privados, rotas, zonas | 6 semanas |
| **5. Maturidade** | Voz durante o treino, relatório semanal, alertas de risco de lesão, wearables | contínuo |

## Critérios de aceite do MVP
- Gravar 1 hora de corrida com app em segundo plano e tela bloqueada, sem perda de dados.
- Abrir o histórico offline.
- Importar um `.fit` real com métricas conferidas contra uma referência independente.
- Pace, parciais e altimetria corretos em atividades de teste conhecidas.
- Estados de interface completos (carregando, vazio, erro, offline, sem permissão).
- Acessibilidade verificada: contraste AA, leitor de tela, fonte ampliada, foco.
- Testes automatizados no motor de métricas.

## Ordem sugerida de construção
1. Motor de métricas (puro, sem interface), com testes. Pace, parciais, ganho de elevação, recordes e suavização do GPS.
2. Importadores `.gpx` e `.fit`.
3. Banco local e modelo de dados.
4. Gravação por GPS em segundo plano.
5. Telas: gravar, histórico, detalhe da atividade (mapa, altimetria, parciais).
6. Backend e sincronização idempotente.
7. Agente e memória (fase 2).

## Dependências externas
- Flutter e Dart: **não instalados** na máquina do desenvolvedor. A instalação exige autorização do usuário.
- Contas de desenvolvedor da Apple e do Google para publicar (fora do escopo por enquanto).
- Chave de API do modelo de linguagem para a fase 2. Será configurada pelo usuário, nunca versionada.
- Provedor de mapas: a definir. Avaliar custo, termos e opção offline.

## Perguntas em aberto
1. Prototipar primeiro como PWA para validar a IA, ou ir direto ao app Flutter?
2. Backend em TypeScript (NestJS) ou Python (FastAPI)?
3. Provedor de mapas e de tiles.
4. Idade mínima dos usuários.
5. Verificação da marca Vybra (INPI, domínio, lojas).
