import axios from 'axios';
import { env } from './config/env';

async function testAi() {
  console.log(`[TEST] Testing AI Engine endpoint at: ${env.AI_ENGINE_URL}/nova/chat`);
  try {
    const res = await axios.post(`${env.AI_ENGINE_URL}/nova/chat`, {
      student_id: 'student_123',
      text: 'explain 3nf please',
      current_theta: 0.0,
      recent_errors: []
    }, { timeout: 10000 });
    
    console.log('[SUCCESS] AI Engine responded with:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('[ERROR] Failed to reach AI Engine:', err.message);
    if (err.response) {
      console.error('[ERROR] Status:', err.response.status);
      console.error('[ERROR] Data:', err.response.data);
    }
  }
}

testAi();
