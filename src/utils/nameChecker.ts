const BAD_WORDS_VI = [
  'địt', 'đéo', 'cặc', 'lồn', 'cl', 'ngu', 'chửi', 'dm', 'đm', 'dkm', 'đkm', 'vcl', 
  'óc chó', 'buồi', 'đầu khấc', 'phản động', 'chó đẻ', 'đực', 'cút', 'mẹ mày', 
  'đĩ', 'phò', 'cave', 'đồ ngu', 'cho dien', 'hãm', 'ham lon', 'hãm lờ'
];

export function checkUsername(name: string): { isValid: boolean; reason?: string } {
  const normalized = name.trim().toLowerCase();
  
  if (normalized.length < 2) {
    return { isValid: false, reason: 'Tên quá ngắn! Vui lòng nhập từ 2 ký tự trở lên.' };
  }
  
  if (normalized.length > 25) {
    return { isValid: false, reason: 'Tên quá dài! Giới hạn tối đa là 25 ký tự.' };
  }

  // Basic regex check to prevent pure special character names (allow standard Vietnamese letters & spaces)
  const letterRegex = /^[a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯưăâêôơư\s]+$/;
  if (!letterRegex.test(name)) {
    return { isValid: false, reason: 'Tên không được chứa ký tự đặc biệt lạ!' };
  }

  // Split name into clean words
  const words = normalized.split(/\s+/).filter(Boolean);

  // Check against prohibited words with full boundary checks
  for (const bad of BAD_WORDS_VI) {
    const badWords = bad.toLowerCase().split(/\s+/).filter(Boolean);
    if (badWords.length === 0) continue;

    if (badWords.length === 1) {
      // Single word bad word: must match one of the words in the name exactly
      if (words.includes(badWords[0])) {
        return { 
          isValid: false, 
          reason: 'Tên chứa từ ngữ không phù hợp hoặc phản cảm. Vui lòng đặt tên học tập văn minh!' 
        };
      }
    } else {
      // Multi-word bad word phrase: must find this sequence of words in the name words list
      let hasPhrase = false;
      for (let i = 0; i <= words.length - badWords.length; i++) {
        let match = true;
        for (let j = 0; j < badWords.length; j++) {
          if (words[i + j] !== badWords[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          hasPhrase = true;
          break;
        }
      }
      if (hasPhrase) {
        return { 
          isValid: false, 
          reason: 'Tên chứa từ ngữ không phù hợp hoặc phản cảm. Vui lòng đặt tên học tập văn minh!' 
        };
      }
    }
  }

  return { isValid: true };
}
