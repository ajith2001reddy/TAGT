import os
import json
import hashlib

def get_file_hash(filepath):
    try:
        with open(filepath, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except Exception:
        return None

def bundle_changed_files(
    output_prefix="ts_project_part",
    state_file=".bundle_state.json"
):
    ignore_dirs       = {'.git', 'node_modules', 'dist', 'build', '.next', 'out', '__pycache__'}
    ignore_files      = {'.DS_Store', 'package-lock.json', 'yarn.lock'}
    ignore_env_prefix = ".env"
    secret_keywords   = ["SECRET", "TOKEN", "KEY", "PASSWORD", "API_KEY"]

    # ── load previous state ──────────────────────────────────────────
    if os.path.exists(state_file):
        with open(state_file, 'r') as f:
            previous_state = json.load(f)
    else:
        previous_state = {}

    current_state = {}
    changed_files = []
    new_files     = []
    deleted_files = []

    all_current_paths = set()

    # ── scan all files ───────────────────────────────────────────────
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            if (
                file in ignore_files
                or file.startswith(output_prefix)
                or file.endswith('.py')
                or file.startswith(ignore_env_prefix)
                or file == state_file
            ):
                continue

            file_path = os.path.join(root, file)
            file_hash = get_file_hash(file_path)
            if file_hash is None:
                continue

            all_current_paths.add(file_path)
            current_state[file_path] = file_hash

            if file_path not in previous_state:
                new_files.append(file_path)
            elif previous_state[file_path] != file_hash:
                changed_files.append(file_path)

    for path in previous_state:
        if path not in all_current_paths:
            deleted_files.append(path)

    # ── nothing changed ──────────────────────────────────────────────
    if not changed_files and not new_files and not deleted_files:
        print("✅ No changes detected. Nothing to send.")
        return

    # ── build one formatted string per changed file ──────────────────
    file_chunks = []

    # deleted notice (text only, no file content)
    if deleted_files:
        deleted_text = "DELETED FILES:\n" + "\n".join(f"  ❌ {p}" for p in deleted_files)
        file_chunks.append(deleted_text)

    for label, file_list in [("NEW", new_files), ("MODIFIED", changed_files)]:
        for file_path in file_list:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                lines    = content.splitlines()
                filtered = [
                    line for line in lines
                    if not any(kw in line.upper() for kw in secret_keywords)
                ]
                content = "\n".join(filtered)

                chunk = (
                    f"[{label}] --- FILE: {file_path} ---\n"
                    f"{content}\n"
                    f"--- END OF {file_path} ---\n"
                )
                file_chunks.append(chunk)

            except Exception as e:
                file_chunks.append(f"[{label}] --- FILE: {file_path} [READ ERROR: {e}] ---\n")

    # ── distribute into exactly 20 buckets ──────────────────────────
    buckets = [[] for _ in range(20)]
    for i, chunk in enumerate(file_chunks):
        buckets[i % 20].append(chunk)

    for i in range(20):
        filename = f"{output_prefix}_{i+1:02d}.txt"
        with open(filename, 'w', encoding='utf-8') as out:
            out.write(f"TS CHANGES PART {i+1} of 20\n")
            out.write("=" * 30 + "\n")
            out.write("".join(buckets[i]))
        print(f"📦 Created: {filename}")

    # ── save new state ────────────────────────────────────────────────
    with open(state_file, 'w') as f:
        json.dump(current_state, f, indent=2)

    print(f"\n📊 Summary:")
    print(f"   🆕 New:      {len(new_files)} files")
    print(f"   ✏️  Modified: {len(changed_files)} files")
    print(f"   ❌ Deleted:  {len(deleted_files)} files")
    print(f"   💾 State saved to {state_file}")


if __name__ == "__main__":
    bundle_changed_files()