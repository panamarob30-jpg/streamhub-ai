import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log('Testing Anthropic API connection...\n');

// Test with different models
const modelsToTest = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
  'claude-2.1',
  'claude-2.0'
];

for (const model of modelsToTest) {
  try {
    console.log(`Testing model: ${model}...`);
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: 'Hi'
      }]
    });
    console.log(`✅ ${model} - WORKS!`);
    console.log(`   Response: ${message.content[0].text}\n`);
    break; // Found a working model, stop testing
  } catch (error) {
    console.log(`❌ ${model} - ${error.status} ${error.error?.error?.type || error.message}\n`);
  }
}
