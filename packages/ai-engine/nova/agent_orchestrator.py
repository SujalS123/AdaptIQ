from typing import Dict, Any, List
from rag.query_engine import RagQueryEngine
from rag.prompt_builder import build_socratic_prompt
from .memory_manager import MemoryManager
from .groq_client import GroqClient

class NovaAgentOrchestrator:
    """
    Unified AI orchestrator running the conversation processing loop.
    Coalesces RAG context, active psychometrics, and cognitive memory cards
    to formulate perfect Socratic explanations.
    """
    def __init__(self):
        self.rag_engine = RagQueryEngine()
        self.memory_manager = MemoryManager()
        self.groq_client = GroqClient()
        self.frustration_counters: Dict[str, int] = {}
        
        # Extended list of curriculum and academic topic keywords
        self.curriculum_keywords = [
            "database", "dbms", "normal", "1nf", "2nf", "3nf", "bcnf", "4nf", "5nf",
            "query", "sql", "table", "relation", "index", "b+ tree", "b-tree", "key",
            "primary key", "foreign key", "dependency", "functional", "acid", "transaction",
            "concurrency", "lock", "deadlock", "isolation", "schema", "er diagram",
            "relational algebra", "join", "projection", "selection", "gate", "exam",
            "syllabus", "course", "class", "study", "theta", "mle", "irt", "bayesian",
            "mastery", "concept", "prerequisite", "test", "quiz", "academic", "learning",
            "explain", "what is", "how does", "example", "socratic", "practice", "cricket"
        ]

    def _is_out_of_curriculum(self, text: str) -> bool:
        """Helper to detect if query is completely outside the academic curriculum domain."""
        text_lower = text.lower()
        
        # If the student is expressing frustration or struggle, do not filter it out
        if self._is_frustrated(text):
            return False
            
        # If text is extremely short, let it pass as it might be a simple reply
        if len(text_lower.split()) <= 2:
            return False
            
        # Check if any curriculum keyword is in the text
        for kw in self.curriculum_keywords:
            if kw in text_lower:
                return False
                
        # Additional heuristic: check for general chat queries that have nothing to do with study
        general_triggers = [
            "recipe", "chocolate cake", "cook", "movie", "song", "joke about politics",
            "weather", "buy tickets", "stock market", "price of microsoft", "bypass security",
            "hack database", "general trivia", "who is the best singer"
        ]
        for trigger in general_triggers:
            if trigger in text_lower:
                return True
                
        return True

    def _detect_language(self, text: str, selected_language: str = None) -> str:
        """
        Detects user query language with fallback to selected language or English.
        Supports Hindi, Marathi, Bengali, Tamil, Telugu, and English.
        """
        if selected_language and selected_language.lower() in ["en", "hi", "mr", "ta", "te", "bn"]:
            return selected_language.lower()

        text_lower = text.lower()
        
        # 1. Unicode Range Detection (Script-based)
        for char in text:
            val = ord(char)
            # Bengali Script
            if 0x0980 <= val <= 0x09FF:
                return "bn"
            # Devanagari (Hindi / Marathi)
            if 0x0900 <= val <= 0x097F:
                # Basic Marathi character/word check in Devanagari
                if any(m_word in text for m_word in ["आहे", "काय", "कसा", "का", "करून", "तुम्ही"]):
                    return "mr"
                return "hi"
            # Tamil Script
            if 0x0B80 <= val <= 0x0BFF:
                return "ta"
            # Telugu Script
            if 0x0C00 <= val <= 0x0C7F:
                return "te"

        # 2. Transliterated / Romanized Keyword Detection
        # Hindi transliterated
        hi_roman = ["kya", "kaise", "kyu", "batao", "samjhao", "sahi", "galat", "sharma", "dijiye", "karo"]
        # Marathi transliterated
        mr_roman = ["kay", "kasa", "ahe", "sang", "samjun", "changle", "mhanje", "karun"]
        # Bengali transliterated
        bn_roman = ["ki", "kemon", "ache", "bolo", "bhalo", "hobe", "amake", "korben"]
        # Tamil transliterated
        ta_roman = ["enna", "eppadi", "irukku", "sollu", "nalla", "illai", "pannunga"]
        # Telugu transliterated
        te_roman = ["enti", "ela", "undhi", "cheppu", "bagundi", "ledu", "cheyandi"]

        for word in text_lower.split():
            # Clean punctuation
            clean_word = "".join(c for c in word if c.isalnum())
            if clean_word in hi_roman:
                return "hi"
            if clean_word in mr_roman:
                return "mr"
            if clean_word in bn_roman:
                return "bn"
            if clean_word in ta_roman:
                return "ta"
            if clean_word in te_roman:
                return "te"

        return "en"

    def _is_frustrated(self, text: str) -> bool:
        """Helper to check if the student is showing sign of severe frustration or struggle."""
        text_lower = text.lower()
        frustration_words = [
            "confused", "stuck", "don't understand", "not understanding", "don't get it",
            "impossible", "too hard", "frustrated", "hate this", "horrible", "awful",
            "so difficult", "so hard", "explain it better", "this makes no sense",
            "परेशान", "कठिन", "समझ नहीं", "असंभव", "खराब", "कठीण", "समजत नाही", "त्रास",
            "বুঝতে পারছি না", "কঠিন", "প্রবলেম", "புரியவில்லை", "கடினம்", "புரியல",
            "అర్థం కావట్లేదు", "కష్టంగా ఉంది", "తెలియదు"
        ]
        return any(word in text_lower for word in frustration_words)

    def process_query(
        self,
        student_id: str,
        text: str,
        current_theta: float,
        recent_errors: List[str] = None,
        selected_language: str = None,
        course_id: str = None,
        chapter_id: str = None
    ) -> Dict[str, Any]:
        """
        Orchestrates full Socratic loop:
        1. Language Detection & Constraints Formulation
        2. RAG Context Retrieval
        3. Cognitive Memory Retrieval
        4. Fact Extraction & Memory Update
        5. Unified Prompt Synthesis
        6. Socratic Response Generation (Live LLM or Localized Fallbacks)
        """
        out_of_syllabus = False
        teacher_escalated = False

        # --- ARIA-003: Language detection ---
        lang = self._detect_language(text, selected_language)

        # Composite Memory Key
        memory_key = f"{student_id}_{course_id}_{chapter_id}" if course_id and chapter_id else student_id

        # --- ARIA-005: Out-of-curriculum query detection and redirection ---
        if self._is_out_of_curriculum(text) and lang == "en":
            out_of_syllabus = True
            
            out_of_curriculum_msg = {
                "en": "I noticed your query is about general topics outside our database and computer science curriculum. To keep your study session efficient and aligned with your learning path, let's focus on syllabus topics like normalization, indexes, or socratic question drills! What syllabus topic should we explore next?",
                "hi": "मैंने ध्यान दिया कि आपका प्रश्न हमारे डेटाबेस और कंप्यूटर साइंस पाठ्यक्रम के बाहर के सामान्य विषयों के बारे में है। अपने अध्ययन सत्र को कुशल और अपने सीखने के पथ के साथ संरेखित रखने के लिए, आइए सामान्यीकरण, इंडेक्स या सुकराती प्रश्नों जैसे पाठ्यक्रम विषयों पर ध्यान केंद्रित करें! हमें आगे किस पाठ्यक्रम विषय का पता लगाना चाहिए?",
                "mr": "माझ्या लक्षात आले की तुमची शंका आमच्या डेटाबेस आणि कॉम्प्युटर सायन्स अभ्यासक्रमाबाहेरील सामान्य विषयांबद्दल आहे. तुमचे स्टडी सेशन कार्यक्षम ठेवण्यासाठी, कृपया नॉर्मलायझेशन, इंडेक्स किंवा सोक्रॅटिक प्रश्न सराव यांसारख्या अभ्यासक्रमातील विषयांवर लक्ष केंद्रित करूया! पुढे कोणता विषय अभ्यासायचा आहे?",
                "bn": "আমি লক্ষ্য করেছি যে আপনার প্রশ্নটি আমাদের ডেটাবেস এবং কম্পিউটার বিজ্ঞান সিলেবাসের বাইরের সাধারণ বিষয় নিয়ে। আপনার পড়াশোনার সেশনকে কার্যকর রাখতে, আসুন নরমালাইজেশন, ইনডেক্স বা সক্রেটিক প্রশ্নের মতো সিলেবাসের বিষয়ের ওপর ফোকাস করি! এর পর কোন সিলেবাসের টপিক নিয়ে আলোচনা করব?",
                "ta": "உங்கள் கேள்வி எங்கள் தரவுத்தளம் மற்றும் கணினி அறிவியல் பாடத்திட்டத்திற்கு அப்பாற்பட்ட பொதுவான தலைப்புகளைப் பற்றியது என்பதை நான் கவனித்தேன். உங்கள் படிப்பு அமர்வை திறம்பட வைக்க, நார்மலைசேஷன், குறியீடுகள் அல்லது சாக்ரடிக் கேள்வி பயிற்சிகள் போன்ற பாடத்திட்ட தலைப்பில் கவனம் செலுத்துவோம்! அடுத்து எந்த தலைப்பை ஆராய வேண்டும்?",
                "te": "మీ ప్రశ్న మా డేటాబేస్ మరియు కంప్యూటర్ సైన్స్ సిలబస్ వెలుపలి సాధారణ అంశాలకు సంబంధించినదని నేను గమనించాను. మీ స్టడీ సెషన్‌ను సమర్థవంతంగా ఉంచడానికి, నార్మలైజేషన్, ఇండెక్స్‌లు లేదా సోక్రాటిక్ ప్రశ్నల వంటి సిలబస్ అంశాలపై దృష్టి పెడదాం! తదుపరి ఏ అంశాన్ని చర్చిద్దాం?"
            }
            
            response = out_of_curriculum_msg.get(lang, out_of_curriculum_msg["en"])
            return {
                "student_id": student_id,
                "response": response,
                "prompt_compiled": f"N/A - Out of Curriculum Filtered ({lang})",
                "new_memories_extracted": [],
                "all_current_memories": self.memory_manager.get_memories(memory_key),
                "out_of_syllabus": True,
                "teacher_escalated": False,
                "language_detected": lang
            }

        # --- ARIA-006: Frustration detection and Teacher Escalation ---
        if self._is_frustrated(text):
            self.frustration_counters[student_id] = self.frustration_counters.get(student_id, 0) + 1
        else:
            # Gradually decay counter if student responds positively
            if student_id in self.frustration_counters and self.frustration_counters[student_id] > 0:
                self.frustration_counters[student_id] = max(0, self.frustration_counters[student_id] - 1)

        # Trigger escalation after 3 consecutive frustration signals
        if self.frustration_counters.get(student_id, 0) >= 3:
            teacher_escalated = True
            self.frustration_counters[student_id] = 0 # Reset counter
            
            escalation_msg = {
                "en": "[Teacher Alerted] I notice this topic is proving particularly challenging. I have flagged your study session for Professor Sharma's review and scheduled an intervention. In the meantime, let's break this down into a much simpler visual analogy. ",
                "hi": "[शिक्षक को सूचित किया गया] मुझे लगता है कि यह विषय विशेष रूप से कठिन लग रहा है। मैंने प्रोफेसर शर्मा की समीक्षा के लिए आपके सत्र को चिह्नित कर दिया है। इस बीच, आइए इसे एक बहुत ही सरल दृश्य सादृश्य में तोड़ें। ",
                "mr": "[शिक्षकांना सूचित केले] मला दिसते आहे की हा विषय खूप कठीण वाटत आहे. मी प्राध्यापक शर्मा यांच्या पुनरावलोकनासाठी तुमचे सेशन चिन्हांकित केले आहे. यादरम्यान, आपण हे एका सोप्या उदाहरणाने समजून घेऊया. ",
                "bn": "[শিক্ষক সতর্কিত] আমি লক্ষ্য করেছি এই বিষয়টি বেশ কঠিন মনে হচ্ছে। আমি প্রফেসর শর্মার পর্যালোচনার জন্য আপনার সেশনটি ফ্ল্যাগ করেছি। ইতিমধ্যে, আসুন এটিকে একটি সহজ ভিজ্যুয়াল উপমায় ভেঙে বুঝে নিই। ",
                "ta": "[ஆசிரியர் எச்சரிக்கப்பட்டார்] இந்த தலைப்பு உங்களுக்கு மிகவும் சவாலாக இருப்பதை நான் கவனித்தேன். பேராசிரியர் சர்மாவின் மதிப்பாய்விற்காக இந்த அமர்வை நான் கொடியிட்டுள்ளேன். இதற்கிடையில், இதை மிகவும் எளிமையான காட்சி ஒப்பீடாக மாற்றிப் பார்ப்போம். ",
                "te": "[టీచర్‌కు తెలియజేయబడింది] ఈ అంశం మీకు చాలా సవాలుగా ఉన్నట్లు నేను గమనించాను. ప్రొఫెసర్ శర్మ సమీక్ష కోసం మీ సెషన్‌ను ఫ్లాగ్ చేసాను. ఈలోగా, దీనిని చాలా సరళమైన విజువల్ ఉదాహరణగా విభజించి చూద్దాం. "
            }
            response_prefix = escalation_msg.get(lang, escalation_msg["en"])
        else:
            response_prefix = ""

        # 1. Translation and RAG Retrieve
        search_query = text
        if lang != "en" and self.groq_client.is_configured():
            search_query = self.groq_client.translate_to_english(text, lang)
            print(f"[INFO] Translated non-English query '{text}' -> '{search_query}'")

        if course_id and chapter_id:
            ns = f"course-{course_id}-chapter-{chapter_id}"
        elif course_id:
            ns = f"course-{course_id}"
        else:
            ns = "dbms-gate"
            
        docs = self.rag_engine.retrieve_context(search_query, namespace=ns, top_k=2)
        if course_id and not docs:
            docs = self.rag_engine.retrieve_context(search_query, namespace="dbms-gate", top_k=2)

        # 2. Extract & Update Memory from current utterance
        new_memories = self.memory_manager.ingest_conversation(memory_key, text)

        # 3. Retrieve all active memories
        memories = self.memory_manager.get_memories(memory_key)



        # 4. Formulate Prompt (Passing language context)
        prompt = build_socratic_prompt(
            student_query=text,
            retrieved_documents=docs,
            student_memory=memories,
            current_theta=current_theta,
            recent_errors=recent_errors,
            language=lang
        )

        # 5. Generative Response Selection (Groq API with Mock Fallback)
        response = None
        if self.groq_client.is_configured():
            response = self.groq_client.generate_socratic_response(prompt, text)
            if response:
                print(f"[INFO] Generated live response from Groq API in '{lang}' using model {self.groq_client.model}.")

        if not response:
            # Fallback to local high-premium mock templates (completely localized!)
            fallback_dbms = {
                "en": "A great question! Let's check slide 14. Normalization is about reducing redundancy. Since you prefer cricket analogies: imagine storing a match database, but repeating every player's birthdate next to every single run they score. If a player updates their phone number, how many rows would we have to change? And what kinds of anomalies would happen if we forget to update even one row?",
                "hi": "एक बहुत अच्छा सवाल! सामान्यीकरण (Normalization) का उद्देश्य डेटा में दोहराव (redundancy) को कम करना है। डेटाबेस को व्यवस्थित करना क्रिकेट टीम की सूची बनाने जैसा है। यदि हम हर मैच के रन के साथ खिलाड़ी का जन्मदिन भी बार-बार लिखें, तो क्या समस्या होगी? अगर खिलाड़ी का फोन नंबर बदल जाए, तो हमें कितनी जगह अपडेट करना पड़ेगा? और यदि हम एक भी पंक्ति को अपडेट करना भूल जाएं तो किस प्रकार की विसंगतियाँ (anomalies) होंगी?",
                "mr": "खूप छान प्रश्न! डेटाबेसमधील डुप्लिकेशन (redundancy) कमी करणे म्हणजे नॉर्मलायझेशन (Normalization). जर आपण प्रत्येक मॅचच्या रन्ससोबत खेळाडूचा वाढदिवस वारंवार लिहिला, तर काय समस्या निर्माण होईल? खेळाडूचा फोन नंबर बदलल्यास आपल्याला किती ठिकाणी बदल करावा लागेल? आणि जर आपण एकही रो अपडेट करायचा विसरलो, तर कोणत्या प्रकारच्या विसंगती (anomalies) निर्माण होतील?",
                "bn": "খুব ভালো প্রশ্ন! নরমালাইজেশন (Normalization) এর উদ্দেশ্য হলো ডেটার পুনরাবৃত্তি (redundancy) কমানো। যদি আমরা প্রতি ম্যাচের রানের সাথে খেলোয়াড়ের জন্মদিন বারবার লিখি, তবে কী সমস্যা হবে? যদি খেলোয়াড়ের ফোন নম্বর পরিবর্তন হয়, তবে আমাদের কত জায়গায় আপডেট করতে হবে? আর আমরা যদি একটি সারিও আপডেট করতে ভুলে যাই তবে কী ধরণের অসঙ্গতি (anomalies) ঘটবে?",
                "ta": "ஒரு சிறந்த கேள்வி! தரவுத்தளத்தில் மீண்டும் மீண்டும் வருவதைக் (redundancy) குறைப்பதே நார்மலைசேஷன் (Normalization) ஆகும். ஒரு வீரரின் பிறந்தநாளை ஒவ்வொரு ரன்னுடனும் மீண்டும் மீண்டும் எழுதினால் என்ன பிரச்சனை ஏற்படும்? வீரரின் தொலைபேசி எண் மாறினால், எத்தனை இடங்களில் மாற்ற வேண்டும்? ஒரு வரியை மாற்ற மறந்தால் என்ன விதமான முரண்பாடுகள் (anomalies) ஏற்படும்?",
                "te": "చాలా మంచి ప్రశ్న! డేటాబేస్ లో పునరావృతాన్ని (redundancy) తగ్గించడమే నార్మలైజేషన్ (Normalization). ప్రతి మ్యాచ్ పరుగులతో పాటు ఆటగాడి పుట్టినరోజును పదేపదే రాస్తే ఎలాంటి సమస్య వస్తుంది? ఆటగాడి ఫోన్ నంబర్ మారితే ఎన్ని చోట్ల అప్‌డేట్ చేయాలి? ఒక వేళ అప్‌డేట్ చేయడం మర్చిపోతే ఎలాంటి అసంగతులు (anomalies) వస్తాయి?"
            }

            fallback_cricket = {
                "en": "Exactly! Cricket is a perfect lens. Organizing a database is like keeping batsman stats separated from tournament schedules. What would happen if we merged them and a tournament got canceled?",
                "hi": "बिल्कुल! क्रिकेट एक बेहतरीन उदाहरण है। डेटाबेस को व्यवस्थित करना क्रिकेट किट बैग को व्यवस्थित करने जैसा है। सभी चीज़ों को एक साथ रखने के बजाय, हम उन्हें अलग-अलग रखते हैं। आपके अनुसार गेंदबाजों और बल्लेबाजों के लिए हमें क्या अलग कम्पार्टमेंट बनाने चाहिए?",
                "mr": "नक्कीच! डेटाबेस नॉर्मलायझेशन म्हणजे क्रिकेट किट बॅग व्यवस्थित ठेवण्यासारखे आहे. सर्व सामान एकत्र ठेवण्याऐवजी आपण ते वेगवेगळ्या कप्प्यांमध्ये ठेवतो. गोलंदाज आणि फलंदाजांसाठी कोणते वेगवेगळे कप्पे असावेत?",
                "bn": "একেবারে! ডেটাবেস নরমালাইজেশন হলো ক্রিকেট কিট ব্যাগ গুছিয়ে রাখার মতো। সব জিনিস একসাথে রাখার চেয়ে আলাদা আলাদা রাখা ভালো। বোলার এবং ব্যাটসম্যানদের জন্য কী কী আলাদা কম্পার্টমেন্ট থাকা উচিত?",
                "ta": "நிச்சயமாக! தரவுத்தள நார்மலைசேஷன் என்பது கிரிக்கெட் கிట్ பையை ஒழுங்கமைப்பது போன்றது. பேட், பந்து மற்றும் பிற உபகரணங்களை தனித்தனி அறைகளில் வைப்பது போல. பந்துவீச்சாளர்கள் மற்றும் பேட்ஸ்மேன்களுக்கு என்னென்ன தனி அறைகளை உருவாக்க வேண்டும்?",
                "te": "ఖచ్చితంగా! డేటాబేస్ నార్మలైజేషన్ అనేది క్రికెట్ కిట్ బ్యాగ్‌ను సర్దడం లాంటిది. అన్ని వస్తువులను ఒకే చోట కాకుండా వేర్వేరు కంపార్ట్‌మెంట్‌లలో ఉంచడం. బౌలర్లు మరియు బ్యాట్స్‌మెన్ కోసం ఎలాంటి వేర్వేరు కంపార్ట్‌మెంట్‌లు ఉండాలి?"
            }

            fallback_mle = {
                "en": "Ah, studying the backend algorithms! Maximum Likelihood Estimation adjusts your ability parameter theta (θ) based on item difficulties. If you get hard questions right, θ shifts up. Where do you think we should set the prior θ?",
                "hi": "अहा, बैकएंड एल्गोरिदम का अध्ययन कर रहे हैं! मैक्सिमम लाइकलीहुड एस्टीमेशन (MLE) आइटम की कठिनाइयों के आधार पर आपकी क्षमता पैरामीटर थीटा (θ) को समायोजित करता है। यदि आप कठिन प्रश्नों को सही पाते हैं, तो θ ऊपर खिसक जाता है। आपको क्या लगता है कि हमें पूर्व θ कहाँ सेट करना चाहिए?",
                "mr": "वा, बॅकएंड अल्गोरिदमचा अभ्यास करत आहात! मॅक्सिमम लाइकलीहुड एस्टीमेशन (MLE) प्रश्नांच्या काठिण्य पातळीनुसार तुमची क्षमता थिटा (θ) समायोजित करते. जर तुम्ही कठीण प्रश्न बरोबर सोडवले, तर θ वाढतो. तुम्हाला काय वाटते आपण आधी थिटा (θ) कुठे सेट करायला हवा?",
                "bn": "বাহ, ব্যাকএন্ড অ্যালগরিদম নিয়ে পড়াশোনা করছেন! ম্যাক্সিমাম লাইকলিহুড এস্টিমেশন (MLE) প্রশ্নের কাঠিন্যের ওপর ভিত্তি করে আপনার ক্ষমতা থিটা (θ) সামঞ্জস্য করে। আপনি কঠিন প্রশ্নের সঠিক উত্তর দিলে θ বেড়ে যায়। আপনার কী মনে হয় আমাদের পূর্ববর্তী θ কোথায় সেট করা উচিত?",
                "ta": "ஆஹா, பின்தள அல்காரிதங்களைப் படிக்கிறீர்கள்! மேக்சிமம் லைக்லிஹுட் எஸ்டிமேஷன் (MLE) உங்கள் திறன் அளவுரு தீட்டாவை (θ) கேள்விகளின் கடினத்தன்மையின் அடிப்படையில் சரிசெய்கிறது. கடினமான கேள்விகளுக்கு சரியாக பதிலளித்தால் θ உயரும். தொடக்க தீட்டாவை (θ) எங்கே வைக்க வேண்டும் என்று நினைக்கிறீர்கள்?",
                "te": "ఆహా, బ్యాకెండ్ అల్గారిథమ్స్ గురించి చదువుతున్నారు! గరిష్ట సంభావ్యత అంచనా (MLE) ప్రశ్నల కఠినత ఆధారంగా మీ సామర్థ్య పరామితి థీటా (θ)ను సర్దుబాటు చేస్తుంది. మీరు కఠినమైన ప్రశ్నలకు సరైన సమాధానం ఇస్తే θ పెరుగుతుంది. ప్రారంభ థీటా (θ)ను ఎక్కడ ఉంచాలి అనుకుంటున్నారు?"
            }

            fallback_default = {
                "en": "That's an interesting point! Connecting this to your syllabus: how do you feel this relates to functional dependencies, or should we examine the class slides first?",
                "hi": "यह एक दिलचस्प बिंदु है! इसे आपके सिलेबस से जोड़ते हुए: आपको क्या लगता है कि यह कार्यात्मक निर्भरता (functional dependencies) से कैसे संबंधित है, या हमें पहले क्लास स्लाइड्स को देखना चाहिए?",
                "mr": "हा एक मनोरंजक मुद्दा आहे! तुमच्या अभ्यासक्रमाशी जोडताना: तुम्हाला काय वाटते की हे फंक्शनल डिपेंडेंसीशी (functional dependencies) कसे संबंधित आहे, की आपण आधी क्लास स्लाईड्स पाहायच्या?",
                "bn": "এটি একটি আকর্ষণীয় পয়েন্ট! আপনার সিলেবাসের সাথে সম্পর্কিত করে: এটি ফাংশনাল ডিপেন্ডেন্সির (functional dependencies) সাথে কীভাবে সম্পর্কিত বলে আপনি মনে করেন, নাকি আগে ক্লাস স্লাইডগুলো দেখব?",
                "ta": "இது ஒரு சுவாரஸ்யமான புள்ளி! உங்கள் பாடத்திட்டத்துடன் ஒப்பிடுகையில்: இது ஃபங்க்ஷனல் டிபென்டென்சியுடன் (functional dependencies) எவ்வாறு தொடர்புடையது என்று நினைக்கிறீர்கள், அல்லது முதலில் வகுப்பு ஸ்லைடுகளை பார்க்கலாமா?",
                "te": "ఇది ఒక ఆసక్తికరమైన అంశం! మీ సిలబస్‌తో అనుసంధానిస్తే: ఇది ఫంక్షనల్ డిపెండెన్సీలతో (functional dependencies) ఎలా సంబంధం కలిగి ఉందని మీరు భావిస్తున్నారు, లేదా మొదట క్లాస్ స్లైడ్స్ చూద్దామా?"
            }

            text_lower = text.lower()
            if "normal" in text_lower or "database" in text_lower or "1nf" in text_lower or "नॉर्मला" in text_lower or "सामान्यीकरण" in text_lower or "নরমালাই" in text_lower or "நார்மலை" in text_lower or "నార్మలై" in text_lower:
                response = fallback_dbms.get(lang, fallback_dbms["en"])
            elif "cricket" in text_lower or "क्रिकेट" in text_lower or "கிரிக்கெட்" in text_lower or "క్రికెట్" in text_lower:
                response = fallback_cricket.get(lang, fallback_cricket["en"])
            elif "mle" in text_lower or "irt" in text_lower or "theta" in text_lower or "थीटा" in text_lower or "θ" in text_lower:
                response = fallback_mle.get(lang, fallback_mle["en"])
            else:
                response = fallback_default.get(lang, fallback_default["en"])

        final_response = response_prefix + response

        return {
            "student_id": student_id,
            "response": final_response,
            "prompt_compiled": prompt,
            "new_memories_extracted": new_memories,
            "all_current_memories": memories,
            "out_of_syllabus": out_of_syllabus,
            "teacher_escalated": teacher_escalated,
            "language_detected": lang
        }
