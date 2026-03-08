import os

def bundle_ts_smart_split(output_prefix="ts_project_part"):
    ignore_dirs = {'.git', 'node_modules', 'dist', 'build', '.next', 'out', '__pycache__'}
    ignore_files = {'.DS_Store', 'package-lock.json', 'yarn.lock'}

    # exclude env files for security
    ignore_env_prefix = ".env"

    # secret keywords to remove
    secret_keywords = ["SECRET", "TOKEN", "KEY", "PASSWORD", "API_KEY"]

    file_data = []

    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:

            if (
                file in ignore_files
                or file.startswith(output_prefix)
                or file.endswith('.py')
                or file.startswith(ignore_env_prefix)   # skip env files
            ):
                continue

            file_path = os.path.join(root, file)

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                    # remove secret lines
                    lines = content.splitlines()
                    filtered = [
                        line for line in lines
                        if not any(keyword in line.upper() for keyword in secret_keywords)
                    ]

                    content = "\n".join(filtered)

                    formatted = f"--- FILE: {file_path} ---\n{content}\n--- END OF {file_path} ---\n\n"
                    file_data.append(formatted)

            except Exception:
                continue

    buckets = [[] for _ in range(20)]
    for i, content in enumerate(file_data):
        bucket_index = i % 20
        buckets[bucket_index].append(content)

    for i in range(20):
        filename = f"{output_prefix}_{i+1:02d}.txt"
        with open(filename, 'w', encoding='utf-8') as out:
            out.write(f"TS PROJECT PART {i+1} of 20\n")
            out.write("="*30 + "\n")
            out.write("".join(buckets[i]))

    print("Done! Created 20 files. Secrets and env files excluded.")

if __name__ == "__main__":
    bundle_ts_smart_split()