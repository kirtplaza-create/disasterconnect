// src/config.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralized configuration for AI providers and API keys.
// In a production app, these should be handled via a secure backend,
// but for this local setup, we manage them here.
// ─────────────────────────────────────────────────────────────────────────────

export const AI_CONFIG = {
  // Options: 'local' (Ollama) or 'cloud' (SiliconFlow/Claude)
  provider: 'local',

  // FOR OLLAMA (Local):
  // Default URL is http://localhost:11434/api/chat
  // Make sure to set OLLAMA_ORIGINS="*" before starting Ollama!
  localEndpoint: 'http://127.0.0.1:11434/api/chat',
  localModel: 'llama3.1:latest',

  // FOR CLOUD (SiliconFlow - provided by user):
  cloudEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
  cloudKey: '2e5a129129dc407c915d28abf1571757.BjGiqp4RGWO4J3YUVLme26gA',
  cloudModel: 'deepseek-ai/DeepSeek-V2.5', // More likely to be in free tier

  // FOR CLAUDE (Anthropic - fallback if you have a key):
  claudeEndpoint: 'https://api.anthropic.com/v1/messages',
  claudeKey: '',
  claudeModel: 'claude-3-sonnet-20240229'
}
