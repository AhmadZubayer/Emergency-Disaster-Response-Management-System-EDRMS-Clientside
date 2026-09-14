import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';


function getSystemPrompt(): string {
  try {
    const chatbotDir = path.join(process.cwd(), 'chatbot');
    const config = fs.existsSync(path.join(chatbotDir, 'config.md'))
      ? fs.readFileSync(path.join(chatbotDir, 'config.md'), 'utf-8')
      : '';
    const knowledge = fs.existsSync(path.join(chatbotDir, 'knowledge.md'))
      ? fs.readFileSync(path.join(chatbotDir, 'knowledge.md'), 'utf-8')
      : '';
    const endpoints = fs.existsSync(path.join(chatbotDir, 'endpoints.md'))
      ? fs.readFileSync(path.join(chatbotDir, 'endpoints.md'), 'utf-8')
      : '';

    return `
You are the official EDRMS AI Assistant.
Always follow the guardrails, knowledge base, and endpoints provided below.
Always reply in the user's language (English, Bangla, or Banglish).
Always use Markdown links in the format [Page Name](/route) when referring to pages.
Do NOT use any emojis in your responses.

=== SYSTEM CONFIG & GUARDRAILS ===
${config}

=== DOMAIN KNOWLEDGE ===
${knowledge}

=== PUBLIC ENDPOINTS & ROUTES ===
${endpoints}
`.trim();
  } catch (err) {
    console.error('Error reading chatbot knowledge files:', err);
    return 'You are the helpful AI assistant for EDRMS (Emergency & Disaster Response Management System). Assist users with disaster information, rescue requests, donations (/donations), and missing persons.';
  }
}

