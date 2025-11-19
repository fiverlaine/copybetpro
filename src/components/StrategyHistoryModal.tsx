import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface StrategyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
  strategyName: string;
}

interface HistoryEntry {
  id: string;
  month: number;
  year: number;
  percentage: number;
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const BarChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function StrategyHistoryModal({ isOpen, onClose, strategyId, strategyName }: StrategyHistoryModalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    bestMonth: 0,
    trend: 0
  });

  useEffect(() => {
    if (isOpen && strategyId) {
      fetchHistory();
    }
  }, [isOpen, strategyId]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('strategy_history')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return;
      }

      if (data) {
        const historyData = data.map(item => ({
          id: item.id,
          month: item.month,
          year: item.year,
          percentage: parseFloat(item.percentage)
        }));

        setHistory(historyData);

        // Calcular estatísticas
        if (historyData.length > 0) {
          const percentages = historyData.map(h => h.percentage);
          const average = percentages.reduce((a, b) => a + b, 0) / percentages.length;
          const bestMonth = Math.max(...percentages);
          
          // Calcular tendência (últimos 3 meses vs anteriores)
          let trend = 0;
          if (historyData.length >= 3) {
            const lastThree = historyData.slice(0, 3).map(h => h.percentage);
            const previous = historyData.slice(3, 6).map(h => h.percentage);
            if (previous.length > 0) {
              const lastThreeAvg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
              const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
              trend = lastThreeAvg - previousAvg;
            }
          }

          setStats({
            average: average,
            bestMonth: bestMonth,
            trend: trend
          });
        }
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(percentage: number): { bg: string; text: string } {
    if (percentage >= 70) {
      return { bg: 'bg-green-500/20', text: 'text-green-400' };
    } else if (percentage >= 50) {
      return { bg: 'bg-amber-500/20', text: 'text-amber-400' };
    } else {
      return { bg: 'bg-red-500/20', text: 'text-red-400' };
    }
  }

  function getStatusLabel(percentage: number): string {
    if (percentage >= 70) return 'Alto';
    if (percentage >= 50) return 'Médio';
    return 'Baixo';
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <BarChartIcon />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Histórico Mensal</h2>
              <p className="text-gray-400 text-sm mt-1">{strategyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Estatísticas */}
              {history.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-4">
                    <div className="text-gray-400 text-sm mb-1">Média Geral</div>
                    <div className="text-3xl font-bold text-white">{stats.average.toFixed(1)}%</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-gray-400 text-sm mb-1">Melhor Mês</div>
                    <div className="text-3xl font-bold text-green-400">{stats.bestMonth.toFixed(1)}%</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-gray-400 text-sm mb-1">Tendência</div>
                    <div className={`text-3xl font-bold flex items-center gap-2 ${stats.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <TrendingUpIcon />
                      {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de Histórico */}
              {history.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Evolução Mensal</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">MÊS</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">ANO</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">PERCENTUAL</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((entry) => {
                          const statusColors = getStatusColor(entry.percentage);
                          return (
                            <tr key={entry.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                              <td className="py-4 px-4 text-white font-medium">{monthNames[entry.month - 1]}</td>
                              <td className="py-4 px-4 text-gray-400">{entry.year}</td>
                              <td className={`py-4 px-4 font-semibold ${statusColors.text}`}>
                                {entry.percentage.toFixed(1)}%
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                  {getStatusLabel(entry.percentage)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">Nenhum histórico disponível para esta estratégia.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

