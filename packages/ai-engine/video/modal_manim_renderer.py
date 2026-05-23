import os
import subprocess
import tempfile
import glob
import modal

# Define the cloud image with all necessary system dependencies for Manim
manim_image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg", "libcairo2-dev", "libpango1.0-dev")
    .pip_install("manim")
)

# Initialize the Modal App
app = modal.App("adaptiq-manim-renderer")

@app.function(image=manim_image, timeout=300)
def render_manim_scene_cloud(scene_code: str, scene_class: str = "ConceptExplainer") -> bytes:
    """
    Renders a Manim scene in the cloud.
    Returns the binary bytes of the generated .mp4 file.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        # Write the python script to the temp directory
        script_path = os.path.join(temp_dir, "scene.py")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(scene_code)
            
        # Run the manim command in the cloud container
        # -ql for low quality (fast rendering). Use -pqh for 1080p60fps
        cmd = ["manim", "-ql", "-v", "WARNING", "--media_dir", temp_dir, script_path, scene_class]
        
        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        except subprocess.CalledProcessError as e:
            # If rendering fails, raise an exception with the manim stderr output
            raise Exception(f"Manim Cloud Compilation Failed:\n{e.stderr}")
            
        # Find the generated mp4 file
        videos = glob.glob(f"{temp_dir}/**/*.mp4", recursive=True)
        if not videos:
            raise Exception("Manim succeeded but no MP4 output file was generated.")
            
        # Read the video bytes and return them over the network
        with open(videos[0], "rb") as f:
            video_bytes = f.read()
            
        return video_bytes
