# Agente de IA

O agente é o núcleo do produto. Ele conversa, lembra, motiva, registra e orienta, apoiado pelos dados reais do usuário.

## Papéis
- **Treinador:** sugere o próximo treino e ajusta o plano.
- **Comparador:** explica diferenças entre corridas e evolução.
- **Registrador:** guarda a vida do usuário (trabalho, sono, humor, dificuldades).
- **Companhia:** motiva todos os dias e acolhe nos dias difíceis.
- **Apoio emocional leve:** escuta e técnicas simples. Não é terapeuta.

## Tom ajustável
O usuário escolhe e pode mudar a qualquer momento. Sugestão de perfis iniciais:
| Perfil | Estilo |
|---|---|
| Direto | Objetivo, curto, sem rodeios |
| Acolhedor | Empático, gentil, valoriza o esforço |
| Motivador | Energético, desafiador sem cobrança |
| Analítico | Foco em números e explicação |
| Personalizado | O usuário descreve como quer ser tratado |

Regras que valem para **qualquer** tom: nunca humilhar, culpar ou comparar com outras pessoas; respeitar o protocolo de crise.

## Memória persistente
O agente não reinicia ao fechar e abrir o app.

| Camada | O que guarda | Exemplo |
|---|---|---|
| Trabalho | Conversa atual | Últimas mensagens |
| Episódica | Resumos de conversas e dias | "Terça: dormiu mal, correu 4 km devagar" |
| Semântica | Fatos estáveis | "Trabalha em turnos", "joelho direito sensível" |
| Perfil | Objetivos, preferências, tom | "Prova de 10k em março" |
| Padrões | O que foi aprendido dos dados | "Rende pior após menos de 6 h de sono" |

**Pipeline**
1. Fim da conversa: job extrai fatos novos, mudanças de objetivo e emoções relevantes.
2. Cada fato tem confiança, origem, data e marca de sensível. Fatos contraditórios substituem os antigos.
3. Antes de responder, o agente busca por relevância e recência (embeddings no pgvector) e monta um contexto curto.
4. O usuário vê, corrige e apaga qualquer item. Apagar remove também dos embeddings.

**Regras**
- Conteúdo emocional é sensível: retenção configurável, uso apenas para o próprio usuário, sem treino de modelos com esses dados.
- O agente nunca inventa memória. Se não lembra, pergunta.

## Ferramentas (function calling)
`buscar_atividades`, `comparar_atividades`, `ler_metricas`, `ler_plano`, `atualizar_plano`, `buscar_memoria`, `salvar_memoria`, `agendar_lembrete`, `ver_recuperacao`.

Os números que o agente cita **sempre** vêm das ferramentas.

## Check-in diário
Pergunta curta sobre como o usuário está (energia, sono, humor, dor). A resposta ajusta o dia: treino forte, leve, descanso ou alternativa.

## Dia difícil
Quando o usuário não consegue treinar:
1. Acolher sem cobrar.
2. Entender o motivo (cansaço, tempo, dor, ânimo, imprevisto).
3. Propor algo menor: 10 minutos de caminhada, alongamento, respiração.
4. Registrar o motivo na memória para ajustar o plano.
5. Se for dor persistente, orientar a procurar profissional de saúde.

Dia de descanso planejado ou dia difícil acolhido **não quebra** sequências de consistência.

## Notificações proativas
O agente decide **se, quando e como** falar.

**Entradas da decisão:** rotina, horário de sono, clima, histórico de resposta, cota diária, horário de silêncio, estado emocional recente.

**Tipos:** lembrete de treino, incentivo, aviso de recuperação, celebração de conquista, check-in de humor.

**Controles do usuário:** horário de silêncio, limite diário, pausar por um dia ("me deixe em paz hoje"), desligar por tipo.

**Regras:**
- Nunca enviar mensagem motivacional logo após sinal de crise.
- Reduzir a frequência se o usuário ignora várias seguidas.
- Passar por checagem de tom e segurança antes de enviar.

## Protocolo de crise (obrigatório)
**Sinais:** menção a autolesão, desesperança grave, ideação suicida, violência.

**Ação:**
1. Interromper o tom motivacional e de treino.
2. Acolher com linguagem simples e humana.
3. Indicar CVV (188, 24 horas) e SAMU (192) em emergência.
4. Pausar notificações de treino.
5. Marcar o episódio como sensível na memória.

**Testes:** conjunto de casos de avaliação executado antes de cada release. Falha neste conjunto bloqueia o lançamento.

## Limites e transparência
- O app deixa claro que o agente é uma IA e não substitui profissionais de saúde ou de saúde mental.
- Não faz diagnóstico, não prescreve medicação, não promete resultados.
- Em caso de dados insuficientes, diz que não sabe.
- Prompts versionados, com avaliação antes de mudanças.

## Segurança do agente
- Conteúdo importado ou digitado (notas, nomes de rota, arquivos) é tratado como dado, nunca como instrução.
- O agente só acessa os dados do próprio usuário.
- Logs sem dados pessoais (redação de PII).
