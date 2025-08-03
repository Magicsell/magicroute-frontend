// Color Validation Utilities
// Bu dosya renk kontrastı ve görünürlük kontrolü için kullanılır

/**
 * Renk kontrastı hesaplama
 * @param {string} backgroundColor - Arka plan rengi
 * @param {string} textColor - Text rengi
 * @returns {number} - Kontrast oranı (4.5+ iyi, 3+ kabul edilebilir)
 */
export const calculateContrastRatio = (backgroundColor, textColor) => {
  // Basit kontrast hesaplama (gerçek uygulamada daha karmaşık olabilir)
  const isDarkBackground = backgroundColor.includes('gradient') || 
                          backgroundColor.includes('#667eea') || 
                          backgroundColor.includes('#764ba2') ||
                          backgroundColor.includes('dark');
  
  const isLightText = textColor === 'white' || textColor.includes('255,255,255');
  
  if (isDarkBackground && isLightText) {
    return 7.0; // Yüksek kontrast
  } else if (!isDarkBackground && !isLightText) {
    return 6.0; // Yüksek kontrast
  } else {
    return 2.0; // Düşük kontrast
  }
};

/**
 * Güvenli text rengi önerisi
 * @param {string} backgroundColor - Arka plan rengi
 * @returns {string} - Önerilen text rengi
 */
export const suggestTextColor = (backgroundColor) => {
  if (backgroundColor.includes('gradient') || 
      backgroundColor.includes('#667eea') || 
      backgroundColor.includes('#764ba2')) {
    return 'white';
  }
  return '#2c3e50';
};

/**
 * Card görünürlük kontrolü
 * @param {object} cardStyle - Card stil objesi
 * @returns {object} - Kontrol sonuçları
 */
export const validateCardVisibility = (cardStyle) => {
  const { background, color } = cardStyle;
  const contrastRatio = calculateContrastRatio(background, color);
  
  return {
    isValid: contrastRatio >= 4.5,
    contrastRatio,
    suggestedTextColor: suggestTextColor(background),
    issues: contrastRatio < 4.5 ? ['Düşük kontrast oranı'] : []
  };
};

/**
 * Tüm card'ların görünürlüğünü kontrol et
 * @param {array} cards - Card array'i
 * @returns {object} - Kontrol raporu
 */
export const validateAllCards = (cards) => {
  const results = cards.map((card, index) => ({
    cardIndex: index,
    ...validateCardVisibility(card.style)
  }));
  
  const issues = results.filter(result => !result.isValid);
  
  return {
    totalCards: cards.length,
    validCards: results.filter(r => r.isValid).length,
    issues,
    hasIssues: issues.length > 0
  };
};

/**
 * Renk değişikliği sonrası otomatik kontrol
 * @param {string} oldColor - Eski renk
 * @param {string} newColor - Yeni renk
 * @param {string} textColor - Text rengi
 * @returns {object} - Kontrol sonucu
 */
export const validateColorChange = (oldColor, newColor, textColor) => {
  const oldContrast = calculateContrastRatio(oldColor, textColor);
  const newContrast = calculateContrastRatio(newColor, textColor);
  
  return {
    oldContrast,
    newContrast,
    isImproved: newContrast > oldContrast,
    isAcceptable: newContrast >= 4.5,
    suggestedTextColor: suggestTextColor(newColor)
  };
};

// Console'a uyarı yazdırma fonksiyonu
export const logColorWarning = (message, data) => {
  console.warn(`🎨 Color Warning: ${message}`, data);
};

// Başarı mesajı yazdırma fonksiyonu
export const logColorSuccess = (message, data) => {
  console.log(`✅ Color Success: ${message}`, data);
}; 