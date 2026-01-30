import glob
import itertools
import json
import os
import subprocess
from typing import Any
import sys

import yaml

PATTERN_INPUT = 'gui/assets/models/*.json'
PATTERN_OUTPUT = 'gui/_executables/*.md'
ENCODING = 'utf-8'

# Create directories
folder = os.path.split(PATTERN_OUTPUT)[0]
subprocess.call(['rm', '-r', folder])
os.makedirs(folder)

def add_id(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    for i, entry in enumerate(entries):
        entry['profileID'] = i

    return entries

# Iterate over JSON files
error = 0
prefix = PATTERN_INPUT.split("*",1)[0]
for model_json in glob.glob(PATTERN_INPUT):
    # Prepare JSON file path
    model_yaml = PATTERN_OUTPUT.replace('*', f'{{profile}}{os.sep}{os.path.splitext(model_json[len(prefix):])[0]}')

    try:
        with open(model_json, encoding=ENCODING) as path_json:
            # Load JSON contents
            content = json.load(path_json)
            for platform, profiles in itertools.groupby(sorted(add_id(content['profiles']), key=lambda x: x['platform']), lambda x: x['platform']):
                if not os.path.exists(folder := os.path.dirname(model_yaml.format(profile=platform))):
                    os.makedirs(folder, exist_ok=True)

                with open(model_yaml.format(profile=platform), 'wb') as path_yaml:
                    # Write YAML output with required parameters
                    path_yaml.write(yaml.safe_dump({"entries": list(profiles)}, indent=4, allow_unicode=False, encoding='utf-8', sort_keys=False, explicit_start=True))
                    path_yaml.write(b'---\n')
    except Exception as e:
        print(f"Could not process {model_json}: {e}", file=sys.stderr)
        error = 1

sys.exit(error)
