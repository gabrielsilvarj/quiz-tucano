import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Importe ícones do lucide-react se necessário, ou use SVGs/texto para simplicidade inicial
// Exemplo: import { CheckCircle2, XCircle, AlertTriangle, Clock, ChevronLeft, ChevronRight, ListChecks, Settings, BookOpen } from 'lucide-react';

// Ícones SVG como componentes para evitar dependências externas diretas no snippet
const IconCheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconXCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const IconAlertTriangle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconBookOpen = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .25 1l.08.15a2 2 0 0 1 0 2l-.25.43a2 2 0 0 1-1.73 1L2 12.22v.44a2 2 0 0 0 2 2h.18a2 2 0 0 1 1.73 1l.25.43a2 2 0 0 1 0 2l-.08.15a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-.25-1l-.08-.15a2 2 0 0 1 0-2l.25-.43a2 2 0 0 1 1.73-1L22 11.78v-.44a2 2 0 0 0-2-2h-.18a2 2 0 0 1-1.73-1l-.25-.43a2 2 0 0 1 0-2l.08-.15a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconListChecks = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>;


const API_URL = "https://api.steinhq.com/v1/storages/67f1b6f8c0883333658c85c4/Banco";
const BACKGROUND_IMAGE_URL = "https://placehold.co/1920x1080/2D3748/4A5568?text=Fundo+Tematico"; // Placeholder

// Funções utilitárias de LocalStorage
const getStoredValue = (key, defaultValue) => {
  const saved = localStorage.getItem(`QuestõesT27M_${key}`);
  if (saved !== null) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao parsear valor do localStorage:", e);
      return defaultValue;
    }
  }
  return defaultValue;
};

