import { useRouter } from 'next/router';
import { useState, useRef } from 'react';
import questions from '../utils/questions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Quiz() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalLevel, setFinalLevel] = useState('');
  const certRef = useRef(null);

  const current = questions[index];

  const handleAnswer = (i) => {
    if (i === current.answer) setScore(score + 1);
    if (index + 1 === questions.length) {
      finish();
    } else {
      setIndex(index + 1);
    }
  };

  const finish = async () => {
    const level = 
  score <= 10 ? 'A1' :
  score <= 20 ? 'A2' :
  score <= 28 ? 'B1' :
  score >= 29 ? 'B2' :
  'Desconocido';
    setFinalLevel(level);
    setFinished(true);

    await fetch('/api/save-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: router.query.name,
        phone: router.query.phone,
        email: router.query.email,
        level
      }),
    });

    setTimeout(() => generatePDF(), 1000);
  };

  const generatePDF = async () => {
    const element = certRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', 0, y, pdfWidth, imgHeight);
    pdf.save('Certificado_BestWork.pdf');
  };

  if (finished) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
        <div
          ref={certRef}
          style={{
            width: '800px',
            margin: 'auto',
            padding: '3rem',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            fontFamily: 'Poppins, sans-serif',
            color: '#333',
            textAlign: 'center',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          }}
        >
          <img
            src="https://bestwork.cl/wp-content/uploads/2023/05/Logo.png"
            alt="BestWork Logo"
            style={{ width: '180px', marginBottom: '20px' }}
          />

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#1446a0',
            }}
          >
            Certificado Inicial de Nivel de Inglés
          </h1>

          <p style={{ fontSize: '18px', marginBottom: '8px' }}>
            <strong>{router.query.name}</strong>
          </p>
          <p style={{ fontSize: '16px', marginBottom: '25px' }}>
            ha completado exitosamente el Test Inicial de Inglés y su nivel estimado es:
          </p>

          <p
            style={{
              fontSize: '26px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '30px',
            }}
          >
            {finalLevel}
          </p>

          <p
            style={{
              fontSize: '13px',
              marginBottom: '40px',
              maxWidth: '600px',
              margin: '0 auto',
              color: '#777',
            }}
          >
            Este certificado es una referencia inicial del nivel de inglés basada en una prueba adaptativa.
            No constituye una acreditación oficial.
          </p>

          <div
            style={{
              marginTop: '60px',
              paddingTop: '20px',
              borderTop: '1px dashed #ccc',
            }}
          >
            <p
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#0a7dd1',
              }}
            >
              🎓 ¡Felicidades! Has obtenido una BECA del{' '}
              <strong style={{ color: '#e74c3c' }}>70%</strong> en el plan que más necesitas.
            </p>
          </div>
        </div>

        <p style={{ marginTop: '2rem' }}>Tu certificado se ha descargado automáticamente.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto', fontFamily: 'Poppins, sans-serif' }}>
      <progress value={index + 1} max={questions.length} style={{ width: '100%' }} />
      <h2 style={{ marginTop: '2rem' }}>{current.question}</h2>
      {current.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleAnswer(i)}
          style={{
            display: 'block',
            margin: '1rem 0',
            padding: '0.9rem',
            fontSize: '1rem',
            width: '100%',
            backgroundColor: '#1446a0',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
