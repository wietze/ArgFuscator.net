import glob
import json
import os
import sys

import pydantic
import structure

for file in sorted(glob.glob('models/**/*')):
    try:
        file_path = file.rstrip(os.sep).split(os.sep)

        if not file_path[-1].endswith(".json"):
            raise ValueError(f"Unexpected extension for file `{file}`")

        try:
            with open(file) as f:
                data = json.load(f)
        except:
            raise ValueError(f"Could not parse JSON of file `{file}`, please check your syntax")

        parsed = structure.Model.model_validate(data, strict=False, context=pydantic.ConfigDict(extra="forbid"))

        # Check if file was placed in correct folder based on declared OS
        for profile in parsed.profiles:
            if profile.operatingSystem in ["Windows", "macOS"]:
                assert profile.operatingSystem.lower() == file_path[-2], f"File with declared operating system {profile.operatingSystem} was not in expected folder"
            else:
                assert file_path[-2] == 'linux', f"File with declared operating system {profile.operatingSystem} was not in expected `linux` folder"

        print(f"✅ {file} validated successfully")

    except Exception as e:
        print(f"❌ {file} had validation errors", file=sys.stderr)
        raise e
