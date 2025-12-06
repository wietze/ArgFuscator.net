type Char = String;

class Token {
    private ConfigElement: HTMLElement;
    private OutputElement: HTMLElement;
    private Type: string;
    private TokenContentOriginal: Char[];
    private TokenContent: Char[];
    private ContextMenu: HTMLMenuElement;
    private ClickHandler: (evt:Event) => void;
    private TokenTypes: Record<string, string>;
    public HasValue: boolean;

    constructor(TokenContent: Char[], HasValue: boolean = false) {
        this.TokenContent = this.TokenContentOriginal = TokenContent;
        this.Type = "argument";
        this.TokenTypes = {}
        this.HasValue = HasValue;
        Array.from(document.querySelector('menu').children).forEach((x: HTMLLIElement) => this.TokenTypes[x.dataset.type] = x.innerText);
    }

    public SetElements(ConfigElement: HTMLElement | null, OutputElement: HTMLElement) {
        // Set elements accordingly
        this.ConfigElement = ConfigElement;
        this.OutputElement = OutputElement;
        this.ConfigElement?.addEventListener("click", e => this.HandleClick(e));

        // Create new Context Menu
        this.ContextMenu = document.getElementsByClassName("ctx")[0].cloneNode(true) as HTMLMenuElement;

        // Add event listeners to Context Menu children
        this.ContextMenu.childNodes.forEach(x => { x.addEventListener("click", e => this.HandleContextClick(e)); });

        // Finally, (re)set this token's content and type, so it gets reflected in the Config/Output Elements
        this.SetContent(this.TokenContent, false);
        this.SetType(this.Type);

        this.ConfigElement?.parentElement.appendChild(this.ContextMenu);
    }

    public GetContent(): Char[] {
        return this.TokenContent.slice();
    }

    public GetStringContent(): string {
        return this.TokenContent.join("");
    }

    public SetContent(Content: Char[], OutputOnly: boolean = true): void {
        this.TokenContent = Content;
        if (this.OutputElement){
            this.OutputElement.textContent = this.TokenContent.join('');
            this.OutputElement.className = this.TokenContent.length > 0 ? '' : 'hidden';
        }
        if (!OutputOnly && this.ConfigElement)
            this.ConfigElement.textContent = this.OutputElement.textContent;
    }

    public Reset(): void {
        this.SetContent(this.TokenContentOriginal);
    }

    public SetType(Type: string): void {
        this.Type = Type;
        if (this.ConfigElement){
            this.ConfigElement.dataset.type = Type;
            this.ConfigElement.title = `This token is currently marked as '${this.TokenTypes[this.Type]}'.`;
        }
        if (this.ContextMenu)
            Array.from(this.ContextMenu.children).forEach(x => { var element = x as HTMLElement; element.dataset.active = element.dataset.type == Type ? 'true' : ''; })
    }

    public GetType(): string {
        return this.Type;
    }

    public HandleContextClick(evt: Event): void {
        var Element = evt.currentTarget as HTMLElement;
        this.SetType(Element.dataset.type);
        // Emulate click on Config Element to close the context menu
        this.ConfigElement.dispatchEvent(new Event("click"));
    }

    public HandleClick(evt: Event): void {
        if (this.ContextMenu.style.display != "block") {
            this.ContextMenu.style.display = "block";
            SetPosition(evt.currentTarget as HTMLDivElement, this.ContextMenu);

            // Add event listener for clicking 'outside' context menu
            this.ClickHandler = (evt: Event) => {
                if (!this.ContextMenu.contains(evt.target as HTMLElement) && !this.ConfigElement.contains(evt.target as HTMLElement)) {
                    this.ConfigElement.dispatchEvent(new Event("click")); // Emulate click to close the context menu
                }
            }
            window.addEventListener('mousedown', this.ClickHandler);
        } else {
            this.ContextMenu.style.display = "none";
            if(this.ClickHandler)
                window.removeEventListener('mousedown', this.ClickHandler); // Remove handler, no need to keep listening anymore
        }
    }
}
