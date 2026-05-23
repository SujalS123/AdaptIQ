import os
import sys

# Add packages/ai-engine to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../packages/ai-engine')))

from nova.agent_orchestrator import NovaAgentOrchestrator

def test_extended_chatbot_features():
    print("==========================================================")
    print("      ADAPTIQ CHATBOT EXTENDED FEATURES VALIDATION        ")
    print("==========================================================\n")
    
    orchestrator = NovaAgentOrchestrator()
    # Force mock mode by removing/disabling Groq API key temporarily to test deterministic localized fallbacks
    orchestrator.groq_client.api_key = None

    student_id = "test_student_456"

    # -------------------------------------------------------------
    # TEST 1: Out-of-Syllabus Filtering & Redirection (ARIA-005)
    # -------------------------------------------------------------
    print("--- [TEST 1] Out-of-Syllabus Filtering ---")
    query_off_topic = "Can you give me a good chocolate cake recipe?"
    print(f"User Query: '{query_off_topic}'")
    res1 = orchestrator.process_query(student_id, query_off_topic, 0.0)
    print(f"Detected Out-of-Syllabus? {res1['out_of_syllabus']}")
    print(f"Chatbot Response:\n{res1['response']}\n")
    
    assert res1['out_of_syllabus'] is True
    print("[SUCCESS] Out-of-Syllabus filter successfully caught general query!\n")

    # -------------------------------------------------------------
    # TEST 2: Frustration Monitoring & Teacher Escalation (ARIA-006)
    # -------------------------------------------------------------
    print("--- [TEST 2] Frustration Monitoring & Teacher Escalation ---")
    frustrated_messages = [
        "I am so confused and stuck on databases.",
        "It is too hard, this makes no sense to me.",
        "I don't understand any of this, explain it better please."
    ]
    
    for i, msg in enumerate(frustrated_messages, 1):
        print(f"Message {i}: '{msg}'")
        res = orchestrator.process_query(student_id, msg, 0.0)
        print(f"-> Counter state: {orchestrator.frustration_counters.get(student_id, 0)}")
        print(f"-> Escalated to Teacher? {res['teacher_escalated']}")
        print(f"-> Chatbot Response snippet: {res['response'][:110]}...\n")
        
        if i == 3:
            assert res['teacher_escalated'] is True
            assert "[Teacher Alerted]" in res['response']
            
    print("[SUCCESS] Teacher escalation correctly triggered on the 3rd frustration message!\n")

    # -------------------------------------------------------------
    # TEST 3: Language Detection & Localized Socratic Fallbacks (ARIA-003)
    # -------------------------------------------------------------
    print("--- [TEST 3] Language Detection & Localized Socratic Fallbacks ---")
    
    test_queries = [
        # Hindi (Devnagari)
        {"text": "डेटाबेस सामान्यीकरण क्या है?", "expected_lang": "hi"},
        # Hindi (Transliterated Roman)
        {"text": "mujhe normalization samjhao", "expected_lang": "hi"},
        # Marathi (Transliterated Roman)
        {"text": "database normalization kay ahe sang", "expected_lang": "mr"},
        # Telugu (Transliterated Roman)
        {"text": "database normalization enti cheppu", "expected_lang": "te"},
        # Tamil (Transliterated Roman)
        {"text": "database normalization enna eppadi sollu", "expected_lang": "ta"},
        # Bengali (Transliterated Roman)
        {"text": "database normalization ki hobe bolo", "expected_lang": "bn"},
        # English Standard
        {"text": "How does 1NF work?", "expected_lang": "en"}
    ]

    for item in test_queries:
        q = item["text"]
        expected = item["expected_lang"]
        res = orchestrator.process_query(student_id, q, 0.0)
        detected = res["language_detected"]
        print(f"Query: '{q}'")
        print(f"-> Detected Language: {detected} (Expected: {expected})")
        print(f"-> Localized Socratic Response:\n{res['response']}\n")
        
        assert detected == expected, f"Language detection mismatch: got {detected}, expected {expected}"

    print("[SUCCESS] Multi-language detection and Socratic fallback responses fully validated!\n")
    print("==========================================================")
    print("             ALL EXTENDED CHATBOT TESTS PASSED!           ")
    print("==========================================================")

if __name__ == "__main__":
    test_extended_chatbot_features()
