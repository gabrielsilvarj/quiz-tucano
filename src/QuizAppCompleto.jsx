import React, { useEffect, useState, useRef, useMemo } from 'react';
import './App.css';

/* ---------------
  UTILITÁRIOS
--------------- */

// Embaralha um array de modo mais claro que sort(() => 0.5 - Math.random())
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Hook simples para usar LocalStorage (opcional)
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
      // Se o usuário estiver em modo privado ou algo der errado, apenas ignoramos
    }
  }, [key, state]);

  return [state, setState];
}

/* ---------------
  SUB-COMPONENTES
--------------- */

/** Exibe instruções iniciais. */
function Instrucoes() {
  return (
    <div className="instructions-box">
      <h2>Instruções:</h2>
      <ul>
        <li>Selecione o manual e os tópicos que deseja estudar.</li>
        <li>Escolha quantas questões deseja e, se quiser, ative o tempo por questão.</li>
        <li>Ao iniciar o quiz, uma questão será exibida por vez.</li>
        <li>Você poderá navegar entre as questões com os botões “Voltar” e “Avançar”.</li>
        <li>As respostas não podem ser alteradas após selecionadas.</li>
        <li>Se o tempo da questão expirar, ela será marcada como errada.</li>
      </ul>
    </div>
  );
}

/** Botões para selecionar o manual desejado. */
function ManualSelector({ manuais, selectedManual, setSelectedManual }) {
  return (
    <>
      <h2>Selecione o Manual:</h2>
      {manuais.map(manual => (
        <button
          key={manual}
          onClick={() => setSelectedManual(manual)}
          style={{
            backgroundColor: selectedManual === manual ? '#1976d2' : '#ccc',
            color: '#fff',
            marginRight: '0.5rem',
            marginBottom: '0.5rem'
          }}
        >
          {manual}
        </button>
      ))}
    </>
  );
}

