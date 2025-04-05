import React, { useEffect, useState, useRef } from 'react';

export default function QuizAppCompleto() {
  const [questions, setQuestions] = useState([]);
  const [manuais, setManuais] = useState([]);
  const [selectedManual, setSelectedManual] = useState('');
  const [selectedTopicos, setSelectedTopicos] = useState([]);
  const [numQuestoes, setNumQuestoes] = useState(10);
  const [tempoAtivo, setTempoAtivo] = useState(false);
  const [tempoLimite, setTempoLimite] = useState(30);
  const [quiz, setQuiz] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(tempoLimite);

  const timerRef = useRef(null);

  const sheetUrl = 'https://api.steinhq.com/v1/storages/67f1b6f8c0883333658c85c4/Banco';

  useEffect(() => {
    fetch(sheetUrl)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        const uniqueManuais = [...new Set(
  data.map(q => (q.MANUAL || '').trim().toUpperCase()).filter(Boolean)
)];
        setManuais(uniqueManuais);
      });
  }, []);

  useEffect(() => {
    if (tempoAtivo && quiz.length > 0 && !showResults) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            proximaQuestaoAutomatico();
            return tempoLimite;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [tempoAtivo, quiz, showResults]);

  const topicosFiltrados = [...new Set(
    questions.filter(q => (q.MANUAL || '').trim().toUpperCase() === selectedManual).map(q => q.Subtópico)
  )];

  const gerarQuiz = () => {
    let questoesSelecionadas = [];
    const minQuestoesPorCategoria = Math.min(
      ...selectedTopicos.map(t => questions.filter(q => q.Subtópico === t && q.MANUAL === selectedManual).length)
    );
    const totalMaximo = minQuestoesPorCategoria * selectedTopicos.length;
    if (numQuestoes > totalMaximo) setNumQuestoes(totalMaximo);

    selectedTopicos.forEach(topico => {
      const questoesCategoria = questions.filter(q => q.Subtópico === topico && q.MANUAL === selectedManual);
      questoesSelecionadas = questoesSelecionadas.concat(
        questoesCategoria.sort(() => 0.5 - Math.random()).slice(0, Math.floor(numQuestoes / selectedTopicos.length))
      );
    });

    setQuiz(questoesSelecionadas);
    setUserAnswers({});
    setShowResults(false);
    setTimer(tempoLimite);
  };

  const proximaQuestaoAutomatico = () => {
    setQuiz(prevQuiz => prevQuiz.slice(1));
  };

  const handleAnswer = (index, letra) => {
    setUserAnswers(prev => ({ ...prev, [index]: letra }));
  };

  const calcularPontuacao = () => quiz.reduce((acc, q, i) => acc + (userAnswers[i] === q.Correta ? 1 : 0), 0);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Quiz Interativo</h1>

      <h2>Selecione o Manual:</h2>
      {manuais.map(manual => (
        <button key={manual} onClick={() => setSelectedManual(manual)}>{manual}</button>
      ))}

      {selectedManual && (
        <div>
          <h2>Selecione os tópicos:</h2>
          {topicosFiltrados.map(topico => (
            <div key={topico}>
              <input type="checkbox" checked={selectedTopicos.includes(topico)}
                onChange={() => setSelectedTopicos(prev => prev.includes(topico)
                  ? prev.filter(t => t !== topico)
                  : [...prev, topico])} />
              <label>{topico}</label>
            </div>
          ))}

          <label>Quantidade de questões:</label>
          <input type="number" min={1} max={50} value={numQuestoes} onChange={e => setNumQuestoes(Number(e.target.value))} />

          <div>
            <input type="checkbox" checked={tempoAtivo} onChange={() => setTempoAtivo(!tempoAtivo)} /> Ativar tempo por questão?
            {tempoAtivo && <input type="number" value={tempoLimite} onChange={e => setTempoLimite(Number(e.target.value))} placeholder="Segundos por questão" />}
          </div>

          <button onClick={gerarQuiz}>Gerar Quiz</button>
        </div>
      )}

      {quiz.length > 0 && (
        <div>
          {tempoAtivo && <h3>Tempo restante: {timer}s</h3>}
          {quiz.map((q, i) => (
            <div key={i}>
              <p>{i + 1}. {q.Questao}</p>
              {['A', 'B', 'C', 'D'].map(letra => (
                <div key={letra}>
                  <input type="radio" checked={userAnswers[i] === letra} onChange={() => handleAnswer(i, letra)} />
                  <label>{q[`Alternativa ${letra}`]}</label>
                </div>
              ))}
            </div>
          ))}
          <button onClick={() => setShowResults(true)}>Finalizar Quiz</button>
        </div>
      )}

      {showResults && (
        <div>
          <h2>Você acertou {calcularPontuacao()} de {quiz.length}</h2>
        </div>
      )}
    </div>
  );
}
