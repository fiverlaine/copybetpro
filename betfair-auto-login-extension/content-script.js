// Content Script para Betfair Auto Login Extension
// Login automático via URL hash

console.log('🎯 Betfair Auto Login - Content Script carregado');

// ✅ Adicionado: obter credenciais via hash (#) ou query parameter (?)
function getAutoLoginCreds() {
  try {
    // 1. Tenta via hash (#autologin=) - usado pela Betfair
    const hash = location.hash;
    if (hash.startsWith('#autologin=')) {
      const encoded = hash.substring('#autologin='.length);
      const decoded = atob(encoded);
      const creds = JSON.parse(decoded);
      console.log('🔑 Credenciais detectadas via hash (#):', { u: creds.u, p: '***' });
      
      // Salva no sessionStorage para persistir após navegação
      sessionStorage.setItem('autoLoginCreds', JSON.stringify(creds));
      
      // Remove o hash da URL para segurança
      if (history.replaceState) {
        history.replaceState(null, '', location.pathname + location.search);
      }
      
      return creds;
    }
    
    // 2. Tenta via query parameter (?autologin=) - usado pela Bolsa/FullTBet
    const urlParams = new URLSearchParams(location.search);
    const autologinParam = urlParams.get('autologin');
    if (autologinParam) {
      const decoded = atob(autologinParam);
      const creds = JSON.parse(decoded);
      console.log('🔑 Credenciais detectadas via query parameter (?):', { u: creds.u, p: '***' });
      
      // Salva no sessionStorage para persistir após navegação
      sessionStorage.setItem('autoLoginCreds', JSON.stringify(creds));
      
      // Remove o query parameter da URL para segurança
      if (history.replaceState) {
        urlParams.delete('autologin');
        const newUrl = location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        history.replaceState(null, '', newUrl);
      }
      
      return creds;
    }
    
    // 3. Tenta via sessionStorage (para páginas após navegação)
    const stored = sessionStorage.getItem('autoLoginCreds');
    if (stored) {
      console.log('🔑 Credenciais encontradas no sessionStorage');
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('❌ Falha ao obter credenciais:', err);
  }
  return null;
}

// Executa imediatamente ao carregar
function initAutoLogin() {
  const creds = getAutoLoginCreds();
  if (!creds) {
    console.log('⚠️ Nenhuma credencial de autologin encontrada');
    return;
  }
  if (!(creds.u && creds.p)) {
    console.log('⚠️ Credenciais incompletas:', creds);
    return;
  }

  console.log('🔑 Credenciais de auto-login detectadas, iniciando processo...');
  autoFillLogin(creds.u, creds.p);
}

// Executa em múltiplos momentos para garantir sucesso
setTimeout(initAutoLogin, 500);
setTimeout(initAutoLogin, 2000);
setTimeout(initAutoLogin, 4000);

// Após login bem-sucedido remove credenciais
function clearAutoLoginCreds() {
  sessionStorage.removeItem('autoLoginCreds');
  console.log('🧹 Credenciais removidas do sessionStorage');
}

// Dispatcher para múltiplos domínios
function autoFillLogin(username, password) {
  const host = location.hostname;

  if (/betfair\./i.test(host)) {
    return autoFillBetfair(username, password);
  }

  if (/bolsadeaposta\./i.test(host) || /fulltbet\./i.test(host)) {
    return autoFillBolsaFull(username, password);
  }

  console.warn('⚠️ Domínio não reconhecido para auto-login:', host);
  return false;
}

// ------------------------------
// Betfair
function autoFillBetfair(username, password) {
  const tryFill = () => {
    const userField = document.getElementById('ssc-liu');
    const passField = document.getElementById('ssc-lipw');
    const loginBtn  = document.getElementById('ssc-lis');
    if (userField && passField) {
      userField.value = username;
      passField.value = password;
      userField.dispatchEvent(new Event('input', { bubbles: true }));
      passField.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => { if (loginBtn) loginBtn.click(); }, 300);
      showLoginFeedback('✅ Login automático Betfair acionado!');
      clearAutoLoginCreds();
      return true;
    }
    return false;
  };

  if (!tryFill()) {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (tryFill() || attempts > 10) clearInterval(timer);
    }, 500);
  }
  return true;
}

