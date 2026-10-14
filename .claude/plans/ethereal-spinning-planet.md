# Plan to fix rotation reset effect and update drag rotation

## Context
The user wants the rotation of draggable elements to return to their original angle after being dragged and released, regardless of their new position. Additionally, they want the rotation during dragging to be 30 degrees instead of the current 2 degrees.

## Proposed Changes
1.  **Update `disruptive-portfolio/script.js`**: Change the inline transform applied during dragging in the `drag()` function to include a 30-degree rotation.
2.  **Update `disruptive-portfolio/style.css`**: Update the `.draggable.is-dragging` class to apply a 30-degree rotation. This ensures that even if the JS lags, the visual representation is consistent.
3.  **Ensure smooth transition**: The existing transition on the `.draggable` class in `style.css` is already set up to handle the return to base transform smoothly.

## Critical Files
- `disruptive-portfolio/script.js`
- `disruptive-portfolio/style.css`

## Verification
1.  Open the project in a browser.
2.  Grab a draggable element. It should rotate 30 degrees and scale slightly.
3.  Move it to a new location on the screen.
4.  Release the element. It should smoothly rotate back to its original orientation (determined by `--base-rot`) while staying at the new location.
