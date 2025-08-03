// MagicSell Theme Configuration
// Bu dosya tüm renk ve stil yönetimini merkezileştirir

export const theme = {
  // Ana renkler
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    gradient: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    gradientHover: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
    
    // Text renkleri
    textPrimary: 'white',
    textSecondary: 'rgba(255,255,255,0.8)',
    textDark: '#2c3e50',
    textMuted: '#7f8c8d',
    
    // Status renkleri
    status: {
      delivered: '#27ae60',
      pending: '#f39c12', 
      inProcess: '#3498db',
      success: '#27ae60',
      warning: '#f39c12',
      info: '#3498db'
    },
    
    // Card arka planları
    cardBackground: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    cardBackgroundHover: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
    subCardBackground: 'rgba(255,255,255,0.8)',
    subCardBackgroundHover: 'rgba(255,255,255,0.95)'
  },
  
  // Spacing
  spacing: {
    xs: 0.5,
    sm: 1,
    md: 1.5,
    lg: 2,
    xl: 3
  },
  
  // Border radius
  borderRadius: {
    sm: 1,
    md: 1.5,
    lg: 2
  },
  
  // Font sizes
  fontSize: {
    xs: '0.65rem',
    sm: '0.7rem',
    md: '0.8rem',
    lg: '1rem',
    xl: '1.2rem',
    xxl: '1.5rem'
  }
};

// Card stilleri için hazır fonksiyonlar
export const cardStyles = {
  mainCard: {
    p: 1,
    textAlign: 'center',
    background: theme.colors.cardBackground,
    color: theme.colors.textPrimary,
    borderRadius: theme.borderRadius.md,
    minHeight: 80,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
    }
  },
  
  subCard: {
    p: 1,
    background: theme.colors.subCardBackground,
    borderRadius: theme.borderRadius.sm,
    border: '1px solid rgba(255,255,255,0.4)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: theme.colors.subCardBackgroundHover,
      transform: 'scale(1.02)',
      boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
    }
  },
  
  containerCard: {
    p: theme.spacing.md,
    background: theme.colors.cardBackground,
    color: theme.colors.textPrimary,
    borderRadius: theme.borderRadius.md
  }
};

// Text stilleri için hazır fonksiyonlar
export const textStyles = {
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: 600,
    mb: 0.5,
    color: theme.colors.textPrimary
  },
  
  value: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xl
  },
  
  caption: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs
  },
  
  statusValue: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg
  },
  
  statusLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs
  }
};

// Renk kontrastı kontrol fonksiyonu
export const checkColorContrast = (backgroundColor, textColor) => {
  // Basit kontrast kontrolü
  const isDarkBackground = backgroundColor.includes('gradient') || 
                          backgroundColor.includes('#') && 
                          backgroundColor.toLowerCase().includes('dark');
  
  return isDarkBackground ? 'white' : '#2c3e50';
};

// Güvenli text rengi seçici
export const getSafeTextColor = (backgroundColor) => {
  if (backgroundColor.includes('gradient') || backgroundColor.includes('#667eea') || backgroundColor.includes('#764ba2')) {
    return 'white';
  }
  return '#2c3e50';
}; 