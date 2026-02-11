/**
 * Content Hash Utility
 *
 * SHA-256 ハッシュを計算するユーティリティ。
 * クライアント（Web Crypto API）とサーバー（Node.js crypto）の両方で動作する。
 */

/**
 * テキストの SHA-256 ハッシュを計算
 *
 * @param text - ハッシュ化するテキスト
 * @returns 16進数文字列のハッシュ値
 *
 * @example
 * const hash = await computeHash("議案の本文");
 * console.log(hash); // "a1b2c3d4..."
 */
export async function computeHash(text: string): Promise<string> {
  // 環境判定: window が存在するかでブラウザ/Node.js を判別
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // ブラウザ環境: Web Crypto API を使用
    return computeHashBrowser(text);
  } else {
    // Node.js 環境: crypto モジュールを使用
    return computeHashNode(text);
  }
}

/**
 * ブラウザ環境での SHA-256 ハッシュ計算（Web Crypto API）
 */
async function computeHashBrowser(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

/**
 * Node.js 環境での SHA-256 ハッシュ計算（crypto モジュール）
 */
async function computeHashNode(text: string): Promise<string> {
  // 動的 import で crypto モジュールを読み込む（Astro のビルド対応）
  const { createHash } = await import('node:crypto');
  const hash = createHash('sha256');
  hash.update(text, 'utf8');
  return hash.digest('hex');
}
