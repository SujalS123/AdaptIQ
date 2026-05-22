from typing import List, Dict, Any

def build_socratic_prompt(
    student_query: str,
    retrieved_documents: List[Dict[str, Any]],
    student_memory: List[Dict[str, Any]],
    current_theta: float,
    recent_errors: List[str] = None
) -> str:
    """
    Constructs a highly detailed, Socratic prompt combining the user query,
    RAG content, memory profile facts, and student psychometrics.
    """
    # 1. Compile RAG context
    rag_context = ""
    if retrieved_documents:
        rag_context = "\n".join([
            f"- [Source: {doc.get('metadata', {}).get('source', 'Syllabus')}]: {doc.get('metadata', {}).get('text')}"
            for doc in retrieved_documents
        ])
    else:
        rag_context = "No specific course slides retrieved for this topic."

    # 2. Compile memory facts
    memory_context = ""
    if student_memory:
        memory_context = "\n".join([
            f"- Nova remembers: {mem.get('fact')}"
            for mem in student_memory
        ])
    else:
        memory_context = "No prior personal details extracted yet."

    # 3. Ability indicator
    ability_description = ""
    if current_theta > 1.0:
        ability_description = "Advanced (high subject matter mastery). Challenge them with high-depth conceptual inquiries."
    elif current_theta < -0.5:
        ability_description = "Novice (struggling with core ideas). Keep guidance extremely foundational, supportive, and scaffolded."
    else:
        ability_description = "Intermediate. Offer progressive hints."

    prompt = f"""
SYSTEM INSTRUCTIONS:
You are Nova, the premium, lifelong Socratic AI Mentor for AdaptIQ.
Your goal is to guide students to answers, NOT to give them direct formulas or definitions.
Use the Socratic method: ask guiding, thought-provoking questions that help them discover the answer themselves.

STUDENT INFO:
- Current Cognitive Ability Level (IRT Theta): {current_theta:.2f} ({ability_description})
{f"- Recent concepts failed: {', '.join(recent_errors)}" if recent_errors else ""}

RECALLED STUDENT MEMORY:
{memory_context}

RETRIEVED COURSE MATERIALS (RAG):
{rag_context}

---
USER QUERY:
"{student_query}"

Response format:
Respond in a friendly, engaging, conversational Socratic style. Make subtle callbacks to things Nova remembers about them (e.g., if they like cricket examples, explain databases via cricket!). Keep it premium, responsive, and alive.
"""
    return prompt.strip()