const setStoredValue = (key, value) => {
  try {
    localStorage.setItem(`QuestõesT27M_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("Erro ao salvar valor no localStorage:", e);
  }
};

// Função para embaralhar array
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function App() {
  // Estados de dados e UI
  const [allQuestionsData, setAllQuestionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('config'); // 'config', 'quiz', 'results'

  // Estados de Configuração (com valores iniciais do localStorage)
  const [selectedManual, setSelectedManual] = useState(() => getStoredValue('selectedManual', null));
  // selectedSubtopics: { [globalSubtopicId: string]: boolean }, onde globalSubtopicId é "Manual>Seção>Subtópico"
  const [selectedSubtopics, setSelectedSubtopics] = useState(() => getStoredValue('selectedSubtopics', {}));
  const [numQuestionsConfig, setNumQuestionsConfig] = useState(() => getStoredValue('numQuestionsConfig', 10));
  const [timerActive, setTimerActive] = useState(() => getStoredValue('timerActive', false));
  const [timerLimit, setTimerLimit] = useState(() => getStoredValue('timerLimit', 30));
  const [selectedDifficulty, setSelectedDifficulty] = useState(() => getStoredValue('selectedDifficulty', 'Todos'));
  const [distributionMode, setDistributionMode] = useState(() => getStoredValue('distributionMode', 'equally'));
  const [presentationMode, setPresentationMode] = useState(() => getStoredValue('presentationMode', 'single'));

  // Estados derivados e do Quiz (resetados a cada novo quiz)
  const [manuals, setManuals] = useState([]);
  const [sectionsAndSubtopicsByManual, setSectionsAndSubtopicsByManual] = useState({}); // { manual: { section: [subtopics] } }
  const [difficultyLevelsByManual, setDifficultyLevelsByManual] = useState({}); // { manual: [difficulties] }
  
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // [{ answer: 'A'|'B'|'C'|'D'|null|'TEMPO_EXPIRADO', timeLeft: number }]
  const [currentTimer, setCurrentTimer] = useState(null); // ID do intervalo do timer da questão atual
  const [maxPossibleQuestions, setMaxPossibleQuestions] = useState(0);
  const [alertMessage, setAlertMessage] = useState(null);

  // Efeito para buscar dados da API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Formato de dados inesperado da API.");
        }
        setAllQuestionsData(data);
      } catch (e) {
        setError(`Falha ao carregar questões: ${e.message}. Verifique a URL da API e sua conexão.`);
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Efeito para processar dados carregados (extrair manuais, seções, etc.)
  useEffect(() => {
    if (allQuestionsData.length > 0) {
      const uniqueManuals = [...new Set(allQuestionsData.map(q => q.MANUAL).filter(Boolean))].sort();
      setManuals(uniqueManuals);

      const newSectionsAndSubtopics = {};
      const newDifficultyLevels = {};

      uniqueManuals.forEach(manual => {
        newSectionsAndSubtopics[manual] = {};
        const questionsInManual = allQuestionsData.filter(q => q.MANUAL === manual);
        const uniqueDifficulties = [...new Set(questionsInManual.map(q => q['Nível de Dificuldade']).filter(Boolean))].sort();
        newDifficultyLevels[manual] = uniqueDifficulties;

        const uniqueSections = [...new Set(questionsInManual.map(q => q.Seção).filter(Boolean))].sort();
        uniqueSections.forEach(section => {
          const subtopicsInSection = [...new Set(questionsInManual.filter(q => q.Seção === section).map(q => q.Subtópico).filter(Boolean))].sort();
          if (subtopicsInSection.length > 0) {
            newSectionsAndSubtopics[manual][section] = subtopicsInSection;
          }
        });
      });
      setSectionsAndSubtopicsByManual(newSectionsAndSubtopics);
      setDifficultyLevelsByManual(newDifficultyLevels);
    }
  }, [allQuestionsData]);

  // Efeitos para persistir configurações no LocalStorage
  useEffect(() => setStoredValue('selectedManual', selectedManual), [selectedManual]);
  useEffect(() => setStoredValue('selectedSubtopics', selectedSubtopics), [selectedSubtopics]);
  useEffect(() => setStoredValue('numQuestionsConfig', numQuestionsConfig), [numQuestionsConfig]);
  useEffect(() => setStoredValue('timerActive', timerActive), [timerActive]);
  useEffect(() => setStoredValue('timerLimit', timerLimit), [timerLimit]);
  useEffect(() => setStoredValue('selectedDifficulty', selectedDifficulty), [selectedDifficulty]);
  useEffect(() => setStoredValue('distributionMode', distributionMode), [distributionMode]);
  useEffect(() => setStoredValue('presentationMode', presentationMode), [presentationMode]);

  // Função para exibir alertas temporários
  const showAlert = (message, duration = 3000) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(null), duration);
  };

  // Memoização para otimizar cálculos de questões disponíveis e máximo
  const availableQuestionsForCurrentSettings = useMemo(() => {
    if (!selectedManual || allQuestionsData.length === 0) return [];

    // Subtópicos selecionados para o manual atual
    const currentManualSelectedSubtopics = Object.keys(selectedSubtopics).filter(key => 
        selectedSubtopics[key] && key.startsWith(`${selectedManual}>`)
    ).map(key => {
        const parts = key.split('>');
        return { section: parts[1], subtopic: parts[2] };
    });
    
    if (currentManualSelectedSubtopics.length === 0) return [];

    return allQuestionsData.filter(q => {
      const isManualMatch = q.MANUAL === selectedManual;
      const isSubtopicMatch = currentManualSelectedSubtopics.some(st => st.section === q.Seção && st.subtopic === q.Subtópico);
      const isDifficultyMatch = selectedDifficulty === 'Todos' || q['Nível de Dificuldade'] === selectedDifficulty;
      
      return isManualMatch && isSubtopicMatch && isDifficultyMatch;
    });
  }, [allQuestionsData, selectedManual, selectedSubtopics, selectedDifficulty]);

  useEffect(() => {
    if (!selectedManual || Object.keys(selectedSubtopics).filter(key => selectedSubtopics[key] && key.startsWith(`${selectedManual}>`)).length === 0) {
      setMaxPossibleQuestions(0);
      return;
    }

    const questionsBySelectedSubtopic = {};
    availableQuestionsForCurrentSettings.forEach(q => {
      const subtopicKey = `${q.MANUAL}>${q.Seção}>${q.Subtópico}`;
      if (!questionsBySelectedSubtopic[subtopicKey]) {
        questionsBySelectedSubtopic[subtopicKey] = [];
      }
      questionsBySelectedSubtopic[subtopicKey].push(q);
    });

    const selectedSubtopicKeys = Object.keys(questionsBySelectedSubtopic);

    if (selectedSubtopicKeys.length === 0) {
        setMaxPossibleQuestions(0);
        return;
    }

    if (distributionMode === 'equally') {
      const minQuestionsInSubtopic = Math.min(...selectedSubtopicKeys.map(key => questionsBySelectedSubtopic[key].length));
      setMaxPossibleQuestions(minQuestionsInSubtopic * selectedSubtopicKeys.length);
    } else { // 'total'
      setMaxPossibleQuestions(availableQuestionsForCurrentSettings.length);
    }
  }, [availableQuestionsForCurrentSettings, distributionMode, selectedManual, selectedSubtopics]);


  // Handlers de configuração
  const handleManualSelect = (manual) => {
    setSelectedManual(manual);
    // Opcional: Resetar sub-seleções se o manual muda? Ou manter se possível?
    // Por ora, não reseta sub-seleções, mas o filtro de exibição cuidará disso.
    // Resetar dificuldade para 'Todos' do novo manual se a anterior não existir
    if (manual && difficultyLevelsByManual[manual] && !difficultyLevelsByManual[manual].includes(selectedDifficulty) && selectedDifficulty !== 'Todos') {
        setSelectedDifficulty('Todos');
    }
  };

  const handleSubtopicToggle = (manual, section, subtopic) => {
    const key = `${manual}>${section}>${subtopic}`;
    setSelectedSubtopics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSectionToggle = (manual, section, subtopicsInSection) => {
    const allSelectedInSection = subtopicsInSection.every(sub => selectedSubtopics[`${manual}>${section}>${sub}`]);
    const newSelectedSubtopics = { ...selectedSubtopics };
    subtopicsInSection.forEach(sub => {
      newSelectedSubtopics[`${manual}>${section}>${sub}`] = !allSelectedInSection;
    });
    setSelectedSubtopics(newSelectedSubtopics);
  };

  const handleNumQuestionsChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (maxPossibleQuestions > 0 && value > maxPossibleQuestions) {
      showAlert(`Máximo de ${maxPossibleQuestions} questões para esta configuração.`, 3000);
      value = maxPossibleQuestions;
    }
    setNumQuestionsConfig(value);
  };
  
  const handleTimerLimitChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 5;
    if (value < 5) value = 5;
    setTimerLimit(value);
  };

  // Lógica para iniciar o Quiz
  const startQuiz = () => {
    if (!selectedManual) {
      showAlert("Por favor, selecione um manual primeiro.");
      return;
    }
    const currentSelectedSubtopicKeys = Object.keys(selectedSubtopics).filter(key => selectedSubtopics[key] && key.startsWith(`${selectedManual}>`));
    if (currentSelectedSubtopicKeys.length === 0) {
      showAlert("Por favor, selecione pelo menos um subtópico para o quiz.");
      return;
    }
    if (numQuestionsConfig <= 0 || numQuestionsConfig > maxPossibleQuestions) {
      showAlert(`Número de questões inválido. Ajuste para um valor entre 1 e ${maxPossibleQuestions}.`);
      return;
    }

    let finalQuizQuestions = [];
    const questionsToPickFrom = shuffleArray(availableQuestionsForCurrentSettings); // Embaralha as disponíveis globalmente primeiro

    if (distributionMode === 'equally') {
        const questionsPerSubtopic = Math.floor(numQuestionsConfig / currentSelectedSubtopicKeys.length);
        let remainder = numQuestionsConfig % currentSelectedSubtopicKeys.length;
        
        const subtopicQuestionPools = {};
        currentSelectedSubtopicKeys.forEach(key => {
            const [_m, section, subtopic] = key.split('>');
            subtopicQuestionPools[key] = shuffleArray(questionsToPickFrom.filter(q => q.MANUAL === selectedManual && q.Seção === section && q.Subtópico === subtopic));
        });

        currentSelectedSubtopicKeys.forEach(key => {
            let count = questionsPerSubtopic + (remainder > 0 ? 1 : 0);
            finalQuizQuestions.push(...subtopicQuestionPools[key].slice(0, count));
            if (remainder > 0) remainder--;
        });
        finalQuizQuestions = shuffleArray(finalQuizQuestions.slice(0, numQuestionsConfig)); // Garante o número exato e reembaralha

    } else { // 'total'
        finalQuizQuestions = questionsToPickFrom.slice(0, numQuestionsConfig);
    }
    
    setQuizQuestions(shuffleArray(finalQuizQuestions)); // Embaralha o conjunto final
    setUserAnswers(finalQuizQuestions.map(() => ({ answer: null, timeLeft: timerActive ? timerLimit : Infinity, timeExpired: false })));
    setCurrentQuestionIndex(0);
    setCurrentView('quiz');
  };
  
  // Lógica do Timer da Questão
  useEffect(() => {
    if (currentView !== 'quiz' || !timerActive || !quizQuestions.length || userAnswers[currentQuestionIndex]?.timeExpired) {
      if (currentTimer) clearInterval(currentTimer);
      return;
    }

    let questionTime = userAnswers[currentQuestionIndex]?.timeLeft === Infinity ? timerLimit : userAnswers[currentQuestionIndex]?.timeLeft;
    
    // Se já respondeu ou tempo expirou, não inicia timer
    if(userAnswers[currentQuestionIndex]?.answer || userAnswers[currentQuestionIndex]?.timeExpired) {
        if (currentTimer) clearInterval(currentTimer);
        return;
    }

    // Se o tempo já é 0 (veio de um estado anterior expirado), marca como expirado
    if (questionTime <= 0) {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            if (newAnswers[currentQuestionIndex] && !newAnswers[currentQuestionIndex].answer) { // Só marca se não tiver resposta
                 newAnswers[currentQuestionIndex] = { ...newAnswers[currentQuestionIndex], answer: 'TEMPO_EXPIRADO', timeExpired: true, timeLeft: 0 };
            }
            return newAnswers;
        });
        if (currentTimer) clearInterval(currentTimer);
        // Auto-avançar se for o caso (pode ser adicionado aqui)
        // handleNextQuestion(); 
        return;
    }


    const timerId = setInterval(() => {
      setUserAnswers(prevAnswers => {
        const newAnswers = [...prevAnswers];
        if (newAnswers[currentQuestionIndex] && !newAnswers[currentQuestionIndex].answer && !newAnswers[currentQuestionIndex].timeExpired) { // Só atualiza se não respondida e não expirada
          const newTimeLeft = newAnswers[currentQuestionIndex].timeLeft - 1;
          if (newTimeLeft <= 0) {
            clearInterval(timerId);
            newAnswers[currentQuestionIndex] = { ...newAnswers[currentQuestionIndex], answer: 'TEMPO_EXPIRADO', timeExpired: true, timeLeft: 0 };
            // A lógica de auto-avançar pode ser chamada aqui ou no botão "Avançar" ao verificar timeExpired
            // Para simplificar, o usuário terá que clicar em avançar ou o resultado será computado ao final.
            // A instrução diz: "avança automaticamente para a próxima questão". Implementemos isso.
            setTimeout(() => handleNextQuestion(), 1000); // Pequeno delay para o usuário ver que o tempo acabou
          } else {
            newAnswers[currentQuestionIndex] = { ...newAnswers[currentQuestionIndex], timeLeft: newTimeLeft };
          }
        } else {
             clearInterval(timerId); // Limpa se já respondida ou expirada por outro meio
        }
        return newAnswers;
      });
    }, 1000);
    setCurrentTimer(timerId);

    return () => clearInterval(timerId);
  }, [currentView, timerActive, currentQuestionIndex, quizQuestions, userAnswers]); // Adicionado userAnswers como dependencia

  const handleAnswerSelect = (option) => {
    if (userAnswers[currentQuestionIndex]?.timeExpired || userAnswers[currentQuestionIndex]?.answer === 'TEMPO_EXPIRADO') return;

    setUserAnswers(prev => {
      const newAnswers = [...prev];
      // Mantém o timeLeft atual, não reseta. A resposta pode ser mudada enquanto o tempo não expirar.
      newAnswers[currentQuestionIndex] = { ...newAnswers[currentQuestionIndex], answer: option };
      return newAnswers;
    });
    if (currentTimer) clearInterval(currentTimer); // Para o timer da questão atual ao responder
  };

  const handleNextQuestion = () => {
    if (currentTimer) clearInterval(currentTimer);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentView('results');
    }
  };

  const handlePrevQuestion = () => {
    if (currentTimer) clearInterval(currentTimer);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const resetQuiz = () => {
    // Mantém as configurações do usuário (selectedManual, selectedSubtopics, etc.)
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    if (currentTimer) clearInterval(currentTimer);
    setCurrentView('config');
  };

  // Componente de Card reutilizável
  const Card = ({ children, className = "", title }) => (
    <div className={`bg-gray-800 shadow-xl rounded-lg p-6 my-4 ${className}`}>
      {title && <h2 className="text-xl font-semibold text-blue-400 mb-4">{title}</h2>}
      {children}
    </div>
  );
  
  // Renderização condicional das Views
  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center text-2xl p-10">Carregando Questões...</div>;
    }
    if (error) {
      return <Card title="Erro"><div className="flex items-center space-x-2 text-red-400"><IconAlertTriangle /><span>{error}</span></div></Card>;
    }

    switch (currentView) {
      case 'config':
        const currentManualSections = selectedManual ? sectionsAndSubtopicsByManual[selectedManual] || {} : {};
        const currentManualDifficulties = selectedManual ? difficultyLevelsByManual[selectedManual] || [] : [];
        const isAnySubtopicSelectedForCurrentManual = Object.keys(selectedSubtopics).some(key => selectedSubtopics[key] && key.startsWith(`${selectedManual}>`));

        return (
          <>
            {alertMessage && (
              <div className="fixed top-5 right-5 bg-red-600 text-white p-3 rounded-md shadow-lg z-50">
                {alertMessage}
              </div>
            )}
            <Card className="border border-blue-500">
              <h2 className="text-2xl font-bold text-center text-blue-300 mb-6">Configurar Quiz</h2>
              
              {/* Seleção de Manual */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">1. Selecione o Manual:</h3>
                <div className="flex flex-wrap gap-3">
                  {manuals.map(manual => (
                    <button
                      key={manual}
                      onClick={() => handleManualSelect(manual)}
                      className={`px-4 py-2 rounded-md transition-all duration-150 ease-in-out text-sm font-medium
                        ${selectedManual === manual 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                    >
                      {manual}
                    </button>
                  ))}
                </div>
              </div>

              {selectedManual && (
                <>
                  {/* Seleção de Seções e Subtópicos */}
                  <Card title="2. Selecione Seções e Subtópicos" className="bg-gray-700/50">
                    {Object.keys(currentManualSections).length === 0 && <p className="text-gray-400">Nenhuma seção encontrada para este manual.</p>}
                    {Object.entries(currentManualSections).map(([section, subtopics]) => {
                      const allSubtopicsInSectionSelected = subtopics.every(sub => selectedSubtopics[`${selectedManual}>${section}>${sub}`]);
                      return (
                        <div key={section} className="mb-4 p-3 bg-gray-800 rounded-md">
                          <div className={`flex items-center justify-between p-2 rounded-t-md ${allSubtopicsInSectionSelected ? 'bg-green-700/30' : 'bg-gray-700'}`}>
                            <label className="font-semibold text-gray-200">{section}</label>
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-400"
                              checked={allSubtopicsInSectionSelected}
                              onChange={() => handleSectionToggle(selectedManual, section, subtopics)}
                            />
                          </div>
                          <div className="pl-4 pt-2 space-y-1">
                            {subtopics.map(subtopic => (
                              <label key={subtopic} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-400"
                                  checked={!!selectedSubtopics[`${selectedManual}>${section}>${subtopic}`]}
                                  onChange={() => handleSubtopicToggle(selectedManual, section, subtopic)}
                                />
                                <span>{subtopic}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </Card>

                  {/* Nível de Dificuldade */}
                  <Card title="3. Nível de Dificuldade" className="bg-gray-700/50">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {['Todos', ...currentManualDifficulties].map(level => (
                        <label key={level} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                          <input
                            type="radio"
                            name="difficulty"
                            className="form-radio h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 focus:ring-blue-400"
                            value={level}
                            checked={selectedDifficulty === level}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                          />
                          <span>{level}</span>
                        </label>
                      ))}
                    </div>
                  </Card>

                  {/* Modo de Distribuição */}
                  <Card title="4. Modo de Distribuição das Questões" className="bg-gray-700/50">
                     <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                          <input type="radio" name="distributionMode" value="equally" checked={distributionMode === 'equally'} onChange={(e) => setDistributionMode(e.target.value)} className="form-radio h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 focus:ring-blue-400" />
                          <span>Distribuir igualmente entre subtópicos</span>
                        </label>
                        <label className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                          <input type="radio" name="distributionMode" value="total" checked={distributionMode === 'total'} onChange={(e) => setDistributionMode(e.target.value)} className="form-radio h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 focus:ring-blue-400" />
                          <span>Priorizar quantidade total de questões</span>
                        </label>
                     </div>
                  </Card>

                  {/* Modo de Apresentação */}
                  <Card title="5. Modo de Apresentação das Questões" className="bg-gray-700/50">
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                          <input type="radio" name="presentationMode" value="single" checked={presentationMode === 'single'} onChange={(e) => setPresentationMode(e.target.value)} className="form-radio h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 focus:ring-blue-400" />
                          <span>Uma questão por vez</span>
                        </label>
                        <label className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                          <input type="radio" name="presentationMode" value="cumulative" checked={presentationMode === 'cumulative'} onChange={(e) => setPresentationMode(e.target.value)} className="form-radio h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 focus:ring-blue-400" />
                          <span>Acumulativo (mostrar questões anteriores respondidas)</span>
                        </label>
                      </div>
                  </Card>
                  
                  {/* Quantidade de Questões */}
                  <Card title="6. Quantidade de Questões" className="bg-gray-700/50">
                    <input
                      type="number"
                      value={numQuestionsConfig}
                      onChange={handleNumQuestionsChange}
                      min="1"
                      max={maxPossibleQuestions > 0 ? maxPossibleQuestions : undefined}
                      disabled={!isAnySubtopicSelectedForCurrentManual || maxPossibleQuestions === 0}
                      className="form-input w-full md:w-1/2 bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Máximo de questões possível: {maxPossibleQuestions > 0 ? maxPossibleQuestions : (isAnySubtopicSelectedForCurrentManual ? '0 (verifique filtros)' : 'N/A (selecione subtópicos)')}
                    </p>
                  </Card>

                  {/* Tempo por Questão */}
                  <Card title="7. Tempo por Questão" className="bg-gray-700/50">
                    <label className="flex items-center space-x-2 mb-2 text-gray-300 hover:text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={timerActive}
                        onChange={(e) => setTimerActive(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-400"
                      />
                      <span>Ativar cronômetro por questão?</span>
                    </label>
                    {timerActive && (
                      <div className="mt-2">
                        <label htmlFor="timerLimitInput" className="block text-sm font-medium text-gray-300 mb-1">Segundos por questão:</label>
                        <input
                          type="number"
                          id="timerLimitInput"
                          value={timerLimit}
                          onChange={handleTimerLimitChange}
                          min="5"
                          className="form-input w-full md:w-1/2 bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </Card>
                </>
              )}

              <button
                onClick={startQuiz}
                disabled={!selectedManual || !isAnySubtopicSelectedForCurrentManual || numQuestionsConfig <= 0 || numQuestionsConfig > maxPossibleQuestions || maxPossibleQuestions === 0}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-150 ease-in-out text-lg flex items-center justify-center space-x-2"
              >
                <IconListChecks />
                <span>Gerar Quiz</span>
              </button>
            </Card>

            {/* Caixa de Instruções */}
            {!selectedManual && (
                 <Card title="Bem-vindo ao Questões T-27M!" className="mt-8">
                    <p className="text-gray-300 mb-2">Teste e aprimore seus conhecimentos!</p>
                    <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm">
                        <li>Selecione o Manual e as seções/subtópicos que deseja estudar.</li>
                        <li>Em cada seção, os subtópicos serão listados e poderão ser selecionados individualmente ou todos de uma vez marcando a seção.</li>
                        <li>Escolha quantas questões deseja para o seu quiz.</li>
                        <li>Defina o nível de dificuldade das questões.</li>
                        <li>Escolha como as questões serão distribuídas e apresentadas.</li>
                        <li>Se desejar, ative um limite de tempo para responder cada questão.</li>
                        <li>Durante o quiz, uma questão será exibida por vez (ou de forma acumulada, conforme sua escolha).</li>
                        <li>Você poderá navegar entre as questões usando os botões 'Voltar' e 'Avançar'.</li>
                        <li>As respostas poderão ser alteradas enquanto o tempo da questão não expirar (se o cronômetro estiver ativo) ou se não houver tempo definido.</li>
                        <li>Se o tempo da questão expirar, ela será automaticamente considerada como errada e o quiz avançará.</li>
                        <li>Suas respostas não são armazenadas em um servidor ou banco de dados externo após o término do quiz. Suas preferências de configuração são salvas localmente no seu navegador.</li>
                    </ul>
                </Card>
            )}
          </>
        );

      case 'quiz':
        const currentQ = quizQuestions[currentQuestionIndex];
        const currentA = userAnswers[currentQuestionIndex];
        const isTimeUpForCurrent = currentA?.timeExpired || currentA?.answer === 'TEMPO_EXPIRADO';
        const isAnswered = !!currentA?.answer;

        return (
          <Card className="border border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-300">Questão {currentQuestionIndex + 1} de {quizQuestions.length}</h2>
              {timerActive && (
                <div className={`text-lg font-bold p-2 rounded-md ${currentA?.timeLeft <= 10 && currentA?.timeLeft > 0 ? 'text-orange-400 animate-pulse' : (isTimeUpForCurrent ? 'text-red-500' : 'text-gray-300')}`}>
                  Tempo: {isTimeUpForCurrent ? 'Esgotado!' : (currentA?.timeLeft === Infinity ? 'Sem limite' : `${currentA?.timeLeft}s`)}
                </div>
              )}
            </div>

            {/* Modo Acumulativo */}
            {presentationMode === 'cumulative' && currentQuestionIndex > 0 && (
                <div className="mb-8 space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="text-lg font-semibold text-gray-400 border-b border-gray-700 pb-2 mb-3">Questões Anteriores:</h3>
                    {quizQuestions.slice(0, currentQuestionIndex).map((q, idx) => {
                        const ans = userAnswers[idx];
                        const correctAnswerLetter = q.Correta;
                        const isUserCorrect = ans?.answer === correctAnswerLetter;
                        let userAnswerDisplay = 'Não respondida';
                        if (ans?.answer === 'TEMPO_EXPIRADO') userAnswerDisplay = 'Tempo Esgotado';
                        else if (ans?.answer) userAnswerDisplay = `Sua resposta: ${ans.answer} (${q[`Alternativa ${ans.answer}`]})`;
                        
                        return (
                            <div key={`prev-${q.Questao}-${idx}`} className="p-3 bg-gray-700/60 rounded-md opacity-75">
                                <p className="text-sm text-gray-400 mb-1">Questão {idx + 1}: {q.Questao}</p>
                                <p className={`text-sm ${isUserCorrect ? 'text-green-400' : (ans?.answer === 'TEMPO_EXPIRADO' || ans?.answer ? 'text-red-400' : 'text-yellow-400')}`}>
                                    {userAnswerDisplay}
                                </p>
                                {(!isUserCorrect && ans?.answer) && <p className="text-xs text-gray-500">Correta: {correctAnswerLetter} ({q[`Alternativa ${correctAnswerLetter}`]})</p>}
                            </div>
                        );
                    })}
                </div>
            )}
            
            {/* Questão Atual */}
            <div className="mb-6">
              <p className="text-lg text-gray-100 leading-relaxed">{currentQ.Questao}</p>
            </div>
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map(option => (
                <label
                  key={option}
                  className={`block p-3 rounded-md border-2 transition-all duration-150 ease-in-out
                    ${currentA?.answer === option ? 'bg-blue-700 border-blue-500' : 'bg-gray-700 border-gray-600 hover:border-blue-400'}
                    ${isTimeUpForCurrent || (isAnswered && currentA?.answer !== 'TEMPO_EXPIRADO') ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={currentA?.answer === option}
                    onChange={() => handleAnswerSelect(option)}
                    disabled={isTimeUpForCurrent || (isAnswered && currentA?.answer !== 'TEMPO_EXPIRADO' && currentA?.answer !== null) } // Permite mudar se não for tempo esgotado
                    className="form-radio mr-3 h-4 w-4 text-blue-500 bg-gray-600 border-gray-500 focus:ring-blue-400"
                  />
                  <span className="text-gray-200">{option}. {currentQ[`Alternativa ${option}`]}</span>
                </label>
              ))}
            </div>
             {isTimeUpForCurrent && <p className="text-red-500 text-center mt-4 font-semibold">Tempo esgotado para esta questão!</p>}

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors duration-150 ease-in-out flex items-center space-x-2"
              >
                <IconChevronLeft />
                <span>Voltar</span>
              </button>
              <button
                onClick={handleNextQuestion}
                // Habilitado se respondido OU se tempo esgotou (e não é a última questão)
                // OU se não há timer ativo e não respondeu (mas o usuário deve ser incentivado a responder)
                // A regra é: "desabilitado se a questão atual ainda não foi respondida E o cronômetro (se ativo) ainda não expirou."
                disabled={ timerActive && !isTimeUpForCurrent && !currentA?.answer }
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors duration-150 ease-in-out flex items-center space-x-2"
              >
                <span>{currentQuestionIndex === quizQuestions.length - 1 ? 'Ver Resultados' : 'Avançar'}</span>
                <IconChevronRight />
              </button>
            </div>
          </Card>
        );

      case 'results':
        const correctAnswersCount = userAnswers.filter((ans, idx) => ans.answer === quizQuestions[idx].Correta).length;
        const totalQuestions = quizQuestions.length;
        const scorePercentage = totalQuestions > 0 ? ((correctAnswersCount / totalQuestions) * 100).toFixed(1) : 0;

        return (
          <Card className="border border-green-500">
            <h2 className="text-3xl font-bold text-center text-green-400 mb-6">Resultado Final do Quiz</h2>
            <div className="text-center mb-8">
              <p className="text-4xl font-bold text-white">
                Você acertou {correctAnswersCount} de {totalQuestions} questões!
              </p>
              <p className="text-2xl text-gray-300">({scorePercentage}%)</p>
            </div>

            <h3 className="text-xl font-semibold text-blue-300 mb-4">Gabarito Detalhado:</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {quizQuestions.map((q, idx) => {
                const userAnswer = userAnswers[idx];
                const isCorrect = userAnswer.answer === q.Correta;
                let statusText = '';
                if (userAnswer.answer === 'TEMPO_EXPIRADO') {
                  statusText = 'Tempo Esgotado (Considerada Errada)';
                } else if (!userAnswer.answer) {
                  statusText = 'Não Respondida (Considerada Errada)';
                } else if (isCorrect) {
                  statusText = 'Correta!';
                } else {
                  statusText = 'Incorreta';
                }

                return (
                  <div key={idx} className={`p-4 rounded-lg shadow ${isCorrect ? 'bg-green-800/30 border-l-4 border-green-500' : 'bg-red-800/30 border-l-4 border-red-500'}`}>
                    <p className="font-semibold text-gray-200 mb-1">Questão {idx + 1}: {q.Questao}</p>
                    <p className="text-sm text-gray-300">Sua resposta:
                      <span className="font-medium ml-1">
                        {userAnswer.answer === 'TEMPO_EXPIRADO' ? 'Tempo Esgotado' : 
                         userAnswer.answer ? `${userAnswer.answer} (${q[`Alternativa ${userAnswer.answer}`] || 'Opção inválida'})` : 'Não respondida'}
                      </span>
                    </p>
                    <div className="flex items-center mt-1">
                      {isCorrect ? <IconCheckCircle /> : <IconXCircle />}
                      <span className={`ml-2 text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{statusText}</span>
                    </div>
                    {(!isCorrect || userAnswer.answer === 'TEMPO_EXPIRADO' || !userAnswer.answer) && (
                      <p className="text-sm text-yellow-300 mt-1">Resposta Correta: {q.Correta} ({q[`Alternativa ${q.Correta}`]})</p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={resetQuiz}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-150 ease-in-out text-lg flex items-center justify-center space-x-2"
            >
              <IconBookOpen />
              <span>Fazer Nova Prova</span>
            </button>
          </Card>
        );
      default:
        return <div>Visão desconhecida.</div>;
    }
  };

  return (
    <div 
        className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-8 flex flex-col items-center selection:bg-blue-500 selection:text-white"
        style={{
            backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
        }}
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-0"></div> {/* Overlay com blur */}
      
      <main className="container mx-auto max-w-3xl w-full z-10 relative">
        <header className="text-center my-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Questões T-27M
          </h1>
        </header>
        {renderContent()}
      </main>
      <footer className="text-center py-6 text-gray-500 z-10 relative text-sm">
        <p>&copy; {new Date().getFullYear()} Questões T-27M. Versão 2.0.</p>
        <p>Desenvolvido para fins de demonstração.</p>
      </footer>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748; // gray-800
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568; // gray-600
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096; // gray-500
        }
        // Para Firefox
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4a5568 #2d3748;
        }
      `}</style>
    </div>
  );
}

export default App;