// Helper to fetch live database records dynamically from the backend APIs
async function fetchLiveDataForMessage(message: string): Promise<string> {
  const lower = message.toLowerCase();
  const backendBase = process.env.BACKEND_URL || 'http://localhost:5000';
  const liveSections: string[] = [];

  const shouldFetchMissing =
    lower.includes('missing') ||
    lower.includes('harie') ||
    lower.includes('lost') ||
    lower.includes('person') ||
    lower.includes('খুঁজে') ||
    lower.includes('হারিয়ে') ||
    lower.includes('নিখোঁজ') ||
    lower.includes('list all') ||
    lower.includes('list');

  const shouldFetchRescue =
    lower.includes('rescue') ||
    lower.includes('sos') ||
    lower.includes('trapped') ||
    lower.includes('stranded') ||
    lower.includes('উদ্ধার') ||
    lower.includes('সাহায্য') ||
    lower.includes('list all') ||
    lower.includes('list');

  const shouldFetchDisaster =
    lower.includes('disaster') ||
    lower.includes('flood') ||
    lower.includes('cyclone') ||
    lower.includes('alert') ||
    lower.includes('দুর্যোগ') ||
    lower.includes('বন্যা') ||
    lower.includes('ঘূর্ণিঝড়') ||
    lower.includes('list all') ||
    lower.includes('list');

  const shouldFetchDonations =
    lower.includes('donation') ||
    lower.includes('campaign') ||
    lower.includes('fund') ||
    lower.includes('aid') ||
    lower.includes('দান') ||
    lower.includes('ডোনেশন') ||
    lower.includes('list all') ||
    lower.includes('list');

  const promises: Promise<void>[] = [];

  if (shouldFetchMissing) {
    promises.push(
      fetch(`${backendBase}/api/missing-persons`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          if (list.length > 0) {
            liveSections.push(
              `### LIVE MISSING PERSON REPORTS IN DATABASE:\n${JSON.stringify(
                list.slice(0, 10).map((m: Record<string, unknown>) => ({
                  id: m.id,
                  name: m.full_name,
                  age: m.age,
                  gender: m.gender,
                  last_seen_location: m.last_seen_location,
                  status: m.status,
                  contact_phone: m.contact_phone,
                  description: m.description,
                  detail_link: `/missing-persons/${m.id}`,
                })),
                null,
                2
              )}`
            );
          }
        })
        .catch(() => {})
    );
  }

  if (shouldFetchRescue) {
    promises.push(
      fetch(`${backendBase}/api/rescue-requests`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          if (list.length > 0) {
            liveSections.push(
              `### LIVE RESCUE REQUESTS IN DATABASE:\n${JSON.stringify(
                list.slice(0, 10).map((r: Record<string, unknown>) => ({
                  id: r.id,
                  address: r.address,
                  people_count: r.people_count,
                  urgency_level: r.urgency_level,
                  status: r.status,
                  detail_link: `/rescue-requests/${r.id}`,
                })),
                null,
                2
              )}`
            );
          }
        })
        .catch(() => {})
    );
  }

  if (shouldFetchDisaster) {
    promises.push(
      fetch(`${backendBase}/api/disaster`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          if (list.length > 0) {
            liveSections.push(
              `### LIVE ACTIVE DISASTERS IN DATABASE:\n${JSON.stringify(
                list.slice(0, 10).map((d: Record<string, unknown>) => ({
                  id: d.id,
                  disaster_name: d.disaster_name,
                  impacted_location: d.impacted_location,
                  type: d.type,
                  detail_link: `/disaster/${d.id}`,
                })),
                null,
                2
              )}`
            );
          }
        })
        .catch(() => {})
    );
  }

  if (shouldFetchDonations) {
    promises.push(
      fetch(`${backendBase}/api/donations/campaigns`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          if (list.length > 0) {
            liveSections.push(
              `### LIVE DONATION CAMPAIGNS IN DATABASE:\n${JSON.stringify(
                list.slice(0, 10).map((c: Record<string, unknown>) => ({
                  id: c.id,
                  title: c.title,
                  target_amount: c.target_amount,
                  raised_amount: c.raised_amount,
                  status: c.status,
                  detail_link: `/donations/${c.id}`,
                })),
                null,
                2
              )}`
            );
          }
        })
        .catch(() => {})
    );
  }

  await Promise.allSettled(promises);

  if (liveSections.length === 0) {
    return '';
  }

  return `
=== REAL-TIME LIVE DATABASE DATA FROM EDRMS API ===
${liveSections.join('\n\n')}

INSTRUCTIONS FOR PRESENTING LIVE DATA:
1. When the user asks to list, view, or check items (missing requests/persons, rescue requests, disasters, or donation campaigns), list the actual live items from the real-time data above.
2. Present them in clean, organized bullet points with key attributes (e.g., Name, Location, Status, Age, Urgency, Target/Raised funds).
3. Include a direct clickable markdown link for each individual item using its detail_link, e.g. [View Details: mr penguin](/missing-persons/0d6fa891...) or [View Campaign: Sylhet Flood](/donations/11111111...).
4. Also provide the main section directory link (e.g. [Missing Persons Directory](/missing-persons), [Rescue Requests Feed](/rescue-requests), [Disasters Feed](/disaster), or [Donations Campaigns](/donations)).
5. Do NOT include any emoji icons.
`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string.' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in .env.local.' },
        { status: 500 }
      );
    }

    const baseSystemInstruction = getSystemPrompt();
    const liveDataContext = await fetchLiveDataForMessage(message);
    const systemInstruction = `${baseSystemInstruction}\n\n${liveDataContext}`.trim();

   
    const rawItems: { role: 'user' | 'model'; text: string }[] = [];

    if (Array.isArray(history)) {
      for (const h of history) {
        if (h && typeof h.content === 'string' && h.content.trim()) {
          rawItems.push({
            role: h.role === 'user' ? 'user' : 'model',
            text: h.content.trim(),
          });
        }
      }
    }

    rawItems.push({
      role: 'user',
      text: message.trim(),
    });

    const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const item of rawItems) {
      const last = contents[contents.length - 1];
      if (last && last.role === item.role) {
        last.parts[0].text += `\n${item.text}`;
      } else {
        contents.push({
          role: item.role,
          parts: [{ text: item.text }],
        });
      }
    }

    // Ensure the conversation starts with user turn
    while (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    };

    // Production aliases with automatic multi-model failover for high demand / 503 spikes
    const models = [
      'gemini-flash-latest',
      'gemini-flash-lite-latest',
      'gemini-3.7-flash',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash-lite',
    ];
    let lastErrorMessage = '';
    let replyText = '';

    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn(`Gemini API error with model ${model}:`, errData);
          lastErrorMessage =
            errData?.error?.message ||
            `HTTP ${res.status}: ${res.statusText || 'Gemini service error'}`;
          continue;
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts;
        const textPart = Array.isArray(parts)
          ? parts.find((p: { text?: string }) => typeof p?.text === 'string')?.text
          : '';

        if (textPart) {
          replyText = textPart;
          break;
        }
      } catch (e) {
        lastErrorMessage = e instanceof Error ? e.message : 'Network error connecting to Gemini.';
      }
    }

    if (!replyText) {
      return NextResponse.json(
        {
          error: lastErrorMessage || 'Unable to connect to Gemini API. Please try again.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: unknown) {
    console.error('Chatbot API Route Error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error.';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

