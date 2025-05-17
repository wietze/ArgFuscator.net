@Modifier.AddArgument("RegexMatch", "text-s", "Regex Match", "The regex string to find")
@Modifier.AddArgument("RegexReplace", "text-s", "Regex Replace", "The replacement string")
@Modifier.AddArgument("CaseSensitive", "checkbox", "Case sensitive", "")
@Modifier.Register("Regex", "Apply a regex-replace operation (on token-level).", ['argument', 'value', 'path', 'url'])
class Regex extends Modifier {
    private readonly RegexMatch: RegExp;
    private readonly RegexReplace: string;
    constructor(InputCommand: Token[], ApplyTo: string[], Arguments: Argument[], Probability: string, RegexMatch: string, RegexReplace: string, CaseSensitive: boolean) {
        super(InputCommand, ApplyTo, Arguments, Probability);
        if (!RegexMatch)
            throw Error("No regex string provided")

        try {
            this.RegexMatch = new RegExp(RegexMatch, CaseSensitive ? "" : "i");
        } catch {
            throw Error("Regex could not be compiled.")
        }
        this.RegexReplace = RegexReplace;
    }

    GenerateOutput(): void {
        let This = this;
        this.InputCommandTokens.forEach(Token => {
            var NewTokenContent: string = Token.GetStringContent();

            if (This.IncludedTypes.includes(Token.GetType()) && Modifier.CoinFlip(this.Probability) && NewTokenContent.match(this.RegexMatch)) {
                let RexReplace = this.RegexReplace.replace(new RegExp('\\$(\\d+)\\[(\\d+):(\\d+(?:-(?:\\d+)?)?)\\]'), (x, rIndex, start, end) => {
                    let match = NewTokenContent.match(this.RegexMatch)[rIndex];
                    if (end.indexOf('-') >= 0) {
                        let ids = end.split('-')
                        if (!ids[1]) ids[1] = match.length;
                        let choices = Array.from(new Array(parseInt(ids[1])), (x, i) => i + parseInt(ids[0]));
                        end = Modifier.ChooseRandom(choices)
                    }
                    return match.substring(start, end)
                })

                RexReplace = RexReplace.replace(/\$RANDOM/g, Modifier.RandomString(Modifier.ChooseRandom(Array.from(Array(20).keys())) + 1));
                NewTokenContent = NewTokenContent.replace(this.RegexMatch, RexReplace)
            }
            Token.SetContent(NewTokenContent.split(""))
        })
    }
}
