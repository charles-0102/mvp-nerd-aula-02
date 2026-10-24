import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import type { Demand } from "../src/domain";
const mock = vi.hoisted(() => ({
  profile: vi.fn(),
  list: vi.fn(),
  counts: vi.fn(),
  get: vi.fn(),
  comments: vi.fn(),
  rpc: vi.fn(),
  register: vi.fn(),
  storedToken: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
}));
vi.mock("../src/api", () => ({
  configured: true,
  api: mock,
  rpc: mock.rpc,
  register: mock.register,
  storedToken: mock.storedToken,
  forgetToken: vi.fn(),
  client: () => ({
    auth: {
      getSession: mock.getSession,
      signOut: mock.signOut,
      signInWithPassword: mock.signInWithPassword,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  }),
}));
const profile = {
  id: "person-a",
  role: "requester",
  email: "ana@example.test",
  display_name: "ana@example.test",
};
const demand: Demand = {
  id: "request-a",
  number: "DEM-1234ABCD",
  title: "Solicitar teclado e mouse",
  description: "Preciso dos itens para trabalhar.",
  author_id: "person-a",
  author_label: "ana@example.test",
  status: "open",
  priority: "medium",
  version: 1,
  created_at: "2026-10-24T12:00:00Z",
};
function open(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  mock.storedToken.mockReturnValue("stored-credential");
  mock.profile.mockResolvedValue(profile);
  mock.list.mockResolvedValue([]);
  mock.counts.mockResolvedValue({ open: 0, in_progress: 0, completed: 0 });
  mock.get.mockResolvedValue(demand);
  mock.comments.mockResolvedValue([]);
  mock.getSession.mockResolvedValue({
    data: { session: { user: { id: "admin" } } },
  });
  mock.signOut.mockResolvedValue({ error: null });
  mock.signInWithPassword.mockResolvedValue({ error: null });
});
describe("participant flow", () => {
  it("requires only email, explains local history and retains email after failure", async () => {
    mock.storedToken.mockReturnValue(null);
    mock.register.mockRejectedValue(Error("network"));
    open();
    const user = userEvent.setup();
    const email = await screen.findByLabelText("Seu e-mail");
    expect(screen.queryByLabelText("Senha")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Não há recuperação por e-mail/),
    ).toBeInTheDocument();
    await user.type(email, "ana@example.test");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível confirmar",
    );
    expect(email).toHaveValue("ana@example.test");
  });
  it("shows an empty initial list with zero counts and no example records", async () => {
    open();
    expect(
      await screen.findByText("Espaço para o próximo pedido."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("00")).toHaveLength(3);
    expect(screen.queryByText(demand.title)).not.toBeInTheDocument();
  });
  it("does not turn a failed query into empty data", async () => {
    mock.list.mockRejectedValue(Error("offline"));
    open();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(
      screen.queryByText("Espaço para o próximo pedido."),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(3);
  });
  it("keeps total counts independent from the filter", async () => {
    mock.list.mockResolvedValue([
      demand,
      { ...demand, id: "other", title: "Resolvida", status: "completed" },
    ]);
    mock.counts.mockResolvedValue({ open: 1, in_progress: 0, completed: 1 });
    open();
    await screen.findByText(demand.title);
    await userEvent.click(screen.getByRole("button", { name: "Concluída" }));
    expect(screen.queryByText(demand.title)).not.toBeInTheDocument();
    expect(screen.getByText("Resolvida")).toBeInTheDocument();
    expect(screen.getAllByText("01")).toHaveLength(2);
  });
  it("defaults to medium; reveals a critical reason; preserves every field after a failed write", async () => {
    mock.rpc.mockRejectedValue(Error("connection lost"));
    open("/nova");
    const user = userEvent.setup();
    const priority = await screen.findByLabelText("Prioridade");
    expect(priority).toHaveValue("medium");
    await user.type(screen.getByLabelText(/^Título/), "Um pedido");
    await user.type(screen.getByLabelText(/^Descrição/), "Uma descrição");
    await user.selectOptions(priority, "critical");
    await user.type(screen.getByLabelText(/^Justificativa/), "Sem alternativa");
    await user.click(screen.getByRole("button", { name: "Criar demanda" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "pode ter sido salvo",
    );
    expect(screen.getByLabelText(/^Título/)).toHaveValue("Um pedido");
    expect(screen.getByLabelText(/^Descrição/)).toHaveValue("Uma descrição");
    expect(screen.getByLabelText(/^Justificativa/)).toHaveValue(
      "Sem alternativa",
    );
  });
  it("blocks duplicate clicks and confirms only after the server returns", async () => {
    let finish: (value: Demand) => void = () => {};
    mock.rpc.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    open("/nova");
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/^Título/), "Title");
    await user.type(screen.getByLabelText(/^Descrição/), "Description");
    await user.click(screen.getByRole("button", { name: "Criar demanda" }));
    expect(
      screen.getByRole("button", { name: "Salvando demanda…" }),
    ).toBeDisabled();
    expect(screen.queryByText(/criada com sucesso/)).not.toBeInTheDocument();
    finish(demand);
    expect(
      await screen.findByText(/DEM-1234ABCD criada com sucesso/),
    ).toBeInTheDocument();
    expect(mock.rpc).toHaveBeenCalledTimes(1);
  });
  it("preserves a late comment and disables sending after completion", async () => {
    mock.rpc.mockRejectedValue(Error("REQUEST_COMPLETED"));
    open("/demandas/request-a");
    const user = userEvent.setup();
    await user.type(
      await screen.findByLabelText(/^Acrescente à conversa/),
      "Texto ainda não enviado",
    );
    mock.get.mockResolvedValue({ ...demand, status: "completed", version: 3 });
    await user.click(screen.getByRole("button", { name: "Enviar comentário" }));
    expect(await screen.findByLabelText(/^Seu texto preservado/)).toHaveValue(
      "Texto ainda não enviado",
    );
    expect(
      screen.queryByRole("button", { name: "Enviar comentário" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("já foi concluída");
  });
  it("never offers administrative controls to a participant", async () => {
    open("/demandas/request-a");
    await screen.findByText(demand.title);
    expect(
      screen.queryByRole("button", { name: "Iniciar atendimento" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Revisar prioridade/ }),
    ).not.toBeInTheDocument();
  });
});
describe("administrator flow", () => {
  beforeEach(() => {
    mock.profile.mockResolvedValue({
      ...profile,
      id: "admin",
      role: "admin",
      display_name: "Instrutor",
    });
  });
  it("requires a session before querying administrative data", async () => {
    mock.getSession.mockResolvedValue({ data: { session: null } });
    open("/admin");
    expect(await screen.findByLabelText("Senha")).toBeInTheDocument();
    expect(mock.profile).not.toHaveBeenCalled();
    expect(mock.list).not.toHaveBeenCalled();
  });
  it("preserves the reason and requires reopening a stale revision with the latest version", async () => {
    mock.rpc
      .mockRejectedValueOnce(Error("STALE_REQUEST"))
      .mockResolvedValueOnce({ ...demand, version: 3, priority: "critical" });
    open("/admin/demandas/request-a");
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole("button", { name: /Revisar prioridade/ }),
    );
    await user.selectOptions(
      screen.getByLabelText("Nova prioridade"),
      "critical",
    );
    await user.type(screen.getByLabelText(/^Motivo/), "Motivo preservado");
    mock.get.mockResolvedValue({ ...demand, priority: "high", version: 2 });
    await user.click(
      screen.getByRole("button", { name: "Confirmar prioridade" }),
    );
    expect(await screen.findByLabelText("Seu motivo preservado")).toHaveValue(
      "Motivo preservado",
    );
    expect(
      screen.queryByRole("button", { name: "Confirmar prioridade" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Revisar prioridade/ }),
    );
    await user.selectOptions(
      screen.getByLabelText("Nova prioridade"),
      "critical",
    );
    expect(screen.getByLabelText(/^Motivo/)).toHaveValue("Motivo preservado");
    await user.click(
      screen.getByRole("button", { name: "Confirmar prioridade" }),
    );
    await waitFor(() =>
      expect(mock.rpc).toHaveBeenLastCalledWith(
        true,
        "revise_priority",
        expect.objectContaining({
          p_expected_version: 2,
          p_expected_priority: "high",
          p_reason: "Motivo preservado",
        }),
        false,
      ),
    );
  });
  it("does not request a reason for unchanged priority", async () => {
    open("/admin/demandas/request-a");
    await userEvent.click(
      await screen.findByRole("button", { name: /Revisar prioridade/ }),
    );
    expect(screen.queryByLabelText(/^Motivo/)).not.toBeInTheDocument();
  });
  it("keeps logout available and explains a failed service logout", async () => {
    mock.signOut.mockResolvedValue({ error: Error("offline") });
    open("/admin");
    await userEvent.click(
      await screen.findByRole("button", {
        name: "Sair da conta administrativa",
      }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível encerrar",
    );
    expect(
      screen.getByRole("button", { name: "Sair da conta administrativa" }),
    ).not.toBeDisabled();
  });
});
