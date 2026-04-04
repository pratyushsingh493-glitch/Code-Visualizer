const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = 'gemini-2.0-flash'
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`

/**
 * Stream an explanation of the given Python code from Gemini.
 * Calls `onChunk(textSoFar)` as each piece arrives.
 * Returns the full text when done.
 */
export async function explainCodeStream(code, onChunk) {
  const url = `${BASE_URL}:streamGenerateContent?alt=sse&key=${API_KEY}`

  const body = {
    contents: [
      {
        parts: [
          {
            text: `You are an expert Python tutor. Explain the following Python code in a clear, beginner-friendly way.

Break your explanation into:
1. **Overview** — What the code does in one sentence.
2. **Step-by-step Walkthrough** — Go line by line (or block by block) explaining the logic.
3. **Key Concepts** — List any important Python concepts used (loops, slicing, etc.).
4. **Output** — What the code would print or produce.

Use markdown formatting. Keep it concise but thorough.

\`\`\`python
${code}
\`\`\``,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${res.status} — ${err}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Process SSE events
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim()
        if (!jsonStr || jsonStr === '[DONE]') continue

        try {
          const parsed = JSON.parse(jsonStr)
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            fullText += text
            onChunk(fullText)
          }
        } catch {
          // skip unparseable chunks
        }
      }
    }
  }

  return fullText
}

/**
 * Diagnose a code error using Gemini (non-streaming, returns full response).
 */
export async function diagnoseError(code, errorMessage) {
  const url = `${BASE_URL}:generateContent?key=${API_KEY}`

  const body = {
    contents: [
      {
        parts: [
          {
            text: `You are an expert Python debugger. A student wrote this Python code and got an error.

**Code:**
\`\`\`python
${code}
\`\`\`

**Error:**
\`\`\`
${errorMessage}
\`\`\`

Respond in this exact JSON format (no markdown wrapper, just raw JSON):
{
  "error_type": "the type of error (e.g., SyntaxError, TypeError, etc.)",
  "line": null or the line number where the error occurs,
  "problem": "A clear, beginner-friendly explanation of what went wrong",
  "suggestion": "A specific suggestion on how to fix it",
  "fixed_code": "The corrected version of the problematic line(s) only"
}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) throw new Error('Empty response from Gemini')

  // Try to parse JSON from the response
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    // Fallback: return raw text as the problem description
    return {
      error_type: 'Unknown',
      line: null,
      problem: text,
      suggestion: 'Review the error message above and check your code syntax.',
      fixed_code: null,
    }
  }
}
