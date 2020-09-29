documentation → [toolbox](../toolbox.md) → form → Dropdown

## Dropdown

`@desc` A selectable dropdown menu form component

`@params`
- `options: string[]` → An array of strings for each selectable option in the dropdown list.
- `onSelect: Function [(string) => void] (optional)` → The callback function that is executed when a user selects a new value from the dropdown

`@usage`
```
<Dropdown 
  options={["Volvo", "Porche", "BMW", "Toyota", "Tesla"]} 
  onSelect={(x: string) => {console.log(`Selected: ${x}`)}}
/>
```
