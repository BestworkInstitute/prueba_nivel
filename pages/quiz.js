import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import questions from '../utils/questions';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Quiz() {
  const router = useRouter();
  const { name, email, phone } = router.query;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutos
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [finalLevel, setFinalLevel] = useState('');
  const certRef = useRef(null);

  const current = questions[index];

  // Timer regresivo
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (i) => {
    const updated = [...answers];
    updated[index] = i;
    setAnswers(updated);
  };

  const handlePrevious = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleNext = () => {
    if (index < questions.length - 1) setIndex(index + 1);
  };

  const finish = async () => {
    let correct = 0;
    answers.forEach((ans, i) => {
      if (ans === questions[i].answer) correct++;
    });
    setScore(correct);

    const level =
      correct <= 5 ? 'A1 - Básico' :
      correct <= 10 ? 'A2 - Pre-Intermedio' :
      correct <= 15 ? 'B1 - Intermedio' :
      'B2 - Intermedio Alto';

    setFinalLevel(level);
    setFinished(true);

    // Enviar a Google Sheets
    await fetch('/api/save-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, level })
    });

    // Esperar que cargue logo
    setTimeout(() => generatePDF(), 1000);
  };

  const generatePDF = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const canvas = await html2canvas(certRef.current, {
      scale: 2,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, imgHeight);
    pdf.save('Certificado_BestWork.pdf');
  };

  const formatTime = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };

  if (finished) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
        <div
          ref={certRef}
          style={{
            width: '800px',
            margin: 'auto',
            padding: '2.5rem',
            backgroundColor: '#ffffff',
            fontFamily: 'Poppins, sans-serif',
            color: '#333',
            textAlign: 'center',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
            borderRadius: '12px'
          }}
        >
          <img
            src="/logo.png"
            alt="BestWork Logo"
            style={{ width: '160px', marginBottom: '20px' }}
          />

          <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', color: '#1446a0' }}>
            Certificado Inicial de Nivel de Inglés
          </h1>

          <p style={{ fontSize: '17px', marginBottom: '8px' }}>
            <strong>{name}</strong>
          </p>
          <p style={{ fontSize: '15px', marginBottom: '20px' }}>
            ha completado exitosamente el Test Inicial de Inglés y su nivel estimado es:
          </p>

          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '30px' }}>
            {finalLevel}
          </p>

          <p style={{ fontSize: '12px', color: '#777', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            Este certificado es una referencia inicial del nivel de inglés basada en una prueba adaptativa.
            No constituye una acreditación oficial.
          </p>

          <div style={{ borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#0a7dd1' }}>
              🎓 ¡Felicidades! Has obtenido una BECA del <strong style={{ color: '#e74c3c' }}>70%</strong> en el plan que más necesitas.
            </p>
          </div>
        </div>

        <p style={{ marginTop: '2rem' }}>Tu certificado se ha descargado automáticamente.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ textAlign: 'right', fontSize: '1rem', color: '#e63946', fontWeight: 'bold' }}>
        Tiempo restante: ⏳ {formatTime(timeLeft)}
      </div>
      <progress value={index + 1} max={questions.length} style={{ width: '100%', margin: '1rem 0' }} />
      <h2>{current.question}</h2>
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>{current.explanation}</p>

      {current.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleSelect(i)}
          style={{
            display: 'block',
            margin: '0.5rem 0',
            padding: '0.9rem',
            fontSize: '1rem',
            width: '100%',
            backgroundColor: answers[index] === i ? '#1446a0' : '#eee',
            color: answers[index] === i ? '#fff' : '#000',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {opt}
        </button>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <button onClick={handlePrevious} disabled={index === 0} style={navBtnStyle}>⬅ Anterior</button>
        {index < questions.length - 1 ? (
          <button onClick={handleNext} style={navBtnStyle}>Siguiente ➡</button>
        ) : (
          <button onClick={finish} style={navBtnStyle}>Finalizar ✅</button>
        )}
      </div>
    </div>
  );
}

const navBtnStyle = {
  padding: '0.8rem 1.2rem',
  backgroundColor: '#1446a0',
  color: '#fff',
  fontSize: '1rem',
  fontWeight: '600',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};
