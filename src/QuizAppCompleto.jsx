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
    if (currentQuest