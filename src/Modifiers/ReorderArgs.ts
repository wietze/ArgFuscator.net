@Modifier.AddArgument("CombineShortForm", "checkbox", "Combine flag options", "")
@Modifier.AddArgument("RandomiseOrder", "checkbox", "Randomise order of flags", "")
@Modifier.AddArgument("SwapLongShortForm", "checkbox", "Swap long-form arguments for short-form equivalents and vice versa", "")
@Modifier.Register("Reorder Arguments", "Change the order and/or form of certain short- and long-form arguments.", ['argument'])
class ReorderArgs extends Modifier {
    private CombineShortForm: boolean;
    private SwapLongShortForm: boolean;
    private RandomiseOrder: boolean;

    constructor(InputCommand: Token[], ApplyTo: string[], Arguments: Argument[], Probability: string, CombineShortForm: boolean, RandomiseOrder: boolean, SwapLongShortForm: boolean) {
        super(InputCommand, ApplyTo, Arguments, Probability)
        this.CombineShortForm = CombineShortForm
        this.SwapLongShortForm = SwapLongShortForm
        this.RandomiseOrder = RandomiseOrder

        if(Arguments?.length == 0)
            logUserError("arguments-error", `Cannot apply Reorder Arguments modifier: no known command-line arguments specified.`, true);
    }

    private IsMergeable = (Token: Token) => this.IncludedTypes.includes(Token.GetType()) && Token.GetStringContent().match(/^-[^-]$/) && !Token.HasValue;
    private IsValueMergeable = (Token: Token) => this.IncludedTypes.includes(Token.GetType()) && Token.GetStringContent().match(/^-[^-]$/) && Token.HasValue;

    GenerateOutput(): void {
        var This = this;

        if (this.RandomiseOrder) {
            let tokens = this.InputCommandTokens.filter(x => this.IncludedTypes.includes(x.GetType()) && !x.HasValue);

            let shuffleable = tokens.map(x => x.GetContent()).slice()
            Modifier.Shuffle(shuffleable)

            let i = 0;
            tokens.forEach((Token) =>
                Token.SetContent(shuffleable[i++])
            )
        }

        if (this.SwapLongShortForm) {
            this.InputCommandTokens.forEach((Token) => {
                let FoundArguments = this.Arguments?.filter(y => y.Arguments && y.Arguments.some(z => z == Token.GetStringContent())).map(y => y.Arguments.filter(z => z !== Token.GetStringContent()))
                if (FoundArguments.length > 0 && FoundArguments[0].length > 0 && Modifier.CoinFlip(this.Probability)) {
                    Token.SetContent(Modifier.ChooseRandom(FoundArguments[0]).split(''));
                }
            })
        }

        if (this.CombineShortForm) {
            this.InputCommandTokens.forEach((Token, index) => {
                // Check if this is one of the mergeable tokens, and with probability merge it
                if (This.IsMergeable(Token)) {
                    // Find all upcoming mergable tokens
                    let candidates = this.InputCommandTokens.slice(index + 1).filter(t => This.IsMergeable(t) && Modifier.CoinFlip(This.Probability))

                    // Create brand new token with the found one, plus all upcoming ones
                    let newContent = Token.GetContent()
                    candidates.forEach(x => {
                        newContent.push(...x.GetContent().slice(1))
                        x.SetContent([]) // Ensures token is 'removed'
                    })

                    //Find short-form arguments that DO have a value; we can pick at most one, and only add them to the end.
                    let valueCandidates: [Token, Token][] = this.InputCommandTokens.slice(index + 1).map((t, i, a) => [t, (i + 1) < a.length ? a[i + 1] : null]);
                    valueCandidates = valueCandidates?.filter((t) => This.IsValueMergeable(t[0]) && t[1] !== null && Modifier.CoinFlip(This.Probability))
                    if (valueCandidates.length > 0) {
                        let valueCandidate = Modifier.ChooseRandom(valueCandidates)
                        newContent.push(...valueCandidate[0].GetContent().slice(1))
                        valueCandidate[0].SetContent([])
                        newContent.push(...valueCandidate[1].GetContent())
                        valueCandidate[1].SetContent([])
                    }

                    // Update current token
                    Token.SetContent(newContent)
                }
            })


            // Second pass: merge left-over short-form arguments that have a value
            this.InputCommandTokens.forEach((Token, index) => {
                // Check if this is one of the mergeable tokens, and with probability merge it
                if (This.IsValueMergeable(Token) && (index + 1) < This.InputCommandTokens.length && Modifier.CoinFlip(This.Probability)) {
                    let newContent = Token.GetContent()
                    newContent.push(...this.InputCommandTokens[index + 1].GetContent())
                    this.InputCommandTokens[index + 1].SetContent([])
                    Token.SetContent(newContent)
                }
            })
        }
    }
}
