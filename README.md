# @chayns/swipeable

A wrapper component that reveals contextual actions on swipe.

## Installation

```bash
npm install @chayns/swipeable framer-motion
```

## Usage

```ts
import { Swipeable } from "@chayns/swipeable";
import "@chayns/swipeable/index.css";
import { Icon } from "chayns-components";

const MyComponent = () => (
  <Swipeable
    leftActions={[
      {
        color: "#3B82F6",
        text: "Delete",
        icon: <Icon icon={`fas ${isUnread ? "fa-check" : "fa-envelope"}`} />,
        action: () => alert("Deleted!"),
      },
    ]}
    rightActions={
      [
        // Same as `leftActions`
      ]
    }
  >
    Anything goes here...
  </Swipeable>
);
```
