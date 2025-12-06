function TokenEquals(array1: Token, array2: Token): boolean {
    return array1.GetContent().length === array1.GetContent().length && array1.GetContent().every(function (value, index) { return CharEquals(value, array1.GetContent()[index]); })
}

function CharEquals(char1: Char, char2: Char): boolean {
    return char1.toString() == char2.toString();
}

class ModifierDefinition {
    public Name: string;
    public Description: string;
    public DefaultIncludedTypes: string[];
    public Arguments: ModifierArgumentsDefinition[] = [];
    public Function: Function;
    public constructor(init?: Partial<ModifierDefinition>) {
        Object.assign(this, init);
    }
}

class ModifierArgumentsDefinition {
    public InternalName: string;
    public PublicName: string;
    public Description: string;
    public Type: string;
    public constructor(init?: Partial<ModifierArgumentsDefinition>) {
        Object.assign(this, init);
    }
}

abstract class Modifier {
    protected InputCommandTokens: Token[] = [];
    protected IncludedTypes: string[] = [];
    protected Probability: number;
    protected Arguments: Argument[];

    public static SeparationChar: Char = ' ' as String as Char;
    public static QuoteChars: Char[] = ['"' as String as Char, "'" as String as Char];
    public static ValueChars: Char[] = ['=' as String as Char, ':' as String as Char];
    public static CommonOptionChars: Char[] = ['/' as String as Char, '-' as String as Char];

    constructor(InputCommand: Token[], IncludedTypes: string[], Arguments: Argument[], Probability: string) {
        // Parse inputs
        this.InputCommandTokens = InputCommand
        this.IncludedTypes.push(...IncludedTypes);
        this.Arguments = Arguments;
        this.Probability = Modifier.ParseProbability(Probability);
    }

    protected static CoinFlip(probability: number): boolean {
        return Math.random() > 1 - probability;
    }

    protected static ChooseRandom<T>(options: Array<T>): T {
        return options[Math.floor(Math.random() * options.length)];
    }

    protected static RandomString(length: number): string {
        var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return [...Array(length)].reduce(a => a + p[~~(Math.random() * p.length)], '');
    }

