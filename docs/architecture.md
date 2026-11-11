# Architecture

## How a hint request works

```mermaid
sequenceDiagram
    participant S as Student's browser
    participant V as Vercel function /api/hint
    participant G as Google Gemini
    S->>S: Describe the board (gates, wrong cases, correct answer from the solver)
    S->>V: POST /api/hint (JSON)
    V->>V: Validate with Zod, rate limit, build Bit's prompt
    V->>G: generateContent (API key from environment)
    G-->>V: Short hint
    V-->>S: { hint }
    Note over S: If anything fails, Bit shows the level's written hint
```

## Layers

```mermaid
flowchart TD
    Pages["pages/ (Home, World Map, Level, Learn, Settings)"] --> Board["features/board (UI + board rules)"]
    Pages --> Hints["features/hints"]
    Pages --> Progress["features/progress + scoring + settings"]
    Board --> Engine["features/simulation (pure logic engine)"]
    Hints --> Engine
    Levels["levels/data/*.json"] --> Engine
    Hints -->|fetch| API["api/hint.ts → server/"]
    API --> Gemini["Google Gemini"]
```

## Design decisions

| Decision                                | Why                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------- |
| Logic engine has no React code          | Easy to unit test, and the same code checks levels, hints and the board |
| Levels are JSON data, validated by Zod  | New levels need no code changes; mistakes are caught by tests           |
| A solver proves every level is solvable | No impossible levels; the AI hint also knows the correct answer         |
| AI key only on the server               | Students can't see or misuse it                                         |
| Written fallback hint for every level   | The game works without internet or an API key                           |
| Progress in localStorage, no accounts   | No personal data collected from students under 18                       |
| Power only shown after "Test circuit"   | Students must think before seeing the answer                            |
