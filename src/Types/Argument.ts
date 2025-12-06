class Argument {
    public Arguments: string[];
    public ValueCount: number;
    public Redundant: boolean;

    constructor(Arguments: string[], ValueCount:number, Redundant:boolean) {
        this.Arguments = Arguments;
        this.ValueCount = ValueCount || 0;
        this.Redundant = Redundant || false;
    }
}
