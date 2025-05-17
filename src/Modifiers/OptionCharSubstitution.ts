@Modifier.AddArgument("OutputOptionChars", "text-a", "Possible option chars", "All possible option chars here, without separator")
@Modifier.Register("Option Char Substitution", "Replace option characters, such as '/' or '-' with acceptable alternatives.", ['argument'])
class OptionCharSubstitution extends Modifier {
    private OutputOptionChars: Char[];

    constructor(InputCommand: Token[], ApplyTo: string[], Arguments: Argument[], Probability: string, OutputOptionChars: string | null) {
        super(InputCommand, ApplyTo, Arguments, Probability);
        if (OutputOptionChars == null || OutputOptionChars.length == 0)
            throw Error(`Unexpected OutputOptionChars length (expecting at least 1, found ${OutputOptionChars?.length})`);

        this.OutputOptionChars = OutputOptionChars.split('').map(x => x as String as Char);
    }

    GenerateOutput(): void {
        var This = this;
        this.InputCommandTokens.forEach(Token => {
            var NewTokenContent: Char[] = Token.GetContent();

            if (This.IncludedTypes.includes(Token.GetType()) && This.OutputOptionChars.some(x => x == (NewTokenContent[0] as string)) && (NewTokenContent.length == 1 || !This.OutputOptionChars.some(x => x == (NewTokenContent[1] as string))) && Modifier.CoinFlip(This.Probability)) {
                NewTokenContent[0] = Modifier.ChooseRandom(This.OutputOptionChars.filter(x => x !== NewTokenContent[0]));
                Token.SetContent(NewTokenContent);
            }
        });
    }
}
