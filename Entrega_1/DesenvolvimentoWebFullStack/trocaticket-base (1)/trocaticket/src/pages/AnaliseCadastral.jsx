import { useNavigate } from "react-router-dom";
import "./AnaliseCadastral.css"; // Importando o CSS puro

export default function AnaliseCadastral() {
  const navigate = useNavigate();

  const handleReenviarEmail = () => {
    alert("E-mail de confirmação reenviado para o seu endereço cadastrado!");
  };

  return (
    <div className="analise-page">
      <main className="analise-main">
        <div className="analise-content-wrapper">
          
          <section className="status-card">
            <div className="card-top-bar"></div>
            
            <div className="card-body">
              {/* Ícone de Status com Animação */}
              <div className="status-icon-container">
                <div className="status-icon-pulse"></div>
                <div className="status-icon-circle">
                  <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
              </div>

              {/* Textos Principais */}
              <h1 className="analise-title">Cadastro Enviado para Análise</h1>
              
              <p className="analise-subtitle">
                Seu cadastro está sendo analisado. Você receberá a notificação de validação cadastral por e-mail após a análise documental.
              </p>
              
              <p className="analise-prazo">
                O prazo padrão de análise é de <strong>24 a 48 horas úteis</strong>.
              </p>

              {/* Barra de Progresso (Stepper) */}
              <div className="stepper-container">
                <h2>Etapas do Processo de Credenciamento</h2>
                
                <div className="stepper-track-wrapper">
                  <div className="stepper-line"></div>
                  
                  {/* Passo 1 */}
                  <div className="step-item">
                    <div className="step-circle step-completed">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path>
                      </svg>
                    </div>
                    <span>Envio</span>
                  </div>
                  
                  {/* Passo 2 */}
                  <div className="step-item">
                    <div className="step-circle step-active">
                      <svg className="spin-animation" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                      </svg>
                    </div>
                    <span className="text-active">Análise</span>
                  </div>
                  
                  {/* Passo 3 */}
                  <div className="step-item">
                    <div className="step-circle step-pending">3</div>
                    <span className="text-pending">Liberação</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="analise-actions">
                <button className="btn-primary" onClick={() => navigate('/login')}>
                  Fazer Login
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" fillRule="evenodd"></path>
                  </svg>
                </button>
                <button className="btn-secondary" onClick={handleReenviarEmail} type="button">
                  Reenviar E-mail
                </button>
              </div>
              
              <p className="analise-help">
                Dúvidas no envio de documentos? 
                <button onClick={() => navigate('/suporte')}>Fale com a equipe de suporte</button>
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}