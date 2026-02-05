# ArgFuscator

ArgFuscator is an open-source, stand-alone web application that helps generate obfuscated command lines for common system-native executables across Windows, Linux, and macOS.

👉 **Use the interactive version of ArgFuscator on [ArgFuscator.net](https://argfuscator.net/)** 🚀

👾 _Find the offline, cross-platform PowerShell version on [wietze/Invoke-Argfuscator](https://www.github.com/wietze/Invoke-Argfuscator)._

## One-sentence pitch

Paste a valid command in [ArgFuscator](https://argfuscator.net/) and get a working, obfuscated command-line equivalent in return.

## Summary

Command-Line obfuscation ([T1027.010](https://attack.mitre.org/techniques/T1027/010/)) is the masquerading of a command's true intention through the manipulation of a process' command line. Across [Windows](https://www.wietzebeukema.nl/blog/windows-command-line-obfuscation), Linux, and macOS, many applications parse passed command-line arguments in unexpected ways, leading to situations in which insertion, deletion, and/or substitution of certain characters does not change the program's execution flow. Successful command-line obfuscation is likely to frustrate defensive measures such as AV and EDR software, in some cases completely bypassing detection altogether.

Although previous research has highlighted the risks of command-line obfuscation, mostly with anecdotal examples of vulnerable (system-native) applications, there is a knowledge vacuum surrounding this technique. This project aims to overcome this by providing a centralised resource that documents and demonstrates various command-line obfuscation techniques, and records the susceptibility of popular applications for each.

## Goal

The primary goal of this project is to document known command-line obfuscation techniques against applications commonly used in cyberattacks and use this knowledge to allow users to generate obfuscated command lines. For cybersecurity defenders, this provides a powerful tool to test one's own defence systems. Since detecting or otherwise accommodating for command-line obfuscation does not have to be difficult, having access to this resource allows for effective, real-world validation of defence mechanisms in one's environment.

## Coming about

First, through literature review and our own research, command-line obfuscation techniques were gathered, analysed, and classified. The identified techniques form the basis for the subsequent analysis.

Afterward, by assessing a wide variety of popular applications, both in [automated fashion](https://github.com/wietze/windows-command-line-obfuscation) and through manual inspection, a mapping between the defined techniques and vulnerable applications was created. The results are captured in a machine-readable format (see [`./models`](/models/)).

Thirdly, a system was created that allows for the transformation of an arbitrary command line using a sequence of defined obfuscation techniques in a provided configuration. To ensure ease of use, a TypeScript implementation was created (see [`./src`](/src/)) that is supported by a user-friendly web interface (see [`./gui`](/gui/)), which can interpret the aforementioned model files.

Finally, the models were tested against the created implementation in order to validate their correctness, which allows for the further tuning of the findings. The result is this project, encompassing the results of all stages.

## Local development

To run ArgFuscator yourself, follow these steps:

0. Prerequisites:
    1. Clone this repository;
    2. Install TypeScript (e.g., `apt install tsc`);
    3. Install [Jekyll](https://jekyllrb.com/docs/installation/).

1. From the main folder of this repository, run the following command:

   ```bash
   tsc -w --project src/ --outfile gui/assets/js/main.js
   ```

2. Copy and convert the models to serve them via Jekyll:

   ```bash
   cp -r models/ gui/assets/
   python3 -m pip install pyyaml
   python3 .github/workflows/json-transform.py
   ```

3. From the `gui/` folder, run:

   ```bash
   jekyll serve
   ```