    protected static Shuffle<T>(array: Array<T>, offset:number = 0) {
        for (let i = array.length - 1; i > offset; i--) {
            const j = offset + Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    protected static GetArgDetails(Arguments: Argument[], TokenContent: Char[]) : (Argument | null){
        let result = Arguments.filter(x => x.Arguments?.some(y => y === TokenContent.join("")))
        if(result && result.length > 0){
            return result[0];
        }
        return null;
    }

    public static CommandTokenise(InputCommand: string, Arguments: Argument[], FormatPicker: HTMLMenuElement): Token[] {
        if (InputCommand == null) return null;
        var InQuote: Char | null = null;
        var InOptionChar: boolean | null = null;
        var Tokens: Token[] = [];
        var TokenContent: Char[] = [];
        var SeenValueChar: boolean = false;
        for (var i = 0; i < InputCommand.length; i++) {
            if (TokenContent.length == 0) SeenValueChar = false;
            let Char: Char = new String(InputCommand[i]) as Char;
            InOptionChar = (TokenContent.length == 0 && Modifier.CommonOptionChars.some(y => y == Char)) ? true : InOptionChar;

            if (InQuote == null && (Char == this.SeparationChar || (!SeenValueChar && (i == InputCommand.length || !(['\\', '/'].some(x => x == InputCommand[i + 1]))) && this.ValueChars.some(x => x == Char)))) {
                if (Char != this.SeparationChar)
                    TokenContent.push(Char);

                if (Token.length > 0 && TokenContent.length > 0)
                    Tokens.push(new Token(TokenContent, Modifier.GetArgDetails(Arguments, TokenContent)?.ValueCount > 0));
                TokenContent = [] as Char[];
                InOptionChar = false;

            } else {
                if (InQuote != null && Char.toString() == InQuote?.toString())
                    InQuote = null;
                else if (InQuote == null && this.QuoteChars.some(x => x == Char))
                    InQuote = Char;

                TokenContent.push(Char);

                // Check for known argument match
                let a = Modifier.GetArgDetails(Arguments, TokenContent)
                if (TokenContent.length == 2 && a !== null) {
                    // Create existing find as new token
                    let t = new Token(TokenContent, a.ValueCount > 0);
                    Tokens.push(t);
                    TokenContent = [] as Char[];
                    InOptionChar = false;

                    // If we are NOT expecting a value and the next character is not a separation char, it will be another command
                    if (a.ValueCount == 0 && ((i+1) < InputCommand.length && InputCommand[i + 1] != this.SeparationChar))
                        TokenContent.push(Tokens[Tokens.length - 1].GetContent()[0])

                }
            }

            SeenValueChar = SeenValueChar || this.ValueChars.some(x => x == Char)
        }
        if (Token?.length > 0 && TokenContent.length > 0)
            Tokens.push(new Token(TokenContent, Modifier.GetArgDetails(Arguments, TokenContent)?.ValueCount > 0));

        // Find matching template, if available
        Tokens[0].SetType("command");

        if (document.getElementById("input-command")?.dataset.program !== undefined) {
            let expectedProgram = document.getElementById("input-command")?.dataset.program?.split(".")[0];
            if (!Tokens[0].GetStringContent().toLowerCase().includes(expectedProgram.toLowerCase())) {
                logUserError("unexpected-program", `Are you sure you pasted a valid <code>${expectedProgram}</code> command? To obfuscate the command-line arguments of other executables, click <a href="/">here</a>.`)
            }
        }

        if (FormatPicker != null) {
            let i = 0;
            let found = false;
            let token = Tokens[0].GetStringContent();

            if (token.includes('\\')) {
                let parts = token.split('\\');
                token = parts[parts.length - 1];
            }

            if (token.toLowerCase() == 'cmd.exe' || token.toLowerCase() == 'cmd') {
                let commandIndex = Tokens.findIndex((x) => x.GetStringContent().match(/^\/c$/i));

                if (commandIndex > 0) {
                    logUserError("pattern-cmd", '<code>cmd.exe</code> requires special obfuscation - please check out the <a href="https://github.com/danielbohannon/Invoke-DOSfuscation" target="_blank">Invoke-Dosfuscation project</a> for this! Below are the results for obfuscating the \'inner\' command.');
                    if (Tokens[commandIndex + 1].GetContent()[0] == '"') { // Argument is quoted
                        let command = Tokens[commandIndex + 1].GetStringContent()
                        return Modifier.CommandTokenise(command.slice(1, command.length - 1), Arguments, FormatPicker)
                    }
                    else // Argument is unquoted
                    {
                        return Modifier.CommandTokenise(Tokens.slice(commandIndex + 1).map(y => y.GetStringContent()).join(this.SeparationChar as string), Arguments, FormatPicker)
                    }
                } else {
                    logUserError("pattern-cmd-2", '<code>cmd.exe</code> requires special obfuscation - please checkout the <a href="https://github.com/danielbohannon/Invoke-DOSfuscation" target="_blank">Invoke-Dosfuscation project</a> for this!');
                }
            }

            FormatPicker?.childNodes.forEach(x => {
                if ([token.toLowerCase(), token.toLowerCase() + ".exe"].find(y => y == x.textContent.toLowerCase() || (x instanceof HTMLElement && y == x.dataset["alias"]?.toLowerCase()))) {
                    found = true;
                    x.dispatchEvent(new Event("click"));
                }
                i++;
            });

            // Special cases
            if (token.toLowerCase() == 'cmd.exe' || token.toLowerCase() == 'cmd')
                return;
            if (token.toLowerCase() == 'powershell.exe' || token.toLowerCase() == 'powershell' || token.toLowerCase() == 'pwsh.exe' || token.toLowerCase() == 'pwsh')
                logUserError("pattern-cmd", 'We will proceed with obfuscating the provided PowerShell command-line arguments, but not any PowerShell code, as this goes beyond the scope of this project - please checkout <a href="https://github.com/danielbohannon/Invoke-Obfuscation" target="_blank">Invoke-Obfuscation</a> for this!');

            if (!found) {
                let token_code = document.createElement("code")

                token_code.innerText = token.length > 20 ? (token.slice(0, 20) + "…") : token;
                token_code.title = token;

                logUserError("pattern-unknown", `It looks like this project is not aware of obfuscation options for ${token_code.outerHTML}. Create your own using the options panel below.`);
            }
        }
        Tokens.slice(1).forEach((x, i) => {
            let TokenText = x.GetStringContent();

            let _TokenText = TokenText.replace(/(['"])(.*?)\1/g, '$2') //Remove any surrounding quotes
            // If previous token ends with a ValueChar, assume this token denotes a 'value' type;
            // or, if no option char present, designate it as 'value', unless overwritten further down
            if (this.ValueChars.some(y => Tokens[i].GetContent().reverse()[0] == y) || !Modifier.CommonOptionChars.some(x => _TokenText.startsWith(x as string))) {
                x.SetType('value');

                // Special case: WMIC
                if (Tokens[0].GetStringContent().match(/wmic(\.exe)?/i)
                    && !Tokens.slice(1, 2 + i).some(x => x.GetType() == 'disabled')
                    && !(Tokens[i].GetType() == 'argument' && Modifier.ValueChars.some(x => Tokens[i].GetContent().reverse()[0] == x))
                ) {
                    x.SetType('disabled');
                }
            }

            if (_TokenText.match(/^(?:\\\\[^\\]+|[a-zA-Z]:|\.[\\/])((?:\\[^\\]+)+\\)?([^<>:]*)$/) || _TokenText.match(/^[^<>:]+\.[a-zA-Z0-9]{2,4}$/)) x.SetType('path'); // Windows file path format
            if (_TokenText.match(/^\/[a-zA-Z0-9-_ ]+\/[a-zA-Z0-9-_\/ ]+$/)) x.SetType('path'); // Linux file path format
            if (_TokenText == '-') x.SetType('path') // stdin
            if (_TokenText.match(/^(HKLM|HKCC|HKCR|HKCU|HKU|HKEY_(LOCAL_MACHINE|CURRENT_CONFIG|CLASSES_ROOT|CURRENT_USER|USERS))\\?/i)) x.SetType('disabled'); // Windows Registry
            if (_TokenText.startsWith('http:') || _TokenText.startsWith('https:') || _TokenText.match(/[12]?\d?\d\.[12]?\d?\d\.[12]?\d?\d\.[12]?\d?\d/)) x.SetType('url'); //URLs (including IP addresses)
        });
        return Tokens;
    }

    protected static ParseProbability(Probability: string): number {
        let ReturnProbability: number;
        // Parse probability
        if (Probability == null) ReturnProbability = 0.1;
        ReturnProbability = Number(Probability);
        if (ReturnProbability < 0 || ReturnProbability > 1)
            throw Error(`Unexpected Probability (expecting 0<=x<=1, found x=${ReturnProbability})`);
        return ReturnProbability;
    }

    abstract GenerateOutput(): void;

    public TestRun(InputCommand: string): string {
        let token = new Token(Array.from(InputCommand));
        //let output = document.createElement("span")
        //token.SetElements(null, output)
        token.SetType("dummy");

        this.IncludedTypes = ["dummy"]
        this.InputCommandTokens = [token]
        this.Probability = 0.05;
        while (true) {
            this.Probability *= 2;
            this.GenerateOutput();
            if (token.GetStringContent() != InputCommand)
                return token.GetStringContent()
            else if (this.Probability > 1) {
                //console.warn(`Exhausted ${InputCommand}`)
                return null;
            }
        }
    }

    private static Implementations: Record<string, ModifierDefinition> = {};

    public static Register = (Name: string, Description: string, DefaultIncludedTypes: string[]) => {
        return (target: Function) => {
            Modifier.Implementations[target.name] = new ModifierDefinition({ Name: Name, Description: Description, DefaultIncludedTypes: DefaultIncludedTypes, Function: target });
        }
    }

    public static AddArgument = (name: string, type: string, readableName: string, description: string) => {
        return (target: Function) => {
            if (!(target.name in Modifier.Implementations))
                throw Error(`Unexpected argument declaration for modifier ${target.name}`)
            let obj = Modifier.Implementations[target.name]
            if (obj.Function.toString().split('\n')[0].indexOf(name) <= -1) {
                throw Error(`Unexpected argument declaration for non-existing property ${name} on modifier ${target.name}`)
            }

            obj.Arguments.unshift(new ModifierArgumentsDefinition({ InternalName: name, Type: type, PublicName: readableName, Description: description }));
        }
    }

    public static GetAllModifiers(): Record<string, ModifierDefinition> {
        return Modifier.Implementations;
    }
}

type Constructor<T> = {
    new(...args: any[]): T;
    readonly prototype: T;
    name: string;
}
