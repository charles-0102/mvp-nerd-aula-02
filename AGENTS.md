# AGENTS.md — Central de Demandas da Equipe

## Como trabalhar

- Execute o pedido atual. Inspecione o estado existente, preserve trabalho e dados e leia apenas o necessário à tarefa. Não copie aplicações de outras pastas nem exija releitura integral dos documentos para ajustes pontuais.
- Em trabalhos maiores, apresente um plano curto e avance até verificar a entrega. Explique decisões de forma simples; não peça novamente decisões já autorizadas. Esclareça dúvidas essenciais, contradições e bloqueios reais enquanto avança no trabalho independente.
- Pedidos somente de documentação não executam migrations ou releases. Entregas de implementação seguem a autorização de CI/CD abaixo, salvo pedido limitado a trabalho local ou rascunho. Mudanças destrutivas exigem alcance concreto e autorização específica; novos repositórios ou destinos exigem pedido próprio.

## PRDs opcionais

- `PRDs/` guarda especificações que ajudem a definir e revisar o trabalho. Nem todo projeto ou funcionalidade precisa de um PRD novo. Correções, ajustes e funcionalidades simples podem seguir diretamente pelo pedido no chat.
- Para funcionalidades complexas, com decisões relevantes de escopo, jornadas ou regras, você pode sugerir um PRD e perguntar se o usuário quer criá-lo para revisão. Crie quando solicitado ou quando a proposta for aceita; se houver revisão combinada, aguarde-a antes de implementar o escopo dependente.
- Consulte os trechos pertinentes de [PRDs/PRD-Inicial.md](PRDs/PRD-Inicial.md) para requisitos e critérios existentes. Reutilize ou atualize a especificação pertinente quando necessário, evitando documentos e regras duplicadas. Este arquivo concentra orientações duradouras de trabalho.

## Stack

- React + TypeScript + Vite, React Router (`/` solicitante, `/admin` administrador), CSS responsivo, português brasileiro e acessibilidade por teclado. Use Node.js/npm compatíveis, registre versões e mantenha lockfile.
- Use `@supabase/supabase-js` com Supabase real, regras e operações atômicas no banco. Respeite o escopo acordado; não crie servidor próprio apenas para separar camadas. Mantenha rotas SPA e variáveis públicas compatíveis com a publicação na Vercel.

## Configuração e navegador

