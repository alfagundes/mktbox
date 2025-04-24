// src/utils/firebaseErrors.ts
export function getFirebaseMsg(code: string) {
    const map: Record<string, string> = {
      'auth/invalid-email'        : 'E‑mail inválido.',
      'auth/user-not-found'       : 'Usuário não encontrado.',
      'auth/wrong-password'       : 'Senha incorreta.',
      'auth/too-many-requests'    : 'Muitas tentativas. Tente mais tarde.'
    };
    return map[code] ?? 'Erro inesperado, tente novamente.';
  }