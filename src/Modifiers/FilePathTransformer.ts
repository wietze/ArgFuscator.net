@Modifier.AddArgument("PathTraversal", "checkbox", "Path traversal", "")
@Modifier.AddArgument("SubstituteSlashes", "checkbox", "Transform slashes", "")
@Modifier.AddArgument("ExtraSlashes", "checkbox", "Extra slashes", "")
@Modifier.AddArgument("ValidFilePaths", "checkbox", "Referenced folders must exist", "")
@Modifier.Register("File Path Transformer", "Change the format in which file paths are represented.", ['path'])
class FilePathTransformer extends Modifier {

    private PathTraversal: boolean;
    private SubstituteSlashes: boolean;
    private ExtraSlashes: boolean;
    private ValidFilePaths: boolean;
    private readonly Keywords: string[] = ["debug", "system32", "compile", "winsxs", "temp", "update"];
    private readonly KeywordsNix: string[] = ["/bin", "/usr/bin", "/usr/sbin", "/etc", "/var", "/var/log", "/var/lib", "/tmp", "/home", "/proc", "/sys", "/usr/libexec", "/usr/share", "/usr/local", "/usr/local/bin", "/usr/local/lib", "/usr/local/share", "/var/spool",  "/var/local"]

    constructor(InputCommand: Token[], ApplyTo: string[], Arguments: Argument[], Probability: string, PathTraversal: boolean, SubstituteSlashes: boolean, ExtraSlashes: boolean, ValidFilePaths:boolean) {
        super(InputCommand, ApplyTo, Arguments, Probability);

        this.PathTraversal = PathTraversal;
        this.SubstituteSlashes = SubstituteSlashes;
        this.ExtraSlashes = ExtraSlashes;
        this.ValidFilePaths = ValidFilePaths;
    }

    GenerateOutput(): void {
        var This = this;
        this.InputCommandTokens.forEach(Token => {
            var NewTokenContent: string = Token.GetStringContent();

            if (This.IncludedTypes.includes(Token.GetType())) {
                // Path Traversal
                if (This.PathTraversal) {
                    if(!This.ValidFilePaths){
                        NewTokenContent = NewTokenContent.replace(/([^\\/])([\\/])([^\\/])/g, (match, a, b, c) => {
                            let repeats = b;
                            let i = 0;
                            let options = This.Keywords.map(x => `${x}${b}..${b}`)
                            options.push(`.${b}`)
                            do {
                                repeats += Modifier.ChooseRandom(options);
                                i++;
                            } while (Modifier.CoinFlip(This.Probability * (0.9 ** i)));
                            return Modifier.CoinFlip(This.Probability) ? `${a}${repeats}${c}` : match;
                        });
                    } else {
                        if(NewTokenContent.startsWith("/")){
                            let prefix = Modifier.ChooseRandom(This.KeywordsNix)
                            let depth = prefix.split("").filter(x => x == "/").length
                            NewTokenContent = prefix + ("/..".repeat(depth)) + NewTokenContent
                        }
                    }
                }

                // Substitute Slashes
                if (This.SubstituteSlashes) {
                    NewTokenContent = NewTokenContent.replace(/(?<!:)(?:[/]+|[\\]+)/g, function (a, i) {
                        // index must be greater than 0 (to avoid transforming the first two backslashes on e.g. "\\share\file\path.txt")
                        if (Modifier.CoinFlip(This.Probability) && i > 0) return (a.startsWith("\\") ? "/" : "\\").repeat(a.length)
                        return a;
                    });
                }

                // Extra Slashes
                if (This.ExtraSlashes && Modifier.CoinFlip(This.Probability)) {
                    NewTokenContent = NewTokenContent.replace(/([^\\/])([\\/])([^\\/])/g, (match, a, b, c) => {
                        let repeats = b;
                        let i = 0;
                        do {
                            repeats += b;
                            i++;
                        } while (Modifier.CoinFlip(This.Probability * (0.9 ** i)));
                        return Modifier.CoinFlip(This.Probability) ? `${a}${repeats}${c}` : match;
                    });
                }

                Token.SetContent(NewTokenContent.split(""));
            }
        });
    }
}
