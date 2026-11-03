# Mark All Layers for Export (Adobe XD Plugin)

Marking layers for export one by one in Adobe XD is tedious. This plugin marks every layer it is allowed to reach in one click, so all of them can be downloaded from a Development share link.

> **Status:** Adobe XD is in maintenance mode. This plugin was tested on XD version `61.0.12.1` (update this after testing).

## Features

- **Mark all layers for export:** marks every artboard, group and nested layer that XD lets a plugin edit.
- **Check what is still unmarked:** counts marked layers across the whole document and groups the unmarked ones by the container holding them.
- **Unmark all layers:** removes the export mark from everything in the current scope.
- **Safe with XD's edit-context rules:** the plugin never touches a layer that XD would reject, so your changes are not silently undone.

![Results dialog](docs/images/results-dialog.png)

## Why some layers need an extra step

XD only lets a plugin edit layers it reaches through **plain groups** (groups without a mask) and **artboards**. The contents of these containers are off-limits until you open them yourself:

- Masked groups
- Components
- Repeat grids
- Boolean groups
- Scroll groups

If a plugin edits even one layer outside that scope, XD [reverts the entire operation](https://developer.adobe.com/xd/uxp/develop/plugin-development/xd-concepts/edit-context/) without showing an error. Many "mark everything" scripts fail that way. This plugin skips those layers and lists the containers it couldn't reach, so you know exactly where to go next.

## Installation

### Option A: installer file

1. Download the latest `.xdx` file from [Releases](../../releases).
2. Double-click it. XD warns that the plugin is unverified; accept it.

### Option B: developer folder

1. Download or clone this repository.
2. In XD, choose **Plugins > Development > Show Develop Folder**.
3. Copy the `src` folder there and rename it to `MarkAllForExport`.
4. Choose **Plugins > Development > Reload Plugins**.

## Usage

1. Press **Esc** until nothing is selected.
2. Choose **Plugins > Mark All Layers for Export > Mark all layers for export**.
3. Read the results popup. It lists any masked groups, components or repeat grids it couldn't reach.
4. For each listed container, double-click into it until a layer **inside** it is selected, then run **Mark all layers for export** again.
5. Run **Check what is still unmarked** until it says "Everything is marked."

### Create the developer link

A plugin can't create share links, so this part is manual:

1. Open the **Share** tab.
2. Set **Link for** to **Development**.
3. Choose the export format (SVG, or PNG with the sizes you need) and pick the artboards.
4. Click **Create Link**, or **Update Link** if the file already has one.

All marked assets are then downloadable from the link's Assets panel.

## Tips

- **Locked layers** are skipped. Unlock them first if you need them marked.
- **Components:** marking inside the main component may carry through to its copies. Use **Check what is still unmarked** to confirm.
- **Large files:** marking thousands of layers can make the Development link slower to generate.

## Building from source

```bash
./scripts/build.sh
```

This creates `dist/MarkAllForExport-v<version>.xdx`. Pushing a tag such as `v1.1.0` also builds the file and attaches it to a GitHub Release automatically.

## Contributing

Bug reports and pull requests are welcome. Include your XD version and the type of container involved (mask, component, repeat grid and so on).

## License

[MIT](LICENSE)
