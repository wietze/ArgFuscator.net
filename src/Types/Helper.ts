
function SetPosition(Parent: HTMLElement, ContextMenu: HTMLElement): void {
    var box = Parent.getBoundingClientRect()
    ContextMenu.style.top = `${Math.round(box.top - Parent.parentElement.getBoundingClientRect().top) + (box.height/2)}px`;
    ContextMenu.style.left = `${Math.round(box.left - Parent.parentElement.getBoundingClientRect().left)}px`
}

function ShowContextMenu(Element: HTMLElement, ClickElement: HTMLElement) {
    if (Element.style.display == "block") {
        Element.style.display = 'none';
        ClickElement.ariaExpanded = 'false';
        ClickElement.setAttribute('aria-activedescendant', "");
    } else {
        SetPosition(ClickElement, Element);
        Element.style.display = 'block';
        ClickElement.ariaExpanded = 'true';
        ClickElement.setAttribute('aria-activedescendant', Element.querySelector('li[aria-selected=true]')?.id || "");

        var ClickHandler = (evt: Event) => {
            var Target = evt.target as HTMLElement;
            if (!Element.contains(Target))
                window.removeEventListener('mousedown', ClickHandler);

            if (!Element.contains(Target) && Target != ClickElement && !ClickElement.contains(Target))
                ClickElement.dispatchEvent(new Event("click"));
        }
        window.addEventListener('mousedown', ClickHandler);
    }
}

function UpdateExcludeText(ContextMenuButton: HTMLElement, ContextMenu: HTMLElement): string {
    let IncludedTypes: string[] = JSON.parse(ContextMenuButton.dataset.included_types);
    Array.from(ContextMenu.children).forEach((ContextMenuItem: HTMLElement) => { ContextMenuItem.dataset.active = (IncludedTypes.includes(ContextMenuItem.dataset.type) ? "true" : ""); });
    if (IncludedTypes.length == 0) {
        return "nothing"
    } else if (IncludedTypes.length >= ContextMenu.children.length) {
        return "everything"
    } else if (IncludedTypes.length < (ContextMenu.children.length / 2)) {
        var IncludedTypeNames = Array.from(ContextMenu.children).filter((x: HTMLElement) => IncludedTypes.includes(x.dataset.type)).map((x: HTMLElement) => x.innerText + "s");
        return IncludedTypeNames.join(", ") + " only";
    }
    else {
        var IncludedTypeNames = Array.from(ContextMenu.children).filter((x: HTMLElement) => !IncludedTypes.includes(x.dataset.type)).map((x: HTMLElement) => x.innerText + "s");
        return "everything except " + IncludedTypeNames.join(", ")
    }
}
