import os
import sys

# Add packages/ai-engine to python path to allow direct imports of local modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../packages/ai-engine')))

from nova.agent_orchestrator import NovaAgentOrchestrator

def test_nova_agent():
    print("[INFO] Initializing NovaAgentOrchestrator...")
    orchestrator = NovaAgentOrchestrator()
    
    # 1. Test standard query when Groq is not configured
    print("\n[TEST 1] Querying Nova without Groq API configured...")
    res = orchestrator.process_query(
        student_id="student_123",
        text="Explain normalization to me, I love cricket analogies.",
        current_theta=0.5,
        recent_errors=[]
    )
    print(f"Response:\n{res['response']}")
    print(f"Memory cards extracted:\n{res['new_memories_extracted']}")
    
    # 2. Test with dummy Groq API key configuration
    print("\n[TEST 2] Configuring fake Groq API key to test URL routing...")
    os.environ["GROQ_API_KEY"] = "gsk_dummy_key_for_testing_purposes_only"
    
    # Re-initialize or update key in orchestrator client
    orchestrator.groq_client.api_key = os.environ["GROQ_API_KEY"]
    
    print(f"Is Groq configured? {orchestrator.groq_client.is_configured()}")
    
    res_fake = orchestrator.process_query(
        student_id="student_123",
        text="Explain normal forms please.",
        current_theta=0.5,
        recent_errors=[]
    )
    # Since the key is fake, the actual API request will fail or return a warning, 
    # and it should gracefully fall back to the mock templates.
    print(f"Fallback Response:\n{res_fake['response']}")

if __name__ == "__main__":
    test_nova_agent()
