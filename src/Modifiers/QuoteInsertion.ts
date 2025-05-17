@Modifier.Register("Quote Insertion", "Add pairs of quotes to command-line arguments.", ['argument', 'path', 'url', 'value'])
class QuoteInsertion extends Modifier {
    private static QuoteCharacter: Char = new String("\"") as Char;
    private static AcceptableSuccessionChars: RegExp = /^[a-z0-9\-\/]$/i;

    constructor(InputCommand: Token[], ApplyTo: string[], Arguments: Argument[], Probability: string) {
        super(InputCommand, ApplyTo, Arguments, Probability);
    }


    private AddQuotes(input: Char[]): Char[] {
        var This = this;
        let result: Char[] = [];
        input.forEach((char, index) => {
            let nextChar = index + 1 < input.length ? input[index + 1] : "";

            result.push(char);
            if (QuoteInsertion.AcceptableSuccessionChars.test(char.toString()) && (nextChar == "" || QuoteInsertion.AcceptableSuccessionChars.test(nextChar.toString())) && Modifier.CoinFlip(This.Probability)) {
                result.push(QuoteInsertion.QuoteCharacter);
            }
        });

        // Make sure the number of added quotes was a multiple of two
        if (result.filter(x => x == QuoteInsertion.QuoteCharacter).length % 2 != input.filter(x => x == QuoteInsertion.QuoteCharacter).length % 2)
            result.splice(result.lastIndexOf(QuoteInsertion.QuoteCharacter), 1)

        return result;
    }


    GenerateOutput(): void {
        var This = this;
        this.InputCommandTokens.forEach(function (Token) {
            // Skip if excluded
            if (!This.IncludedTypes.includes(Token.GetType())) return;

            // Split by SeperationChar (required to make sure we don't add quotes in the wrong places)
            let parts = Token.GetStringContent().split(Modifier.SeparationChar.toString())

            // Generate new
            let NewTokenContent = Array.from(parts.map(part => This.AddQuotes(Array.from(part)).join('')).join(Modifier.SeparationChar.toString()));
            Token.SetContent(NewTokenContent);
            return;
        });
    }
}
