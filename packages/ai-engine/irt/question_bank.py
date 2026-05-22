# Mock question bank for verification or local execution in the AI engine
MOCK_QUESTIONS = [
    {
        "id": "q1",
        "conceptId": "db-keys",
        "questionText": "Which of the following is a minimal superkey?",
        "options": ["Candidate Key", "Primary Key", "Foreign Key", "Alternate Key"],
        "correctOptionIndex": 0,
        "explanationText": "By definition, a candidate key is a minimal superkey.",
        "discriminationA": 1.2,
        "difficultyB": -1.0,
        "guessingC": 0.25,
    },
    {
        "id": "q2",
        "conceptId": "normalization-1nf-2nf",
        "questionText": "Which normal form is concerned with eliminating partial functional dependencies?",
        "options": ["First Normal Form", "Second Normal Form", "Third Normal Form", "Boyce-Codd Normal Form"],
        "correctOptionIndex": 1,
        "explanationText": "Second normal form eliminates partial dependencies where non-prime attributes depend on parts of a composite primary key.",
        "discriminationA": 1.4,
        "difficultyB": 0.0,
        "guessingC": 0.25,
    },
    {
        "id": "q3",
        "conceptId": "normalization-3nf-bcnf",
        "questionText": "If a relation is in BCNF, what must be true for every functional dependency X ➡️ Y?",
        "options": ["X is a superkey", "Y is a prime attribute", "X is a primary key", "Y depends on a candidate key"],
        "correctOptionIndex": 0,
        "explanationText": "For a relation to be in BCNF, for every functional dependency X ➡️ Y, X must be a superkey.",
        "discriminationA": 1.8,
        "difficultyB": 1.2,
        "guessingC": 0.25,
    },
    {
        "id": "q4",
        "conceptId": "normalization-3nf-bcnf",
        "questionText": "Which of the following decomposition strategies is guaranteed to be dependency-preserving and lossless for any 3NF schema?",
        "options": [
            "3NF Synthesis Algorithm",
            "BCNF Decomposition",
            "4NF Join Projection",
            "None of the above"
        ],
        "correctOptionIndex": 0,
        "explanationText": "The 3NF synthesis algorithm guarantees dependency preservation and lossless-join decomposition, which is not always possible for BCNF.",
        "discriminationA": 1.5,
        "difficultyB": 1.6,
        "guessingC": 0.25,
    }
]
