/* ===== utils.js — helpers compartilhados ===== */

/**
 * Escapa caracteres especiais de HTML para uso seguro em innerHTML.
 * Previne XSS (bug nº7): qualquer dado vindo do usuário (palavras, kanji,
 * categorias, mensagens de toast) deve passar por aqui antes de virar HTML.
 * @param {*} value valor a ser convertido em string segura
 * @returns {string} texto seguro para inserção em HTML
 */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapa valor para uso DENTRO de uma string JS de aspas simples que está
 * em um atributo HTML (ex.: onclick="speak('VALOR')").
 * 1) escapa `\`, `'`, CR/LF para o contexto JS;
 * 2) depois aplica esc() para o contexto do atributo HTML.
 * @param {*} value valor a ser convertido em string segura
 * @returns {string} texto seguro para string JS dentro de atributo
 */
export function escJS(value) {
  if (value === null || value === undefined) return '';
  const jsSafe = String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
  return esc(jsSafe);
}
