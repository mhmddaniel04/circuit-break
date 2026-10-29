# Circuit Break: User Testing Plan

**Course:** CSC536 · **Group:** CDCS2536B

## 1. Goals

1. Check that Form 5 students can play the game **without help** from us.
2. Measure whether the game helps students **learn logic gates** (Objective 1 and Objective 2).
3. Find bugs and confusing parts before the final submission.

## 2. Participants

- **3–5 Form 5 students** who are learning (or have learned) logic gates.
- Students are under 18: get **permission from the teacher (and parents if the school requires it)** before testing.
- **Do not collect personal data.** Give each student a code: S1, S2, S3, …

## 3. Setup

| Item                | Details                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Device              | Laptop or phone with Chrome or Edge, internet on (for AI hints)                              |
| Link                | Live game URL (from Phase 9), or `npm run dev` on our laptop                                 |
| Before each student | Settings → **Reset progress**, so everyone starts from Level 1                               |
| Materials           | Pre/post quiz (`quiz.md`), feedback form (`feedback-form.md`), observation sheet (section 6) |
| Time per student    | About **35 minutes**                                                                         |

## 4. Procedure

| Step              | Time   | What happens                                                                                                                                             |
| ----------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Welcome        | 2 min  | Explain: "We are testing the game, not you. There are no wrong answers."                                                                                 |
| 2. Pre-test quiz  | 5 min  | Student answers the quiz **before** playing.                                                                                                             |
| 3. Free play      | 20 min | Student plays from World 1. **Do not help** unless they are stuck for more than 2 minutes. One group member observes and fills in the observation sheet. |
| 4. Post-test quiz | 5 min  | The same quiz again, **after** playing.                                                                                                                  |
| 5. Feedback form  | 3 min  | Student fills in the feedback form.                                                                                                                      |

**Think-aloud:** ask the student to say what they are thinking while playing ("I think this needs AND because…"). This shows where they get confused.

## 5. What we measure

| Measure          | How                              | Target                                     |
| ---------------- | -------------------------------- | ------------------------------------------ |
| Learning gain    | Post-test score − pre-test score | Average gain > 0                           |
| Levels completed | World Map stars after 20 minutes | ≥ 8 levels                                 |
| Hint use         | Observation sheet                | Hints used on hard levels, not every level |
| Ease of use      | Feedback form, questions 1–3     | Average ≥ 4 out of 5                       |
| Bugs             | Bug log                          | All serious bugs fixed before submission   |

## 6. Observation sheet (one per student)

**Student code:** \_\_\_\_ · **Device:** laptop / phone · **Language used:** EN / BM

| Level                   | Time taken | Wrong tests | Hint used? | Stuck? (where) | Notes / quotes |
| ----------------------- | ---------- | ----------- | ---------- | -------------- | -------------- |
| W1-L1 Flip the Switch   |            |             |            |                |                |
| W1-L2 Wake Up           |            |             |            |                |                |
| W1-L3 Double Flip       |            |             |            |                |                |
| W1-L4 Chain of Three    |            |             |            |                |                |
| W1-L5 Every Combination |            |             |            |                |                |
| W2-L1 Double Lock       |            |             |            |                |                |
| W2-L2 Not Yet           |            |             |            |                |                |
| W2-L3 Triple Check      |            |             |            |                |                |
| W2-L4 Safety Lock       |            |             |            |                |                |
| W2-L5 Two Doors         |            |             |            |                |                |

**Things to watch for:**

- [ ] Understands the tutorial without help
- [ ] Knows how to place a gate (tap gate → tap slot)
- [ ] Understands "needs 0 / needs 1" on the bulb
- [ ] Understands the ✓ / ✗ badges and the results table
- [ ] Reads the AI hint and uses it
- [ ] Opens the Learn page by themselves

## 7. Bug log

| #   | Found by (student / tester) | Page / level | What happened | Steps to repeat | Serious? (Y/N) | Fixed? |
| --- | --------------------------- | ------------ | ------------- | --------------- | -------------- | ------ |
| 1   |                             |              |               |                 |                |        |
| 2   |                             |              |               |                 |                |        |
| 3   |                             |              |               |                 |                |        |

## 8. Results summary (fill in after testing)

| Student     | Pre-test (/8) | Post-test (/8) | Gain | Levels done | Hints used | Ease of use (avg /5) |
| ----------- | ------------- | -------------- | ---- | ----------- | ---------- | -------------------- |
| S1          |               |                |      |             |            |                      |
| S2          |               |                |      |             |            |                      |
| S3          |               |                |      |             |            |                      |
| S4          |               |                |      |             |            |                      |
| S5          |               |                |      |             |            |                      |
| **Average** |               |                |      |             |            |                      |

**Main findings:** (3–5 bullet points)

**Changes we made because of testing:** (list them; good for the report)
