# Markets — Claude Code Instructions

> **Read [Agents.md](Agents.md) first.** It contains the project coding standards, technology stack, component organization, styling rules, naming conventions, accessibility requirements, mobile UX constraints, TDD practices, event-driven architecture rules, and anti-patterns that apply to all work in this repo.

## Figma MCP Integration Rules

These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

### Figma File Reference

- **File key:** `LMawgHcglco0TG32UAQUhE`
- **File URL:** https://www.figma.com/design/LMawgHcglco0TG32UAQUhE/Markets

### Required Flow (do not skip)

1. Run `get_design_context` first to fetch the structured representation for the exact node(s)
2. If the response is too large or truncated, run `get_metadata` to get the high-level node map, then re-fetch only the required node(s) with `get_design_context`
3. Run `get_screenshot` for a visual reference of the node variant being implemented
4. Only after you have both `get_design_context` and `get_screenshot`, download any assets needed and start implementation
5. Translate the output (usually React + Tailwind) into this project's conventions: Gluestack UI v3 components + NativeWind styling + Expo Router navigation
6. Validate against Figma for 1:1 look and behavior before marking complete

### Implementation Rules

- Treat the Figma MCP output (React + Tailwind) as a representation of design and behavior, not as final code style
- IMPORTANT: Replace raw HTML elements with Gluestack UI v3 equivalents:
  - `<div>` → `<Box>` or `<VStack>`/`<HStack>`
  - `<button>` → `<Button>` + `<ButtonText>`
  - `<input>` → `<Input>` + `<InputField>`
  - `<text>` / `<p>` / `<span>` → `<Text>` or `<Heading>`
  - `<img>` → `<Image>` (from expo-image)
  - Lists → `<FlashList>` for performance
- Map Figma Tailwind classes to NativeWind-compatible classes (NativeWind supports most Tailwind utilities)
- IMPORTANT: Map Figma colors to design tokens in `config.ts`, not raw hex values
- Reuse existing components from `components/ui/` and `components/{domain}/` instead of duplicating
- Use Expo Router for navigation — no `<a>` tags or manual routing
- Respect role-based routing: customer screens in `(customer)/`, vendor in `(vendor)/`, manager in `(manager)/`
- Strive for 1:1 visual parity with the Figma design
- Validate the final UI against the Figma screenshot for both look and behavior

## Asset Handling

- The Figma MCP server provides an assets endpoint which can serve image and SVG assets
- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly
- IMPORTANT: DO NOT import/add new icon packages — all assets should be in the Figma payload or use Gluestack's built-in icon set via `lucide-react-native`
- Store downloaded assets in `assets/` directory at project root
- Use `expo-image` (`<Image>`) for all image rendering — not React Native's built-in `<Image>`
