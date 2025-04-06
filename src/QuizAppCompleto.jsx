import React, { useEffect, useState, useRef, useMemo } from 'react';
 import './App.css';
 
 /* ---------------
   UTILITÁRIOS
 --------------- */
 /* --------------------
    UTILITÁRIOS
 -------------------- */
 
 // Embaralha um array de modo mais claro do que sort(() => 0.5 - Math.random())
 // Embaralha um array utilizando o algoritmo Fisher-Yates
 function shuffleArray(array) {
   const arr = [...array];
   for (let i = arr.length - 1; i > 0; i--) {
 @@ -15,7 +15,7 @@ function shuffleArray(array) {
   return arr;
 }
 
 // Hook simples para usar LocalStorage (opcional)
 // Hook simples para uso de localStorage
 function useLocalStorageState(key, defaultValue) {
   const [state, setState] = useState(() => {
     try {
 @@ -30,24 +30,25 @@ function useLocalStorageState(key, defaultValue) {
     try {
       window.localStorage.setItem(key, JSON.stringify(state));
     } catch {
       // Se o usuário estiver em modo privado ou algo der errado, apenas ignoramos
       // Ignora erros em ambientes privados
     }
   }, [key, state]);
 
   return [state, setState];
 }
 
 /* ---------------
   SUB-COMPONENTES
 --------------- */
 /* --------------------
    COMPONENTES DE SELEÇÃO
 -------------------- */
 
 /** Exibe instruções iniciais. */
 /** Exibe as instruções iniciais */
 function Instrucoes() {
   return (
     <div className="instructions-box">
     <div className="instructions-box fade-in">
       <h2>Instruções:</h2>
       <ul>
         <li>Selecione o manual e os tópicos que deseja estudar.</li>
         <li>Selecione o manual e as seções que deseja estudar.</li>
         <li>Em cada seção, os subtópicos serão listados e poderão ser selecionados individualmente ou em conjunto.</li>
         <li>Escolha quantas questões deseja e, se quiser, ative o tempo por questão.</li>
         <li>Ao iniciar o quiz, uma questão será exibida por vez.</li>
         <li>Você poderá navegar entre as questões com os botões “Voltar” e “Avançar”.</li>
 @@ -58,20 +59,17 @@ function Instrucoes() {
   );
 }
 
 /** Botões para selecionar o manual desejado. */
 /** Permite selecionar o manual desejado */
 function ManualSelector({ manuais, selectedManual, setSelectedManual }) {
   return (
     <>
       <h2>Selecione o Manual:</h2>
       <h2 className="section-title">Selecione o Manual:</h2>
       {manuais.map(manual => (
         <button
           key={manual}
           onClick={() => setSelectedManual(manual)}
           style={{
             backgroundColor: selectedManual === manual ? '#1976d2' : '#ccc',
             color: '#fff',
             marginRight: '0.5rem',
             marginBottom: '0.5rem'
             backgroundColor: selectedManual === manual ? '#1976d2' : '#ccc'
           }}
         >
           {manual}
 @@ -81,9 +79,89 @@ function ManualSelector({ manuais, selectedManual, setSelectedManual }) {
   );
 }
 
 /** Checkboxes para selecionar os tópicos, input de quantidade e tempo. */
 function TopicosSelector({
   topicos,
 /** Exibe as seções e seus subtópicos agrupados.  
  *  Se uma seção for selecionada, todos os seus subtópicos serão marcados.
  */
 function SeccoesSelector({ questions, selectedManual, selectedTopicos, setSelectedTopicos }) {
   // Agrupa os subtópicos por seção para o manual selecionado.
   const seccoes = useMemo(() => {
     const filtered = questions.filter(
       q => (q.MANUAL || '').trim().toUpperCase() === selectedManual
     );
     const groups = {};
     filtered.forEach(q => {
       const secao = q.Seção; // considere que a propriedade do objeto seja "Seção"
       const subtitulo = q.Subtópico;
       if (!groups[secao]) groups[secao] = new Set();
       groups[secao].add(subtitulo);
     });
     return Object.entries(groups).map(([secao, subtopicosSet]) => ({
       secao,
       subtopicos: Array.from(subtopicosSet)
     }));
   }, [questions, selectedManual]);
 
   const toggleSubtopico = (subtopico) => {
     if (selectedTopicos.includes(subtopico)) {
       setSelectedTopicos(selectedTopicos.filter(s => s !== subtopico));
     } else {
       setSelectedTopicos([...selectedTopicos, subtopico]);
     }
   };
 
   const toggleSection = (secao, subtopicos) => {
     const allSelected = subtopicos.every(sub => selectedTopicos.includes(sub));
     if (allSelected) {
       // Remove todos os subtópicos da seção
       setSelectedTopicos(selectedTopicos.filter(s => !subtopicos.includes(s)));
     } else {
       // Adiciona os que ainda não estiverem selecionados
       setSelectedTopicos(Array.from(new Set([...selectedTopicos, ...subtopicos])));
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
               <label htmlFor={`secao-${secao}`}>
                 <strong>{secao}</strong>
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
 
 /** Combina a seleção de seções/subtópicos com as configurações do quiz */
 function ConfigSelector({
   questions,
   selectedManual,
   selectedTopicos,
   setSelectedTopicos,
   numQuestoes,
 @@ -96,34 +174,19 @@ function TopicosSelector({
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
           type='number'
           type="number"
           min={1}
           max={maxQuestoesPossiveis || 1}
           value={numQuestoes}
 @@ -136,39 +199,42 @@ function TopicosSelector({
               setNumQuestoes(valor);
             }
           }}
           disabled={topicos.length === 0}
           disabled={selectedTopicos.length === 0}
           style={{ marginLeft: '0.5rem' }}
         />
       </div>
 
       <div style={{ marginTop: '1rem' }}>
         <input
           type='checkbox'
           type="checkbox"
           id="tempoAtivo"
           checked={tempoAtivo}
           onChange={() => setTempoAtivo(!tempoAtivo)}
         />{' '}
         Ativar tempo por questão?
         <label htmlFor="tempoAtivo">Ativar tempo por questão?</label>
         {tempoAtivo && (
           <>
             <br />
             <label>Tempo (em segundos): </label>
             <input
               type='number'
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
 
 /** Exibe a questão atual e botões para resposta. */
 /* --------------------
    COMPONENTES DO QUIZ
 -------------------- */
 
 /** Exibe a questão atual com animação de fade-in */
 function QuizQuestion({
   quiz,
   currentQuestionIndex,
 @@ -178,25 +244,31 @@ function QuizQuestion({
   setShowResults
 }) {
   const { Questao } = quiz[currentQuestionIndex];
   const [animClass, setAnimClass] = useState('fade-in');
 
   useEffect(() => {
     setAnimClass('fade-in');
   }, [currentQuestionIndex]);
 
   return (
     <div style={{ marginTop: '2rem' }}>
     <div className={`question-card ${animClass}`}>
       <div>
         <p>
           <strong>
             {currentQuestionIndex + 1}. {Questao}
           </strong>
         </p>
         {['A', 'B', 'C', 'D'].map(letra => (
           <div key={letra} style={{ marginLeft: '1rem' }}>
           <div key={letra} className="option">
             <input
               type='radio'
               type="radio"
               id={`option-${currentQuestionIndex}-${letra}`}
               name={`questao-${currentQuestionIndex}`}
               checked={userAnswers[currentQuestionIndex] === letra}
               onChange={() => handleAnswer(letra)}
               disabled={userAnswers[currentQuestionIndex] !== undefined}
             />
             <label style={{ marginLeft: '0.5rem' }}>
             <label htmlFor={`option-${currentQuestionIndex}-${letra}`}>
               {letra}) {quiz[currentQuestionIndex][`Alternativa ${letra}`]}
             </label>
           </div>
 @@ -227,20 +299,31 @@ function QuizQuestion({
   );
 }
 
 /** Exibe o resultado final do quiz, correções e pontuação. */
 /** Exibe os resultados com animação de fade-in */
 function Resultados({ quiz, userAnswers, calcularPontuacao, onFazerNovaProva }) {
   const [animClass, setAnimClass] = useState('fade-in');
 
   useEffect(() => {
     setAnimClass('fade-in');
   }, []);
 
   return (
     <div style={{ marginTop: '2rem' }}>
     <div className={`result-section ${animClass}`}>
       <h2>Resultado Final</h2>
       <p>Você acertou {calcularPontuacao()} de {quiz.length}</p>
       <p>
         Você acertou {calcularPontuacao()} de {quiz.length}
       </p>
       <h3>Correções:</h3>
       <ul>
       <ul className="corrections-list">
         {quiz.map((q, i) => {
           const acertou = userAnswers[i] === q.Correta;
           const expirou = userAnswers[i] === 'TEMPO_EXPIRADO';
           return (
             <li key={i} style={{ marginTop: '0.5rem' }}>
               <strong>{i + 1}. {q.Questao}</strong><br />
             <li key={i}>
               <strong>
                 {i + 1}. {q.Questao}
               </strong>
               <br />
               {expirou && (
                 <span style={{ color: 'red' }}>
                   Tempo Esgotado → Considerada Errada
 @@ -256,61 +339,44 @@ function Resultados({ quiz, userAnswers, calcularPontuacao, onFazerNovaProva })
               )}
               {!acertou && (
                 <div>
                   Resposta Correta: <b>{q.Correta}</b><br />
                   Resposta Correta: <b>{q.Correta}</b>
                   <br />
                   Alternativa: {q[`Alternativa ${q.Correta}`]}
                 </div>
               )}
             </li>
           );
         })}
       </ul>
 
       {/* Botão para fazer nova prova */}
       <button onClick={onFazerNovaProva} style={{ marginTop: '1rem' }}>
         Fazer nova prova
       </button>
     </div>
   );
 }
 
 /* ---------------
   COMPONENTE PRINCIPAL
 --------------- */
 /* --------------------
    COMPONENTE PRINCIPAL
 -------------------- */
 
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
 
   const [selectedTopicos, setSelectedTopicos] = useLocalStorageState('quizSelectedTopicos', []);
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
 
   // URL da planilha
   const sheetUrl = 'https://api.steinhq.com/v1/storages/67f1b6f8c0883333658c85c4/Banco';
 
   /* ---------------
      BUSCA DOS DADOS
   --------------- */
   useEffect(() => {
     fetch(sheetUrl)
       .then(res => res.json())
 @@ -319,26 +385,19 @@ export default function QuizAppCompleto() {
         const uniqueManuais = [
           ...new Set(
             data.map(q => (q.MANUAL || '').trim().toUpperCase()).filter(Boolean)
           ),
           )
         ];
         setManuais(uniqueManuais);
         setIsLoading(false);
       })
       .catch(() => setIsLoading(false));
   }, []);
 
   /* ---------------
      RELÓGIO/TEMPO
   --------------- */
   useEffect(() => {
     if (!tempoAtivo || showResults || quiz.length === 0) {
       return;
     }
 
     if (!tempoAtivo || showResults || quiz.length === 0) return;
     if (currentQuestionIndex < quiz.length) {
       setTimer(tempoLimite);
       if (timerRef.current) clearInterval(timerRef.current);
 
       timerRef.current = setInterval(() => {
         setTimer(prev => {
           if (prev <= 1) {
 @@ -348,7 +407,6 @@ export default function QuizAppCompleto() {
           return prev - 1;
         });
       }, 1000);
 
       return () => clearInterval(timerRef.current);
     }
   }, [currentQuestionIndex, tempoAtivo, showResults, quiz, tempoLimite]);
 @@ -363,41 +421,23 @@ export default function QuizAppCompleto() {
     }
   };
 
   /* ---------------
      CÁLCULO TÓPICOS
   --------------- */
   const topicosFiltrados = useMemo(() => {
     return [
       ...new Set(
         questions
           .filter(q => (q.MANUAL || '').trim().toUpperCase() === selectedManual)
           .map(q => q.Subtópico)
       ),
     ];
   }, [questions, selectedManual]);
   // Cálculo dos tópicos disponíveis não é mais necessário,
   // pois a seleção será feita via agrupamento por seção.
 
   /* ---------------
      MÁXIMO QUESTÕES
   --------------- */
   const maxQuestoesPossiveis = useMemo(() => {
     if (selectedTopicos.length === 0) return 0;
 
     const questoesPorTopico = selectedTopicos.map(topico => {
       return questions.filter(
     const questoesPorTopico = selectedTopicos.map(topico =>
       questions.filter(
         q =>
           (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
           q.Subtópico === topico
       ).length;
     });
 
       ).length
     );
     if (questoesPorTopico.length === 0) return 0;
     const minQuestoesPorCategoria = Math.min(...questoesPorTopico);
     return minQuestoesPorCategoria * selectedTopicos.length;
   }, [questions, selectedManual, selectedTopicos]);
 
   /* ---------------
      GERA O QUIZ
   --------------- */
   const gerarQuiz = () => {
     if (!selectedManual) {
       alert('Selecione um manual primeiro.');
 @@ -407,36 +447,26 @@ export default function QuizAppCompleto() {
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
 
     // Embaralha os tópicos para distribuir o resto de forma aleatória
     const topicosEmbaralhados = shuffleArray(selectedTopicos);
 
     topicosEmbaralhados.forEach((topico, idx) => {
       let qtde = cotaBase + (idx < resto ? 1 : 0);
       const questoesCategoria = questions.filter(
         q =>
           (q.MANUAL || '').trim().toUpperCase() === selectedManual &&
           q.Subtópico === topico
       );
 
       // Embaralha e pega a quantidade definida
       const selecionadas = shuffleArray(questoesCategoria).slice(0, qtde);
 
       questoesSelecionadas = questoesSelecionadas.concat(selecionadas);
     });
 
     setQuiz(questoesSelecionadas);
     setCurrentQuestionIndex(0);
     setUserAnswers({});
 @@ -445,9 +475,6 @@ export default function QuizAppCompleto() {
     setQuizIniciado(true);
   };
 
   /* ---------------
      LÓGICA RESPOSTAS
   --------------- */
   const handleAnswer = (letra) => {
     const i = currentQuestionIndex;
     if (!userAnswers[i]) {
 @@ -458,52 +485,38 @@ export default function QuizAppCompleto() {
   const calcularPontuacao = () => {
     let score = 0;
     quiz.forEach((q, i) => {
       if (userAnswers[i] === q.Correta) {
         score += 1;
       }
       if (userAnswers[i] === q.Correta) score += 1;
     });
     return score;
   };
 
   /* ---------------
      REINICIAR QUIZ
   --------------- */
   const handleFazerNovaProva = () => {
     // Restaura tudo para o estado inicial (exceto o que você desejar manter)
     setQuiz([]);
     setUserAnswers({});
     setShowResults(false);
     setQuizIniciado(false);
     setCurrentQuestionIndex(0);
     // Se quiser zerar também manual e tópicos selecionados:
     // setSelectedManual('');
     // setSelectedTopicos([]);
   };
 
   /* ---------------
      RENDERIZAÇÃO
   --------------- */
   if (isLoading) {
     return <div style={{ padding: '2rem' }}>Carregando...</div>;
   }
 
   return (
     <div style={{ padding: '2rem' }}>
       <h1>Quiz Interativo</h1>
 
       <h1 className="title fade-in">Quiz Interativo</h1>
       {!quizIniciado && <Instrucoes />}
 
       {!quizIniciado && (
         <>
           <ManualSelector
             manuais={manuais}
             selectedManual={selectedManual}
             setSelectedManual={setSelectedManual}
           />
 
           {selectedManual && !showResults && (
             <TopicosSelector
               topicos={topicosFiltrados}
             <ConfigSelector
               questions={questions}
               selectedManual={selectedManual}
               selectedTopicos={selectedTopicos}
               setSelectedTopicos={setSelectedTopicos}
               numQuestoes={numQuestoes}
 @@ -518,11 +531,11 @@ export default function QuizAppCompleto() {
           )}
         </>
       )}
 
       {quizIniciado && quiz.length > 0 && !showResults && (
         <>
           {tempoAtivo && <h3>Tempo restante: {timer}s</h3>}
 
           {tempoAtivo && (
             <h3 className="timer fade-in">Tempo restante: {timer}s</h3>
           )}
           <QuizQuestion
             quiz={quiz}
             currentQuestionIndex={currentQuestionIndex}
 @@ -533,7 +546,6 @@ export default function QuizAppCompleto() {
           />
         </>
       )}
 
       {showResults && (
         <Resultados
           quiz={quiz}
