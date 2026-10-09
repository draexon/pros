# Pros

An original React component library by **draexon**. 210 components across 14 collections, built around rounded forms, a monochrome palette, and purposeful motion.

![Pros gallery](docs/preview.png)

## Run the gallery

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The gallery includes live interactive previews, full source modules, usage examples, search, saved components, adjustable preview surfaces, and a persistent motion switch.

## Use the library

```sh
npm run build:lib
npm pack
```

Install the resulting `draexon-pros-0.1.0.tgz` from another React project:

```sh
npm install /path/to/draexon-pros-0.1.0.tgz
```

```tsx
import { ProsProvider, EditorialCard, RangeInput } from "@draexon/pros";
import "@draexon/pros/style.css";

export function Example() {
  return (
    <ProsProvider>
      <EditorialCard
        title="Your own point of view."
        onAction={(action) => console.log(action)}
      />
      <RangeInput label="Intensity" defaultValue="64" />
    </ProsProvider>
  );
}
```

The package provides ES modules, CommonJS, TypeScript declarations, and a separate stylesheet. React 18.3 or 19 and React DOM are peer dependencies. No existing UI or motion component library is used.

## The collections

Each collection contains 15 individually exported components:

| Collection   | Examples                                                  |
| ------------ | --------------------------------------------------------- |
| Cards        | EditorialCard, StackedCard, TicketCard, FoldCard          |
| Buttons      | ArrowButton, HoldButton, RollingButton, OrbitButton       |
| Inputs       | OtpInput, TagInput, FileDropzone, RatingInput             |
| Navigation   | PillTabs, IconDock, ChapterRail, AlphabetIndex            |
| Typography   | WordReveal, CircularText, RotatingWord, InkHeadline       |
| Feedback     | RingProgress, MilestoneNotice, DotLoader, EmptyCollection |
| Overlays     | CommandPalette, SideDrawer, ImageLightbox, SpotlightTour  |
| Data display | BarChart, Heatmap, SortableTable, WaterfallChart          |
| Media        | Filmstrip, ImageCompare, Polaroid, CoverArt               |
| Layouts      | BentoGrid, ResizablePanel, MasonryBoard, HeroBlock        |
| Commerce     | ProductCard, BundleBuilder, OrderSummary, ShippingTracker |
| Social       | PollCard, ChatPanel, InviteForm, CommentThread            |
| Lists        | ReorderList, KanbanBoard, ReadingList, SearchableList     |
| Motion       | TiltSurface, MagneticField, DragTrack, RevealCurtain      |

The complete inventory is in [COMPONENTS.md](COMPONENTS.md).

## Content and state

Components share the exported `ProsProps` and `ProsItem` types. Exact supported props and event names are documented by the implementation shown in each component's source tab.

- `title`, `description`, `label`, `items`, and `children` customize supported content.
- `className` and `style` style the outer surface.
- Controls using `useModel` accept `value`, `defaultValue`, and `onValueChange`. A supplied `value` makes them controlled.
- Toggle values are `"true"` or `"false"`; numeric values are number strings. Multi-selection uses comma-separated labels, so item labels must be unique and must not contain commas.
- Some compound examples, such as chat, checklist, kanban, and tour state, are local compositions. Use their callbacks to connect your own data layer or adapt their source for full control.
- `onAction` delivers actions to your application. Checkout, file download, sharing, invite, email, and contact actions require your app's service integration. No backend or payment service is bundled.
- `image` supplies images. `VideoFrame` and `AudioPlayer` use `href` for actual media sources and native playback controls. `AudioCard` is a playback-control surface with play/pause callbacks.
- Default chart values, names, dates, amounts, and statistics are illustrative data.

## Motion and accessibility

Every component has an entrance; interactive elements add purpose-specific transitions. The library uses native CSS animation, pointer events, and native dialog behavior. Dialogs support Escape, focus containment, and focus return. Tabs support arrow keys, Home, and End. Keyboard focus remains visible.

```tsx
<ProsProvider motion={false}>
  <YourApp />
</ProsProvider>
```

The provider switch and `prefers-reduced-motion` disable decorative animation while preserving state changes. Continuous animation can be paused from the gallery header. Native media playback remains user-controlled.

Core tokens:

```css
:root {
  --pros-ink: #171817;
  --pros-paper: #ffffff;
  --pros-radius: 28px;
  --pros-duration: 450ms;
  --pros-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --pros-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

Typography uses Manrope and DM Sans through Google Fonts, with system fallbacks. Self-host fonts or override the families for an offline-only application. Components are designed primarily for light surfaces with intentionally dark individual compositions; this is not an automatic dark-theme system.

## Validate

```sh
npm run check
npm run build
npm test
```

`npm test` builds the library and checks every public component with server rendering, custom content, empty collections, safe button types, packaging compatibility, unique identifiers, controlled values, and calculations. Browser validation notes are recorded in [docs/VALIDATION.md](docs/VALIDATION.md).

## Project layout

- `src/library/` — original component modules, shared primitives, and scoped styles.
- `src/catalog.json` — complete searchable component metadata.
- `src/App.tsx` — gallery, detail playground, and documentation.
- `dist/` — generated reusable package.
- `site/` — generated gallery website.
- `tests/` — package and rendering tests.
- `scripts/publish-private.ps1` — creates or verifies the private GitHub repository, then pushes the current commit.

## Design research

Editorial layouts and printed matter collected on [Are.na](https://www.are.na/rachel-steele/layout-editorial-kl3d-_flrj4), [Pinterest typography references](https://it.pinterest.com/pin/business-cards-design-inspiration-black-and-white-graphic-design-typography--814799757554549066/), and physical objects informed the direction. All component implementations and geometric artwork are original. No third-party reference artwork is redistributed.

Private source. All rights reserved by draexon.
