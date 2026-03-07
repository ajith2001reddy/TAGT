import os

def bundle_ts_smart_split(output_prefix="ts_project_part"):
    ignore_dirs = {'.git', 'node_modules', 'dist', 'build', '.next', 'out', '__pycache__'}
    ignore_files = {'.DS_Store', 'package-lock.json', 'yarn.lock'}

    # explicitly allow these
    include_env_files = {'.env', '.env.local', '.env.production', '.env.development'}

    file_data = []

    # 1. Collect all file contents first
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            if (
                file in ignore_files
                or file.startswith(output_prefix)
                or file.endswith('.py')
            ):
                continue

            # ensure env files are included
            if file.startswith(".env") or file in include_env_files:
                file_path = os.path.join(root, file)
            else:
                file_path = os.path.join(root, file)

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    formatted = f"--- FILE: {file_path} ---\n{content}\n--- END OF {file_path} ---\n\n"
                    file_data.append(formatted)
            except Exception:
                continue

    # 2. Distribute files into 20 buckets
    buckets = [[] for _ in range(20)]
    for i, content in enumerate(file_data):
        bucket_index = i % 20
        buckets[bucket_index].append(content)

    # 3. Write the 20 files
    for i in range(20):
        filename = f"{output_prefix}_{i+1:02d}.txt"
        with open(filename, 'w', encoding='utf-8') as out:
            out.write(f"TS PROJECT PART {i+1} of 20\n")
            out.write("="*30 + "\n")

            if i == 0:
                out.write("(Includes .env files if present)\n")

            out.write("".join(buckets[i]))

    print("Done! Created 20 files. No code was cut in half.")

if __name__ == "__main__":
    bundle_ts_smart_split()