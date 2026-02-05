import os
from pathlib import Path

# --- CONFIGURATION ---
OUTPUT_FILE = "full_project_dump.txt"
# Add folders you want to skip (standard defaults included)
IGNORE_DIRS = {'.git', 'node_modules', '__pycache__', 'venv', '.vscode', 'dist', 'build'}
# Add extensions you want to skip (images, binaries, etc.)
IGNORE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.pdf', '.pyc', '.exe', '.dat', '.db'}

def generate_dump():
    project_root = Path.cwd()
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
        f_out.write(f"PROJECT DUMP: {project_root.name}\n")
        f_out.write("=" * 60 + "\n\n")

        # 1. GENERATE DIRECTORY TREE (The "Map")
        f_out.write("DIRECTORY STRUCTURE:\n")
        for root, dirs, files in os.walk(project_root):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            level = root.replace(str(project_root), '').count(os.sep)
            indent = ' ' * 4 * level
            f_out.write(f"{indent}{os.path.basename(root)}/\n")
            sub_indent = ' ' * 4 * (level + 1)
            for f in files:
                if Path(f).suffix not in IGNORE_EXTS:
                    f_out.write(f"{sub_indent}{f}\n")
        
        f_out.write("\n" + "=" * 60 + "\n")
        f_out.write("FILE CONTENTS START BELOW\n")
        f_out.write("=" * 60 + "\n\n")

        # 2. GENERATE FILE CONTENTS
        for root, dirs, files in os.walk(project_root):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                file_path = Path(root) / file
                
                # Skip the output file itself and binary extensions
                if file == OUTPUT_FILE or file_path.suffix in IGNORE_EXTS:
                    continue

                relative_path = file_path.relative_to(project_root)
                
                f_out.write(f"\n--- BEGIN FILE: {relative_path} ---\n")
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='replace') as f_in:
                        f_out.write(f_in.read())
                except Exception as e:
                    f_out.write(f"[ERROR READING FILE: {e}]\n")
                
                f_out.write(f"\n--- END FILE: {relative_path} ---\n")

    print(f"✅ Success! Advanced dump created at: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_dump()