# plusone

A super-light Chrome extension for Google Sheets that shows tiny hover controls near your cursor while you're over the sheet grid:

- `+` increments the selected cell by 1.
- `−` decrements the selected cell by 1.

## Load the extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder (`plusone`)

## Notes

- Runs only on `docs.google.com/spreadsheets/*`.
- Buttons only appear when your cursor is over the sheet grid and the active cell value is numeric.
- UI is intentionally tiny and transient to avoid interfering with normal spreadsheet usage.