/** Checkboxes para selecionar os tópicos, input de quantidade e tempo. */
function TopicosSelector({
  topicos,
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
    <div>
      <h2>Selecione os tópicos:</h2>
      {topicos.length === 0 && (
        <p style={{ color: 'red' }}>Não há tópicos disponíveis para o manual selecionado.</p>
      )}
      {topicos.map(topico => (
        <div key={topico}>
          <input
            type='checkbox'
            checked={selectedTopicos.includes(topico)}
            onChange={() =>
              setSelectedTopicos(prev =>
                prev.includes(topico)
                  ? prev.filter(t => t !== topico)
                  : [...prev, topico]
              )
            }
          />
          <label style={{ marginLeft: '0.5rem' }}>{topico}</label>
        </div>
      ))}

      <div style={{ marginTop: '1rem' }}>
        <label>
          Quantidade de questões (máx: {maxQuestoesPossiveis || 0}):
        </label>
        <input
          type='number'
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
          disabled={topicos.length === 0}
          style={{ marginLeft: '0.5rem' }}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input
          type='checkbox'
          checked={tempoAtivo}
          onChange={() => setTempoAtivo(!tempoAtivo)}
        />{' '}
        Ativar tempo por questão?
        {tempoAtivo && (
          <>
            <br />
            <label>Tempo (em segundos): </label>
            <input
              type='number'
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

/** Exibe a questão atual e botões para resposta. */
function QuizQuestion({
  quiz,
  currentQuestionIndex,
  userAnswers,
  handleAnswer,
  setCurrentQuestionIndex,
  setShowResults
}) {
  const { Questao } = quiz[currentQuestionIndex];

  return (
    <div style={{ marginTop: '2rem' }}>
      <div>
        <p>
          <strong>
            {currentQuestionIndex + 1}. {Questao}
          </strong>
        </p>
        {['A', 'B', 'C', 'D'].map(letra => (
          <div key={letra} style={{ marginLeft: '1rem' }}>
            <input
              type='radio'
              name={`questao-${currentQuestionIndex}`}
              checked={userAnswers[currentQuestionIndex] === letra}
              onChange={() => handleAnswer(letra)}
              disabled={userAnswers[currentQuestionIndex] !== undefined}
            />
            <label style={{ marginLeft: '0.5rem' }}>
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

/** Exibe o resultado final do quiz, correções e pontuação. */
function Resultados({ quiz, userAnswers, calcularPontuacao }) {
  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Resultado Final</h2>
      <p>Você acertou {calcularPontuacao()} de {quiz.length}</p>
      <h3>Correções:</h3>
      <ul>
        {quiz.map((q, i) => {
          const acertou = userAnswers[i] === q.Correta;
          const expirou = userAnswers[i] === 'TEMPO_EXPIRADO';
          return (
            <li key={i} style={{ marginTop: '0.5rem' }}>
              <strong>{i + 1}. {q.Questao}</strong><br />
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
                  Resposta Correta: <b>{q.Correta}</b><br />
                  Alternativa: {q[`Alternativa ${q.Correta}`]}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------
  COMPONENTE PRINCIPAL
--------------- */

export default function QuizAppCompleto() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [manuais, setManuais] = useState([]);
  const [selectedManual, setSelectedManual] = useState('');

  // Exemplo de uso de localStorage para topicos selecionados
  const [selectedTopicos, setSelectedTopicos] = useLocalStorageState(
    'quizSelectedTopicos',
    []
  );

  const [numQuestoes, setNumQuestoes] = useLocalStorageState('quizNumQuestoes', 10);
  const [tempoAtivo, setTempoAtivo] = useLocalStorageState('quizTempoAtivo', false);
  const [tempoLimite, setTempoLimite] = useLocalStorageState('quizTempoLimite', 30);
  const [timer, setTimer] = useState(tempoLimite);

  const [quiz, setQuiz] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // As respostas podem ser salvas em localStorage também, se quiser
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizIniciado, setQuizIniciado] = useState(false);

  const timerRef = useRef(null);

  const sheetUrl = 'https://api.steinhq.com/v1/storages/67f1b6f8c0883333658c85c4/Banco';

  // BUSCAR OS DADOS
  useEffect(() => {
    fetch(sheetUrl)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        const uniqueManuais = [
          ...new Set(
            data.map(q => (q.MANUAL || '').trim().toUpperCase()).filter(Boolean)
          ),
        ];
        setManuais(uniqueManuais);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // RELÓGIO
  useEffect(() => {
    if (!tempoAtivo || showResults || quiz.length === 0) {
      return;
    }

    if (currentQuestionIndex < quiz.length) {
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
    }
  }, [currentQuestionIndex, tempoAtivo, showResults, quiz, tempoLimite]);

  const handleTimeExpired = () => {
    const i = currentQuestionIndex;
    setUserAnswers(prev => ({ ...prev, [i]: 'TEMPO_EXPIRADO' }));
    if (i < quiz.length - 1) {
      setCurrentQuestionIndex(i + 1);
    } else {
      setShowResults(true);
    }
  };

  // TOPICOS DISPONÍVEIS
  const topicosFiltrados = useMemo(() => {
    return [
      ...new Set(
        questions
          .filter(q => (q.MANUAL || '').trim().toUpperCase() === selectedManual)
          .map(q => q.Subtópico)
      ),
    ];
  }, [questions, selectedManual]);

  // CÁLCULO DO TOTAL MÁXIMO DE QUESTÕES PARA MANTER DISTRIBUIÇÃO IGUAL
  const maxQuestoesPossiveis = useMemo(() => {
    if (selectedTopicos.length === 0) return 0;

    // Para cada subtópico escolhido, conta quantas questões há disponíveis
    const questoesPorTopico = selectedTopicos.map(topico => {
      return questions.filter(
        q =>
          (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
          q.Subtópico === topico
      ).length;
    });

    if (questoesPorTopico.length === 0) return 0;
    const minQuestoesPorCategoria = Math.min(...questoesPorTopico);
    return minQuestoesPorCategoria * selectedTopicos.length;
  }, [questions, selectedManual, selectedTopicos]);

  // GERA O QUIZ
  const gerarQuiz = () => {
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
    // Divide igualmente
    const cotaBase = Math.floor(num / selectedTopicos.length);
    const resto = num % selectedTopicos.length;

    // Embaralha os tópicos para distribuir o resto de forma aleatória
    const topicosEmbaralhados = shuffleArray(selectedTopicos);

    topicosEmbaralhados.forEach((topico, idx) => {
      let qtde = cotaBase + (idx < resto ? 1 : 0);
      const questoesCategoria = questions.filter(
        q =>
          (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
          q.Subtópico === topico
      );
      const selecionadas = shuffleArray(questoesCategoria).slice(0, qtde);

      questoesSelecionadas = questoesSelecionadas.concat(selecionadas);
    });

    setQuiz(questoesSelecionadas);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setTimer(tempoLimite);
    setQuizIniciado(true);
  };

  const handleAnswer = (letra) => {
    const i = currentQuestionIndex;
    if (!userAnswers[i]) {
      setUserAnswers(prev => ({ ...prev, [i]: letra }));
    }
  };

  const calcularPontuacao = () => {
    let score = 0;
    quiz.forEach((q, i) => {
      if (userAnswers[i] === q.Correta) {
        score += 1;
      }
    });
    return score;
  };

  /* ------------------ RENDERIZAÇÃO ------------------ */
  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Quiz Interativo</h1>

      {!quizIniciado && <Instrucoes />}

      {!quizIniciado && (
        <>
          {/* Componente para selecionar o manual */}
          <ManualSelector
            manuais={manuais}
            selectedManual={selectedManual}
            setSelectedManual={setSelectedManual}
          />

          {/* Configurações de tópicos e quantidade de questões */}
          {selectedManual && !showResults && (
            <TopicosSelector
              topicos={topicosFiltrados}
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
          {tempoAtivo && <h3>Tempo restante: {timer}s</h3>}

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
        />
      )}
    </div>
  );
}
