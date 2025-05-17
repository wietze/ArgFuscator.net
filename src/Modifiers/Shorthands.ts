//@Modifier.AddArgument("ShorthandCommands", "textarea", "Commands that can be shortened", "Enter ALL commands that can be shortened here (comma separated).\ne.g. enter 'test' if 'tes', 'te', 't' are also accepted.\nShould there be commands that start with the same letters, this will be taken into account when generating alternatives.")
@Modifier.AddArgument("CaseSensitive", "checkbox", "Case sensitive", "")
@Modifier.Register("Shorthands", "Allow certain commands to be shortened.", ['argument'])
class Shorthands extends Modifier {
    private static readonly Separator = ",";
    private Substitutions: Map<string, string[]> = new Map();
    private CaseSensitive: boolean;

    private static NormaliseArgument(input: string, CaseSensitive: boolean, strip_option_char: boolean = true): string {
        let result = input;
        if (strip_option_char && Modifier.CommonOptionChars.some(x => input.startsWith(x.toString())))
            result = input.substring(1);

        if (!CaseSensitive)
            result = result.toLocaleLowerCase();

        return result
    }

    constructor(InputCommand: Token[], ApplyTo: string[], Arguments: Argument[], Probability: string, CaseSensitive: boolean) {
        super(InputCommand, ApplyTo, Arguments, Probability);

        if(Arguments?.length == 0)
            logUserError("arguments-error", `Cannot apply Shorthands modifier: no known command-line arguments specified.`, true);

        try {
            let This = this;

            let args = Arguments.map(x => x.Arguments).flat()
            let commands = new Set(args.map(x => Shorthands.NormaliseArgument(x, CaseSensitive)));
            this.CaseSensitive = CaseSensitive;

            commands.forEach(command => {
                let suffix = Modifier.ValueChars.includes(command.charAt(command.length - 1)) ? command.charAt(command.length - 1) : "";
                // Skip commands that cannot be shortened
                if (command.length <= 1) return;

                // Create a deduplicated array of commands that excludes the current one
                let commands_other_s = new Set(commands)
                commands_other_s.delete(command)
                let commands_other_a = Array.from(commands_other_s);

                // Find collisions with other commands
                for (var i = 1; i < command.length; i++) {
                    let command_shortened = command.substring(0, i);
                    if (commands_other_a.every(command_test => command_test.substring(0, i) !== command_shortened)) {
                        // At this stage, we have found the minimum number of letters the command should have to be 'unique' amongst the provided commands
                        // Create a substitution entry with an array of possible options
                        let options = Array.from({ length: command.length - i }, (_, j) => command.substring(0, i + j) + suffix)
                        This.Substitutions.set(command, options);
                        options.forEach(option => This.Substitutions.set(option, options))
                        break;
                    }
                }
            })
        }
        catch (e) {
            logUserError("shorthand-error", `Could not compute shorthand permutations.`, true);
            throw e;
        }

    }

    GenerateOutput(): void {
        var This = this;
        this.InputCommandTokens.forEach(Token => {
            if (This.IncludedTypes.includes(Token.GetType()) && Modifier.CoinFlip(This.Probability)) {
                let token = Shorthands.NormaliseArgument(Token.GetStringContent(), This.CaseSensitive)
                if (This.Substitutions.has(token)) {
                    let original_token = Shorthands.NormaliseArgument(Token.GetStringContent(), This.CaseSensitive, false);
                    Token.SetContent(original_token.replace(token, Modifier.ChooseRandom(This.Substitutions.get(token))).split(""));
                }
            }
        });
    }
}
