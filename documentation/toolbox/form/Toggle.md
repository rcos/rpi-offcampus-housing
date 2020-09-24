documentation → [toolbox](../toolbox.md) → form → Toggle

## toggle

`@desc` A form component that is a boolean toggle. It's either on or off

`@params`
- `initialValue: boolean (optional)` → the width of the container. `(default: false)`
- `onLabel: string (optional)` → the string label to show when the toggle is on
- `offLabel: string (optional)` → the string label to show when the toggle is off
- `onToggle: Function [(boolean) => void] (optional)` → the callback function to call when the toggle action is triggered

`@usage`
```
<Toggle onLabel="Toggle on" offLabel="Toggle off" initialValue={true} />
```
