import glob
import json
import os
import subprocess
import sys

import yaml

PATTERN_INPUT = 'gui/assets/models/*.json'
PATTERN_OUTPUT = 'gui/_executables/*.md'
ENCODING = 'utf-8'

# Create directories
folder = os.path.split(PATTERN_OUTPUT)[0]
subprocess.call(['rm', '-r', folder])
os.makedirs(folder)

# Iterate over JSON files
error = 0
prefix = PATTERN_INPUT.split("*",1)[0]
for model_json in glob.glob(PATTERN_INPUT):
    # Prepare JSON file path
    model_yaml = PATTERN_OUTPUT.replace('*', os.path.splitext(model_json[len(prefix):])[0])

    if not os.path.exists(folder := os.path.dirname(model_yaml)):
        os.makedirs(folder, exist_ok=True)

    try:
        with open(model_json, encoding=ENCODING) as path_json:
            # Load JSON contents
            content = json.load(path_json)
            with open(model_yaml, 'wb') as path_yaml:
                # Write YAML output with required parameters
                path_yaml.write(yaml.safe_dump(content, indent=4, allow_unicode=False, encoding='utf-8', sort_keys=False, explicit_start=True))
                path_yaml.write(b'---\n')
    except Exception as e:
        print(f"Could not process {model_json}: {e}", file=sys.stderr)
        error = 1

sys.exit(error)
