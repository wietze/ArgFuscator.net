class Argument {
    public Arguments: string[];
    public ValueCount: number;

    constructor(Arguments: string[], ValueCount:number) {
        this.Arguments = Arguments;
        this.ValueCount = ValueCount || 0;
    }
}
