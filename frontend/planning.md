```markdown
modules/
├── theme-switcher/
│ ├── src/
│ │ ├── module.ts # only the definition of new Module() goes here
│ │ ├── stateful # layer where state is managed
│ │ ├── logic layer # any logic needed for the UI
│ │ ├── theme-switcher-element.ts # Handles state rendering for the module, extends ModuleElement
│ ├── package.json # Metadata for the module
│ ├── README.md # Explains the module
```

1. Read the markdown above to show you an example of a module
2. Please read the files as well to get context
3. Take each module defined in `core-modules.ts` and implement it as a module with all of these files

### Module Rules

- Every module must implement ModuleElement
- Every module has access to BookeraApi