- Valores reais de ambiente ficam no `.env`, sem exposição em Markdown, capturas ou logs; a exceção autorizada é o repositório abaixo. Leia apenas variáveis necessárias com parser dotenv, sem executar ou despejar o arquivo. `.env.example` contém só nomes; ignore `.env` e variantes no Git e mantenha permissão `600` no arquivo real.
- Confira sobreposições de `.env.local` e do processo sem substituir valores válidos silenciosamente. Reutilize credenciais nos conectores/CLI; não extraia tokens para o `.env` nem peça senhas ou tokens pelo chat. Configuração não comprova autenticação nem autoriza mudança inesperada de destino.
- Exponha no frontend somente `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (publishable/anon). Nunca exponha senha, `service_role`, `sb_secret_` ou token da CLI; não amplie `envPrefix`.
- Abra sites e autenticações no navegador integrado (`iab`), visível; use `--no-browser` nas CLIs. Navegador externo somente por pedido explícito ou após explicar uma limitação do integrado.

## Supabase — quando a tarefa envolver o banco

1. Confira `SUPABASE_PROJECT_NAME` e `SUPABASE_PROJECT_REF`; altere somente objetos de `SUPABASE_DATABASE_PREFIX` e `SUPABASE_PRIVATE_SCHEMA`. `SUPABASE_REFERENCE_SCHEMA` permite apenas inspeção de metadados. A estrutura anterior pode existir: pasta nova não significa banco vazio.
2. Prefira a CLI: confira versão e `supabase db query --help`, com suporte a `--linked`/`--file` (validado na 2.84.2). Compare internamente `supabase projects list --output json` com a configuração. Reutilize autenticação ou use `supabase login --no-browser`; login no painel não autentica a CLI. O painel está em `SUPABASE_DASHBOARD_URL`.
3. Inicialize somente se faltar configuração. Vincule com `supabase link --project-ref <valor-configurado>` e confira `supabase/.temp/project-ref`, sem copiar `.temp`. Faça leitura com `supabase db query --linked`; esse fluxo não exige Docker, senha de Postgres ou chave privilegiada. Alternativa: CLI compatível oficial ou SQL Editor no projeto conferido, sem trocar o destino.
4. Revise o preflight, se existir: somente metadados de colisões, colunas, restrições, funções, RLS, privilégios e gatilhos. Valide/cite identificadores SQL e passe argumentos de CLI separados. Use consulta agregada em relatórios, pois a CLI observada mostrava apenas a última instrução. Reutilize objetos compatíveis; investigue estado parcial sem limpeza automática ou `IF NOT EXISTS` que esconda diferenças.
5. Salve migrations incrementais em `supabase/migrations/`, com nome temporal genérico e transação quando possível; preserve arquivos aplicados. Revise e execute um por vez: `supabase db query --linked --file <arquivo-revisado> --output json`. Após falha/timeout, confira o remoto antes de repetir; esse comando não registra automaticamente o histórico de migrations.
6. Preserve dados, Auth, privilégios e objetos de outras aplicações. Não use reset remoto, seed geral, exclusão em massa, `db push`, `migration up`, `migration repair` ou `db pull` para sincronizar indiscriminadamente o banco compartilhado. Confira estrutura, acesso, comportamento e metadados relevantes após alterações.

**Preparação da aula:** em 24/10/2026, os objetos da Central foram removidos por pedido explícito, com estrutura preservada em migration. Consulte o [README](README.md). Recrie somente quando João solicitar o início da aula/implementação; não reaplique automaticamente a limpeza administrativa.

## Identidade e integridade

- Alunos usam e-mail declarado e credencial aleatória por navegador, enviada no corpo da RPC; só o hash fica na tabela privada. Sem alunos no Supabase Auth ou Anonymous Sign-Ins. Não unir históricos por e-mail; sem recuperação por e-mail ou expiração automática, com revogação operacional. Nunca exponha credenciais em URL, QR ou logs.
- Reutilize a conta administrativa confirmada, não anônima, de `ADMIN_EMAIL` e seu perfil próprio (`ADMIN_DISPLAY_NAME` para exibição). Se faltar vínculo, prepare provisionamento controlado; não promova alunos, recrie conta Auth ou altere senha. Reconfira dependências relevantes das permissões amplas e do gatilho de outra aplicação já observados, sem alterá-los.
- Mantenha RLS e privilégios mínimos: solicitantes usam RPC, sem escrita direta irrestrita. Funções `security definer` precisam de `search_path` controlado, nomes qualificados e execução restrita. O serviço determina autoria, horários, números, transições, atomicidade e bloqueio após conclusão.
- Conflitos de revisão usam `PT409`, nunca `40001` como erro de negócio (provocou retries no PostgREST). Preserve bloqueio de linha e versão esperada; não encerre conexões de outras aplicações.

## GitHub

- Repositório: [mvp-nerd-aula-02](https://github.com/charles-0102/mvp-nerd-aula-02.git). Confira `GITHUB_REPOSITORY` e remotos contra esse destino; se a variável estiver vazia, use esta referência. `GITHUB_ACCOUNT` define a conta; `GITHUB_REFERENCE_REPOSITORY` serve apenas para conferir identidade.
- Confira a identidade do mecanismo utilizado; conector, CLI e navegador podem divergir. Não substitua remoto silenciosamente, altere identidade global ou use credenciais na URL. Antes de enviar código, confira que nenhum arquivo de ambiente real está rastreado ou incluído.

## Branches, PRs e CI/CD

- João delegou ao agente a entrega completa das implementações: criar e publicar branch de trabalho no GitHub, fazer push, abrir PR, coordenar migrations, fazer o merge na `main` e acompanhar o deploy. Execute esse fluxo sem pedir novamente autorização para cada etapa nos destinos já definidos. Esta orientação substitui restrições anteriores de entrega somente local nos documentos; respeite limites expressos no pedido atual.
- Trabalhe sempre em branch própria a partir da `main` atualizada, preservando alterações existentes; nunca envie código diretamente à `main`. Abra a PR com código, SQL aplicável, validações e sequência de release. Revise o diff, resolva conflitos e aguarde os checks e aprovações exigidos pelo repositório para a revisão atual antes do merge, sem contornar proteções.
- Identifique os ambientes e vínculos efetivos antes de operar: frontend local pode acessar banco de produção. Não deduza o ambiente pela branch ou por localhost. Se faltar a identificação do destino de produção, esclareça somente essa informação antes de escrever nele.
- Defina a ordem entre migration, merge e deploy pela compatibilidade do código em execução. Expansões compatíveis podem preceder o deploy que depende delas; remoções ou renomeações exigem etapas de expansão, transição do código e retirada posterior, com autorização específica quando destrutivas. Registre a sequência e a recuperação na PR; abrir a PR não equivale a publicar.
- Configure e mantenha o pipeline do repositório para cumprir essa sequência. Se o merge dispara deploy, garanta que a migration necessária seja concluída antes de ativar o código dependente; quando o código precisar vir antes, verifique seu deploy antes da migration posterior. Preserve as restrições do banco compartilhado descritas acima.
- CI de PR valida build, testes pertinentes e migrations em banco descartável. Produção usa fluxo protegido, segredos do provedor e migrations serializadas por ambiente, sem disponibilizar credenciais de produção à execução de código não confiável de PRs. Confira arquivos/hashes já aplicados para evitar reaplicação.
- Em falha, interrompa as etapas dependentes, confira o estado real e corrija antes de continuar. Não faça rollback destrutivo automático; reverta a aplicação somente se compatível com o schema vigente. Acompanhe CI, migrations e deploy até o resultado, verifique o comportamento publicado e relate PR/merge, versões, evidências e eventuais bloqueios, sem declarar sucesso só pelo merge.

## Verificação e entrega

- Execute build e verificações proporcionais à mudança. Teste acesso e transações no serviço com chave pública e acessos representativos; componentes não comprovam integração. Falhas deliberadas e testes destrutivos usam banco descartável. Identifique fixtures remotas; limpeza autorizada limita-se aos IDs da execução.
- Confira critérios aplicáveis e jornadas afetadas, incluindo persistência, isolamento, conflitos, textos preservados em falha e saída administrativa. Teste teclado e tela pequena no `iab`; diferencie viewport de dispositivo real. Registre passou/falhou/não verificado com evidências atuais e pendências.
- Mantenha no README comandos reproduzíveis, estrutura utilizada e resultados. Para migrations: arquivo, SHA-256, data, resultado e evidências sem valores reais do ambiente; metadados detalhados ficam em `artifacts/` local ignorado. Entregue código, SQL, testes pertinentes, lockfile e configuração de exemplo conforme a tarefa.
- QR definitivo depende de `PUBLIC_APP_URL` publicada: raiz do solicitante, sem credenciais ou e-mail individual, nunca localhost ou `/admin`. Verificações da etapa publicada e capacidade simultânea exigem evidência própria.
