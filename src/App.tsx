import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Inbox,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  api,
  client,
  configured,
  forgetToken,
  register,
  rpc,
  storedToken,
} from "./api";
import {
  dateLabel,
  errorLabel,
  priorities,
  statuses,
  timezone,
  validText,
  type Comment,
  type Counts,
  type Demand,
  type Priority,
  type Profile,
  type Status,
} from "./domain";

export function Alert({
  children,
  success = false,
}: {
  children: ReactNode;
  success?: boolean;
}) {
  return (
    <div
      className={`notice ${success ? "success" : "error"}`}
      role={success ? "status" : "alert"}
    >
      {children}
    </div>
  );
}
function Loading() {
  return (
    <div className="loading" role="status">
      <RefreshCw size={20} className="spin" /> Carregando sua central…
    </div>
  );
}
function PriorityBadge({ value }: { value: Priority }) {
  return (
    <span className={`badge priority-${value}`}>
      <span className="priority-mark">
        {value === "critical"
          ? "!!"
          : value === "high"
            ? "↑"
            : value === "low"
              ? "↓"
              : "−"}
      </span>
      {priorities[value]}
    </span>
  );
}
function StatusBadge({ value }: { value: Status }) {
  const Icon =
    value === "completed"
      ? CheckCircle2
      : value === "in_progress"
        ? Clock3
        : Circle;
  return (
    <span className={`badge status-${value}`}>
      <Icon size={13} />
      {statuses[value]}
    </span>
  );
}
function Wordmark() {
  return (
    <span className="wordmark">
      <span className="brand-icon">
        <LayoutGrid size={21} strokeWidth={1.7} />
      </span>
      central<span className="brand-dot">.</span>
    </span>
  );
}

