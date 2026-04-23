import { test } from '@playwright/test';

// Exploration des logprobs sur des complétions Playwright ambigues.
// Requiert OPENAI_API_KEY. Lancer avec :
//   OPENAI_API_KEY=sk-... npx playwright test tests/IA-engine --project=chromium --reporter=list
// Modèle surchargeable via OPENAI_MODEL (défaut: gpt-4o-mini).

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

type TopLogprob = { token: string; logprob: number };
type ContentLogprob = { token: string; logprob: number; top_logprobs: TopLogprob[] };

async function completeWithLogprobs(prompt: string, maxTokens = 30) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Tu complètes du code Playwright TypeScript. Continue le snippet verbatim, sans commentaire ni markdown.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0,
      logprobs: true,
      top_logprobs: 5,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const content: string = data.choices[0].message.content ?? '';
  const tokens: ContentLogprob[] = data.choices[0].logprobs?.content ?? [];
  return { content, tokens };
}

// Entropie (bits) calculée sur le top-k renvoyé : borne inférieure de l'entropie réelle,
// mais suffisante pour repérer les positions où le modèle "hésite".
function entropyBits(top: TopLogprob[]): number {
  let h = 0;
  for (const t of top) {
    const p = Math.exp(t.logprob);
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

function show(token: string): string {
  return JSON.stringify(token);
}

function printTable(tokens: ContentLogprob[]) {
  console.log('');
  console.log('  # | token choisi        |   p   | H(bits) | top-5 (token @ p)');
  console.log('----+---------------------+-------+---------+------------------------------------------');
  tokens.forEach((t, i) => {
    const p = Math.exp(t.logprob).toFixed(3);
    const h = entropyBits(t.top_logprobs).toFixed(2);
    const alts = t.top_logprobs
      .map((a) => `${show(a.token)}@${Math.exp(a.logprob).toFixed(2)}`)
      .join('  ');
    console.log(`${String(i).padStart(3)} | ${show(t.token).padEnd(19)} | ${p} |  ${h}   | ${alts}`);
  });
}

const prompts: { name: string; prompt: string }[] = [
  {
    // Très ambigu: getByRole ? locator ? getByText ? click ? fill ? -> entropie élevée.
    name: 'ambigu : choix d\'API après "await page."',
    prompt: [
      "import { test, expect } from '@playwright/test';",
      '',
      "test('recherche', async ({ page }) => {",
      "  await page.goto('https://example.com');",
      '  await page.',
    ].join('\n'),
  },
  {
    // Syntaxe contrainte: il reste à fermer la string puis la parenthèse -> entropie quasi nulle.
    name: 'syntaxe forcée : fin de chaîne + parenthèse',
    prompt: [
      "import { test, expect } from '@playwright/test';",
      '',
      "test('goto', async ({ page }) => {",
      "  await page.goto('https://example.com",
    ].join('\n'),
  },
  {
    // Mix: après expect(locator). le modèle hésite entre toBeVisible / toHaveText / toHaveCount...
    name: 'assertion : que choisir après "expect(locator)."',
    prompt: [
      "import { test, expect } from '@playwright/test';",
      '',
      "test('titre visible', async ({ page }) => {",
      "  await page.goto('https://playwright.dev');",
      "  const heading = page.getByRole('heading');",
      '  await expect(heading).',
    ].join('\n'),
  },
];

test.describe('logprobs : où le modèle hésite, où la syntaxe le force', () => {
  test.skip(!process.env.OPENAI_API_KEY, 'OPENAI_API_KEY non défini');

  for (const { name, prompt } of prompts) {
    test(name, async () => {
      console.log('\n============================================================');
      console.log(`PROMPT : ${name}`);
      console.log('------------------------------------------------------------');
      console.log(prompt);
      console.log('------------------------------------------------------------');

      const { content, tokens } = await completeWithLogprobs(prompt, 30);

      console.log('COMPLETION :');
      console.log(content);
      printTable(tokens);

      if (tokens.length === 0) throw new Error('Aucun logprob renvoyé par l\'API');

      const hs = tokens.map((t) => entropyBits(t.top_logprobs));
      const avg = hs.reduce((a, b) => a + b, 0) / hs.length;
      const max = Math.max(...hs);
      const idxMax = hs.indexOf(max);
      console.log('');
      console.log(`H moyenne = ${avg.toFixed(2)} bits  |  max = ${max.toFixed(2)} bits à la position ${idxMax} (token ${show(tokens[idxMax].token)})`);
    });
  }
});
