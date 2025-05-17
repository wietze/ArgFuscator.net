@Modifier.AddArgument("SedStatements", "textarea", "Sed statements", "Sed replacement statements, one per line, e.g.:\ns/xx/yy/ to replace xx with yy\ns/xx/yy/i to replace xx with yy, case insensitively\ns/xx/yy|zz/ to replace xx with either yy or zz (at random)")
@Modifier.Register("Sed replacements", "Apply a sed-style replace operation (on token-level).", ['argument', 'value'])
class Sed extends Modifier {
    private readonly SedStatements: SedStatement[];

    constructor(InputCommand: Token[], ApplyTo: string[], Arguments: Argument[], Probability: string, SedStatements: string) {
        super(InputCommand, ApplyTo, Arguments, Probability);
        this.SedStatements = [];
        if (!SedStatements)
            throw Error("No sed statements string provided")

        SedStatements.split('\n').forEach(x => {
            try {
                if (x) this.SedStatements.push(new SedStatement(x))
            } catch {
                let token_code = document.createElement("code")
                token_code.innerText = x
                logUserError("sed-compile-error", `Could not compile sed statement ${token_code.outerHTML}.`, true)
            }
        })

    }

    GenerateOutput(): void {
        let This = this;
        this.InputCommandTokens.forEach(Token => {
            var NewTokenContent: string = Token.GetStringContent();

            if (This.IncludedTypes.includes(Token.GetType())) {
                let matches = this.SedStatements.filter(x => x.StringIndex(NewTokenContent) >= 0);


                matches.forEach(match => {
                    let instance = match.StringIndex(NewTokenContent);
                    while (instance >= 0) {
                        let replacement = Modifier.ChooseRandom(match.Replace);
                        if (Modifier.CoinFlip(this.Probability)) {
                            NewTokenContent = NewTokenContent.substring(0, instance) + replacement + NewTokenContent.substring(instance + match.Find.length);
                        }
                        instance = NewTokenContent.indexOf(match.Find, instance + replacement.length + 1);
                    }

                });
                Token.SetContent(NewTokenContent.split(""))
            }
        });
    }
}
