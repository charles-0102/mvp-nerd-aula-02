# Central de Demandas da Equipe

Aplicação React + TypeScript + Vite com Supabase real. Solicitantes entram apenas com e-mail, criam demandas e acompanham comentários no mesmo navegador. O administrador usa Supabase Auth, consulta a equipe, revisa prioridades com justificativa e avança Aberta → Em andamento → Concluída.

## Executar localmente

Versões verificadas: Node.js **22.22.3**, npm **10.9.8**, Supabase CLI **2.84.2**, PostgreSQL **17** nos testes. Dependências exatas em `package.json` e `package-lock.json`.

```sh
nvm use
npm ci
npm run dev
```

Abra `http://127.0.0.1:5173/` para o solicitante e `/admin` para a administração. A interface local grava no projeto Supabase real configurado; não é um banco de desenvolvimento independente. O servidor aceita somente loopback. Não exponha o servidor de desenvolvimento à rede.

O `.env` existente foi preservado, permanece ignorado e tem permissão `600`. Em outro checkout, crie seu `.env` a partir dos nomes de `.env.example` e configure os valores pelo fluxo seguro do provedor. Apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` são públicas. O build recusa chaves privilegiadas e outras variáveis com prefixo `VITE_`. Nunca forneça senhas ou tokens pelo chat ou os grave em arquivos versionados.

A credencial aleatória do participante é emitida pelo banco e guardada no armazenamento local. Só o hash fica no schema privado. E-mail repetido cria outra identidade; não há recuperação por e-mail. Não são criados alunos no Auth. A conta administrativa existente é vinculada por provisionamento controlado; o aplicativo não oferece cadastro administrativo ou troca de senha.

## Estrutura

- `src/App.tsx`: entrada pública, login administrativo, lista, abertura e atendimento.
- `src/api.ts`: clientes Supabase separados por acesso, RPCs e paginação.
- `src/domain.ts`: tipos, mensagens e validação de apresentação.
- `src/styles.css`: interface responsiva, foco visível e redução de movimento.
- `supabase/migrations/`: estrutura preservada e futuras migrations incrementais.
- `scripts/database.mjs`: conferência de destino, preflight, execução individual e registro transacional de hashes.
- `scripts/test-database.mjs`: testes reais de SQL em banco descartável, com contrato Auth mínimo isolado.
- `tests/`: testes de jornadas e falhas da interface.
- `.github/workflows/ci.yml`: build, interface, migrations e regras de banco descartável.
- `.github/workflows/release.yml`: release manual protegido, com migration antes do frontend.
- `vercel.json`: rotas SPA e cabeçalhos para futura publicação na Vercel.

## Banco e migrations

A limpeza administrativa de preparação da aula já havia sido executada. **Não execute os scripts antigos de limpeza em `artifacts/`.** Em 24/10/2026, o pedido de início da implementação autorizou recriar somente os objetos da Central. O preflight confirmou ausência desses objetos; a conta administrativa existente foi reutilizada, sem mudar senha, Auth, dados ou permissões de outras aplicações.

| Migration | SHA-256 | Data | Resultado |
| --- | --- | --- | --- |
| `20261024115813_initial_structure.sql` | `372d5a3ea6cc790352b63a870385a3ef9adefcb8a4a0d63153a4d4f8af47e787` | 24/10/2026 | Aplicada e verificada no projeto configurado. |

A migration original foi preservada byte a byte. O executor acrescenta, na mesma transação, um registro privado de nome/hash/data. Há quatro tabelas de aplicação (perfis, demandas, comentários e sessões de participante), uma tabela privada de controle de migrations, 14 funções e três políticas de leitura administrativa. Todas as tabelas têm RLS; escrita de clientes ocorre exclusivamente pelas RPCs. O hash de metadados externos de políticas, gatilhos e privilégios permaneceu igual antes/depois.

```sh
supabase --version
supabase db query --help
# Se necessário, autentique sem abrir navegador externo:
supabase login --no-browser
# Vincule ao project-ref conferido na configuração local pelo operador.
npm run preflight
npm run db:apply
npm run db:provision-admin
```

O executor compara projeto, vínculo, prefixo e schema; aborta se houver configuração conflitante, objetos prévios sem histórico ou hash diferente. Cada arquivo é executado individualmente por `supabase db query --linked --file`, com registro próprio porque esse comando não atualiza o histórico padrão da CLI. Em timeout/falha, consulte o registro remoto e os diagnósticos antes de repetir. Arquivo já registrado com o mesmo hash é verificado e ignorado. Não use reset, seed geral, `db push`, `migration up`, `migration repair` ou `db pull` neste banco compartilhado.

`db:provision-admin` só vincula a conta confirmada e não anônima indicada na configuração. Perfil diferente ou conta ausente causam interrupção; não há promoção de participante nem criação/alteração de conta Auth.

## Verificação

```sh
npm run build
npm test
npm run test:db
npm run check:secrets
npm audit --audit-level=high
```

`test:db` usa PostgreSQL 17 local (`PG_TEST_BIN` permite indicar o diretório dos binários) ou `TEST_DATABASE_URL` apontando **somente para loopback**. Cria um banco com nome exclusivo, aplica as migrations, verifica permissões/regras/concorrência e remove apenas esse banco ao terminar. Nunca aponte o teste para o banco compartilhado. Na CI, o Postgres é um serviço descartável, sem credenciais de produção.

`npm run verify:remote` verifica o projeto configurado e usa a chave pública para cadastrar dois participantes com o mesmo e-mail de teste, abrir uma demanda Crítica e persistir comentários. Esse comando **grava fixtures identificadas no banco real**; não executa falhas deliberadas nem limpeza. Os IDs ficam em `artifacts/remote-smoke-fixtures.json`. A demanda de verificação visual também está identificada em `artifacts/browser-verification.json`. A limpeza não foi executada e deve se limitar a esses IDs se solicitada.

Resultados em 24/10/2026:

| Verificação | Resultado / limite |
| --- | --- |
| TypeScript e build de produção | Passou. Bundles separados para React e Supabase; fontes locais. |
| Interface | 18 testes passaram: entrada, vazio, erro, filtros/contagens, campos preservados, cliques repetidos, conclusão concorrente, revisão antiga saída com falha, expiração de JWT, separação de sessões e resposta atrasada após encerramento. |
| Banco descartável | 63 verificações/grupos passaram: isolamento, e-mail repetido, limites, permissões diretas, atomicidade com falha injetada, no-op, versão antiga, concorrência com bloqueio e revogação. |
| Supabase real via chave pública | Passou: cadastro, lista/contagens vazias de outra identidade, abertura Crítica atômica, detalhes e comentários persistentes. |
| Navegador integrado | Passou: abertura do exemplo, comentário por teclado, recarga, filtro vazio e retorno. Viewports pequenos efetivos de 360 e 453 px sem rolagem horizontal; não equivale a celular físico. |
| Login e atendimento com a conta administrativa real | Pendente de login pelo instrutor no navegador local. Regras administrativas passaram no banco descartável e na interface automatizada; isso não comprova a jornada Auth real. |
| Dependências | Auditoria sem vulnerabilidades reportadas na instalação verificada. |
| Publicação, rede da turma, simultaneidade, celular físico e QR | Não verificados; fora da entrega local e dependentes de publicação autorizada. |

CA-L01/03–10/21–23 têm evidências combinadas de interface, SQL e integração pública. CA-L02/11–20/26 têm regras e componentes verificados, com a jornada administrativa Auth real ainda pendente. CA-L24 foi verificado parcialmente por teclado e viewport pequeno. CA-L25 passou para a configuração e escopo inspecionados. Os critérios completos e limites continuam no [PRD inicial](PRDs/PRD-Inicial.md). Evidências detalhadas ficam em `artifacts/`, ignorado pelo Git, sem credenciais no material entregue.

## PR e sequência de release

O pedido atual autoriza implementação local e PR preparada para merge. **Não houve merge nem publicação.** A branch de implementação parte da `main` do repositório autorizado; a base inicial contém apenas documentação, pois o repositório estava vazio.

A CI da PR não recebe segredos de produção. O workflow de produção é manual, aceita somente `main`, exige CI verde para o commit exato e um environment `production` com revisores obrigatórios. Releases são serializados com `concurrency`, sem cancelar uma migration em andamento.

Antes de habilitar publicação:

1. Confirmar os IDs do projeto e da organização Vercel existentes e o endereço público. Não criar ou trocar destinos implicitamente.
2. Configurar o environment protegido `production`, seus revisores, variáveis de identificação do Supabase e Vercel, as duas variáveis públicas do frontend e os segredos `SUPABASE_ACCESS_TOKEN` e `VERCEL_TOKEN` diretamente no provedor.
3. Desativar qualquer deploy automático da integração Git da Vercel que pudesse contornar a sequência protegida. O merge, por si só, não deve publicar código dependente de migration ainda não verificada.
4. Após autorização de merge/publicação, aguardar os checks/revisões da PR, fazer merge e executar o release manual do commit verde da `main`.
5. O fluxo verifica hashes, aplica somente expansões compatíveis, compila, publica no projeto Vercel configurado e confere as rotas `/` e `/admin`. Depois, concluir a verificação real de autenticação, atendimento, rede e capacidade da turma.
6. Definir `PUBLIC_APP_URL`, gerar o QR definitivo para a raiz pública sem credenciais e verificar sua leitura em celular. Nenhum QR de localhost foi gerado.

Se a migration falhar, o deploy não começa. Se o deploy falhar após uma expansão, mantenha o schema e investigue; não execute rollback destrutivo. Reverter frontend só é seguro se a versão anterior for compatível com o schema vigente. Remoções e renomeações exigem plano de transição e autorização específica; o pipeline atual não as autoriza. O environment, os segredos e o vínculo Vercel de produção ainda não foram configurados ou acionados nesta entrega local.
