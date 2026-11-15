# Privacidade e segurança

O Vybra trata dados de saúde, localização e conteúdo emocional. São dados sensíveis pela LGPD. Segurança e privacidade são requisitos de produto, não etapa final.

## Princípios
- Minimização: coletar só o necessário.
- Controle do usuário: ver, corrigir, exportar e apagar tudo.
- Sem rede social: nada é compartilhado com outras pessoas.
- Sem uso dos dados do usuário para treinar modelos.
- Segurança por padrão, não por opção.

## Controles
| Tema | Controle |
|---|---|
| Autenticação | OAuth (Google e Apple), tokens de curta duração, refresh rotativo |
| Autorização | Isolamento por usuário na API e RLS no PostgreSQL. Sem acesso entre contas |
| Criptografia | TLS em trânsito, criptografia em repouso, campos sensíveis cifrados (memória emocional) |
| Localização | Zonas de ocultação para casa e trabalho, sem compartilhamento externo |
| Consentimento | Separado para saúde, localização, memória emocional e notificações |
| Direitos do titular | Exportação, correção e exclusão completa, incluindo embeddings |
| IA | Redação de PII em logs, prompts versionados, sem treino com dados do usuário |
| Abuso | Rate limit por usuário e dispositivo, limites de upload, validação de `.fit` e `.gpx` |
| Prompt injection | Conteúdo importado tratado como dado, nunca como instrução |
| Acesso local | Biometria ou PIN para abrir o app |
| Segredos | Fora do repositório, em gerenciador de segredos. Nunca em logs ou prompts |

## LGPD: pontos a resolver antes do lançamento
- Base legal e consentimento explícito para dados de saúde e sensíveis.
- Política de privacidade clara em português.
- Política de retenção, configurável pelo usuário para memória emocional.
- Processo de exclusão que cobre banco, arquivos, embeddings e backups dentro de prazo definido.
- Registro de operações de tratamento e canal para o titular.
- Avaliação de impacto (RIPD) por tratar dados sensíveis e uso de IA.
- Se houver usuários menores de 18, regras específicas. Decidir faixa etária mínima.

## Riscos e mitigações
| Risco | Mitigação |
|---|---|
| GPS em segundo plano varia por fabricante no Android | Serviço em primeiro plano, testes em vários aparelhos, orientação de bateria |
| Custo do LLM com memória | Contexto curto, cache de resumos, modelos escalonados, orçamento por usuário |
| Dependência emocional ou conselho inadequado | Limites claros, protocolo de crise, avisos, avaliação contínua |
| Termos de uso do Strava e de terceiros | Priorizar arquivos e Health Connect. Tratar Strava como opcional e checar os termos de uso de dados para IA |
| Marca "Vybra" | Verificar INPI, domínio e lojas antes de investir na identidade. Risco de conflito com "Vibra" |
| Vazamento de dado sensível | Criptografia, RLS, redação de PII, mínimo privilégio, revisão de segurança |
| Alucinação sobre dados do usuário | Números só via ferramentas, resposta "não sei" quando faltar dado |

## Resiliência e operação
- Timeouts, retry com backoff e jitter em chamadas ao LLM e integrações.
- Degradação: se o LLM cair, o app segue gravando, calculando e mostrando dados. O chat avisa a indisponibilidade.
- Jobs idempotentes com fila de mensagens mortas e replay seguro.
- SLOs propostos: sincronização de atividade com 99,9% de sucesso, resposta do agente p95 abaixo de 6 s.
- Logs com correlation ID e sem dados pessoais.
- Backup só conta após restauração testada em ambiente isolado.
