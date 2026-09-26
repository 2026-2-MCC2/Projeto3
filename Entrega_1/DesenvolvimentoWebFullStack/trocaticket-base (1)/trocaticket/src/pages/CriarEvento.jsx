import {
  CalendarDays,
  Camera,
  ChevronDown,
  FileText,
  MapPin,
  ShieldCheck,
  UploadCloud,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function CriarEvento() {
  return (
    <div className="cadastro-evento">
      <header className="cadastro-evento__heading">
        <h1>Cadastrar Evento</h1>
      </header>

      <div className="cadastro-evento__grid">
        <div className="cadastro-evento__main">
          <FormCard icon={FileText} title="Informações Básicas">
            <div className="field-heading">
              <label htmlFor="nome-evento">Nome do Evento <Required /></label>
              <span>0/80</span>
            </div>
            <input id="nome-evento" placeholder="Ex.: Festival Aurora Sound 2026 - Edição Arena" />
            <div className="form-row">
              <Field label="Categoria / Tipo de Evento" required>
                <div className="select-wrap"><select defaultValue=""><option value="" disabled>Selecione uma categoria...</option><option>Festival</option><option>Show</option><option>Conferência</option></select><ChevronDown size={15} aria-hidden="true" /></div>
              </Field>
              <Field label="Status Operacional Inicial">
                <div className="status-select"><span /> Em planejamento</div>
              </Field>
            </div>
            <Field label="Síntese & Descrição Geral do Evento">
              <textarea rows="3" placeholder="Descreva o escopo executivo, público-alvo prioritário, line-up previsto e objetivos de infraestrutura técnica." />
            </Field>
          </FormCard>

          <FormCard icon={CalendarDays} title="Período e Localização Técnica">
            <div className="form-row">
              <Field label="Data & Início" required><input type="datetime-local" defaultValue="2026-05-15T18:00" /></Field>
              <Field label="Data & Término Previsto" required><input type="datetime-local" defaultValue="2026-05-17T02:00" /></Field>
            </div>
            <div className="form-row form-row--location">
              <Field label="Local / Espaço do Evento" required><input placeholder="Ex.: Arena Sambódromo Anhembi - Pavilhão Oeste" /></Field>
              <Field label="Cidade & UF" required><input defaultValue="São Paulo, SP" /></Field>
            </div>
          </FormCard>

          <FormCard icon={UsersRound} title="Capacidade e Audiência Prevista">
            <p className="form-description">A parametrização correta da audiência é mandatória para a estimativa de custos de segurança por metro quadrado, controle de brigadistas e proporção de banheiros químicos.</p>
            <div className="form-row"><Field label="Capacidade máxima" required><input type="number" placeholder="Ex.: 600" /></Field><Field label="Público estimado"><input type="number" placeholder="Ex.: 500" /></Field></div>
          </FormCard>
        </div>

        <aside className="cadastro-evento__side">
          <FormCard icon={Camera} title="Identidade Visual do Evento">
            <div className="event-preview">
              <img src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=85" alt="Preview de um evento musical" />
              <button type="button" className="event-preview__replace"><UploadCloud size={14} aria-hidden="true" /> Substituir</button>
              <div className="event-preview__caption"><small>PREVIEW OFICIAL</small><strong>Festival Aurora Sound 2026</strong><span><MapPin size={12} aria-hidden="true" /> Anhembi - São Paulo, SP</span></div>
            </div>
          </FormCard>
          <div className="privacy-note"><ShieldCheck size={16} aria-hidden="true" /><span>Seus dados preliminares são criptografados e nenhuma informação de bilheteria é tornada pública sem sua autorização expressa.</span></div>
        </aside>
      </div>

      <footer className="cadastro-evento__footer">
        <Link to="/organizador" className="button button--secondary">Cancelar</Link>
        <Link to="/organizador/eventos/novo/custo" className="button button--primary">Continuar</Link>
      </footer>
    </div>
  );
}

function FormCard({ icon: Icon, title, children }) {
  return <section className="form-card"><h2><span><Icon size={15} aria-hidden="true" /></span>{title}</h2>{children}</section>;
}

function Field({ label, required, children }) {
  return <label className="form-field">{label} {required && <Required />}{children}</label>;
}

function Required() {
  return <span className="required" aria-hidden="true">*</span>;
}
