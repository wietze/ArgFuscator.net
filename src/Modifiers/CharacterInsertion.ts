@Modifier.AddArgument("Characters", "text-a", "Accepted Characters", "Paste all characters, without separators, here")
@Modifier.AddArgument("Offset", "number", "Offset", "The positions up to this index (zero-based, exclusive) will not be used for character insertion. Default: 0")
@Modifier.Register("Character Insertion", "Add arbitrary characters to command-line arguments.", ['argument'])
class CharacterInsertion extends Modifier {
    private CharacterInsertRange: Char[];
    private Offset: number;

    constructor(InputCommand: Token[], ApplyTo: string[], Arguments: Argument[], Probability: string, Characters: string, Offset: number) {
        super(InputCommand, ApplyTo, Arguments, Probability);

        // Parse character ranges
        if (Characters == null || Characters.length == 0)
            throw Error("Invalid value passed for 'Characters'");

        if (Offset < 0)
            throw Error("Cannot use an offset of smaller than 0")
        this.Offset = Offset || 0;

        this.CharacterInsertRange = Characters.split('').map(x => x as String as Char);
    }

    GenerateOutput(): void {
        var This = this;
        this.InputCommandTokens.forEach(function (Token: Token) {
            var NewTokenContent: Char[] = Token.GetContent().slice(0, This.Offset);
            var lastChar = Modifier.CommonOptionChars.some(y => Token.GetContent()[0] == y) && Modifier.ValueChars.some(y => Token.GetContent().reverse()[0] == y) ? Token.GetContent().length - 1 : undefined;

            Token.GetContent().slice(This.Offset, lastChar).forEach(char => {
                // Add current char to result string
                NewTokenContent.push(char);

                // Ensure (a) char is not excluded
                //        (b) probability tells us we will insert a char from the range
                var i = 0;
                if (This.IncludedTypes.includes(Token.GetType()) && Modifier.CoinFlip(This.Probability))
                    do {
                        NewTokenContent.push(Modifier.ChooseRandom(This.CharacterInsertRange));
                        i++;
                    } while (Modifier.CoinFlip(This.Probability * (0.9 ** i)));
            });

            if (lastChar !== undefined)
                NewTokenContent.push(...Token.GetContent().slice(lastChar))

            Token.SetContent(NewTokenContent);
        });
    }
}
