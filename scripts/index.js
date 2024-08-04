import { world } from '@minecraft/server';
import { http, HttpHeader, HttpRequest, HttpRequestMethod } from '@minecraft/server-net';

const OPENAI_API_KEY = '';

world.afterEvents.chatSend.subscribe(async ev => {
  const { message } = ev;

  const response = await sendGPT(message);
  world.sendMessage(`<ChatGPT> ${response}`);
});

/**
 * @param {string} message 
 * @returns {Promise<string>}
 */
async function sendGPT(message) {
  const request = new HttpRequest('https://api.openai.com/v1/chat/completions');
  request.setMethod(HttpRequestMethod.Post);
  request.setHeaders([
    new HttpHeader('Content-Type', 'application/json'),
    new HttpHeader('Authorization', `Bearer ${OPENAI_API_KEY}`)
  ]);

  const payload = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: message }
    ]
  });
  request.setBody(payload);

  const response = await http.request(request);
  
  if (response.status === 200) {
    const responseBody = JSON.parse(response.body);
    const reply = responseBody.choices[0].message.content;
    return reply;
  } else {
    throw new Error(`API request failed with status ${response.status}`);
  }
}
