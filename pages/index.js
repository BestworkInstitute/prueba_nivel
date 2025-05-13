import { useRouter } from 'next/router';
import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '569', email: '' });

  const isValid = () => {
    return (
      form.name.trim() !== '' &&
      /^569\d{8}$/.test(form.phone) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return alert("Datos inválidos");

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Entrando al Test de Nivel... 🎓");
      router.push({ pathname: '/quiz', query: form });
    } else {
      alert("Error al registrar tus datos.");
    }
  };

  return (
    <>
      <Head>
        <title>Test de Nivel de Inglés | BestWork</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet"/>
      </Head>

      <div style={styles.container}>
        <img src="https://bestwork.cl/wp-content/uploads/2023/05/Logo.png" alt="BestWork Logo" style={styles.logo} />
        <h1 style={styles.title}>Test Inicial de Nivel de Inglés</h1>
        <p style={styles.subtitle}>Completa tus datos para comenzar</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" placeholder="Nombre y Apellido" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} required />
          <input type="tel" placeholder="Celular (569XXXXXXXX)" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} style={styles.input} pattern="569\d{8}" required />
          <input type="email" placeholder="Correo Electrónico" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} required />
          <button type="submit" style={styles.button}>Comenzar Test</button>
        </form>
      </div>
    </>
  );
}

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    maxWidth: '450px',
    margin: 'auto',
    padding: '3rem 1rem',
    textAlign: 'center',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    marginTop: '5vh',
  },
  logo: {
    width: '160px',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#333'
  },
  subtitle: {
    fontSize: '1rem',
    marginBottom: '1.5rem',
    color: '#666'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  input: {
    padding: '0.9rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '0.9rem',
    background: '#1446a0',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};
