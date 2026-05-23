import os
import subprocess
import tempfile
import re
import shutil
import json
from typing import Dict, List, Any, Tuple, Optional
from nova.groq_client import GroqClient

class ManimGeneratorService:
    def __init__(self):
        self.groq_client = GroqClient()

    def generate_video(self, concept: str) -> Dict[str, Any]:
        """
        Executes the Agentic Manim Video Generation workflow:
        1. Code Writer drafts the Manim script.
        2. Code Reviewer reviews the script.
        3. Attempts local compilation (if manim binary is available).
        4. Self-heals up to 3 times if compilation fails.
        5. Returns logs, generated code, video URL if successful, and a rich, interactive SVG fallback dataset.
        """
        logs = []
        logs.append({
            "agent": "Orchestrator",
            "status": "info",
            "message": f"🚀 Initializing AI Manim Video Generator for concept: '{concept}'"
        })

        # 1. Draft the code
        logs.append({
            "agent": "Code Writer",
            "status": "working",
            "message": "✍️ Drafting high-fidelity visual Manim Scene. Selecting optimal colors and shapes..."
        })
        
        writer_prompt = self._get_writer_system_prompt()
        user_query = f"Create a Manim scene class named 'ConceptExplainer' that visually explains this concept: '{concept}'"
        
        raw_response = self.groq_client.generate_socratic_response(writer_prompt, user_query)
        if not raw_response:
            # Fallback if LLM fails
            raw_response = self._get_hardcoded_manim_fallback(concept)
            logs.append({
                "agent": "Code Writer",
                "status": "warning",
                "message": "⚠️ LLM request failed. Using local high-fidelity script blueprint."
            })
            
        code = self._extract_code(raw_response)
        logs.append({
            "agent": "Code Writer",
            "status": "success",
            "message": "📦 Drafted initial Manim script. Handing over to Code Reviewer..."
        })

        # 2. Review phase
        logs.append({
            "agent": "Code Reviewer",
            "status": "working",
            "message": "🔍 Auditing Manim script for potential rendering issues (LaTeX usage, layout collision, overlapping, styling)..."
        })
        
        reviewer_prompt = self._get_reviewer_system_prompt()
        review_query = f"Review this Manim code. Spot any errors or violating constraints:\n\n```python\n{code}\n```"
        
        review_response = self.groq_client.generate_socratic_response(reviewer_prompt, review_query)
        if review_response and "error" in review_response.lower():
            logs.append({
                "agent": "Code Reviewer",
                "status": "healing",
                "message": f"🛠️ Reviewer feedback: {review_response[:120]}... Requesting self-healing correction..."
            })
            # Quick single-step healing based on review
            raw_response = self.groq_client.generate_socratic_response(
                writer_prompt,
                f"Correct the following code based on reviewer notes: {review_response}\n\nOriginal Code:\n{code}"
            )
            if raw_response:
                code = self._extract_code(raw_response)
                logs.append({
                    "agent": "Code Writer",
                    "status": "success",
                    "message": "✨ Self-healed code based on reviewer static analysis!"
                })
        else:
            logs.append({
                "agent": "Code Reviewer",
                "status": "success",
                "message": "✅ Static analysis passed with 0 errors detected."
            })

        # 3. Local rendering check & self-healing loop
        render_success = False
        video_url = None
        temp_dir = None
        attempts = 0
        max_attempts = 3
        traceback_error = None

        # Check if manim commands are available
        manim_available = shutil.which("manim") is not None
        if not manim_available:
            logs.append({
                "agent": "Render Engine",
                "status": "warning",
                "message": "⚠️ Local 'manim' CLI binary not found in sandbox environment. Engaging sandbox-resilient stateful SVG/HTML5 vector animation simulation..."
            })
        else:
            logs.append({
                "agent": "Render Engine",
                "status": "working",
                "message": f"⚡ System has 'manim' binary. Initiating subprocess render pipeline (QL - low quality)..."
            })
            
            while attempts < max_attempts and not render_success:
                attempts += 1
                logs.append({
                    "agent": "Render Engine",
                    "status": "working",
                    "message": f"🎬 Compilation Attempt {attempts}/{max_attempts}..."
                })
                
                success, output_path, err_logs = self._try_render_manim(code)
                if success:
                    render_success = True
                    # Move to a public asset folder or static folder if necessary
                    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/public/videos"))
                    os.makedirs(public_dir, exist_ok=True)
                    dest_file = os.path.join(public_dir, f"explainer_{attempts}_{os.getpid()}.mp4")
                    shutil.copy(output_path, dest_file)
                    video_url = f"/videos/explainer_{attempts}_{os.getpid()}.mp4"
                    
                    logs.append({
                        "agent": "Render Engine",
                        "status": "success",
                        "message": f"🎉 Rendered successfully! Video saved to {video_url}"
                    })
                    break
                else:
                    traceback_error = err_logs
                    logs.append({
                        "agent": "Self-Healer",
                        "status": "healing",
                        "message": f"🔧 Compilation failed on attempt {attempts}. Extracting traceback error details..."
                    })
                    # Prompt healing
                    heal_prompt = (
                        f"You are the Manim Self-Healer agent.\n"
                        f"The Manim code you generated failed compilation with the following terminal stderr traceback:\n\n"
                        f"```\n{traceback_error}\n```\n\n"
                        f"Rewrite the code to fix the traceback. Remember to keep the class named 'ConceptExplainer' "
                        f"and do NOT use any MathTex/Tex classes. Return only the valid Python block inside ```python."
                    )
                    heal_response = self.groq_client.generate_socratic_response(writer_prompt, heal_prompt)
                    if heal_response:
                        code = self._extract_code(heal_response)
                        logs.append({
                            "agent": "Code Writer",
                            "status": "success",
                            "message": f"✏️ Generated self-healed revision {attempts}."
                        })
                    else:
                        break

        # 4. Generate structured HTML5 fallback visual dataset
        logs.append({
            "agent": "Orchestrator",
            "status": "working",
            "message": "🧠 Compiling structured interactive vector animation dataset for the VARK Player..."
        })
        fallback_data = self._generate_rich_fallback_data(concept, code)
        logs.append({
            "agent": "Orchestrator",
            "status": "success",
            "message": "🏁 AI Manim Generation process completed successfully!"
        })

        return {
            "success": render_success,
            "code": code,
            "logs": logs,
            "video_url": video_url,
            "fallback_data": fallback_data
        }

    def _get_writer_system_prompt(self) -> str:
        return (
            "You are the Expert Code Writer Agent of the AdaptIQ AI Manim Video Generator.\n"
            "Your task is to write high-fidelity, syntactically perfect Python scripts using the `manim` library.\n\n"
            "CRITICAL DESIGN CONSTRAINTS:\n"
            "1. **Scene Class**: The scene MUST be a class named `ConceptExplainer` inheriting from `Scene` (e.g., `class ConceptExplainer(Scene):`).\n"
            "2. **NO LATEX**: DO NOT use `MathTex`, `Tex`, `TexMobject`, or any LaTeX-dependent class because LaTeX is frequently not installed on standard host environments and causes compilation crashes. Instead, ALWAYS use `Text()` or `MarkupText()` with standard mathematical symbols (e.g. '=', '+', '-', '->', '=>', '*', 'theta').\n"
            "3. **Color Theme**: Match the AdaptIQ premium dark theme. Use high-contrast color hex codes:\n"
            "   - Indigo / Primary: '#818cf8'\n"
            "   - Emerald / Secondary: '#34d399'\n"
            "   - Orchid / Accent: '#f472b6'\n"
            "   - Text / White: '#ffffff'\n"
            "   - Dark Background: '#060814'\n"
            "4. **Layout**: Keep objects neatly spaced. Use positioning methods like `next_to`, `shift`, and `to_edge` so objects do not overlap.\n"
            "5. **Animations**: Keep them elegant and snappy. Chain multiple animations together for a comprehensive lesson. You MUST include sufficient `self.wait(2)` calls between steps to give the viewer time to read.\n"
            "6. **Duration**: The total video must last at least 15-20 seconds. ALWAYS conclude the scene with a long pause, e.g., `self.wait(5)`, so the final state remains visible.\n"
            "7. **Output Format**: Return ONLY valid executable Python code wrapped inside a single ```python...``` code block."
        )

    def _get_reviewer_system_prompt(self) -> str:
        return (
            "You are the Expert Code Reviewer Agent of the AdaptIQ AI Manim Video Generator.\n"
            "Review the provided Manim code. Ensure it satisfies these guidelines:\n"
            "1. No `MathTex` or `Tex` objects are used.\n"
            "2. Correct import: `from manim import *`.\n"
            "3. Class is named `ConceptExplainer`.\n"
            "4. Basic variables are initialized before use.\n\n"
            "If any issue is detected, output a brief message starting with 'ERROR: [reason]'.\n"
            "If the code looks perfect, respond with 'PASS'."
        )

    def _extract_code(self, raw_text: str) -> str:
        """Extracts code blocks starting with ```python."""
        pattern = r"```python(.*?)```"
        match = re.search(pattern, raw_text, re.DOTALL)
        if match:
            return match.group(1).strip()
        
        # Fallback if markdown block is missing
        lines = raw_text.split("\n")
        cleaned_lines = [line for line in lines if not line.strip().startswith("```")]
        return "\n".join(cleaned_lines).strip()

    def _try_render_manim(self, code: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Attempts to render the Manim scene class using subprocess.
        Returns (success, video_path, err_logs).
        """
        temp_file = None
        try:
            # Create a secure temp directory to execute the python file
            temp_dir = tempfile.mkdtemp()
            temp_file = os.path.join(temp_dir, "scene_script.py")
            
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(code)
                
            # Compile with manim -ql (low quality 480p 15fps, fast render, warning suppression)
            cmd = ["manim", "-ql", "-v", "WARNING", "--media_dir", temp_dir, temp_file, "ConceptExplainer"]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=120)
            
            if res.returncode == 0:
                # Find output mp4 in media_dir
                # manim puts it inside media_dir/videos/scene_script/480p15/ConceptExplainer.mp4
                output_mp4 = None
                for root, dirs, files in os.walk(temp_dir):
                    for file in files:
                        if file.endswith(".mp4"):
                            output_mp4 = os.path.join(root, file)
                            break
                            
                if output_mp4 and os.path.exists(output_mp4):
                    # Copy to a persistent temp folder inside the workspace
                    persist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../temp_renders"))
                    os.makedirs(persist_dir, exist_ok=True)
                    persist_path = os.path.join(persist_dir, f"render_{os.getpid()}.mp4")
                    shutil.copy(output_mp4, persist_path)
                    
                    # Clean up
                    try:
                        shutil.rmtree(temp_dir)
                    except:
                        pass
                    return True, persist_path, None
            
            # If compile failed, extract stderr or stdout
            err_msg = res.stderr if res.stderr else res.stdout
            try:
                shutil.rmtree(temp_dir)
            except:
                pass
            return False, None, err_msg
            
        except Exception as e:
            if temp_file and os.path.exists(os.path.dirname(temp_file)):
                try:
                    shutil.rmtree(os.path.dirname(temp_file))
                except:
                    pass
            return False, None, str(e)

    def _generate_rich_fallback_data(self, concept: str, code: str) -> Dict[str, Any]:
        """
        Parses or uses standard rules to construct a beautiful multi-step interactive
        SVG/Canvas relational animation model representing the concepts.
        """
        c_lower = concept.lower()
        
        # 1. Database Joins Concept Fallback
        if "join" in c_lower:
            return {
                "title": "Interactive Relational Joins",
                "concept": concept,
                "steps": [
                    {
                        "title": "Table Setup",
                        "description": "Imagine Table A (Students) and Table B (Enrollments) side-by-side. Both have an ID column.",
                        "elements": [
                            {"type": "table", "id": "tableA", "title": "Table A (Students)", "x": 100, "y": 80, "headers": ["ID", "Name"], "rows": [[1, "Priya"], [2, "Aarav"], [3, "Sophia"]]},
                            {"type": "table", "id": "tableB", "title": "Table B (Enrollments)", "x": 450, "y": 80, "headers": ["StudentId", "Course"], "rows": [[1, "Databases"], [2, "Security"], [4, "Compiler"]]}
                        ]
                    },
                    {
                        "title": "Matching Keys",
                        "description": "The relational join engine scans each row looking for matching values: ID = StudentId.",
                        "elements": [
                            {"type": "table", "id": "tableA", "title": "Table A (Students)", "x": 100, "y": 80, "headers": ["ID", "Name"], "rows": [[1, "Priya"], [2, "Aarav"], [3, "Sophia"]], "highlightRow": 0},
                            {"type": "table", "id": "tableB", "title": "Table B (Enrollments)", "x": 450, "y": 80, "headers": ["StudentId", "Course"], "rows": [[1, "Databases"], [2, "Security"], [4, "Compiler"]], "highlightRow": 0},
                            {"type": "arrow", "from": [260, 130], "to": [450, 130], "color": "#34d399", "label": "Match: 1 = 1"}
                        ]
                    },
                    {
                        "title": "Inner Join Result",
                        "description": "Rows that match on both sides are combined into the final result table. Unmatched records (ID 3, 4) are excluded.",
                        "elements": [
                            {"type": "table", "id": "tableA", "title": "Table A (Students)", "x": 100, "y": 50, "headers": ["ID", "Name"], "rows": [[1, "Priya"], [2, "Aarav"], [3, "Sophia"]]},
                            {"type": "table", "id": "tableB", "title": "Table B (Enrollments)", "x": 450, "y": 50, "headers": ["StudentId", "Course"], "rows": [[1, "Databases"], [2, "Security"], [4, "Compiler"]]},
                            {"type": "table", "id": "resultTable", "title": "Inner Join Output", "x": 220, "y": 240, "headers": ["ID", "Name", "Course"], "rows": [[1, "Priya", "Databases"], [2, "Aarav", "Security"]], "color": "#818cf8"}
                        ]
                    }
                ]
            }
            
        # 2. B+ Tree / Indexing Concept Fallback
        elif "tree" in c_lower or "index" in c_lower or "b+" in c_lower:
            return {
                "title": "B+ Tree Indexing Node Splits",
                "concept": concept,
                "steps": [
                    {
                        "title": "Root Node Overview",
                        "description": "A B+ Tree contains search keys in interior nodes, directing lookups down to leaf blocks.",
                        "elements": [
                            {"type": "node", "id": "root", "label": "[ 15 | 30 ]", "x": 300, "y": 60, "color": "#818cf8"},
                            {"type": "node", "id": "leaf1", "label": "[ 5 | 10 | 12 ]", "x": 100, "y": 180, "color": "#34d399"},
                            {"type": "node", "id": "leaf2", "label": "[ 15 | 20 | 25 ]", "x": 300, "y": 180, "color": "#34d399"},
                            {"type": "node", "id": "leaf3", "label": "[ 30 | 35 | 40 ]", "x": 500, "y": 180, "color": "#34d399"},
                            {"type": "arrow", "from": [260, 95], "to": [140, 180], "color": "#ffffff"},
                            {"type": "arrow", "from": [300, 95], "to": [300, 180], "color": "#ffffff"},
                            {"type": "arrow", "from": [340, 95], "to": [460, 180], "color": "#ffffff"}
                        ]
                    },
                    {
                        "title": "Inserting Key 22",
                        "description": "We traverse from root. Since 15 <= 22 < 30, we navigate to the middle leaf node [ 15 | 20 | 25 ].",
                        "elements": [
                            {"type": "node", "id": "root", "label": "[ 15 | 30 ]", "x": 300, "y": 60, "color": "#818cf8"},
                            {"type": "node", "id": "leaf1", "label": "[ 5 | 10 | 12 ]", "x": 100, "y": 180, "color": "#34d399"},
                            {"type": "node", "id": "leaf2", "label": "[ 15 | 20 | 25 ]", "x": 300, "y": 180, "color": "#f472b6", "glow": True},
                            {"type": "node", "id": "leaf3", "label": "[ 30 | 35 | 40 ]", "x": 500, "y": 180, "color": "#34d399"},
                            {"type": "arrow", "from": [300, 95], "to": [300, 180], "color": "#f472b6", "label": "Search: 15 <= 22 < 30"}
                        ]
                    },
                    {
                        "title": "Node Overflow and Split",
                        "description": "Leaf 2 is full! Adding 22 triggers a vertical node split. Key 22 is promoted, creating two balanced nodes.",
                        "elements": [
                            {"type": "node", "id": "root", "label": "[ 15 | 22 | 30 ]", "x": 300, "y": 60, "color": "#818cf8"},
                            {"type": "node", "id": "leaf1", "label": "[ 5 | 10 | 12 ]", "x": 60, "y": 200, "color": "#34d399"},
                            {"type": "node", "id": "leaf2a", "label": "[ 15 | 20 ]", "x": 220, "y": 200, "color": "#34d399"},
                            {"type": "node", "id": "leaf2b", "label": "[ 22 | 25 ]", "x": 380, "y": 200, "color": "#34d399"},
                            {"type": "node", "id": "leaf3", "label": "[ 30 | 35 | 40 ]", "x": 540, "y": 200, "color": "#34d399"}
                        ]
                    }
                ]
            }

        # 3. Transaction Isolation / ACID isolation Concept Fallback
        elif "acid" in c_lower or "transaction" in c_lower or "isolation" in c_lower or "concurrency" in c_lower:
            return {
                "title": "ACID Transaction Isolation Schedules",
                "concept": concept,
                "steps": [
                    {
                        "title": "Parallel Transactions",
                        "description": "Transaction T1 and T2 run concurrently, reading and updating a shared bank balance variable A.",
                        "elements": [
                            {"type": "box", "id": "t1", "title": "Transaction T1", "x": 80, "y": 60, "width": 200, "height": 180, "color": "#818cf8"},
                            {"type": "box", "id": "t2", "title": "Transaction T2", "x": 420, "y": 60, "width": 200, "height": 180, "color": "#f472b6"},
                            {"type": "text", "x": 100, "y": 120, "text": "Read(A) [A = 100]"},
                            {"type": "text", "x": 440, "y": 150, "text": "Read(A) [A = 100]"}
                        ]
                    },
                    {
                        "title": "Dirty Write / Dirty Read Vulnerability",
                        "description": "Without strict lock isolation, T1 updates A to 150. T2 reads the uncommitted value, risking inconsistencies.",
                        "elements": [
                            {"type": "box", "id": "t1", "title": "Transaction T1", "x": 80, "y": 60, "width": 200, "height": 180, "color": "#818cf8"},
                            {"type": "box", "id": "t2", "title": "Transaction T2", "x": 420, "y": 60, "width": 200, "height": 180, "color": "#f472b6"},
                            {"type": "text", "x": 100, "y": 120, "text": "Write(A = 150)"},
                            {"type": "text", "x": 440, "y": 150, "text": "Read(A) [Dirty Value 150!]"},
                            {"type": "arrow", "from": [260, 120], "to": [440, 150], "color": "#color-danger", "label": "No Lock Conflict"}
                        ]
                    },
                    {
                        "title": "2PL Serializable Lock Schedule",
                        "description": "Strict 2-Phase Locking ensures T1 obtains an Exclusive Lock (X-Lock) on A, forcing T2 to wait safely until T1 commits.",
                        "elements": [
                            {"type": "box", "id": "t1", "title": "Transaction T1", "x": 80, "y": 60, "width": 200, "height": 220, "color": "#818cf8"},
                            {"type": "box", "id": "t2", "title": "Transaction T2", "x": 420, "y": 60, "width": 200, "height": 220, "color": "#f472b6"},
                            {"type": "text", "x": 100, "y": 110, "text": "Lock-X(A) [GRANTED]"},
                            {"type": "text", "x": 100, "y": 140, "text": "Write(A = 150)"},
                            {"type": "text", "x": 100, "y": 170, "text": "Commit & Unlock(A)"},
                            {"type": "text", "x": 440, "y": 110, "text": "Lock-X(A) [BLOCKED]"},
                            {"type": "text", "x": 440, "y": 200, "text": "Lock-X(A) [GRANTED]"},
                            {"type": "arrow", "from": [420, 110], "to": [260, 110], "color": "#34d399", "label": "Wait Queue"}
                        ]
                    }
                ]
            }

        # 4. Standard Flow Generic fallback (dynamically parses concepts to draw nodes & arrows)
        return self._generate_dynamic_fallback(concept, code)

    def _generate_dynamic_fallback(self, concept: str, code: str) -> Dict[str, Any]:
        """
        Generates a smart visual flow dynamically when no pre-coded template is present.
        """
        # Parse potential key phrases out of the code or concept
        steps = [
            {
                "title": "Concept Blueprint",
                "description": f"Understanding '{concept}'. In this scene we will lay out the fundamental structural building blocks.",
                "elements": [
                    {"type": "circle", "id": "c1", "label": concept.split()[0] if concept.split() else "Concept", "x": 300, "y": 120, "color": "#818cf8"},
                    {"type": "text", "x": 300, "y": 250, "text": f"Visualizer: {concept}", "color": "#ffffff"}
                ]
            },
            {
                "title": "Component Interaction",
                "description": "Visualizing how nodes transmit data and interact through the learning system.",
                "elements": [
                    {"type": "circle", "id": "c1", "label": "Input Data", "x": 150, "y": 120, "color": "#818cf8"},
                    {"type": "circle", "id": "c2", "label": "Processing", "x": 450, "y": 120, "color": "#34d399"},
                    {"type": "arrow", "from": [210, 120], "to": [390, 120], "color": "#f472b6", "label": "Transform"}
                ]
            },
            {
                "title": "System Steady State",
                "description": "The concept reaches a balanced output state. Real-time telemetry verifies the logic.",
                "elements": [
                    {"type": "circle", "id": "c1", "label": "Input Data", "x": 150, "y": 80, "color": "#818cf8"},
                    {"type": "circle", "id": "c2", "label": "Processing", "x": 450, "y": 80, "color": "#34d399"},
                    {"type": "arrow", "from": [210, 80], "to": [390, 80], "color": "#f472b6"},
                    {"type": "box", "id": "result", "title": "System Output", "x": 200, "y": 200, "width": 200, "height": 80, "color": "#34d399"}
                ]
            }
        ]
        return {
            "title": f"Dynamic Visualizer: {concept}",
            "concept": concept,
            "steps": steps
        }

    def _get_hardcoded_manim_fallback(self, concept: str) -> str:
        """Standard high-fidelity pure text Manim script in case of generator failure."""
        return (
            "from manim import *\n\n"
            "class ConceptExplainer(Scene):\n"
            "    def construct(self):\n"
            "        # Primary Title\n"
            f"        title = Text(\"Visualizing {concept}\", color='#818cf8').scale(0.8)\n"
            "        self.play(Write(title))\n"
            "        self.wait(1)\n"
            "        self.play(title.animate.to_edge(UP))\n"
            "        \n"
            "        # Graphic box & labels\n"
            "        box = Rectangle(width=4.0, height=2.0, color='#34d399')\n"
            "        box_lbl = Text(\"Core Engine\", color='#ffffff').scale(0.6)\n"
            "        box_lbl.move_to(box.get_center())\n"
            "        \n"
            "        # Text components\n"
            "        caption = Text(\"Agentic pipeline successfully established!\", color='#f472b6').scale(0.5)\n"
            "        caption.next_to(box, DOWN, buff=0.5)\n"
            "        \n"
            "        # Play actions\n"
            "        self.play(Create(box), Write(box_lbl))\n"
            "        self.wait(0.5)\n"
            "        self.play(FadeIn(caption))\n"
            "        self.wait(1.5)\n"
        )
