from video.manim_generator import ManimGeneratorService
gen = ManimGeneratorService()
# Test generate
res = gen.generate_video('Database Keys and Integrity Constraints')
print('---CODE---')
print(res['code'])
print('---ENDCODE---')
