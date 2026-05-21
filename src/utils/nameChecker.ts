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

  // Check against prohibited words
  for (const bad of BAD_WORDS_VI) {
    if (normalized.includes(bad)) {
      return { 
        isValid: false, 
        reason: 'Tên chứa từ ngữ không phù hợp hoặc phản cảm. Vui lòng đặt tên học tập văn minh!' 
      };
    }
  }

  // Basic regex check to prevent pure special character names (allow standard Vietnamese letters & spaces)
  const letterRegex = /^[a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯưăâêôơư\s]+$/;
  if (!letterRegex.test(name)) {
    return { isValid: false, reason: 'Tên không được chứa ký tự đặc biệt lạ!' };
  }

  return { isValid: true };
}
