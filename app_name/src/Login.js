import React, { useState } from 'react';
import { useEffect } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const ipAddress = 'http://192.168.0.81:5000';


  useEffect(() => {
    fetch(`${ipAddress}/worki`)
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error('Error fetching worki:', err));
  }, []);

  const handleLogin = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    alert('Prosze uzupełnić wszystkie pola');
    return;
  }

  try {
    
    const response = await fetch(`${ipAddress}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('user', email);
      onLogin();
    } else {
      alert('Nieprawidłowy login lub hasło');
    }

  } catch (error) {
    console.error(error);
    alert('Błąd połączenia z serwerem');
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔐 Rejestr Worków</h1>
          <p style={styles.subtitle}>Zaloguj się do panelu</p>
        </div>

        <form style={styles.form} onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Login</label>
            <input
              type="text"
              placeholder="Wpisz swój login"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Hasło</label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Wpisz hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showPasswordBtn}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button} >
            Zaloguj się
          </button>
        </form>

        <div style={styles.footer}>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  formWrapper: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '420px',
    padding: '50px 40px',
    animation: 'slideIn 0.5s ease-out',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    color: '#2c3e50',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    letterSpacing: '0.5px',
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: '14px',
    margin: '0',
    fontWeight: '400',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '12px 14px',
    fontSize: '14px',
    border: '2px solid #ecf0f1',
    borderRadius: '6px',
    fontFamily: 'Arial, sans-serif',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#f9fafb',
  },
  passwordContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    padding: '12px 14px',
    fontSize: '14px',
    border: '2px solid #ecf0f1',
    borderRadius: '6px',
    fontFamily: 'Arial, sans-serif',
    transition: 'all 0.3s ease',
    outline: 'none',
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingRight: '40px',
  },
  showPasswordBtn: {
    position: 'absolute',
    right: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
    transition: 'transform 0.2s',
  },
  button: {
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#667eea',
    color: 'white',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '10px',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #ecf0f1',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '12px',
    color: '#95a5a6',
    margin: '0',
  },
};


export default Login;