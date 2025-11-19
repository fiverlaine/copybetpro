import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PoliciesModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void;
  canClose?: boolean;
  loading?: boolean;
}

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export function PoliciesModal({ isOpen, onAccept, onClose, canClose = false, loading = false }: PoliciesModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHasScrolled(false);
      setAccepted(false);
      document.body.style.overflow = 'hidden';
      
      // Verifica se o conteúdo já está todo visível (não precisa de scroll)
      setTimeout(() => {
        const contentElement = document.querySelector('[data-policies-content]') as HTMLElement;
        if (contentElement) {
          const needsScroll = contentElement.scrollHeight > contentElement.clientHeight;
          if (!needsScroll) {
            setHasScrolled(true);
          }
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    // Verifica se rolou até o final (com margem de 10px)
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolled(true);
    }
  };

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 md:px-10 lg:px-16 md:py-12 lg:py-16 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policies-modal-title"
      aria-describedby="policies-modal-content"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={canClose ? onClose : undefined}
        style={{ cursor: canClose ? 'pointer' : 'default' }}
      />

      {/* Modal */}
      <div className="relative w-full h-full md:h-auto max-w-[min(1100px,96vw)] md:min-w-[720px] max-h-[94vh] md:max-h-[90vh] min-h-[60vh] glass-card animate-scale-in overflow-hidden flex flex-col shadow-2xl border border-white/10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary-dark/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Termos de Uso</h2>
              <p className="text-xs text-gray-400">Informações importantes sobre nosso serviço</p>
            </div>
          </div>
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div 
          data-policies-content
          className="flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-6 space-y-5 text-sm md:text-base"
          onScroll={handleScroll}
        >
          {/* Introdução */}
          <div className="space-y-2">
            <p className="text-gray-300 leading-relaxed">
              Bem-vindo ao <strong className="text-white">COPYBETPRO</strong>! Estamos felizes em tê-lo conosco. 
              Antes de começar, gostaríamos de compartilhar algumas informações importantes sobre nosso serviço.
            </p>
            <p className="text-gray-400 leading-relaxed text-xs md:text-sm">
              Nosso objetivo é oferecer uma experiência transparente e segura. Ao aceitar estes termos, você estará 
              concordando com as condições de uso da plataforma.
            </p>
          </div>

          {/* Seção 1: Sobre o Serviço */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-primary">1.</span>
              Como Funciona o COPYBETPRO
            </h3>
            <div className="pl-5 space-y-2 text-gray-400 leading-relaxed text-xs md:text-sm">
              <p>
                O <strong className="text-white">COPYBETPRO</strong> é uma plataforma que replica automaticamente as apostas de traders 
                profissionais. Nosso sistema facilita o processo de replicação de estratégias de forma automatizada.
              </p>
              <p>
                <strong className="text-white">Importante:</strong> Nossos serviços são uma ferramenta de auxílio. Não garantimos 
                resultados financeiros específicos, pois apostas esportivas envolvem riscos naturais de mercado.
              </p>
              <p>
                Recomendamos usar apenas recursos que pode se dar ao luxo de perder. A responsabilidade pelas decisões 
                financeiras e pelos resultados obtidos é sua.
              </p>
            </div>
          </div>

          {/* Seção 2: Limitações e Possíveis Falhas */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-warning">2.</span>
              Sobre Falhas Técnicas e Limitações do Sistema
            </h3>
            <div className="pl-5 space-y-2 text-gray-400 leading-relaxed text-xs md:text-sm">
              <p>
                Como qualquer sistema de software, o COPYBETPRO pode apresentar problemas técnicos como: 
                problemas de conexão, erros de processamento, bugs de software, dificuldades de sincronização, 
                interrupções para manutenção ou erros na configuração.
              </p>
              <div className="mt-2 p-3 rounded bg-warning/10 border border-warning/20">
                <p className="text-warning font-semibold text-xs mb-1">⚠️ Importante</p>
                <p className="text-gray-300 text-xs">
                  <strong>Se ocorrerem perdas financeiras devido a falhas técnicas, bugs, erros do sistema ou 
                  interrupções de serviço, a responsabilidade será sua.</strong> O COPYBETPRO não se responsabiliza 
                  por perdas resultantes desses problemas técnicos.
                </p>
              </div>
              <p>
                Recomendamos monitorar regularmente sua conta. Caso identifique algum problema, entre em contato conosco.
              </p>
            </div>
          </div>

          {/* Seção 3: Replicação de Traders */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-accent-cyan">3.</span>
              Sobre a Replicação de Traders
            </h3>
            <div className="pl-5 space-y-2 text-gray-400 leading-relaxed text-xs md:text-sm">
              <p>
                O COPYBETPRO replica automaticamente as apostas de traders profissionais. É importante entender que:
                o desempenho passado não garante resultados futuros, traders profissionais também podem ter períodos 
                de perdas, diferenças em timing ou configurações podem resultar em resultados diferentes, e nem todas 
                as apostas podem ser replicadas no momento exato devido a fatores técnicos.
              </p>
              <p>
                A replicação é uma ferramenta auxiliar, e os resultados podem variar. É fundamental compreender os 
                riscos envolvidos antes de utilizar o serviço.
              </p>
            </div>
          </div>

          {/* Seção 4: Suas Responsabilidades */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-success">4.</span>
              Suas Responsabilidades
            </h3>
            <div className="pl-5 space-y-2 text-gray-400 leading-relaxed text-xs md:text-sm">
              <p>
                Para garantir o melhor funcionamento, mantenha suas credenciais seguras, garanta saldo suficiente, 
                configure corretamente os parâmetros, monitore regularmente sua conta e utilize o sistema de forma legal.
              </p>
              <p>
                <strong className="text-white">Responsabilidade Financeira:</strong> Você é totalmente responsável 
                por todas as decisões financeiras. Se ocorrerem perdas, a responsabilidade será sua. O COPYBETPRO 
                não se responsabiliza por perdas financeiras de qualquer natureza.
              </p>
            </div>
          </div>

          {/* Seção 5: Limitação de Responsabilidade */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-accent-purple">5.</span>
              Limitação de Responsabilidade
            </h3>
            <div className="pl-5 space-y-2 text-gray-400 leading-relaxed text-xs md:text-sm">
              <p>
                O COPYBETPRO fornece o serviço "como está" e fazemos o nosso melhor para mantê-lo funcionando. 
                Não podemos garantir que o serviço estará sempre disponível, ininterrupto ou livre de erros.
              </p>
              <p>
                <strong className="text-white">Não nos responsabilizamos por:</strong> perdas financeiras, problemas 
                técnicos, erros, bugs, falhas do sistema ou interrupções de serviço.
              </p>
              <p>
                Ao utilizar nosso serviço, você reconhece que entende e aceita essas limitações.
              </p>
            </div>
          </div>

          {/* Seção 6: Modificações do Serviço */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-info">6.</span>
              Modificações e Atualizações
            </h3>
            <div className="pl-5 space-y-2 text-gray-400 leading-relaxed text-xs">
              <p>
                Podemos fazer modificações, atualizações ou melhorias na plataforma a qualquer momento. Você pode 
                cancelar o uso do serviço quando desejar.
              </p>
              <p>
                Podemos atualizar estes termos periodicamente. Ao continuar usando o serviço após as atualizações, 
                você estará aceitando os novos termos.
              </p>
            </div>
          </div>

          {/* Resumo Final */}
          <div className="mt-4 p-4 md:p-5 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-primary font-semibold text-xs md:text-sm mb-2">Resumo Importante</p>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-2">
              Ao utilizar o COPYBETPRO, você reconhece que: entende que o sistema pode apresentar falhas, bugs ou 
              erros técnicos; compreende que apostas esportivas envolvem riscos financeiros; é responsável por todas 
              as decisões financeiras e por eventuais perdas; o serviço não garante lucros ou resultados específicos; 
              deve usar apenas recursos que pode se permitir perder.
            </p>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              Se você é maior de idade e concorda com estes termos, pode prosseguir. Caso contrário, não utilize o serviço.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-700 bg-gray-900/60">
          <div className="flex items-start gap-3 mb-4">
            <label className="flex items-start gap-2 cursor-pointer group flex-1">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-800 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-gray-900 cursor-pointer flex-shrink-0"
              />
              <span className="text-xs text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                Eu li e compreendi os termos acima, entendo os riscos envolvidos e aceito a responsabilidade pelas minhas decisões
              </span>
            </label>
          </div>
          <div className="flex items-center justify-end gap-2">
            {canClose && onClose && (
              <button
                onClick={onClose}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={onAccept}
              disabled={!accepted || !hasScrolled || loading}
              className="btn-primary px-6 py-2 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <span>Aceitar e Continuar</span>
                  <CheckIcon />
                </>
              )}
            </button>
          </div>
          {!hasScrolled && (
            <p className="text-xs text-warning text-center mt-2">
              Por favor, role até o final do documento para aceitar
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
