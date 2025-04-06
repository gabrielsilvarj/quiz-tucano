import React, { useEffect, useState, useRef, useMemo } from 'react';
import './App.css';

/* --------------------
   UTILITÁRIOS
-------------------- */
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
    } catch {}
  }, [key, state]);

  return [state, setState];
}

/* --------------------
   COMPONENTES DE SELEÇÃO
-------------------- */

function Instrucoes() {
  return (
    <div className="instructions-box fade-in">
      <h2>Instruções:</h2>
      <ul>
        <li>Selecione o manual e as seções que deseja estudar.</li>
        <li>Em cada seção, os subtópicos serão listados e poderão ser selecionados individualmente ou em conjunto.</li>
        <li>Escolha quantas questões deseja e, se quiser, ative o tempo por questão.</li>
        <li>Ao iniciar o quiz, uma questão será exibida por vez.</li>
        <li>Você poderá navegar entre as questões com os botões “Voltar” e “Avançar”.</li>
        <li>As respostas poderão ser alteradas enquanto o tempo não expirar ou se não houver tempo definido.</li>
        <li>Se o tempo da questão expirar, ela será marcada como errada.</li>
      </ul>
    </div>
  );
}

function ManualSelector({ manuais, selectedManual, setSelectedManual }) {
  return (
    <>
      <h2 className="section-title">Selecione o Manual:</h2>
      {manuais.map((manual) => (
        <button
          key={manual}
          onClick={() => setSelectedManual(manual)}
          style={{
            backgroundColor: selectedManual === manual ? '#1976d2' : '#ccc',
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
  setSelectedTopicos,
}) {
  const seccoes = useMemo(() => {
    const filtered = questions.filter(
      (q) => (q.MANUAL || '').trim().toUpperCase() === selectedManual
    );
    const groups = {};
    filtered.forEach((q) => {
      const secao = q.Seção;
      const subtitulo = q.Subtópico;
      if (!groups[secao]) groups[secao] = new Set();
      groups[secao].add(subtitulo);
    });
    return Object.entries(groups).map(([secao, subtopicosSet]) => ({
      secao,
      subtopicos: Array.from(subtopicosSet),
    }));
  }, [questions, selectedManual]);

  const toggleSubtopico = (subtopico) => {
    if (selectedTopicos.includes(subtopico)) {
      setSelectedTopicos(selectedTopicos.filter((s) => s !== subtopico));
    } else {
      setSelectedTopicos([...selectedTopicos, subtopico]);
    }
  };

  const toggleSection = (secao, subtopicos) => {
    const allSelected = subtopicos.every((sub) => selectedTopicos.includes(sub));
    if (allSelected) {
      setSelectedTopicos(selectedTopicos.filter((s) => !subtopicos.includes(s)));
    } else {
      setSelectedTopicos(Array.from(new Set([...selectedTopicos, ...subtopicos])));
    }
  };

  return (
    <div className="seccoes-selector fade-in">
      <h2 className="section-title">Selecione as Seções e Subtópicos:</h2>
      {seccoes.map(({ secao, subtopicos }) => {
        const allSelected = subtopicos.every((sub) =>
          selectedTopicos.includes(sub)
        );
        return (
          <div key={secao} className="seccao-group">
            <div className="seccao-header">
              <input
                type="checkbox"
                id={`secao-${secao}`}
                checked={allSelected}
                onChange={() => toggleSection(secao, subtopicos)}
              />
              <label htmlFor={`secao-${secao}`}>
                <strong>{secao}</strong>
              </label>
            </div>
            <div className="subtopicos-list">
              {subtopicos.map((sub) => (
                <div key={sub} className="subtopico-item">
                  <input
                    type="checkbox"
                    id={`sub-${sub}`}
                    checked={selectedTopicos.includes(sub)}
                    onChange={() => toggleSubtopico(sub)}
                  />
                  <label htmlFor={`sub-${sub}`}>{sub}</label>
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
  gerarQuiz,
  modoDistribuicao,
  setModoDistribuicao,
  modoApresentacao,
  setModoApresentacao,
}) {
  return (
    <div className="config-selector fade-in">
      <SeccoesSelector
        questions={questions}
        selectedManual={selectedManual}
        selectedTopicos={selectedTopicos}
        setSelectedTopicos={setSelectedTopicos}
      />
      {/* Seleção do modo de distribuição */}
      <div style={{ marginTop: '1rem' }}>
        <label>Modo de Distribuição:</label>
        <label style={{ marginLeft: '0.5rem' }}>
          <input
            type="radio"
            name="modoDistribuicao"
            value="igual"
            checked={modoDistribuicao === 'igual'}
            onChange={() => setModoDistribuicao('igual')}
          />{' '}
          Distribuição Igual
        </label>
        <label style={{ marginLeft: '0.5rem' }}>
          <input
            type="radio"
            name="modoDistribuicao"
            value="total"
            checked={modoDistribuicao === 'total'}
            onChange={() => setModoDistribuicao('total')}
          />{' '}
          Distribuição Total
        </label>
      </div>
      {/* Seleção do modo de apresentação */}
      <div style={{ marginTop: '1rem' }}>
        <label>Modo de Apresentação:</label>
        <label style={{ marginLeft: '0.5rem' }}>
          <input
            type="radio"
            name="modoApresentacao"
            value="umPorVez"
            checked={modoApresentacao === 'umPorVez'}
            onChange={() => setModoApresentacao('umPorVez')}
          />{' '}
          Uma questão por vez
        </label>
        <label style={{ marginLeft: '0.5rem' }}>
          <input
            type="radio"
            name="modoApresentacao"
            value="acumulativo"
            checked={modoApresentacao === 'acumulativo'}
            onChange={() => setModoApresentacao('acumulativo')}
          />{' '}
          Acumulativo (desliza anteriores)
        </label>
      </div>
      {/* Input de quantidade de questões */}
      <div style={{ marginTop: '1rem' }}>
        {modoDistribuicao === 'igual' ? (
          <>
            <label>Quantidade de questões (máx: {maxQuestoesPossiveis || 0}):</label>
            <input
              type="number"
              min={1}
              max={maxQuestoesPossiveis || 1}
              value={numQuestoes}
              onChange={(e) => {
                const valor = Number(e.target.value);
                if (valor > (maxQuestoesPossiveis || 0)) {
                  alert(
                    `O máximo de questões permitidas é ${maxQuestoesPossiveis}.`
                  );
                  setNumQuestoes(maxQuestoesPossiveis || 1);
                } else {
                  setNumQuestoes(valor);
                }
              }}
              disabled={selectedTopicos.length === 0}
              style={{ marginLeft: '0.5rem', width: '80px' }}
            />
          </>
        ) : (
          <>
            <label>Quantidade de questões:</label>
            <input
              type="number"
              min={1}
              value={numQuestoes}
              onChange={(e) => setNumQuestoes(Number(e.target.value))}
              disabled={selectedTopicos.length === 0}
              style={{ marginLeft: '0.5rem', width: '80px' }}
            />
          </>
        )}
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
              onChange={(e) => setTempoLimite(Number(e.target.value))}
              style={{ width: '80px', marginLeft: '0.5rem' }}
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

/* --------------------
   MODO DE EXIBIÇÃO DAS QUESTÕES
-------------------- */

/** Exibe **apenas** a questão atual, com fade-in (sem flip-in) */
function QuizQuestion({
  quiz,
  currentQuestionIndex,
  userAnswers,
  handleAnswer,
  setCurrentQuestionIndex,
  setShowResults,
  tempoAtivo,
  timer
}) {
  const { Questao } = quiz[currentQuestionIndex];
  // Sempre fade-in
  const [animClass, setAnimClass] = useState('fade-in');

  useEffect(() => {
    // Sempre redefine para fade-in quando currentQuestionIndex muda
    setAnimClass('fade-in');
  }, [currentQuestionIndex]);

  return (
    <div key={currentQuestionIndex} className={`question-card balloon ${animClass}`}>
      <div>
        <p>
          <strong>
            {currentQuestionIndex + 1}. {Questao}
          </strong>
        </p>
        {['A', 'B', 'C', 'D'].map((letra) => (
          <div key={letra} className="option">
            <input
              type="radio"
              id={`option-${currentQuestionIndex}-${letra}`}
              name={`questao-${currentQuestionIndex}`}
              checked={userAnswers[currentQuestionIndex] === letra}
              onChange={() => handleAnswer(letra)}
              disabled={tempoAtivo && timer <= 0}
            />
            <label htmlFor={`option-${currentQuestionIndex}-${letra}`}>
              {letra}) {quiz[currentQuestionIndex][`Alternativa ${letra}`]}
            </label>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentQuestionIndex === 0}
        >
          Voltar
        </button>
        <button
          onClick={() => {
            if (currentQuestionIndex < quiz.length - 1) {
              setCurrentQuestionIndex((prev) => prev + 1);
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

/** No modo "acumulativo", mostra as anteriores + atual.
 *  As anteriores recebem classe "slide-down" e a atual recebe "fade-in".
 *  As anteriores exibem o texto completo da alternativa que o usuário escolheu.
 */
function QuizPresentation({
  quiz,
  currentQuestionIndex,
  userAnswers,
  handleAnswer,
  setCurrentQuestionIndex,
  setShowResults,
  tempoAtivo,
  timer,
  modoApresentacao
}) {
  if (modoApresentacao === 'umPorVez') {
    return (
      <QuizQuestion
        quiz={quiz}
        currentQuestionIndex={currentQuestionIndex}
        userAnswers={userAnswers}
        handleAnswer={handleAnswer}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        setShowResults={setShowResults}
        tempoAtivo={tempoAtivo}
        timer={timer}
      />
    );
  }

  // modo acumulativo
  return (
    <div>
      {quiz.slice(0, currentQuestionIndex).map((q, i) => {
        const resposta = userAnswers[i];
        let textoResposta = '-';
        if (resposta === 'TEMPO_EXPIRADO') {
          textoResposta = 'Tempo Esgotado → Errada';
        } else if (resposta) {
          textoResposta = q[`Alternativa ${resposta}`] || resposta;
        }
        return (
          <div key={i} className="question-card balloon slide-down">
            <p>
              <strong>{i + 1}. {q.Questao}</strong>
            </p>
            <div className="option">
              <span>Resposta: {textoResposta}</span>
            </div>
          </div>
        );
      })}

      {/* Exibe a questão atual com fade-in */}
      {quiz[currentQuestionIndex] && (
        <QuizQuestion
          quiz={quiz}
          currentQuestionIndex={currentQuestionIndex}
          userAnswers={userAnswers}
          handleAnswer={handleAnswer}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          setShowResults={setShowResults}
          tempoAtivo={tempoAtivo}
          timer={timer}
        />
      )}
    </div>
  );
}

/** Exibe os resultados */
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
              {!acertou && !expirou && (
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

/* --------------------
   COMPONENTE PRINCIPAL
-------------------- */

export default function QuizAppCompleto() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [manuais, setManuais] = useState([]);
  const [selectedManual, setSelectedManual] = useState('');
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
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizIniciado, setQuizIniciado] = useState(false);

  // Modo de distribuição: "igual" ou "total"
  const [modoDistribuicao, setModoDistribuicao] = useState('igual');
  // Modo de apresentação: "umPorVez" ou "acumulativo"
  const [modoApresentacao, setModoApresentacao] = useState('umPorVez');

  const timerRef = useRef(null);
  const sheetUrl =
    'https://api.steinhq.com/v1/storages/67f1b6f8c0883333658c85c4/Banco';

  useEffect(() => {
    fetch(sheetUrl)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        const uniqueManuais = [
          ...new Set(
            data.map((q) => (q.MANUAL || '').trim().toUpperCase()).filter(Boolean)
          ),
        ];
        setManuais(uniqueManuais);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Lógica do Timer
  useEffect(() => {
    if (!tempoAtivo || showResults || quiz.length === 0) return;
    if (currentQuestionIndex < quiz.length) {
      setTimer(tempoLimite);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
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
    setUserAnswers((prev) => ({ ...prev, [i]: 'TEMPO_EXPIRADO' }));
    if (i < quiz.length - 1) {
      setCurrentQuestionIndex(i + 1);
    } else {
      setShowResults(true);
    }
  };

  // Cálculo do máximo de questões no modo "igual"
  const maxQuestoesPossiveis = useMemo(() => {
    if (selectedTopicos.length === 0) return 0;
    const questoesPorTopico = selectedTopicos.map((topico) =>
      questions.filter(
        (q) =>
          (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
          q.Subtópico === topico
      ).length
    );
    if (questoesPorTopico.length === 0) return 0;
    const minQuestoesPorCategoria = Math.min(...questoesPorTopico);
    return minQuestoesPorCategoria * selectedTopicos.length;
  }, [questions, selectedManual, selectedTopicos]);

  // Soma total de questões no modo "total"
  const maxTotalQuestoes = useMemo(() => {
    if (selectedTopicos.length === 0) return 0;
    return selectedTopicos.reduce((acc, topico) => {
      const count = questions.filter(
        (q) =>
          (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
          q.Subtópico === topico
      ).length;
      return acc + count;
    }, 0);
  }, [questions, selectedManual, selectedTopicos]);

  const gerarQuiz = () => {
    if (!selectedManual) {
      alert('Selecione um manual primeiro.');
      return;
    }
    if (selectedTopicos.length === 0) {
      alert('Selecione pelo menos um tópico.');
      return;
    }

    let questoesSelecionadas = [];

    if (modoDistribuicao === 'igual') {
      const maxQuestoes = maxQuestoesPossiveis;
      const num = Math.min(numQuestoes, maxQuestoes);
      if (num === 0) {
        alert('Não é possível gerar um quiz com 0 questões.');
        return;
      }
      const cotaBase = Math.floor(num / selectedTopicos.length);
      const resto = num % selectedTopicos.length;
      const topicosEmbaralhados = shuffleArray(selectedTopicos);
      topicosEmbaralhados.forEach((topico, idx) => {
        let qtde = cotaBase + (idx < resto ? 1 : 0);
        const questoesCategoria = questions.filter(
          (q) =>
            (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
            q.Subtópico === topico
        );
        const selecionadas = shuffleArray(questoesCategoria).slice(0, qtde);
        questoesSelecionadas = questoesSelecionadas.concat(selecionadas);
      });
      setQuiz(questoesSelecionadas);
    } else {
      // modo "total"
      const maxTotal = maxTotalQuestoes;
      const num = Math.min(numQuestoes, maxTotal);
      if (num === 0) {
        alert('Não é possível gerar um quiz com 0 questões.');
        return;
      }
      let remaining = num;
      const availability = {};
      selectedTopicos.forEach((topico) => {
        const count = questions.filter(
          (q) =>
            (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
            q.Subtópico === topico
        ).length;
        availability[topico] = count;
      });
      const assignments = {};
      selectedTopicos.forEach((topico) => {
        assignments[topico] = 0;
      });
      let categories = [...selectedTopicos];
      while (remaining > 0 && categories.length > 0) {
        const quota = Math.floor(remaining / categories.length) || 1;
        categories.forEach((cat) => {
          const assign = Math.min(quota, availability[cat]);
          assignments[cat] += assign;
          availability[cat] -= assign;
          remaining -= assign;
        });
        categories = categories.filter((cat) => availability[cat] > 0);
      }
      assignments &&
        Object.keys(assignments).forEach((cat) => {
          const qty = assignments[cat];
          const questoesCategoria = questions.filter(
            (q) =>
              (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
              q.Subtópico === cat
          );
          const selecionadas = shuffleArray(questoesCategoria).slice(0, qty);
          questoesSelecionadas = questoesSelecionadas.concat(selecionadas);
        });
      setQuiz(questoesSelecionadas);
    }

    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setTimer(tempoLimite);
    setQuizIniciado(true);
  };

  const handleAnswer = (letra) => {
    const i = currentQuestionIndex;
    setUserAnswers((prev) => ({ ...prev, [i]: letra }));
  };

  const calcularPontuacao = () => {
    let score = 0;
    quiz.forEach((q, i) => {
      if (userAnswers[i] === q.Correta) score++;
    });
    return score;
  };

  const handleFazerNovaProva = () => {
    setQuiz([]);
    setUserAnswers({});
    setShowResults(false);
    setQuizIniciado(false);
    setCurrentQuestionIndex(0);
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="title fade-in">Questões T-27M</h1>

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
              modoDistribuicao={modoDistribuicao}
              setModoDistribuicao={setModoDistribuicao}
              modoApresentacao={modoApresentacao}
              setModoApresentacao={setModoApresentacao}
            />
          )}
        </>
      )}

      {quizIniciado && quiz.length > 0 && !showResults && (
        <>
          {tempoAtivo && (
            <h3 className="timer fade-in">Tempo restante: {timer}s</h3>
          )}
          <QuizPresentation
            quiz={quiz}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            handleAnswer={handleAnswer}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setShowResults={setShowResults}
            tempoAtivo={tempoAtivo}
            timer={timer}
            modoApresentacao={modoApresentacao}
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
