import React, { useEffect, useState, useRef, useMemo } from 'react';
import './App.css';

/* --------------------
   UTILITÁRIOS
-------------------- */

// Embaralha um array utilizando o algoritmo Fisher-Yates
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Hook simples para uso de localStorage
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
      // Ignora erros em ambientes privados
    }
  }, [key, state]);

  return [state, setState];
}

/* --------------------
   COMPONENTES DE SELEÇÃO
-------------------- */

/** Exibe as instruções iniciais */
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
        <li>As respostas não podem ser alteradas após selecionadas.</li>
        <li>Se o tempo da questão expirar, ela será marcada como errada.</li>
      </ul>
    </div>
  );
}

/** Permite selecionar o manual desejado */
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

/** Exibe seções e subtópicos agrupados, permitindo selecionar tudo de uma vez ou individualmente */
function SeccoesSelector({ questions, selectedManual, selectedTopicos, setSelectedTopicos }) {
  // Agrupa os subtópicos por seção para o manual selecionado.
  const seccoes = useMemo(() => {
    const filtered = questions.filter(
      q => (q.MANUAL || '').trim().toUpperCase() === selectedManual
    );
    const groups = {};
    filtered.forEach(q => {
      const secao = q.Seção || 'Sem Seção'; // Ajuste conforme nome real do campo
      const subtopico = q.Subtópico;
      if (!groups[secao]) groups[secao] = new Set();
      groups[secao].add(subtopico);
    });
    return Object.entries(groups).map(([secao, subtopicosSet]) => ({
      secao,
      subtopicos: Array.from(subtopicosSet)
    }));
  }, [questions, selectedManual]);

  const toggleSubtopico = (subtopico) => {
    if (selectedTopicos.includes(subtopico)) {
      setSelectedTopicos(prev => prev.filter(s => s !== subtopico));
    } else {
      setSelectedTopicos(prev => [...prev, subtopico]);
    }
  };

  const toggleSection = (secao, subtopicos) => {
    // Verifica se todos os subtópicos daquela seção estão selecionados
    const allSelected = subtopicos.every(sub => selectedTopicos.includes(sub));
    if (allSelected) {
      // Remove todos os subtópicos da seção
      setSelectedTopicos(prev => prev.filter(s => !subtopicos.includes(s)));
    } else {
      // Adiciona os que ainda não estiverem selecionados
      setSelectedTopicos(prev => Array.from(new Set([...prev, ...subtopicos])));
    }
  };

  return (
    <div className="seccoes-selector fade-in">
      <h2 className="section-title">Selecione as Seções e Subtópicos:</h2>
      {seccoes.map(({ secao, subtopicos }) => {
        const allSelected = subtopicos.every(sub => selectedTopicos.includes(sub));
        return (
          <div key={secao} className="seccao-group">
            <div className="seccao-header">
              <input
                type="checkbox"
                id={`secao-${secao}`}
                checked={allSelected}
                onChange={() => toggleSection(secao, subtopicos)}
              />
              <label htmlFor={`secao-${secao}`} className="seccao-label">
                {secao}
              </label>
            </div>
            <div className="subtopicos-list">
              {subtopicos.map(sub => (
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

/** Configurações de quantidade de questões, tempo e geração do quiz */
function ConfigSelector({
  questions,
  selectedManual,
  selectedTopicos,
  setSelectedTopicos,
  numQuestoes,
  setNumQuestoes,
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
      {/* <-- Removida aqui a lógica de limitação da quantidade de questões --> */}
      <div style={{ marginTop: '1rem' }}>
        <label>Quantidade de questões: </label>
        <input
          type="number"
          min={1}
          max={50}
          value={numQuestoes}
          onChange={e => setNumQuestoes(Number(e.target.value))}
          style={{ marginLeft: '0.5rem' }}
        />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <input
          type="checkbox"
          id="tempoAtivo"
          checked={tempoAtivo}
          onChange={() => setTempoAtivo(!tempoAtivo)}
        />
        <label htmlFor="tempoAtivo"> Ativar tempo por questão?</label>
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

/* --------------------
   COMPONENTES DO QUIZ
-------------------- */

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

/* --------------------
   COMPONENTE PRINCIPAL
-------------------- */

export default function QuizAppCompleto() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manuais, setManuais] = useState([]);
  const [selectedManual, setSelectedManual] = useState('');

  // Estados para tópicos e configurações, armazenados ou não no localStorage
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
  const [