// ------------------------------
// Bolsa de Apostas e FullTBet
// 🔄 Modificado: seletores específicos para Angular e eventos otimizados
function autoFillBolsaFull(username, password) {
  console.log('🎯 Iniciando auto-login para Bolsa/FullTBet');
  
  const clickPopupIfPresent = () => {
    // Tenta encontrar botão SIM do popup 18+
    const yesSelectors = [
      'button.btn--color',
      'button.mat-mdc-dialog-content button',
      'div.cdk-overlay-pane button',
      'button[mat-dialog-close]',
      'button[class*="dialog"] button',
    ];
    for (const sel of yesSelectors) {
      const btns = Array.from(document.querySelectorAll(sel));
      const yesBtn = btns.find((b) => /sim|yes|confirmar/i.test(b.textContent || ''));
      if (yesBtn) {
        console.log('🔘 Clicando no popup 18+');
        yesBtn.click();
        return true;
      }
    }
    return false;
  };

  const tryFill = () => {
    // Procura campos específicos do Angular baseado no HTML fornecido
    let userField = document.querySelector('input[formcontrolname="login"]');
    let passField = document.querySelector('input[formcontrolname="password"]');
    
    // Se não encontrar, tenta seletores alternativos
    if (!userField) {
      userField = document.querySelector('input.login-input[placeholder*="Usuário"]');
    }
    if (!passField) {
      passField = document.querySelector('input.login-input[type="password"]');
    }
    
    // Verifica se os campos estão visíveis
    if (userField && userField.offsetParent === null) userField = null;
    if (passField && passField.offsetParent === null) passField = null;
    
    // Procura botão de login - busca especificamente o botão com classe login-btn
    let loginBtn = null;
    const allBtns = Array.from(document.querySelectorAll('button'));
    loginBtn = allBtns.find((b) => {
      // Verifica se tem classe login-btn ou se o texto contém "entrar"
      const hasLoginClass = b.className.includes('login-btn');
      const hasLoginText = /entrar/i.test(b.textContent || '');
      const isVisible = b.offsetParent !== null;
      return (hasLoginClass || hasLoginText) && isVisible;
    });

    if (userField && passField) {
      console.log('✅ Campos de login encontrados:', {
        user: userField.className,
        pass: passField.className,
        btn: loginBtn ? loginBtn.className : 'não encontrado'
      });
      
      // Define valores usando propriedades nativas
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      
      nativeInputValueSetter.call(userField, username);
      nativeInputValueSetter.call(passField, password);
      
      // Dispara eventos completos para Angular reconhecer mudanças
      const events = ['input', 'change', 'blur'];
      events.forEach(eventType => {
        userField.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
        passField.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
      });
      
      // Força detecção de mudanças do Angular (se disponível)
      if (typeof window.ng !== 'undefined') {
        try {
          const ngZone = window.ng.probe(userField)?.injector?.get(window.ng.core?.NgZone);
          if (ngZone) {
            ngZone.run(() => {
              console.log('🔄 Executando dentro do NgZone do Angular');
            });
          }
        } catch (e) {
          console.log('⚠️ NgZone não disponível, usando eventos padrão');
        }
      }
      
      // Aguarda e clica no botão
      setTimeout(() => {
        if (loginBtn) {
          console.log('🔘 Clicando no botão de login:', loginBtn.textContent.trim());
          loginBtn.click();
        } else {
          console.warn('⚠️ Botão de login não encontrado, tentando submit');
          const form = userField.closest('form');
          if (form) {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);
          }
        }
      }, 800);
      
      showLoginFeedback('✅ Login automático acionado!');
      clearAutoLoginCreds();
      return true;
    }
    
    return false;
  };

  let attempts = 0;
  const maxAttempts = 40; // Aumentado para 20 segundos
  
  const timer = setInterval(() => {
    attempts += 1;
    
    if (attempts === 1 || attempts % 5 === 0) {
      console.log(`🔄 Tentativa ${attempts}/${maxAttempts} de auto-login...`);
    }
    
    // Sempre tenta clicar no popup primeiro
    clickPopupIfPresent();
    
    // Tenta preencher o formulário
    if (tryFill()) {
      console.log('✅ Auto-login concluído com sucesso!');
      clearInterval(timer);
    } else if (attempts >= maxAttempts) {
      console.warn('⚠️ Timeout: formulário de login não encontrado após ' + maxAttempts + ' tentativas');
      showLoginFeedback('⚠️ Formulário não encontrado. Verifique se a página carregou corretamente.', false);
      clearInterval(timer);
    }
  }, 500);

  // retorna true para indicar que o processo foi iniciado
  return true;
}

// ------------------------------
// Feedback visual
function showLoginFeedback(message, success = true) {
  const existingFeedback = document.getElementById('betfair-auto-login-feedback');
  if (existingFeedback) existingFeedback.remove();

  const isSuccess = success && (message.includes('✅') || message.includes('sucesso'));
  const isWarning = message.includes('⚠️');
  
  let bgColor = '#ef4444'; // vermelho por padrão
  if (isSuccess) bgColor = '#10b981'; // verde
  else if (isWarning) bgColor = '#f59e0b'; // laranja
  
  const feedback = document.createElement('div');
  feedback.id = 'betfair-auto-login-feedback';
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 300px;
    word-wrap: break-word;
    animation: slideInRight 0.3s ease-out;
  `;
  feedback.textContent = message;
  document.body.appendChild(feedback);
  
  // Remove após 5 segundos (ou 8 segundos para avisos)
  setTimeout(() => {
    feedback.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => feedback.remove(), 300);
  }, isWarning ? 8000 : 5000);
}

// Adiciona CSS para animações
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('✅ Betfair Auto Login Content Script pronto!');