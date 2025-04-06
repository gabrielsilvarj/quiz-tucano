import React, { useEffect, useState, useRef } from 'react';

export default function QuizAppCompleto() {
  const [questions, setQuestions] = useState([]);
  const [manuais, setManuais] = useState([]);
  const [selectedManual, setSelectedManual] = useState('');
  const [selectedTopicos, setSelectedTopicos] = useState([]);
  const [numQuestoes, setNumQuestoes] = useState(10);
  const [tempoAtivo, setTempoAtivo] = useState(false);
  const [tempoLimite, setTempoLimite] = useState(30); // em segundos
  const [timer, setTimer] = useState(tempoLimite);

  const [quiz, setQuiz] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const timerRef = useRef(null);

  const sheetUrl = 'https://api.steinhq.com/v1/storages/67f1b6f8c0883333658c85c4/Banco';

  // 1) Carrega dados ao montar
  useEffect(() => {
    fetch(sheetUrl)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        // Normaliza e obtém manuais
        const uniqueManuais = [
          ...new Set(
            data.map(q => (q.MANUAL || '').trim().toUpperCase()).filter(Boolean)
          ),
        ];
        setManuais(uniqueManuais);
      });
  }, []);

  // 2) Timer individual por questão
  useEffect(() => {
    if (!tempoAtivo || showResults || quiz.length === 0) {
      return;
    }

    // Se temos questão válida
    if (currentQuestionIndex < quiz.length) {
      // Resetar timer
      setTimer(tempoLimite);

      // Limpar timer anterior, se houver
      if (timerRef.current) clearInterval(timerRef.current);

      // Iniciar novo timer
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            // Tempo acabou, marca como errada e vai para proxima
            handleTimeExpired();
            return tempoLimite; // zera ou restaura? vamos restaurar
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [currentQuestionIndex, tempoAtivo, showResults, quiz]);

  // 3) Função quando tempo expira
  const handleTimeExpired = () => {
    // se tempo expirou, conta como errada => userAnswers[i] = 'X'
    const i = currentQuestionIndex;
    setUserAnswers(prev => ({ ...prev, [i]: 'TEMPO_EXPIRADO' }));

    // vai para proxima questao
    if (i < quiz.length - 1) {
      setCurrentQuestionIndex(i + 1);
    } else {
      // Fim do quiz
      setShowResults(true);
    }
  };

  // 4) Filtrando topicos do manual
  const topicosFiltrados = [
    ...new Set(
      questions
        .filter(q => (q.MANUAL || '').trim().toUpperCase() === selectedManual)
        .map(q => q.Subtópico)
    ),
  ];

  // 5) Gera o quiz (array de questões)
  const gerarQuiz = () => {
    let questoesSelecionadas = [];
    // minQuestoesPorCategoria
    const minQuestoesPorCategoria = Math.min(
      ...selectedTopicos.map(t =>
        questions.filter(
          q =>
            (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
            q.Subtópico === t
        ).length
      )
    );
    const totalMaximo = minQuestoesPorCategoria * selectedTopicos.length;
    if (numQuestoes > totalMaximo) {
      setNumQuestoes(totalMaximo);
    }

    selectedTopicos.forEach(topico => {
      const questoesCategoria = questions.filter(
        q =>
          (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
          q.Subtópico === topico
      );
      // randomiza e pega a cota => numQuestoes / selectedTopicos.length
      const cota = Math.floor(numQuestoes / selectedTopicos.length);
      const selecionadas = questoesCategoria
        .sort(() => 0.5 - Math.random())
        .slice(0, cota);

      questoesSelecionadas = questoesSelecionadas.concat(selecionadas);
    });

    // Reset states
    setQuiz(questoesSelecionadas);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);

    // se tempo estiver ativo, o timer começa no effect
    setTimer(tempoLimite);
  };

  // 6) Handle de seleção de resposta
  const handleAnswer = (letra) => {
    const i = currentQuestionIndex;
    setUserAnswers(prev => ({ ...prev, [i]: letra }));

    // Ir para próxima
    if (i < quiz.length - 1) {
      setCurrentQuestionIndex(i + 1);
    } else {
      // acabou
      setShowResults(true);
    }
  };

  // 7) Calcular pontuação
  const calcularPontuacao = () => {
    let score = 0;
    quiz.forEach((q, i) => {
      if (userAnswers[i] === q.Correta) {
        score += 1;
      }
    });
    return score;
  };

  // 8) Render
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Quiz Interativo</h1>

      {/* Selecionar Manual */}
      <h2>Selecione o Manual:</h2>
      {manuais.map(manual => (
        <button
          key={manual}
          onClick={() => setSelectedManual(manual)}
          style={{
            backgroundColor: (selectedManual === manual) ? '#1976d2' : '#ccc',
            color: '#fff',
            marginRight: '0.5rem',
            marginBottom: '0.5rem'
          }}
        >
          {manual}
        </button>
      ))}

      {/* Selecionar tópicos (só quando manual está selecionado) */}
      {selectedManual && !showResults && (
        <div>
          <h2>Selecione os tópicos:</h2>
          {topicosFiltrados.map(topico => (
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

          {/* Configurar quantidade de questões */}
          <div style={{ marginTop: '1rem' }}>
            <label>Quantidade de questões: </label>
            <input
              type='number'
              min={1}
              max={50}
              value={numQuestoes}
              onChange={e => setNumQuestoes(Number(e.target.value))}
            />
          </div>

          {/* Configurar tempo por questão */}
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
      )}

      {/* Exibir a Questão atual */}
      {quiz.length > 0 && !showResults && (
        <div style={{ marginTop: '2rem' }}>
          {tempoAtivo && (
            <h3>Tempo restante: {timer}s</h3>
          )}
          {/* Questão atual */}
          <div>
            <p>
              <strong>
                {currentQuestionIndex + 1}. {quiz[currentQuestionIndex].Questao}
              </strong>
            </p>
            {['A', 'B', 'C', 'D'].map(letra => (
              <div key={letra} style={{ marginLeft: '1rem' }}>
                <input
                  type='radio'
                  name={`questao-${currentQuestionIndex}`}
                  checked={userAnswers[currentQuestionIndex] === letra}
                  onChange={() => handleAnswer(letra)}
                />
                <label style={{ marginLeft: '0.5rem' }}>
                  {letra}) {quiz[currentQuestionIndex][`Alternativa ${letra}`]}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exibir resultado */}
      {showResults && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Resultado Final</h2>
          <p>
            Você acertou {calcularPontuacao()} de {quiz.length}
          </p>

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
                      Resposta Correta: <b>{q.Correta}</b>
                      <br />
                      Alternativa:
                      {' '}{q[`Alternativa ${q.Correta}`]}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
