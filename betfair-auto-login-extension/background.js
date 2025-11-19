// Service Worker para Betfair Auto Login Extension
// Extensão simplificada que detecta bookmarklets colados via Ctrl+V

console.log('🚀 Betfair Auto Login Extension - Background Script iniciado');

// Escuta mensagens do content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Mensagem recebida:', message);

  switch (message.action) {
    case 'CHECK_EXTENSION':
      // Verifica se a extensão está funcionando
      sendResponse({ 
        success: true, 
        message: 'Extensão ativa e funcionando',
        version: '1.0.0'
      });
      break;

    case 'EXECUTE_BOOKMARKLET':
      // Executa o bookmarklet usando chrome.scripting.executeScript
      executeBookmarkletViaScripting(message.code, sender.tab.id, sendResponse);
      return true; // Mantém canal aberto para resposta assíncrona

    default:
      console.log('❓ Ação desconhecida:', message.action);
      sendResponse({ 
        success: false, 
        message: 'Ação não reconhecida' 
      });
      break;
  }
  
  return true; // Indica que a resposta será enviada assincronamente
});

// Função para executar bookmarklet usando chrome.scripting.executeScript
async function executeBookmarkletViaScripting(bookmarkletCode, tabId, sendResponse) {
  try {
    console.log('🚀 Executando bookmarklet via chrome.scripting.executeScript...');
    
    // Remove o prefixo "javascript:" se existir
    let code = bookmarkletCode;
    if (code.startsWith('javascript:')) {
      code = code.substring(11);
    }
    
    // Decodifica URL encoding se necessário
    code = decodeURIComponent(code);
    
    console.log('📝 Código preparado para execução:', code.substring(0, 100) + '...');
    
    // Executa o script na aba usando chrome.scripting.executeScript
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: false },
      world: 'MAIN',
      func: (scriptCode) => {
        try {
          console.log('🔧 Injetando script via <script> para contornar CSP...');
          const el = document.createElement('script');
          el.textContent = scriptCode;
          (document.head || document.documentElement).appendChild(el);
          el.remove();
          console.log('✅ Script injetado e executado!');
          return { success: true };
        } catch (err) {
          console.error('❌ Falha ao injetar script:', err);
          return { success: false, message: err.message };
        }
      },
      args: [code]
    });
    
    console.log('✅ Bookmarklet executado via scripting API com sucesso!');
    sendResponse({ 
      success: true, 
      message: 'Bookmarklet executado com sucesso',
      results: results
    });
    
  } catch (error) {
    console.error('❌ Erro ao executar bookmarklet via scripting API:', error);
    sendResponse({ 
      success: false, 
      message: 'Erro na execução: ' + error.message 
    });
  }
}

// executeCodeInPage removido – agora usamos injeção de <script> via chrome.scripting.executeScript

// Event listener para instalação da extensão
chrome.runtime.onInstalled.addListener((details) => {
  console.log('✅ Betfair Auto Login Extension instalada:', details.reason);
});