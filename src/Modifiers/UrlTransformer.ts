@Modifier.AddArgument("LeaveOutProtocol", "checkbox", "Omit Protocol", "")
@Modifier.AddArgument("LeaveOutDoubleSlashes", "checkbox", "Alternative Double Slashes (:// vs :/)", "")
@Modifier.AddArgument("SubstituteSlashes", "checkbox", "Transform Slashes", "")
@Modifier.AddArgument("IpToHex", "checkbox", "Alternate IP Form", "")
@Modifier.AddArgument("PathTraversal", "checkbox", "URL Path traversal", "")
@Modifier.Register("URL Transformer", "Change the format in which URLs are represented.", ['url'])
class UrlTransformer extends Modifier {
    private LeaveOutProtocol: boolean;
    private LeaveOutDoubleSlashes: boolean;
    private SubstituteSlashes: boolean;
    private IpToHex: boolean;
    private PathTraversal: boolean;
    private readonly Keywords: string[] = ["debug", "system32", "compile", "winsxs", "temp", "update"];

    constructor(InputCommand: Token[], ApplyTo: string[], Arguments: Argument[], Probability: string, LeaveOutProtocol: boolean, LeaveOutDoubleSlashes: boolean, SubstituteSlashes: boolean, IpToHex: boolean, PathTraversal: boolean) {
        super(InputCommand, ApplyTo, Arguments, Probability);

        this.Probability = Modifier.ParseProbability(Probability);

        this.LeaveOutProtocol = LeaveOutProtocol;
        this.LeaveOutDoubleSlashes = LeaveOutDoubleSlashes;
        this.SubstituteSlashes = SubstituteSlashes;
        this.IpToHex = IpToHex;
        this.PathTraversal = PathTraversal;
    }

    GenerateOutput(): void {
        var This = this;
        this.InputCommandTokens.forEach(Token => {
            var NewTokenContent: string = Token.GetStringContent();

            if (This.IncludedTypes.includes(Token.GetType())) {

                // Leave out protocol
                if (this.LeaveOutProtocol && Modifier.CoinFlip(this.Probability))
                    NewTokenContent = NewTokenContent.replace(/\w+:\/\//, "://");

                // Path Traversal
                if (This.PathTraversal) {
                    NewTokenContent = NewTokenContent.replace(/([^/])([/])([^/])/g, (match, a, b, c) => {
                        let repeats = b;
                        let i = 0;
                        let options = This.Keywords.map(x => `${x}${b}..${b}`)
                        //options.push(`.${b}`)
                        do {
                            repeats += Modifier.ChooseRandom(options);
                            i++;
                        } while (Modifier.CoinFlip(This.Probability * (0.9 ** i)));
                        return Modifier.CoinFlip(This.Probability) ? `${a}${repeats}${c}` : match;
                    });
                }

                // Change double slashes
                if (this.LeaveOutDoubleSlashes && Modifier.CoinFlip(this.Probability))
                    NewTokenContent = NewTokenContent.replace(/\:\/\//, ":/");

                // Substitute Slashes
                if (this.SubstituteSlashes) {
                    let match;
                    let regex = /\/+/g;
                    while ((match = regex.exec(NewTokenContent)) !== null) {
                        if (Modifier.CoinFlip(this.Probability))
                            NewTokenContent = NewTokenContent.substring(0, match.index) + ('\\'.repeat(match[0].length)) + NewTokenContent.substring(match.index + match[0].length, NewTokenContent.length)
                    }
                }
                // tmp_tokencontent.forEach((Char, index) => {
                //     if (this.SubstituteSlashes && Char == "/" && (index==0 || tmp_tokencontent[index-1] != "/") && Modifier.CoinFlip(this.Probability)){
                //         Char = "\\";
                //         if(tmp_tokencontent.length > index && tmp_tokencontent[index+1] == "/")
                //             tmp_tokencontent[index+1] == Char
                //     }
                //     NewTokenContent += Char;
                // });

                // IP Transform
                if (this.IpToHex && Modifier.CoinFlip(this.Probability)) {
                    let IpAddress = NewTokenContent.match('(?:[0-9]{1,3}\.){3}[0-9]{1,3}')
                    if (IpAddress != null && IpAddress.length > 0) {
                        let Decimals = IpAddress[0].split('.').map(Decimal => Number.parseInt(Decimal));
                        let Decimal = Decimals[3] + Decimals[2] * 256 + Decimals[1] * (256 ** 2) + Decimals[0] * (256 ** 3);
                        if (Modifier.CoinFlip(0.5))
                            NewTokenContent = NewTokenContent.replace(IpAddress[0], Decimal.toString(10));
                        else
                            NewTokenContent = NewTokenContent.replace(IpAddress[0], "0x" + Decimal.toString(16));
                    } //else
                      //  logUserError("ipv4-address", "No valid IPv4 IP address could be found (" + NewTokenContent + ").");
                }

                Token.SetContent(NewTokenContent.split(""));
            }
        });
    }
}
