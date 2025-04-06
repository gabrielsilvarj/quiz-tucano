import React, { useEffect, useState, useRef } from 'react';
import './App.css';

export default function QuizAppCompleto() {
  const [questions, setQuestions] = useState([]);
  const [manuais, setManuais] = useState([]);
  const [selectedManual, setSelectedManual] = useState('');
  const [selectedTopicos, setSelectedTopicos] = useState([]);
  const [numQuestoes, setNumQuestoes] = useState(10);
  const [tempoAtivo, setTempoAtivo] = useState(false);
  const [tempoLimite, setTempoLimite] = useState(30);
  const [timer, setTimer] = useState(tempoLimite);

  const [quiz, setQuiz] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizIniciado, setQuizIniciado] = useState(false);

  const timerRef = useRef(null);

  const sheetUrl = 'https://api.steinhq.com/v1/storages/67f1b6f8c0883333658c85c4/Banco';

  useEffect(() => {
    fetch(sheetUrl)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        const uniqueManuais = [
          ...new Set(
            data.map(q => (q.MANUAL || '').trim().toUpperCase()).filter(Boolean)
          ),
        ];
        setManuais(uniqueManuais);
      });
  }, []);

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

  // Calcula os tópicos filtrados para o manual selecionado
  const topicosFiltrados = [
    ...new Set(
      questions
        .filter(q => (q.MANUAL || '').trim().toUpperCase() === selectedManual)
        .map(q => q.Subtópico)
    ),
  ];

  // Cálculo do total máximo de questões possíveis baseado na distribuição igual
  const calcularTotalMaximo = () => {
    // Se não houver tópicos selecionados, não há questões a distribuir
    if (selectedTopicos.length === 0) return 0;

    // Para cada subtópico escolhido, contamos quantas questões há disponíveis
    const questoesPorTopico = selectedTopicos.map(topico => {
      return questions.filter(
        q =>
          (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
          q.Subtópico === topico
      ).length;
    });

    // O minQuestoesPorCategoria é o menor número de questões dentre os tópicos selecionados
    const minQuestoesPorCategoria = Math.min(...questoesPorTopico);

    // Máximo total, se quisermos mesmo número de questões por categoria
    const totalMaximo = minQuestoesPorCategoria * selectedTopicos.length;

    return totalMaximo;
  };

  const gerarQuiz = () => {
    // Só gere o quiz se houver tópicos selecionados
    if (selectedTopicos.length === 0) return;

    const maxQuestoes = calcularTotalMaximo();
    // Garante que numQuestoes não passe do máximo
    const num = Math.min(numQuestoes, maxQuestoes);

    let questoesSelecionadas = [];

    // Distribuição igual
    const cota = Math.floor(num / selectedTopicos.length);

    // Embaralha tópicos para distribuir o 'resto' de forma mais aleatória (opcional)
    const topicosEmbaralhados = [...selectedTopicos].sort(() => 0.5 - Math.random());

    // Se quiser distribuir exatamente 'num' questões mesmo que não seja múltiplo do Nº de tópicos,
    // podemos espalhar o resto nas primeiras categorias.
    const resto = num % selectedTopicos.length;

    topicosEmbaralhados.forEach((topico, idx) => {
      // Quantidade base que essa categoria deve ter
      let qtdePorTopico = cota;

      // Se ainda sobrou resto para distribuir, acrescenta +1
      if (idx < resto) {
        qtdePorTopico += 1;
      }

      // Filtra todas as questões daquele tópico
      const questoesCategoria = questions.filter(
        q =>
          (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
          q.Subtópico === topico
      );

      // Embaralha e pega a quantidade definida
      const selecionadas = questoesCategoria
        .sort(() => 0.5 - Math.random())
        .slice(0, qtdePorTopico);

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

  const maxQuestoesPossiveis = calcularTotalMaximo();

  return (
    <div style={{ padding: '2rem' }}>

      <h1>Quiz Interativo</h1>

      {!quizIniciado && (
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
      )}

      {!quizIniciado && (
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

              <div style={{ marginTop: '1rem' }}>
                <label>Quantidade de questões (máx: {maxQuestoesPossiveis || 0}): </label>
                <input
                  type='number'
                  min={1}
                  max={maxQuestoesPossiveis || 1}
                  value={numQuestoes}
                  onChange={e => {
                    const valor = Number(e.target.value);
                    setNumQuestoes(
                      valor > maxQuestoesPossiveis
                        ? maxQuestoesPossiveis
                        : valor
                    );
                  }}
                  disabled={selectedTopicos.length === 0}
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
          )}
        </>
      )}

      {quizIniciado && quiz.length > 0 && !showResults && (
        <div style={{ marginTop: '2rem' }}>
          {tempoAtivo && <h3>Tempo restante: {timer}s</h3>}
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
              onClick={() =>
                setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))
              }
              disabled={currentQuestionIndex === 0}
            >
              Voltar
            </button>
            <button
              onClick={() => {
                if (currentQuestionIndex < quiz.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
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
      )}

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
                      Resposta Correta: <b>{q.Correta}</b><br />
                      Alternativa: {q[`Alternativa ${q.Correta}`]}
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
