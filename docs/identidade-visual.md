# Identidade Visual — Vybra

Regra visual oficial do projeto. Toda tela, componente, ícone, tipografia e animação do sistema deve seguir rigorosamente este guia.

> Frase de marca: **"Mais que um app, um parceiro na sua jornada."**
> Slogan: **CORRA. EVOLUA. SUPERE-SE.**

---

## 1. Paleta de Cores

| Token | Hex | Uso |
|---|---|---|
| `primary` (Roxo Principal) | `#7C3AED` | Ações principais, destaques ativos, início de gradientes, bordas de foco |
| `secondary` (Roxo Secundário) | `#A855F7` | Fim de gradientes, realces de texto/ícone, brilhos e gráficos |
| `background` (Fundo Escuro) | `#0B0B0F` | Fundo base de todas as telas |
| `muted` (Cinza) | `#9CA3AF` | Textos secundários, rótulos, legendas e estados inativos |
| `foreground` (Branco) | `#FFFFFF` | Títulos, números principais, ícones sobre fundo escuro ou roxo |

### Superfícies, bordas e gradientes (derivados da prancha oficial)
- **Superfície de card / tile inativo:** variação escura levemente acima de `#0B0B0F` (ex.: `#13131A` / `#181822`) com borda sutil (`rgba(255, 255, 255, 0.08)` ou `#232332`) para separar camadas mantendo contraste alto.
- **Gradiente de marca:** linear do Roxo Principal (`#7C3AED`) para o Roxo Secundário (`#A855F7`), com brilho suave em botões primários e tiles ativos.
- **Realce de atmosfera:** luz/glow roxo sutil em fundos de destaque (ex.: splash, login e card principal do agente), sem poluir a leitura de métricas.

---

## 2. Tipografia

- **Família oficial:** `Plus Jakarta Sans` (Regular `400`, Medium `500`, SemiBold `600`, Bold `700`, ExtraBold `800`).
- **Hierarquia:**
  - Títulos e métricas de impacto: pesos `700` / `800` em `#FFFFFF`, com números tabulares ou espaçamento consistente para leitura rápida durante e após o treino.
  - Slogans e sub-rótulos de marca: caixa alta com `letter-spacing` amplo (ex.: `CORRA. EVOLUA. SUPERE-SE.`).
  - Corpo e descrições: pesos `400` / `500` em `#FFFFFF` ou `#9CA3AF`.
  - Palavras-chave emocionais ou da marca podem receber destaque em `#A855F7` / `#7C3AED`.

---

## 3. Marca e Símbolo

- **Ícone do app:** fundo escuro `#0B0B0F` em formato arredondado (squircle) com brilho roxo nas bordas, letra **`V`** estilizada em gradiente `#7C3AED` → `#A855F7` com linhas de velocidade à esquerda, integrada a uma silhueta branca de corredor em movimento.
- **Wordmark (`Vybra`):** **`V`** em gradiente roxo dinâmico seguido de **`ybra`** em branco (`#FFFFFF`).
- **Uso:** presente na abertura (splash), login e áreas de identidade, sem distorcer proporções.

---

## 4. Elementos de UI e Ícones

- **Botão Primário:** formato pílula (bordas totalmente arredondadas), preenchimento em gradiente `#7C3AED` → `#A855F7`, brilho roxo sutil, texto `#FFFFFF` e seta à direita (`→`).
- **Botão Secundário:** formato pílula, fundo escuro/transparente, borda fina em roxo (`#7C3AED` / `#A855F7`), texto `#FFFFFF` e seta em roxo.
- **Tiles de Ícone (navegação/ação):** quadrados com cantos bem arredondados; ativo em gradiente roxo com brilho e ícone branco; inativo em superfície escura com borda sutil e ícone branco.
- **Estilo de ícones:** traço geométrico limpo, moderno e minimalista em branco (`#FFFFFF`), com acentos pontuais em roxo (`#7C3AED` / `#A855F7`). Referências diretas da prancha:
  - `Corrida` (tênis com linhas de movimento)
  - `Ciclismo` (ciclista)
  - `Treino` (halter)
  - `Rotas` (pino com caminho em roxo)
  - `Estatísticas` (barras verticais)
  - `Conquistas` (troféu)

---

## 5. Diretrizes da Marca

- Visual moderno e minimalista.
- Transmite movimento e performance (linhas de velocidade, transições fluidas, curvas de rota e elevação).
- Cores que inspiram foco e energia.
- Design responsivo, atemporal e com contraste acessível (AA) sobre o fundo `#0B0B0F`.