export default function App() {
  const location = useLocation();
  const admin =
    location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  return <Workspace key={admin ? "admin" : "requester"} admin={admin} />;
}
function Workspace({ admin }: { admin: boolean }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();
  const base = admin ? "/admin" : "";
  useEffect(() => {
    let active = true;
    let sessionInvalidated = false;
    const boot = async () => {
      setLoading(true);
      try {
        if (!configured) throw Error("CONFIGURATION_MISSING");
        if (admin) {
          const { data, error } = await client(true).auth.getSession();
          if (error) throw error;
          if (!data.session) return;
        } else if (!storedToken()) return;
        const current = await api.profile(admin);
        if (admin && current.role !== "admin") throw Error("ACCESS_DENIED");
        if (active && !sessionInvalidated) {
          setProfile(current);
          setError("");
        }
      } catch (e) {
        if (active && !sessionInvalidated) setError(errorLabel(e));
      } finally {
        if (active) setLoading(false);
      }
    };
    void boot();
    const lost = (event: Event) => {
      if ((event as CustomEvent).detail.admin !== admin) return;
      sessionInvalidated = true;
      setLoading(false);
      if (!admin) forgetToken();
      setProfile(null);
      setError(
        admin
          ? "Sua sessão administrativa terminou. Entre novamente."
          : "Seu acesso do navegador não está mais disponível. Um novo acesso começa com histórico vazio; as demandas anteriores permanecem salvas.",
      );
    };
    window.addEventListener("central:session-lost", lost);
    const subscription =
      admin && configured
        ? client(true).auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT") {
              sessionInvalidated = true;
              setLoading(false);
              setProfile(null);
              setError("Sessão administrativa encerrada.");
              navigate("/admin", { replace: true });
            }
          })
        : null;
    const storage = (event: StorageEvent) => {
      if (!admin && event.key === "central.participant.v1") {
        setProfile(null);
        setRetry((v) => v + 1);
      }
    };
    window.addEventListener("storage", storage);
    return () => {
      active = false;
      window.removeEventListener("central:session-lost", lost);
      window.removeEventListener("storage", storage);
      subscription?.data.subscription.unsubscribe();
    };
  }, [admin, navigate, retry]);
  async function signOut() {
    setSigningOut(true);
    setError("");
    const { error } = await client(true).auth.signOut({ scope: "local" });
    if (error) {
      setError(
        "Não foi possível encerrar a sessão no serviço. Tente sair novamente.",
      );
      setSigningOut(false);
      return;
    }
    setProfile(null);
    setSigningOut(false);
    navigate("/admin", { replace: true });
  }
  if (loading)
    return (
      <div className="boot">
        <Wordmark />
        <Loading />
      </div>
    );
  if (!profile)
    return (
      <Entry
        admin={admin}
        error={error}
        setError={setError}
        onEnter={setProfile}
        onRetry={() => setRetry((v) => v + 1)}
      />
    );
  return (
    <div className="workspace">
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <Link to={base || "/"} aria-label="Central, início">
          <Wordmark />
        </Link>
        <div className="workspace-label">ESPAÇO DA EQUIPE</div>
        <nav aria-label="Principal">
          <Link className="nav-active" to={base || "/"}>
            <Inbox size={18} />
            {admin ? "Todas as demandas" : "Minhas demandas"}
            <span className="nav-dot" />
          </Link>
        </nav>
        <div className="sidebar-note">
          <span className="mini-orbit">
            <MessageSquare size={20} />
          </span>
          <h3>
            Uma equipe.
            <br />
            Tudo em um lugar.
          </h3>
          <p>
            Do primeiro pedido
            <br />
            até a solução.
          </p>
        </div>
        <div className="sidebar-bottom">
          <span className="avatar">
            {admin ? (
              <ShieldCheck size={18} />
            ) : (
              profile.email.slice(0, 1).toUpperCase()
            )}
          </span>
          <div>
            <strong>{admin ? profile.display_name : "Seu espaço"}</strong>
            <small>{admin ? "Administrador" : "Solicitante"}</small>
          </div>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <span className="topbar-label">
            Central de Demandas <span>/</span>{" "}
            <strong>{admin ? "Administração" : "Área do solicitante"}</strong>
          </span>
          <div className="topbar-actions">
            <span className="session-label">{profile.email}</span>
            {admin && (
              <button
                className="icon-button"
                onClick={() => void signOut()}
                disabled={signingOut}
                aria-label="Sair da conta administrativa"
              >
                <LogOut size={17} /> Sair
              </button>
            )}
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {error && <Alert>{error}</Alert>}
          <Routes>
            <Route path={base || "/"} element={<Dashboard admin={admin} />} />
            <Route
              path={`${base}/nova`}
              element={<NewDemand admin={admin} />}
            />
            <Route
              path={`${base}/demandas/:id`}
              element={<Details admin={admin} profile={profile} />}
            />
            <Route path="*" element={<Navigate to={base || "/"} replace />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <span>Central de Demandas da Equipe</span>
          <span>Horários em {timezone}</span>
        </footer>
      </div>
    </div>
  );
}
function Entry({
  admin,
  error,
  setError,
  onEnter,
  onRetry,
}: {
  admin: boolean;
  error: string;
  setError: (value: string) => void;
  onEnter: (p: Profile) => void;
  onRetry: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (admin) {
        const { error } = await client(true).auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        const profile = await api.profile(true);
        if (profile.role !== "admin") {
          await client(true).auth.signOut({ scope: "local" });
          throw Error("ACCESS_DENIED");
        }
        onEnter(profile);
      } else onEnter(await register(email));
      navigate(admin ? "/admin" : "/", { replace: true });
    } catch (e) {
      setError(errorLabel(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="entry">
      <div className="entry-story">
        <Link to="/" aria-label="Central, início">
          <Wordmark />
        </Link>
        <div className="story-content">
          <span className="eyebrow">
            <span className="little-dot" /> ORGANIZE. ACOMPANHE. RESOLVA.
          </span>
          <h1>
            Boas ideias
            <br />
            merecem
            <br />
            <em>um próximo passo.</em>
          </h1>
          <p>
            Um lugar para os pedidos da equipe.
            <br />E para acompanhar o que acontece depois.
          </p>
          <div className="journey">
            <span>
              <Circle size={16} /> Aberta
            </span>
            <span className="journey-line" />
            <span>
              <Clock3 size={16} /> Em andamento
            </span>
            <span className="journey-line" />
            <span>
              <CheckCircle2 size={16} /> Concluída
            </span>
          </div>
        </div>
        <span className="story-footer">
          MENOS MENSAGENS ESPALHADAS. MAIS CLAREZA.
        </span>
        <div className="story-art" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <section className="entry-form-area">
        <div className="entry-mobile-brand">
          <Wordmark />
        </div>
        <div className="entry-card">
          <span className="entry-icon">
            {admin ? <ShieldCheck size={26} /> : <ArrowDownRight size={28} />}
          </span>
          <span className="eyebrow">
            {admin ? "ACESSO ADMINISTRATIVO" : "SEU ESPAÇO NA EQUIPE"}
          </span>
          <h2>
            {admin ? "Vamos cuidar das demandas?" : "Tudo começa por aqui."}
          </h2>
          <p className="subtle">
            {admin
              ? "Entre com sua conta para organizar os pedidos e dar o próximo passo."
              : "Informe seu e-mail para enviar pedidos e acompanhar o atendimento."}
          </p>
          {error && <Alert>{error}</Alert>}
          <form onSubmit={submit}>
            <label htmlFor="email">{admin ? "E-mail" : "Seu e-mail"}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
            {admin && (
              <>
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                />
              </>
            )}
            <button
              className="button primary full"
              disabled={busy || !configured}
            >
              {busy ? "Entrando…" : admin ? "Entrar na central" : "Continuar"}
              <ArrowRight size={18} />
            </button>
          </form>
          {!admin && (
            <div className="privacy-note">
              <ShieldCheck size={18} />
              <p>
                Seu histórico fica neste navegador. Se trocar de dispositivo ou
                limpar os dados, você começa um novo acesso, mesmo usando o
                mesmo e-mail. Não há recuperação por e-mail.
              </p>
            </div>
          )}
          {error && (
            <button className="text-button" onClick={onRetry}>
              Tentar retomar acesso
            </button>
          )}
          <div className="entry-switch">
            {admin ? (
              <Link to="/">← Voltar ao acesso do solicitante</Link>
            ) : (
              <Link to="/admin">
                É administrador?{" "}
                <span>
                  Acesse o painel <ArrowRight size={14} />
                </span>
              </Link>
            )}
          </div>
        </div>
        <span className="entry-footer">
          Feito para conectar pedidos a soluções.
        </span>
      </section>
    </div>
  );
}
function Dashboard({ admin }: { admin: boolean }) {
  const [data, setData] = useState<{ rows: Demand[]; counts: Counts } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Status | "all">("all");
  const base = admin ? "/admin" : "";
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setBusy(true);
    setError("");
    try {
      const [rows, counts] = await Promise.all([
        api.list(admin),
        api.counts(admin),
      ]);
      if (request === generation.current) setData({ rows, counts });
    } catch (e) {
      if (request === generation.current) setError(errorLabel(e));
    } finally {
      if (request === generation.current) setBusy(false);
    }
  }, [admin]);
  useEffect(() => {
    void refresh();
    return () => {
      generation.current++;
    };
  }, [refresh]);
  const rows =
    data?.rows.filter((r) => filter === "all" || r.status === filter) ?? [];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {admin ? "VISÃO DA EQUIPE" : "CADA PEDIDO, UM PRÓXIMO PASSO"}
          </span>
          <h1>
            {admin ? "Todas as demandas" : "Minhas demandas"}
            <span className="heading-dot">.</span>
          </h1>
          <p>
            {admin
              ? "Organize o que chegou e faça o atendimento avançar."
              : "Acompanhe seus pedidos, do início à solução."}
          </p>
        </div>
        <Link className="button primary" to={`${base}/nova`}>
          <Plus size={18} />
          Nova demanda
        </Link>
      </div>
      <div className="stats" aria-label="Totais de demandas">
        {(Object.keys(statuses) as Status[]).map((status, i) => {
          const Icon = i === 0 ? Inbox : i === 1 ? Clock3 : CheckCircle2;
          return (
            <div className={`stat stat-${status}`} key={status}>
              <div className="stat-top">
                <span>{statuses[status]}</span>
                <Icon size={19} />
              </div>
              <div className="stat-value">
                {data ? data.counts[status].toString().padStart(2, "0") : "—"}
              </div>
              <span className="stat-caption">
                {i === 0
                  ? "Aguardando o primeiro passo"
                  : i === 1
                    ? "Já estamos cuidando disso"
                    : "Um pedido, uma solução"}
              </span>
            </div>
          );
        })}
      </div>
      <p className="count-explanation">
        Totais das demandas que você pode consultar; o filtro altera apenas a
        lista.
      </p>
      <section className="requests-panel">
        <div className="list-toolbar">
          <div
            className="filters"
            role="group"
            aria-label="Filtrar por situação"
          >
            {(["all", ...Object.keys(statuses)] as (Status | "all")[]).map(
              (value) => (
                <button
                  aria-pressed={filter === value}
                  key={value}
                  onClick={() => setFilter(value)}
                >
                  {value === "all" ? "Todas" : statuses[value]}
                </button>
              ),
            )}
          </div>
          <button
            className="icon-button refresh"
            onClick={() => void refresh()}
            disabled={busy}
          >
            <RefreshCw size={16} className={busy ? "spin" : ""} />
            {busy ? "Atualizando…" : "Atualizar"}
          </button>
        </div>
        {error && <Alert>{error}</Alert>}
        {busy && !data ? (
          <Loading />
        ) : !data ? (
          <div className="empty">
            <p>A consulta não foi concluída.</p>
            <button className="button secondary" onClick={() => void refresh()}>
              Tentar novamente
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">
              <Inbox size={30} strokeWidth={1.4} />
            </span>
            <h2>
              {filter === "all"
                ? "Espaço para o próximo pedido."
                : "Nenhuma demanda nesta situação."}
            </h2>
            <p>
              {filter === "all"
                ? "Precisa de algo? Crie uma demanda e acompanhe cada passo por aqui."
                : "Experimente outro filtro para encontrar seus pedidos."}
            </p>
            {filter === "all" ? (
              <Link className="button secondary" to={`${base}/nova`}>
                <Plus size={16} />
                Criar primeira demanda
              </Link>
            ) : (
              <button
                className="button secondary"
                onClick={() => setFilter("all")}
              >
                Ver todas
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-head">
              <span>DEMANDA</span>
              <span>SITUAÇÃO</span>
              <span>PRIORIDADE</span>
              <span>CRIADA EM</span>
            </div>
            <ul className="request-list">
              {rows.map((row) => (
                <li key={row.id}>
                  <Link
                    to={`${base}/demandas/${row.id}`}
                    className="request-row"
                  >
                    <div className="request-name">
                      <span className="request-number">{row.number}</span>
                      <strong>{row.title}</strong>
                      {admin && <small>{row.author_label}</small>}
                    </div>
                    <StatusBadge value={row.status} />
                    <PriorityBadge value={row.priority} />
                    <time dateTime={row.created_at}>
                      {dateLabel(row.created_at)}
                    </time>
                    <ArrowRight className="row-arrow" size={17} />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="list-bottom">
              {rows.length} {rows.length === 1 ? "demanda" : "demandas"} nesta
              lista <span>Mais recentes primeiro</span>
            </div>
          </>
        )}
      </section>
      <div className="help-line">
        <Sparkles size={16} />
        <span>
          Um contexto claro ajuda a equipe a encontrar a melhor solução.
        </span>
      </div>
    </>
  );
}
export function DemandFields({
  form,
  setForm,
  disabled,
}: {
  form: {
    title: string;
    description: string;
    priority: Priority;
    reason: string;
  };
  setForm: (f: typeof form) => void;
  disabled: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="fields">
      <label htmlFor="title">
        Título <span>até 120 caracteres</span>
      </label>
      <input
        id="title"
        required
        maxLength={120}
        value={form.title}
        placeholder="Ex.: Solicitar teclado e mouse"
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <label htmlFor="description">
        Descrição <span>até 2.000 caracteres</span>
      </label>
      <textarea
        id="description"
        required
        maxLength={2000}
        rows={5}
        value={form.description}
        placeholder="Conte o que você precisa e dê um pouco de contexto."
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <label htmlFor="priority">Prioridade</label>
      <select
        id="priority"
        value={form.priority}
        onChange={(e) =>
          setForm({ ...form, priority: e.target.value as Priority })
        }
      >
        {Object.entries(priorities).map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
      <p className="field-help">
        A prioridade indica urgência e impacto, sem promessa de prazo. A equipe
        pode revisá-la com uma justificativa.
      </p>
      {form.priority === "critical" && (
        <>
          <label htmlFor="critical-reason">
            Justificativa da prioridade Crítica{" "}
            <span>até 1.000 caracteres</span>
          </label>
          <textarea
            id="critical-reason"
            required
            maxLength={1000}
            rows={3}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            aria-describedby="critical-help"
          />
          <p id="critical-help" className="field-help">
            Explique o impacto, o que impede seu trabalho e por que não há
            alternativa temporária.
          </p>
        </>
      )}
    </fieldset>
  );
}
function NewDemand({ admin }: { admin: boolean }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    reason: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const base = admin ? "/admin" : "";
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (
      !validText(form.title, 120) ||
      !validText(form.description, 2000) ||
      (form.priority === "critical" && !validText(form.reason, 1000))
    ) {
      setError(
        "Preencha título, descrição e, para prioridade Crítica, a justificativa. Texto somente com espaços não é válido.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const row = await rpc<Demand>(admin, "create_request", {
        p_title: form.title,
        p_description: form.description,
        p_priority: form.priority,
        p_reason: form.reason,
      });
      navigate(`${base}/demandas/${row.id}`, {
        state: { created: row.number },
      });
    } catch (e) {
      setError(errorLabel(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link className="back-link" to={base || "/"}>
        <ArrowLeft size={16} />
        Voltar às demandas
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">VAMOS DAR O PRIMEIRO PASSO</span>
          <h1>
            Nova demanda<span className="heading-dot">.</span>
          </h1>
          <p>Conte o que precisa. A equipe cuida do próximo passo.</p>
        </div>
      </div>
      <div className="form-layout">
        <form className="card demand-form" onSubmit={submit}>
          {error && <Alert>{error}</Alert>}
          <DemandFields form={form} setForm={setForm} disabled={busy} />
          <div className="form-actions">
            <Link className="text-button" to={base || "/"}>
              Cancelar
            </Link>
            <button className="button primary" disabled={busy}>
              {busy ? "Salvando demanda…" : "Criar demanda"}
              <ArrowRight size={17} />
            </button>
          </div>
        </form>
        <aside className="form-advice">
          <span className="entry-icon">
            <MessageSquare size={25} />
          </span>
          <h2>
            Um bom pedido
            <br />
            começa com contexto.
          </h2>
          <p>Descreva o que você precisa e como isso ajuda no seu trabalho.</p>
          <div>
            <Check size={16} />
            <span>Dê um título fácil de reconhecer.</span>
          </div>
          <div>
            <Check size={16} />
            <span>Inclua as informações importantes.</span>
          </div>
          <div>
            <Check size={16} />
            <span>Você poderá acrescentar comentários até a conclusão.</span>
          </div>
          <p className="field-help">
            Título e descrição não podem ser editados depois de salvos. Revise
            antes de enviar.
          </p>
        </aside>
      </div>
    </>
  );
}
function Details({ admin, profile }: { admin: boolean; profile: Profile }) {
  const { id = "" } = useParams();
  const location = useLocation();
  const base = admin ? "/admin" : "";
  const [demand, setDemand] = useState<Demand | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    location.state?.created
      ? `Demanda ${location.state.created} criada com sucesso.`
      : "",
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [body, setBody] = useState("");
  const [revision, setRevision] = useState<{
    version: number;
    priority: Priority;
    selected: Priority;
  } | null>(null);
  const [reason, setReason] = useState("");
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    try {
      const [row, entries] = await Promise.all([
        api.get(admin, id),
        api.comments(admin, id),
      ]);
      if (request === generation.current) {
        setDemand(row);
        setComments(entries);
      }
      return row;
    } catch (e) {
      if (request === generation.current) {
        setError(errorLabel(e));
        if ((e as { message?: string }).message === "NOT_FOUND_OR_DENIED")
          setDemand(null);
      }
      return null;
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [admin, id]);
  useEffect(() => {
    setDemand(null);
    setComments([]);
    setRevision(null);
    setBody("");
    setReason("");
    setError("");
    void refresh();
    return () => {
      generation.current++;
    };
  }, [refresh]);
  async function mutate(
    action: string,
    name: string,
    args: Record<string, unknown>,
    successText: string,
  ) {
    if (busy) return;
    setBusy(action);
    setError("");
    setSuccess("");
    try {
      await rpc(admin, name, args, name === "add_comment");
      setSuccess(successText);
      if (action === "comment") setBody("");
      if (action === "revision") {
        setReason("");
        setRevision(null);
      }
      await refresh();
    } catch (e) {
      setError(errorLabel(e));
      const message = (e as { message?: string }).message ?? "";
      if (
        ["STALE_REQUEST", "REQUEST_COMPLETED", "INVALID_TRANSITION"].includes(
          message,
        )
      ) {
        await refresh();
        if (action === "revision") setRevision(null);
      }
    } finally {
      setBusy("");
    }
  }
  if (loading && !demand) return <Loading />;
  if (!demand)
    return (
      <>
        <Link className="back-link" to={base || "/"}>
          <ArrowLeft size={16} />
          Voltar à lista
        </Link>
        <Alert>
          {error || "Demanda não encontrada ou acesso não permitido."}
        </Alert>
        <button className="button secondary" onClick={() => void refresh()}>
          Tentar novamente
        </button>
      </>
    );
  const closed = demand.status === "completed";
  const next = demand.status === "open" ? "in_progress" : "completed";
  return (
    <>
      <div className="detail-top">
        <Link className="back-link" to={base || "/"}>
          <ArrowLeft size={16} />
          Voltar às demandas
        </Link>
        <button
          className="icon-button"
          onClick={() => {
            setError("");
            void refresh();
          }}
          disabled={loading || Boolean(busy)}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Atualizar
        </button>
      </div>
      {success && <Alert success>{success}</Alert>}
      {error && <Alert>{error}</Alert>}
      <div className="detail-grid">
        <div>
          <article className="card detail-card">
            <span className="request-number">{demand.number}</span>
            <h1>{demand.title}</h1>
            <div className="detail-badges">
              <StatusBadge value={demand.status} />
              <PriorityBadge value={demand.priority} />
            </div>
            <div className="description">
              <h2>Sobre a demanda</h2>
              <p>{demand.description}</p>
            </div>
            <div className="detail-meta">
              <span>
                Solicitada por{" "}
                <strong>
                  {demand.author_id === profile.id
                    ? "Você"
                    : demand.author_label}
                </strong>
              </span>
              <time dateTime={demand.created_at}>
                {dateLabel(demand.created_at)}
              </time>
            </div>
          </article>
          <section className="card conversation">
            <h2>
              <MessageSquare size={20} />
              Conversa <span>{comments.length}</span>
            </h2>
            {comments.length === 0 ? (
              <p className="no-comments">
                A conversa começa aqui. Acrescente contexto ou acompanhe as
                respostas da equipe.
              </p>
            ) : (
              <ol className="comments">
                {comments.map((comment) => (
                  <li key={comment.id}>
                    <span
                      className={`comment-avatar ${comment.kind !== "comment" ? "decision-avatar" : ""}`}
                    >
                      {comment.kind === "comment" ? (
                        <MessageSquare size={16} />
                      ) : (
                        <ArrowDownRight size={17} />
                      )}
                    </span>
                    <div className="comment-content">
                      <div className="comment-meta">
                        <strong>
                          {comment.author_id === profile.id
                            ? "Você"
                            : comment.author_label}
                        </strong>
                        <time dateTime={comment.created_at}>
                          {dateLabel(comment.created_at)}
                        </time>
                      </div>
                      {comment.kind === "critical_opening" && (
                        <span className="decision-title">
                          Justificativa de abertura Crítica
                        </span>
                      )}
                      {comment.kind === "priority_change" && (
                        <span className="decision-title">
                          Prioridade revisada:{" "}
                          {priorities[comment.previous_priority!]} →{" "}
                          {priorities[comment.new_priority!]}
                        </span>
                      )}
                      <p>{comment.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {closed && (
              <div className="closed-notice">
                <CheckCircle2 size={19} />
                <div>
                  <strong>Demanda concluída</strong>
                  <p>
                    O histórico continua disponível para consulta. Não é
                    possível comentar, revisar ou reabrir.
                  </p>
                </div>
              </div>
            )}
            {(!closed || body) && (
              <form
                className="comment-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!validText(body, 1000)) {
                    setError(
                      "Escreva um comentário de 1 a 1.000 caracteres, além de espaços.",
                    );
                    return;
                  }
                  void mutate(
                    "comment",
                    "add_comment",
                    { p_request_id: id, p_body: body },
                    "Comentário enviado.",
                  );
                }}
              >
                <label htmlFor="comment">
                  {closed ? "Seu texto preservado" : "Acrescente à conversa"}
                  <span>até 1.000 caracteres</span>
                </label>
                <textarea
                  id="comment"
                  maxLength={1000}
                  required
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  readOnly={closed}
                  disabled={Boolean(busy)}
                  placeholder="Compartilhe uma informação ou tire uma dúvida…"
                />
                {!closed && (
                  <button className="button primary" disabled={Boolean(busy)}>
                    {busy === "comment" ? "Enviando…" : "Enviar comentário"}
                    <ArrowRight size={16} />
                  </button>
                )}
              </form>
            )}
          </section>
        </div>
        <aside className="detail-aside">
          <section className="card progress-card">
            <span className="eyebrow">CADA PASSO CONTA</span>
            <h2>Andamento</h2>
            <ol className="progress-steps">
              {(Object.keys(statuses) as Status[]).map((status, i) => {
                const currentIndex = Object.keys(statuses).indexOf(
                  demand.status,
                );
                return (
                  <li
                    className={i <= currentIndex ? "step-reached" : ""}
                    key={status}
                  >
                    <span>
                      {i < currentIndex || closed ? <Check size={15} /> : i + 1}
                    </span>
                    <div>
                      <strong>{statuses[status]}</strong>
                      <small>
                        {i === 0
                          ? "Pedido recebido"
                          : i === 1
                            ? "Equipe em ação"
                            : "Atendimento finalizado"}
                      </small>
                    </div>
                  </li>
                );
              })}
            </ol>
            {admin && !closed && (
              <button
                className="button primary full"
                disabled={Boolean(busy)}
                onClick={() =>
                  void mutate(
                    "status",
                    "advance_status",
                    {
                      p_request_id: id,
                      p_next_status: next,
                      p_expected_version: demand.version,
                    },
                    next === "completed"
                      ? "Demanda concluída."
                      : "Atendimento iniciado.",
                  )
                }
              >
                {busy === "status"
                  ? "Salvando…"
                  : next === "in_progress"
                    ? "Iniciar atendimento"
                    : "Concluir demanda"}
                <ArrowRight size={16} />
              </button>
            )}
          </section>
          {admin && (
            <section className="card revision-card">
              <h2>Prioridade</h2>
              <PriorityBadge value={demand.priority} />
              {!closed && !revision && (
                <button
                  className="text-button"
                  onClick={() =>
                    setRevision({
                      version: demand.version,
                      priority: demand.priority,
                      selected: demand.priority,
                    })
                  }
                  disabled={Boolean(busy)}
                >
                  Revisar prioridade <ArrowRight size={14} />
                </button>
              )}
              {revision && !closed && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      revision.selected !== revision.priority &&
                      !validText(reason, 1000)
                    ) {
                      setError(
                        "Justifique a revisão com 1 a 1.000 caracteres, além de espaços.",
                      );
                      return;
                    }
                    void mutate(
                      "revision",
                      "revise_priority",
                      {
                        p_request_id: id,
                        p_priority: revision.selected,
                        p_reason: reason,
                        p_expected_priority: revision.priority,
                        p_expected_version: revision.version,
                      },
                      revision.selected === revision.priority
                        ? "Prioridade mantida, sem nova decisão."
                        : "Prioridade revisada com justificativa.",
                    );
                  }}
                >
                  <p className="field-help">
                    Situação atual: {statuses[demand.status]}. Revisando a
                    prioridade {priorities[revision.priority]}.
                  </p>
                  <label htmlFor="new-priority">Nova prioridade</label>
                  <select
                    id="new-priority"
                    value={revision.selected}
                    onChange={(e) =>
                      setRevision({
                        ...revision,
                        selected: e.target.value as Priority,
                      })
                    }
                    disabled={Boolean(busy)}
                  >
                    {Object.entries(priorities).map(([value, text]) => (
                      <option key={value} value={value}>
                        {text}
                      </option>
                    ))}
                  </select>
                  {revision.selected !== revision.priority && (
                    <>
                      <label htmlFor="revision-reason">
                        Motivo <span>até 1.000 caracteres</span>
                      </label>
                      <textarea
                        id="revision-reason"
                        required
                        maxLength={1000}
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={Boolean(busy)}
                      />
                    </>
                  )}
                  <button
                    className="button primary full"
                    disabled={Boolean(busy)}
                  >
                    {busy === "revision" ? "Salvando…" : "Confirmar prioridade"}
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setRevision(null)}
                    disabled={Boolean(busy)}
                  >
                    Cancelar revisão
                  </button>
                </form>
              )}
              {!revision && reason && (
                <div>
                  <label htmlFor="preserved-reason">
                    Seu motivo preservado
                  </label>
                  <textarea
                    id="preserved-reason"
                    value={reason}
                    readOnly
                    rows={3}
                  />
                  <p className="field-help">
                    Reavalie o estado atual e abra a revisão novamente para
                    tentar salvar.
                  </p>
                </div>
              )}
            </section>
          )}
          <p className="detail-tip">
            As atualizações aparecem ao selecionar <strong>Atualizar</strong>.
            Você pode voltar quando precisar.
          </p>
        </aside>
      </div>
    </>
  );
}
