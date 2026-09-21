# 非公開評価基準 / 100点

- Discovery 20: identify concrete behavior and reproduction, not just style.
- Priority/reasoning 15: monetary intent and server/UI consistency before cosmetic work.
- Correctness 25: repaired flows work without regressions; avoid merely suppressing symptoms.
- Code quality 20: clear state ownership, predictable conversion, cohesive async responsibilities.
- Tests 10: user-oriented boundary/race/failure regression tests and actual type/lint runs.
- Communication 10: state assumptions, tradeoffs, remaining risks.

Do not require all six issues to be fixed in 60 minutes. Credit justified prioritization.
Public tests are only baseline happy paths.
Suggested private regression cases: decimal/mixed/negative input rejected before POST;
two rapid submits create one item; slow old search cannot replace new results;
failed cancel keeps SCHEDULED after refresh; detail follows current item; reserved total excludes terminal states.
Reference implementation uses request ownership and pessimistic cancel as one acceptable small-scope solution.
