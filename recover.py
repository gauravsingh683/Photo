import json
import os

transcript_path = r"C:\Users\DELL\.gemini\antigravity\brain\cf26ce9f-dd5e-48d0-84da-37275c05f20a\.system_generated\logs\transcript_full.jsonl"
out_dir = r"C:\Photo"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] == 'write_to_file':
                        args = call['args']
                        target_file = args.get('TargetFile', '')
                        if 'booth-app' in target_file or target_file.endswith('.ps1') or 'booth-ui' in target_file:
                            content = args.get('CodeContent', '')
                            # Write it out
                            os.makedirs(os.path.dirname(target_file), exist_ok=True)
                            with open(target_file, 'w', encoding='utf-8') as out_f:
                                out_f.write(content)
                                print(f"Recovered {target_file}")
                    
                    elif call['name'] == 'multi_replace_file_content':
                        args = call['args']
                        target_file = args.get('TargetFile', '')
                        if 'booth-app' in target_file or target_file.endswith('.ps1') or 'booth-ui' in target_file:
                            # Apply replacements
                            if os.path.exists(target_file):
                                with open(target_file, 'r', encoding='utf-8') as rf:
                                    content = rf.read()
                                for chunk in args.get('ReplacementChunks', []):
                                    target = chunk.get('TargetContent', '')
                                    repl = chunk.get('ReplacementContent', '')
                                    content = content.replace(target, repl)
                                with open(target_file, 'w', encoding='utf-8') as out_f:
                                    out_f.write(content)
                                print(f"Applied patch to {target_file}")
        except Exception as e:
            pass
