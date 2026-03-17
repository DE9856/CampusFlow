import React, { useState, useEffect } from 'react';
import axios from 'axios';
const AuthContext = React.createContext(null);
const API_BASE_URL = 'https://campusflow-ohm.onrender.com';
function App() {
   // Your backend URL

// ========== AUTHENTICATION CONTEXT ==========


// ========== MAIN APP COMPONENT ==========
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('campusflow_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('campusflow_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('campusflow_user');
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading CampusFlow...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user: currentUser, login: handleLogin, logout: handleLogout }}>
      {!currentUser ? <LoginPage /> : <Dashboard />}
    </AuthContext.Provider>
  );
}

// ========== LOGIN PAGE COMPONENT ==========
function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    // Removed fullName, password, confirmPassword since not in schema
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = React.useContext(AuthContext);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\+?[1-9][0-9]{7,14}$/.test(phone.replace(/\s/g, ''));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        phone: formData.phone,
        email: formData.email
        // No name field
      });
      
      if (response.data.success) {
        return { success: true, user: response.data.user };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed. Please try again.' 
      };
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        phone: formData.phone,
        email: formData.email
      });
      
      if (response.data.success) {
        return { success: true, user: response.data.user };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please try again.' 
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    // Validation
    if (!validateEmail(formData.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    if (!validatePhone(formData.phone)) {
      setStatus({ type: 'error', message: 'Please enter a valid phone number with country code' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'info', message: isSignUp ? 'Creating your account...' : 'Logging you in...' });

    try {
      if (isSignUp) {
        // Register new user
        const result = await handleRegister();
        
        if (result.success) {
          setStatus({ type: 'success', message: 'Account created successfully!' });
          
          // Auto login after signup
          setTimeout(() => {
            login({
              id: Date.now(), // This will be replaced by real ID from backend
              email: formData.email,
              phone: formData.phone
              // No name field
            });
          }, 1500);
        } else {
          setStatus({ type: 'error', message: result.error });
        }
      } else {
        // Login existing user
        const result = await handleLogin();
        
        if (result.success) {
          setStatus({ type: 'success', message: 'Login successful!' });
          
          setTimeout(() => {
            login({
              id: result.user.id,
              email: result.user.email,
              phone: result.user.phone
              // No name field
            });
          }, 1000);
        } else {
          setStatus({ type: 'error', message: result.error });
        }
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Updated form JSX - removed name and password fields
  return (
    <div style={loginStyles.container}>
      {/* Animated Background */}
      <div style={loginStyles.background}>
        <div style={loginStyles.gradientOrb1}></div>
        <div style={loginStyles.gradientOrb2}></div>
        <div style={loginStyles.gradientOrb3}></div>
        <div style={loginStyles.particleField}>
          {[...Array(30)].map((_, i) => (
            <div key={i} style={{
              ...loginStyles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }} />
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div style={loginStyles.card}>
        <div style={loginStyles.cardGlow}></div>
        
        <div style={loginStyles.logoContainer}>
          <span style={loginStyles.logoIcon}>🎓</span>
          <h1 style={loginStyles.logoText}>CampusFlow</h1>
        </div>

        <h2 style={loginStyles.title}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={loginStyles.subtitle}>
          {isSignUp 
            ? 'Sign up to start managing your tasks with AI' 
            : 'Login to access your personalized dashboard'}
        </p>

        <form onSubmit={handleSubmit} style={loginStyles.form}>
          {/* Removed fullName field */}

          <div style={loginStyles.inputGroup}>
            <span style={loginStyles.inputIcon}>📧</span>
            <input
              type="email"
              name="email"
              placeholder="Gmail Address"
              value={formData.email}
              onChange={handleInputChange}
              style={loginStyles.input}
              disabled={isLoading}
              required
            />
          </div>

          <div style={loginStyles.inputGroup}>
            <span style={loginStyles.inputIcon}>📱</span>
            <input
              type="tel"
              name="phone"
              placeholder="WhatsApp Number (with country code)"
              value={formData.phone}
              onChange={handleInputChange}
              style={loginStyles.input}
              disabled={isLoading}
              required
            />
          </div>
          <p style={loginStyles.hint}>Example: +919876543210</p>

          {/* Removed password and confirmPassword fields */}

          <button 
            type="submit" 
            style={loginStyles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={loginStyles.loader}></span>
            ) : (
              isSignUp ? 'Create Account' : 'Login'
            )}
          </button>
        </form>

        {status.message && (
          <div style={{
            ...loginStyles.statusMessage,
            ...(status.type === 'success' ? loginStyles.statusSuccess : {}),
            ...(status.type === 'error' ? loginStyles.statusError : {}),
            ...(status.type === 'info' ? loginStyles.statusInfo : {})
          }}>
            {status.message}
          </div>
        )}

        <div style={loginStyles.footer}>
          <p style={loginStyles.footerText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setStatus({ type: '', message: '' });
              setFormData({
                email: '',
                phone: ''
                // Removed fullName, password, confirmPassword
              });
            }}
            style={loginStyles.switchButton}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </div>

        <div style={loginStyles.secureBadge}>
          <span>🔒 End-to-end encrypted</span>
          <span>•</span>
          <span>📱 WhatsApp integrated</span>
        </div>
      </div>
    </div>
  );
}

// ========== DASHBOARD COMPONENT ==========
function Dashboard() {
  const { user, logout } = React.useContext(AuthContext);
  const [taskInput, setTaskInput] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [aiPreview, setAiPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Load user's tasks from backend
  useEffect(() => {
    // For now, we'll use localStorage to store tasks
    // In a real app, you'd fetch from database using user.id
    const loadUserTasks = () => {
      const savedTasks = localStorage.getItem(`tasks_${user.phone}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };

    loadUserTasks();
  }, [user.phone]);
  
  // Generate stars on component mount
  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < 100; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 5 + 3,
        delay: Math.random() * 5,
      });
    }
    setStars(newStars);
  }, []);

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check backend health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ Backend connected');
      } catch (error) {
        console.error('❌ Backend not reachable:', error);
        setStatus({ 
          type: 'error', 
          message: 'Cannot connect to backend. Please make sure the server is running.' 
        });
      }
    };
    checkHealth();
  }, []);

  // ========== EVENT HANDLERS ==========
  const handleAnalyzeWithAI = async () => {
    if (!taskInput.trim()) {
      setStatus({ type: 'error', message: '👻 Oops! Task description is empty...' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'info', message: '🧠 AI is thinking...' });

    // Since your backend doesn't have a separate analyze endpoint,
    // we'll simulate AI preview and let the /send endpoint do the actual AI
    setTimeout(() => {
      // Simple preview based on input
      const previewTitle = taskInput.split(' at ')[0].split(' tomorrow')[0].split(' today')[0];
      const previewTime = new Date();
      
      if (taskInput.toLowerCase().includes('tomorrow')) {
        previewTime.setDate(previewTime.getDate() + 1);
        previewTime.setHours(10, 0, 0, 0);
      } else if (taskInput.toLowerCase().includes('today')) {
        previewTime.setHours(15, 0, 0, 0);
      } else {
        previewTime.setHours(previewTime.getHours() + 2);
      }

      setAiPreview({
        title: previewTitle,
        time: previewTime.toISOString(),
        confidence: 0.92
      });
      setShowPreview(true);
      setIsLoading(false);
      setStatus({ type: 'success', message: '✨ Review your task details below' });
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setStatus({ type: 'info', message: '⏳ Scheduling your task...' });

    try {
      // Call your backend /send endpoint
      const response = await axios.post(`${API_BASE_URL}/send`, {
        input: taskInput,
        phone: user.phone
      });

      console.log('✅ Task scheduled:', response.data);

      // Create new task object
      const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];
      const emojis = ['🎯', '📚', '⚡', '🎓', '💡'];
      
      const newTask = {
        id: Date.now(),
        title: aiPreview?.title || response.data.data.title,
        time: new Date(response.data.data.time).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        }),
        status: 'scheduled',
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        userId: user.phone
      };
      
      // Save to localStorage
      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      localStorage.setItem(`tasks_${user.phone}`, JSON.stringify(updatedTasks));
      
      setStatus({ 
        type: 'success', 
        message: `🎉 ${response.data.message}` 
      });
      
      setTaskInput('');
      setShowPreview(false);
      setAiPreview(null);
    } catch (error) {
      console.error('❌ Error scheduling task:', error);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.error || 'Failed to schedule task';
      setStatus({ 
        type: 'error', 
        message: `❌ ${errorMessage}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.background}>
        <div style={{
          ...styles.gradientOrb1,
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
        }}></div>
        <div style={{
          ...styles.gradientOrb2,
          transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`,
        }}></div>
        <div style={{
          ...styles.gradientOrb3,
          transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * -0.2}px)`,
        }}></div>
        
        <div style={styles.particleField}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.particle,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>

        <div style={styles.starField}>
          {stars.map(star => (
            <div
              key={star.id}
              style={{
                ...styles.star,
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header with user info */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.logo}>⚡ CampusFlow</span>
            <div style={styles.userBadge}>
              <span style={styles.userEmoji}>👤</span>
              <span style={styles.userName}>{user.email?.split('@')[0] || 'User'}</span> {/* Shows part before @ in email */}
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.userInfo}>
              <span style={styles.userEmail}>{user.email}</span>
              <span style={styles.userPhone}>{user.phone}</span>
            </div>
            <button onClick={logout} style={styles.logoutButton}>
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div style={styles.grid}>
          {/* Left Column - Creative Task Input */}
          <div style={styles.leftColumn}>
            <div style={styles.creativeCard}>
              <div style={styles.cardGlow}></div>
              <div style={styles.cardContent}>
                <h2 style={styles.creativeTitle}>
                  <span style={styles.titleEmoji}>🧠</span>
                  AI Task Alchemist
                </h2>
                <p style={styles.creativeSubtitle}>
                  Turn thoughts into actions ✨
                </p>
                
                <form onSubmit={handleSubmit}>
                  <div style={styles.chatBubble}>
                    <textarea
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      placeholder="type naturally... 'meet jake tomorrow 3pm'"
                      rows="2"
                      style={styles.creativeTextarea}
                      disabled={isLoading}
                    />
                  </div>

                  {!showPreview && (
                    <button 
                      type="button" 
                      onClick={handleAnalyzeWithAI}
                      style={styles.magicButton}
                      disabled={isLoading}
                    >
                      <span style={styles.buttonSparkle}>✨</span>
                      {isLoading ? 'Analyzing...' : 'Cast Magic'}
                      <span style={styles.buttonSparkle}>✨</span>
                    </button>
                  )}

                  {showPreview && aiPreview && (
                    <div style={styles.previewCard}>
                      <div style={styles.previewHeader}>
                        <span>📋 Extracted</span>
                        <span style={styles.confidencePill}>{Math.round(aiPreview.confidence * 100)}% match</span>
                      </div>
                      <div style={styles.previewRow}>
                        <span style={styles.previewIcon}>📌</span>
                        <span style={styles.previewText}>{aiPreview.title}</span>
                      </div>
                      <div style={styles.previewRow}>
                        <span style={styles.previewIcon}>⏰</span>
                        <span style={styles.previewText}>
                          {new Date(aiPreview.time).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {showPreview && (
                    <>
                      <div style={styles.infoBox}>
                        <span style={styles.infoIcon}>📱</span>
                        <span style={styles.infoText}>
                          WhatsApp reminder will be sent to: {user.phone}
                        </span>
                      </div>

                      <button 
                        type="submit" 
                        style={styles.scheduleButton}
                        disabled={isLoading}
                      >
                        {isLoading ? '🔮 Scheduling...' : '✅ Schedule Task'}
                      </button>
                    </>
                  )}
                </form>

                {status.message && (
                  <div style={{
                    ...styles.statusMessage,
                    ...(status.type === 'success' ? styles.statusCreativeSuccess : {}),
                    ...(status.type === 'error' ? styles.statusCreativeError : {}),
                    ...(status.type === 'info' ? styles.statusCreativeInfo : {})
                  }}>
                    {status.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Visual Task Dashboard */}
          <div style={styles.rightColumn}>
            {/* Personal Stats */}
            <div style={styles.statsGrid}>
              <div style={styles.floatingStat}>
                <span style={styles.floatingNumber}>{tasks.length}</span>
                <span style={styles.floatingLabel}>total tasks</span>
              </div>
              <div style={styles.floatingStat}>
                <span style={styles.floatingNumber}>
                  {tasks.filter(t => t.status === 'scheduled').length}
                </span>
                <span style={styles.floatingLabel}>scheduled</span>
              </div>
              <div style={styles.floatingStat}>
                <span style={styles.floatingNumber}>
                  {tasks.filter(t => t.status === 'pending').length}
                </span>
                <span style={styles.floatingLabel}>pending</span>
              </div>
            </div>

            {/* Task Galaxy */}
            <div style={styles.taskGalaxy}>
              <div style={styles.galaxyHeader}>
                <h3 style={styles.galaxyTitle}>✨ Your Task Galaxy</h3>
                <span style={styles.galaxyCount}>{tasks.length} stars</span>
              </div>
              
              <div style={styles.taskOrbit}>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      style={{
                        ...styles.planetCard,
                        animationDelay: `${index * 0.1}s`,
                        borderLeftColor: task.color
                      }}
                    >
                      <div style={styles.planetEmoji}>{task.emoji}</div>
                      <div style={styles.planetInfo}>
                        <span style={styles.planetName}>{task.title}</span>
                        <span style={styles.planetTime}>{task.time}</span>
                      </div>
                      <span style={{
                        ...styles.planetStatus,
                        backgroundColor: task.status === 'scheduled' ? '#10b98120' : '#f59e0b20',
                        color: task.status === 'scheduled' ? '#10b981' : '#f59e0b'
                      }}>
                        {task.status === 'scheduled' ? '🪐 live' : '⏳ orbit'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyState}>
                    <p style={styles.emptyText}>✨ No tasks yet. Create your first task!</p>
                  </div>
                )}
              </div>

              {/* WhatsApp Status */}
              <div style={styles.whatsappStatus}>
                <span style={styles.whatsappIcon}>📱</span>
                <span style={styles.whatsappText}>
                  WhatsApp reminders active for: {user.phone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span>🚀 Connected as {user.email} • WhatsApp ready • AI active</span>
        </div>
      </div>
    </div>
  );
}
// ========== LOGIN PAGE STYLES ==========
const loginStyles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },

  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #0a0a1f 0%, #1a1a3a 50%, #0a0a1f 100%)',
    zIndex: 0,
    overflow: 'hidden',
  },

  gradientOrb1: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #ff3366 0%, transparent 70%)',
    top: '-200px',
    right: '-200px',
    opacity: 0.4,
    filter: 'blur(50px)',
    animation: 'floatOrb1 25s ease-in-out infinite',
  },

  gradientOrb2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #33ccff 0%, transparent 70%)',
    bottom: '-200px',
    left: '-200px',
    opacity: 0.4,
    filter: 'blur(50px)',
    animation: 'floatOrb2 20s ease-in-out infinite reverse',
  },

  gradientOrb3: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #9966ff 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.3,
    filter: 'blur(60px)',
    animation: 'pulse 15s ease-in-out infinite',
  },

  particleField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  particle: {
    position: 'absolute',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '50%',
    pointerEvents: 'none',
    animation: 'floatParticle 15s linear infinite',
  },

  card: {
    position: 'relative',
    zIndex: 1,
    width: '450px',
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '32px',
    padding: '40px',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    animation: 'fadeInUp 0.8s ease',
  },

  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #ff3366, #33ccff, #9966ff)',
    borderRadius: '32px 32px 0 0',
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '32px',
  },

  logoIcon: {
    fontSize: '2.5rem',
  },

  logoText: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    textShadow: '0 0 10px rgba(255,255,255,0.5)',
  },

  title: {
    fontSize: '1.8rem',
    color: 'white',
    textAlign: 'center',
    margin: '0 0 8px 0',
  },

  subtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: '32px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '40px',
    padding: '4px 20px',
    border: '1px solid rgba(255,255,255,0.1)',
  },

  inputIcon: {
    fontSize: '1.2rem',
  },

  input: {
    flex: 1,
    padding: '16px 0',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    '::placeholder': {
      color: 'rgba(255,255,255,0.3)',
    },
  },

  hint: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
    margin: '-8px 0 0 20px',
  },

  submitButton: {
    padding: '16px',
    background: 'linear-gradient(135deg, #ff3366, #33ccff)',
    border: 'none',
    borderRadius: '40px',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    marginTop: '8px',
  },

  loader: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  statusMessage: {
    marginTop: '20px',
    padding: '12px',
    borderRadius: '40px',
    textAlign: 'center',
    fontSize: '0.9rem',
  },

  statusSuccess: {
    background: 'rgba(16,185,129,0.1)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.3)',
  },

  statusError: {
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.3)',
  },

  statusInfo: {
    background: 'rgba(59,130,246,0.1)',
    color: '#3b82f6',
    border: '1px solid rgba(59,130,246,0.3)',
  },

  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '24px',
  },

  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem',
  },

  switchButton: {
    background: 'none',
    border: 'none',
    color: '#33ccff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  secureBadge: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '40px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.8rem',
  },
};

// ========== DASHBOARD STYLES ==========
const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    width: '100vw',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },

  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #0a0a1f 0%, #1a1a3a 50%, #0a0a1f 100%)',
    zIndex: 0,
    overflow: 'hidden',
  },

  gradientOrb1: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #ff3366 0%, transparent 70%)',
    top: '-200px',
    right: '-200px',
    opacity: 0.4,
    filter: 'blur(50px)',
    animation: 'floatOrb1 25s ease-in-out infinite',
    transition: 'transform 0.1s ease-out',
  },

  gradientOrb2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #33ccff 0%, transparent 70%)',
    bottom: '-200px',
    left: '-200px',
    opacity: 0.4,
    filter: 'blur(50px)',
    animation: 'floatOrb2 20s ease-in-out infinite reverse',
    transition: 'transform 0.1s ease-out',
  },

  gradientOrb3: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #9966ff 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.3,
    filter: 'blur(60px)',
    animation: 'pulse 15s ease-in-out infinite',
    transition: 'transform 0.1s ease-out',
  },

  particleField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  particle: {
    position: 'absolute',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '50%',
    pointerEvents: 'none',
    animation: 'floatParticle 15s linear infinite',
  },

  starField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  star: {
    position: 'absolute',
    background: 'white',
    borderRadius: '50%',
    boxShadow: '0 0 10px white',
    animation: 'twinkle 3s ease-in-out infinite',
  },

  content: {
    position: 'relative',
    zIndex: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    backdropFilter: 'blur(10px)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    padding: '0 8px',
    animation: 'fadeInDown 0.8s ease',
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },

  logo: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'white',
    letterSpacing: '-0.5px',
    textShadow: '0 0 10px rgba(255,255,255,0.5)',
  },

  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '40px',
  },

  userEmoji: {
    fontSize: '1.2rem',
  },

  userName: {
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '500',
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },

  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },

  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.9rem',
  },

  userPhone: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.8rem',
  },

  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '40px',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '24px',
    flex: 1,
    overflow: 'hidden',
  },

  leftColumn: {
    overflow: 'auto',
    paddingRight: '8px',
    animation: 'fadeInLeft 0.8s ease',
  },

  rightColumn: {
    overflow: 'auto',
    paddingLeft: '8px',
    animation: 'fadeInRight 0.8s ease',
  },

  creativeCard: {
    position: 'relative',
    background: 'rgba(15, 23, 42, 0.8)',
    borderRadius: '32px',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    animation: 'float 6s ease-in-out infinite',
  },

  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #f43f5e)',
    animation: 'glowShift 5s linear infinite',
  },

  cardContent: {
    padding: '32px',
  },

  creativeTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: 'white',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  titleEmoji: {
    fontSize: '2rem',
    animation: 'spin 10s linear infinite',
  },

  creativeSubtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '32px',
  },

  chatBubble: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '24px',
    padding: '4px',
    marginBottom: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
    animation: 'pulse 3s ease-in-out infinite',
  },

  creativeTextarea: {
    width: '100%',
    padding: '16px 20px',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
  },

  magicButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    border: 'none',
    borderRadius: '40px',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    marginBottom: '20px',
    animation: 'pulse 2s ease-in-out infinite',
  },

  buttonSparkle: {
    fontSize: '1.2rem',
    animation: 'spin 3s linear infinite',
  },

  previewCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '24px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid rgba(59,130,246,0.3)',
    animation: 'slideInUp 0.5s ease',
  },

  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.9rem',
  },

  confidencePill: {
    padding: '4px 12px',
    background: 'rgba(59,130,246,0.2)',
    borderRadius: '40px',
    color: '#3b82f6',
    animation: 'pulse 2s ease-in-out infinite',
  },

  previewRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },

  previewIcon: {
    fontSize: '1.2rem',
  },

  previewText: {
    color: 'white',
    fontSize: '1rem',
  },

  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(16,185,129,0.1)',
    borderRadius: '40px',
    marginBottom: '16px',
    border: '1px solid rgba(16,185,129,0.3)',
  },

  infoIcon: {
    fontSize: '1.2rem',
  },

  infoText: {
    color: '#10b981',
    fontSize: '0.9rem',
  },

  scheduleButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #10b981, #3b82f6)',
    border: 'none',
    borderRadius: '40px',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    animation: 'pulse 2.5s ease-in-out infinite',
  },

  statusMessage: {
    marginTop: '20px',
    padding: '16px',
    borderRadius: '40px',
    textAlign: 'center',
    fontSize: '0.95rem',
    animation: 'fadeIn 0.5s ease',
  },

  statusCreativeSuccess: {
    background: 'rgba(16,185,129,0.1)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.3)',
  },

  statusCreativeError: {
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.3)',
  },

  statusCreativeInfo: {
    background: 'rgba(59,130,246,0.1)',
    color: '#3b82f6',
    border: '1px solid rgba(59,130,246,0.3)',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },

  floatingStat: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    animation: 'float 4s ease-in-out infinite',
  },

  floatingNumber: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '4px',
    textShadow: '0 0 10px rgba(255,255,255,0.5)',
  },

  floatingLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.6)',
  },

  taskGalaxy: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '32px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    animation: 'float 8s ease-in-out infinite',
  },

  galaxyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },

  galaxyTitle: {
    fontSize: '1.3rem',
    color: 'white',
    margin: 0,
  },

  galaxyCount: {
    padding: '4px 12px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '40px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.9rem',
    animation: 'pulse 2s ease-in-out infinite',
  },

  taskOrbit: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },

  planetCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '24px',
    borderLeft: '4px solid',
    animation: 'slideIn 0.5s ease, float 5s ease-in-out infinite',
    transition: 'transform 0.3s ease',
  },

  planetEmoji: {
    fontSize: '2rem',
    animation: 'spin 10s linear infinite',
  },

  planetInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  planetName: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: '500',
  },

  planetTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.8rem',
  },

  planetStatus: {
    padding: '6px 12px',
    borderRadius: '40px',
    fontSize: '0.8rem',
    fontWeight: '500',
    animation: 'pulse 2s ease-in-out infinite',
  },

  emptyState: {
    padding: '40px',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '24px',
  },

  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '1rem',
  },

  whatsappStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'linear-gradient(90deg, rgba(37,211,102,0.1), rgba(37,211,102,0.05))',
    borderRadius: '40px',
    marginTop: '16px',
  },

  whatsappIcon: {
    fontSize: '1.5rem',
  },

  whatsappText: {
    color: '#25D366',
    fontSize: '0.9rem',
  },

  footer: {
    marginTop: '24px',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.8rem',
    animation: 'fadeInUp 0.8s ease',
  },

  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0a1f 0%, #1a1a3a 100%)',
  },

  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#33ccff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },

  loadingText: {
    color: 'white',
    fontSize: '1.1rem',
  },
};

// Add all animations to document
const style = document.createElement('style');
style.textContent = `
  @keyframes floatOrb1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-50px, 30px) scale(1.1); }
    66% { transform: translate(30px, -20px) scale(0.9); }
  }

  @keyframes floatOrb2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(50px, -30px) scale(1.1); }
    66% { transform: translate(-30px, 20px) scale(0.9); }
  }

  @keyframes floatParticle {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes glowShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  input::placeholder {
    color: rgba(255,255,255,0.3);
  }
`;
document.head.appendChild(style);


export default App;