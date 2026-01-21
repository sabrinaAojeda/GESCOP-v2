// src/pages/Login/Login.jsx - VERSIÓN PREMIUM MEJORADA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('Administrador');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Manejar selección de tipo de usuario
  const handleUserTypeSelect = (type) => {
    setUserType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (!email) {
      setError('Por favor, ingrese su correo corporativo');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, ingrese un correo electrónico válido');
      setLoading(false);
      return;
    }

    try {
      // Simular login
      await new Promise(resolve => setTimeout(resolve, 1500));
      await login(email, userType);
      // La redirección se maneja en el useEffect de arriba
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo-container">
            <img 
              src="/logo.png" 
              alt="COPESA Logo" 
              className="login-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                // Fallback si el logo no carga
                e.target.parentElement.innerHTML = `
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                    <div style="font-size: 32px; color: #066496; background: rgba(6, 100, 150, 0.1); width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center;">
                      🚗
                    </div>
                    <div style="text-align: center;">
                      <div style="font-size: 20px; font-weight: 700; color: #066496; letter-spacing: 0.8px; margin-bottom: 8px;">COPESA</div>
                      <div style="font-size: 14px; color: #56A69E; font-weight: 500;">Gestión Integral</div>
                    </div>
                  </div>
                `;
              }}
            />
            <div className="login-subtitle">Bienvenido, ingrese sus datos para continuar</div>
          </div>
        </div>

        <div className="login-body">
          {error && (
            <div className="alert alert-error" id="errorAlert">
              {error}
            </div>
          )}

          <form id="loginForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Correo Corporativo</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="usuario@copesa-ar.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Usuario</label>
              <div className="role-selector">
                <div 
                  className={`role-option ${userType === 'Administrador' ? 'selected' : ''}`}
                  onClick={() => handleUserTypeSelect('Administrador')}
                  data-role="admin"
                >
                  <span className="role-icon">👨‍💼</span>
                  Administrador
                </div>
                <div 
                  className={`role-option ${userType === 'Empleado' ? 'selected' : ''}`}
                  onClick={() => handleUserTypeSelect('Empleado')}
                  data-role="empleado"
                >
                  <span className="role-icon">👤</span>
                  Empleado
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              id="loginBtn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Verificando...
                </>
              ) : (
                <>🔐 INICIAR SESIÓN</>
              )}
            </button>

            {loading && (
              <div className="loading" id="loading">
                <div className="spinner"></div>
                <div className="loading-text">Verificando credenciales...</div>
              </div>
            )}
          </form>

          <div className="login-footer">
            <div className="footer-text important">
              🔐 Acceso restringido al personal autorizado
            </div>
            <div className="footer-text">
              ¿Problemas para acceder? Contacte al administrador del sistema
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;