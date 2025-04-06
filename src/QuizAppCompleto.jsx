import React, { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';

/* -----------------------------------------------------
   1) FUNÇÕES AUXILIARES
----------------------------------------------------- */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function useLocalStorageState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [key, state]);

  return [state, setState];
}

/* -----------------------------------------------------
   2) SUB-COMPONENTES DE SELEÇÃO
----------------------------------------------------- */

function Instrucoes() {
  return (
    <div className="instructions-box fade-in">
      <h2>Instruções:</h2>
      <ul>
        <li>Selecione o manual e as seções que deseja estudar.</li>
        <li>Em cada seção, os subtópicos poderão ser selecionados individualmente ou em conjunto.</li>
        <li>Escolha quantas questões deseja e, se quiser, ative o tempo por questão.</li>
        <li>Ao iniciar o quiz, uma questão será exibida por vez.</li>
        <li>Você poderá navegar entre as questões com os botões “Voltar” e “Avançar”.</li>
        <li>As respostas não podem ser alteradas após selecionadas.</li>
        <li>Se o tempo da questão expirar, ela será marcada como errada.</li>
      </ul>
    </div>
  );
}

function ManualSelector({ manuais, selectedManual, setSelectedManual }) {
  return (
    <>
      <h2 className="section-title">Selecione o Manual:</h2>
      {manuais.map(manual => (
        <button
          key={manual}
          onClick={() => setSelectedManual(manual)}
          style={{
            backgroundColor: selectedManual === manual ? '#1976d2' : '#ccc'
          }}
        >
          {manual}
        </button>
      ))}
    </>
  );
}

