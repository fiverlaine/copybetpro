// Popup JavaScript para Betfair Auto Login Extension
// Interface do popup da extensão

console.log('🎨 Betfair Auto Login - Popup carregado');

// Elementos DOM
const elements = {
  status: document.getElementById('status'),
  version: document.getElementById('version'),
  credentials: document.getElementById('credentials'),
  testConnection: document.getElementById('testConnection'),
  openBetfair: document.getElementById('openBetfair'),
  loading: document.getElementById('loading')
};

// Estado da extensão
let extensionStatus = {
  active: false,
  version: '1.0.0',
  credentialsCount: 0,
  lastUpdate: Date.now()
};

// Função para mostrar loading
function showLoading(show = true) {
  elements.loading.style.display = show ? 'flex' : 'none';
  elements.testConnection.disabled = show;
  elements.openBetfair.disabled = show;
}

// Função para atualizar status
function updateStatus(status) {
  elements.status.textContent = status.active ? 'Ativo' : 'Inativo';
  elements.status.className = `status-value ${status.active ? 'status-active' : 'status-inactive'}`;
  
  if (status.version) {
    elements.version.textContent = status.version;
  }
  
  if (status.activeCredentials !== undefined) {
    elements.credentials.textContent = `${status.activeCredentials} armazenadas`;
  }
}

// Função para testar conexão com background script
async function testConnection() {
  showLoading(true);
  
  try {
    console.log('🔍 Testando conexão com background script...');
    
    const response = await chrome.runtime.sendMessage({
      action: 'CHECK_EXTENSION'
    });
    
    if (response.success) {
      console.log('✅ Conexão testada com sucesso');
      
      // Atualiza status
      extensionStatus.active = true;
      extensionStatus.version = response.version || '1.0.0';
      updateStatus(extensionStatus);
      
      // Mostra feedback visual
      showFeedback('✅ Extensão funcionando perfeitamente!', 'success');
      
    } else {
      throw new Error(response.message || 'Falha na conexão');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    
    extensionStatus.active = false;
    updateStatus(extensionStatus);
    
    showFeedback('❌ Erro na conexão: ' + error.message, 'error');
  }
  
  showLoading(false);
}

// Função para abrir Betfair
function openBetfair() {
  console.log('🌐 Abrindo Betfair...');
  
  chrome.tabs.create({
    url: 'https://www.betfair.bet.br/',
    active: true
  });
  
  showFeedback('🌐 Abrindo Betfair em nova aba...', 'info');
}

// Função para mostrar feedback visual
function showFeedback(message, type = 'info') {
  // Remove feedback anterior
  const existingFeedback = document.querySelector('.feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  // Cria novo feedback
  const feedback = document.createElement('div');
  feedback.className = 'feedback';
  feedback.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  
  feedback.textContent = message;
  document.body.appendChild(feedback);
  
  // Remove após 3 segundos
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }
  }, 3000);
}

// Função para obter status da extensão
async function getExtensionStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'GET_STATUS'
    });
    
    if (response.success) {
      extensionStatus = {
        active: true,
        version: response.version || '1.0.0',
        credentialsCount: response.activeCredentials || 0,
        lastUpdate: response.uptime || Date.now()
      };
      
      updateStatus(extensionStatus);
    }
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    extensionStatus.active = false;
    updateStatus(extensionStatus);
  }
}

// Função para verificar se Betfair está aberta
async function checkBetfairTab() {
  try {
    const tabs = await chrome.tabs.query({
      url: ['https://www.betfair.bet.br/*', 'https://betfair.bet.br/*']
    });
    
    if (tabs.length > 0) {
      elements.openBetfair.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Betfair Aberta (${tabs.length})
      `;
    } else {
      elements.openBetfair.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
        Abrir Betfair
      `;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar abas:', error);
  }
}

// Event listeners
elements.testConnection.addEventListener('click', testConnection);
elements.openBetfair.addEventListener('click', openBetfair);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Popup inicializado');
  
  // Carrega status inicial
  getExtensionStatus();
  
  // Verifica abas do Betfair
  checkBetfairTab();
  
  // Atualiza status a cada 5 segundos
  setInterval(() => {
    getExtensionStatus();
    checkBetfairTab();
  }, 5000);
});

// Adiciona CSS para animações
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('✅ Betfair Auto Login Popup pronto!');
