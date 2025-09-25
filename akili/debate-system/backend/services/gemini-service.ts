/**
 * Direct Gemini API Service
 * Works around SDK issues by directly calling Gemini API
 */

export class GeminiService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not set');
    }

    const contents = [];

    // Add system instruction if provided
    if (systemPrompt) {
      contents.push({
        parts: [{ text: systemPrompt }],
        role: 'user'
      });
      contents.push({
        parts: [{ text: 'Understood. I will follow these instructions.' }],
        role: 'model'
      });
    }

    // Add user prompt
    contents.push({
      parts: [{ text: prompt }],
      role: 'user'
    });

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 150,
        topP: 0.9
      }
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.apiKey
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data: any = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error('Invalid response from Gemini');
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateContent('Say "OK" if you can hear me', 'You are a helpful assistant.');
      return response.toLowerCase().includes('ok');
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}