function SeccoesSelector({
  questions,
  selectedManual,
  selectedTopicos,
  setSelectedTopicos
}) {
  const seccoes = useMemo(() => {
    const filtered = questions.filter(
      q => (q.MANUAL || '').trim().toUpperCase() === selectedManual
    );

    const groups = {};
    filtered.forEach(q => {
      const secao = q.Seção;
      const subtopico = q.Subtópico;
      if (!groups[secao]) groups[secao] = new Set();
      groups[secao].add(subtopico);
    });

    return Object.entries(groups).map(([secao, setSub]) => ({
      secao,
      subtopicos: Array.from(setSub)
    }));
  }, [questions, selectedManual]);

  const toggleSubtopico = subtopico => {
    if (selectedTopicos.includes(subtopico)) {
      setSelectedTopicos(selectedTopicos.filter(s => s !== subtopico));
    } else {
      setSelectedTopicos([...selectedTopicos, subtopico]);
    }
  };

  const toggleSection = subtopicos => {
    const allSelected = subtopicos.every(sub => selectedTopicos.includes(sub));
    if (allSelected) {
      setSelectedTopicos(selectedTopicos.filter(s => !subtopicos.includes(s)));
    } else {
      setSelectedTopicos(Array.from(new Set([...selectedTopicos, ...subtopicos])));
    }
  };

  return (
    <div className="seccoes-selector fade-in">
      <h2 className="section-title">Selecione as Seções e Subtópicos:</h2>
      {seccoes.map(({ secao, subtopicos }) => {
        const allSelected = subtopicos.every(sub =>
          selectedTopicos.includes(sub)
        );
        return (
          <div key={secao} className="seccao-group">
            <div className="seccao-header">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => toggleSection(subtopicos)}
              />
              <label className="seccao-label">
                <strong>{secao}</strong>
              </label>
            </div>
            <div className="subtopicos-list">
              {subtopicos.map(sub => (
                <div key={sub} className="subtopico-item">
                  <input
                    type="checkbox"
                    checked={selectedTopicos.includes(sub)}
                    onChange={() => toggleSubtopico(sub)}
                  />
                  <label>{sub}</label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ConfigSelector({
  questions,
  selectedManual,
  selectedTopicos,
  setSelectedTopicos,
  numQuestoes,
  setNumQuestoes,
  maxQuestoesPossiveis,
  tempoAtivo,
  setTempoAtivo,
  tempoLimite,
  setTempoLimite,
  gerarQuiz
}) {
  return (
    <div className="config-selector fade-in">
      <SeccoesSelector
        questions={questions}
        selectedManual={selectedManual}
        selectedTopicos={selectedTopicos}
        setSelectedTopicos={setSelectedTopicos}
      />

      <div style={{ marginTop: '1rem' }}>
        <label>
          Quantidade de questões (máx: {maxQuestoesPossiveis || 0}):
        </label>
        <input
          type="number"
          min={1}
          max={maxQuestoesPossiveis || 1}
          value={numQuestoes}
          onChange={e => {
            const valor = Number(e.target.value);
            if (valor > (maxQuestoesPossiveis || 0)) {
              alert(`O máximo de questões permitidas é ${maxQuestoesPossiveis}.`);
              setNumQuestoes(maxQuestoesPossiveis || 1);
            } else {
              setNumQuestoes(valor);
            }
          }}
          disabled={selectedTopicos.length === 0}
          style={{ marginLeft: '0.5rem' }}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="checkbox"
          id="tempoAtivo"
          checked={tempoAtivo}
          onChange={() => setTempoAtivo(!tempoAtivo)}
        />{' '}
        <label htmlFor="tempoAtivo">Ativar tempo por questão?</label>
        {tempoAtivo && (
          <>
            <br />
            <label>Tempo (em segundos): </label>
            <input
              type="number"
              value={tempoLimite}
              onChange={e => setTempoLimite(Number(e.target.value))}
            />
          </>
        )}
      </div>

      <button style={{ marginTop: '1rem' }} onClick={gerarQuiz}>
        Gerar Quiz
      </button>
    </div>
  );
}

/* -----------------------------------------------------
   3) SUB-COMPONENTES DO QUIZ
----------------------------------------------------- */

function QuizQuestion({
  quiz,
  currentQuestionIndex,
  userAnswers,
  handleAnswer,
  setCurrentQuestionIndex,
  setShowResults
}) {
  const { Questao } = quiz[currentQuestionIndex];
  const [animClass, setAnimClass] = useState('fade-in');

  useEffect(() => {
    setAnimClass('fade-in');
  }, [currentQuestionIndex]);

  return (
    <div className={`question-card ${animClass}`}>
      <div>
        <p>
          <strong>
            {currentQuestionIndex + 1}. {Questao}
          </strong>
        </p>
        {['A', 'B', 'C', 'D'].map(letra => (
          <div key={letra} className="option">
            <input
              type="radio"
              id={`option-${currentQuestionIndex}-${letra}`}
              name={`questao-${currentQuestionIndex}`}
              checked={userAnswers[currentQuestionIndex] === letra}
              onChange={() => handleAnswer(letra)}
              disabled={userAnswers[currentQuestionIndex] !== undefined}
            />
            <label htmlFor={`option-${currentQuestionIndex}-${letra}`}>
              {letra}) {quiz[currentQuestionIndex][`Alternativa ${letra}`]}
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
          disabled={currentQuestionIndex === 0}
        >
          Voltar
        </button>
        <button
          onClick={() => {
            if (currentQuestionIndex < quiz.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
            } else {
              setShowResults(true);
            }
          }}
          style={{ marginLeft: '1rem' }}
          disabled={userAnswers[currentQuestionIndex] === undefined}
        >
          Avançar
        </button>
      </div>
    </div>
  );
}

function Resultados({ quiz, userAnswers, calcularPontuacao, onFazerNovaProva }) {
  const [animClass, setAnimClass] = useState('fade-in');

  useEffect(() => {
    setAnimClass('fade-in');
  }, []);

  return (
    <div className={`result-section ${animClass}`}>
      <h2>Resultado Final</h2>
      <p>
        Você acertou {calcularPontuacao()} de {quiz.length}
      </p>

      <h3>Correções:</h3>
      <ul className="corrections-list">
        {quiz.map((q, i) => {
          const acertou = userAnswers[i] === q.Correta;
          const expirou = userAnswers[i] === 'TEMPO_EXPIRADO';
          return (
            <li key={i}>
              <strong>
                {i + 1}. {q.Questao}
              </strong>
              <br />
              {expirou && (
                <span style={{ color: 'red' }}>
                  Tempo Esgotado → Considerada Errada
                </span>
              )}
              {!expirou && userAnswers[i] && (
                <span>
                  Sua Resposta: <b>{userAnswers[i]}</b> {acertou ? '✅' : '❌'}
                </span>
              )}
              {!userAnswers[i] && !expirou && (
                <span style={{ color: 'red' }}>Não Respondida ❌</span>
              )}
              {!acertou && (
                <div>
                  Resposta Correta: <b>{q.Correta}</b>
                  <br />
                  Alternativa: {q[`Alternativa ${q.Correta}`]}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <button onClick={onFazerNovaProva} style={{ marginTop: '1rem' }}>
        Fazer nova prova
      </button>
    </div>
  );
}

/* -----------------------------------------------------
   4) COMPONENTE PRINCIPAL
----------------------------------------------------- */

export default function QuizAppCompleto() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manuais, setManuais] = useState([]);
  const [selectedManual, setSelectedManual] = useState('');
  const [selectedTopicos, setSelectedTopicos] = useLocalStorageState(
    'quizSelectedTopicos',
    []
  );

  const [numQuestoes, setNumQuestoes] = useLocalStorageState(
    'quizNumQuestoes',
    10
  );
  const [tempoAtivo, setTempoAtivo] = useLocalStorageState(
    'quizTempoAtivo',
    false
  );
  const [tempoLimite, setTempoLimite] = useLocalStorageState(
    'quizTempoLimite',
    30
  );

  const [timer, setTimer] = useState(tempoLimite);
  const [quiz, setQuiz] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizIniciado, setQuizIniciado] = useState(false);

  const timerRef = useRef(null);

  // Ajuste a URL para o seu banco
  const sheetUrl =
    'https://api.steinhq.com/v1/storages/67f1b6f8c0883333658c85c4/Banco';

  // >>>>> LOGS PARA DEPURAÇÃO <<<<<
  useEffect(() => {
    console.log('DEBUG -> selectedManual:', selectedManual);
    console.log('DEBUG -> selectedTopicos:', selectedTopicos);
  }, [selectedManual, selectedTopicos]);

  /* -----------------------------------------------------
     (A) Carrega dados da planilha
  ----------------------------------------------------- */
  useEffect(() => {
    fetch(sheetUrl)
      .then(res => res.json())
     .then(data => {
  const dadosNormalizados = data.map(q => ({
    ...q,
    MANUAL: (q.MANUAL || '').trim().toUpperCase(),
    Subtópico: (q.Subtópico || '').trim().toUpperCase(),
    Seção: (q.Seção || '').trim()
  }));

  setQuestions(dadosNormalizados);

  const uniqueManuais = Array.from(new Set(dadosNormalizados.map(q => q.MANUAL)));
  setManuais(uniqueManuais);
  setIsLoading(false);

  console.log('Dados normalizados:', dadosNormalizados.slice(0, 5));
})


        // LOG do que veio do banco
        console.log('DEBUG -> questions (primeiras 5):', data.slice(0, 5));
        console.log('DEBUG -> uniqueManuais:', uniqueManuais);
      })
      .catch(erro => {
        console.error('Erro ao buscar banco:', erro);
        setIsLoading(false);
      });
  }, []);

  /* -----------------------------------------------------
     (B) Timer
  ----------------------------------------------------- */
  const handleTimeExpired = useCallback(() => {
  const i = currentQuestionIndex;
  setUserAnswers(prev => ({ ...prev, [i]: 'TEMPO_EXPIRADO' }));
  if (i < quiz.length - 1) {
    setCurrentQuestionIndex(i + 1);
  } else {
    setShowResults(true);
  }
}, [currentQuestionIndex, quiz.length]);

useEffect(() => {
  if (!tempoAtivo || showResults || quiz.length === 0) return;

  setTimer(tempoLimite);
  if (timerRef.current) clearInterval(timerRef.current);

  timerRef.current = setInterval(() => {
    setTimer(prev => {
      if (prev <= 1) {
        handleTimeExpired();
        return tempoLimite;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timerRef.current);
}, [currentQuestionIndex, tempoAtivo, showResults, quiz.length, tempoLimite, handleTimeExpired]);

  function handleTimeExpired() {
    const i = currentQuestionIndex;
    setUserAnswers(prev => ({ ...prev, [i]: 'TEMPO_EXPIRADO' }));
    if (i < quiz.length - 1) {
      setCurrentQuestionIndex(i + 1);
    } else {
      setShowResults(true);
    }
  }

  /* -----------------------------------------------------
     (C) Cálculo do máximo de questões
  ----------------------------------------------------- */
  const maxQuestoesPossiveis = useMemo(() => {
  if (!selectedManual || selectedTopicos.length === 0 || questions.length === 0) {
    return 0;
  }

  const quantidades = selectedTopicos.map(topico =>
    questions.filter(
      q => q.MANUAL === selectedManual && q.Subtópico === topico.toUpperCase()
    ).length
  );

  const minPorCategoria = Math.min(...quantidades);
  return minPorCategoria * selectedTopicos.length;
}, [questions, selectedManual, selectedTopicos]);

  /* -----------------------------------------------------
     (D) Gera o quiz final
  ----------------------------------------------------- */
  function gerarQuiz() {
    if (!selectedManual) {
      alert('Selecione um manual primeiro.');
      return;
    }
    if (selectedTopicos.length === 0) {
      alert('Selecione pelo menos um tópico.');
      return;
    }

    const maxQuestoes = maxQuestoesPossiveis;
    const num = Math.min(numQuestoes, maxQuestoes);
    if (num === 0) {
      alert('Não é possível gerar um quiz com 0 questões.');
      return;
    }

    let questoesSelecionadas = [];
    const cotaBase = Math.floor(num / selectedTopicos.length);
    const resto = num % selectedTopicos.length;

    const topicosEmbaralhados = shuffleArray(selectedTopicos);

    topicosEmbaralhados.forEach((topico, idx) => {
      let qtde = cotaBase + (idx < resto ? 1 : 0);

      // Normalização
      const topTrim = (topico || '').trim().toUpperCase();

      const questoesCategoria = questions.filter(q => {
        const manualTrim = (q.MANUAL || '').trim().toUpperCase();
        const subtopTrim = (q.Subtópico || '').trim().toUpperCase();
        return manualTrim === selectedManual && subtopTrim === topTrim;
      });

      const selecionadas = shuffleArray(questoesCategoria).slice(0, qtde);
      questoesSelecionadas = questoesSelecionadas.concat(selecionadas);
    });

    setQuiz(questoesSelecionadas);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setTimer(tempoLimite);
    setQuizIniciado(true);

    console.log('DEBUG -> Quiz Gerado:', questoesSelecionadas);
  }

  /* -----------------------------------------------------
     (E) Lógica de Seleção de Resposta
  ----------------------------------------------------- */
  const handleAnswer = useCallback(
  letra => {
    const i = currentQuestionIndex;
    if (!userAnswers[i]) {
      setUserAnswers(prev => ({ ...prev, [i]: letra }));
    }
  },
  [currentQuestionIndex, userAnswers]
);

  function calcularPontuacao() {
    let score = 0;
    quiz.forEach((q, i) => {
      if (userAnswers[i] === q.Correta) {
        score++;
      }
    });
    return score;
  }

  function handleFazerNovaProva() {
    setQuiz([]);
    setUserAnswers({});
    setShowResults(false);
    setQuizIniciado(false);
    setCurrentQuestionIndex(0);
  }

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="title fade-in">Teste de conhecimento T-27M (1º EIA)</h1>

      {!quizIniciado && <Instrucoes />}

      {!quizIniciado && (
        <>
          <ManualSelector
            manuais={manuais}
            selectedManual={selectedManual}
            setSelectedManual={setSelectedManual}
          />
          {selectedManual && !showResults && (
            <ConfigSelector
              questions={questions}
              selectedManual={selectedManual}
              selectedTopicos={selectedTopicos}
              setSelectedTopicos={setSelectedTopicos}
              numQuestoes={numQuestoes}
              setNumQuestoes={setNumQuestoes}
              maxQuestoesPossiveis={maxQuestoesPossiveis}
              tempoAtivo={tempoAtivo}
              setTempoAtivo={setTempoAtivo}
              tempoLimite={tempoLimite}
              setTempoLimite={setTempoLimite}
              gerarQuiz={gerarQuiz}
            />
          )}
        </>
      )}

      {quizIniciado && quiz.length > 0 && !showResults && (
        <>
          {tempoAtivo && (
            <h3 className="timer fade-in">Tempo restante: {timer}s</h3>
          )}

          <QuizQuestion
            quiz={quiz}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            handleAnswer={handleAnswer}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setShowResults={setShowResults}
          />
        </>
      )}

      {showResults && (
        <Resultados
          quiz={quiz}
          userAnswers={userAnswers}
          calcularPontuacao={calcularPontuacao}
          onFazerNovaProva={handleFazerNovaProva}
        />
      )}
    </div>
  );
}
